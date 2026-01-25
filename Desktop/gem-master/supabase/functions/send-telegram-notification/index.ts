import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadNotificationPayload {
    // Can receive credentials from DB trigger (secure, server-side)
    lead_id?: string;
    product_id?: string;
    product_name?: string;
    store_name?: string;
    form_data?: Record<string, string>;
    submitted_at?: string;
    telegram_bot_token?: string;
    telegram_chat_id?: string;
    // Or receive just record info and fetch credentials server-side
    record?: {
        id: string;
        product_id: string;
        form_data: Record<string, string>;
        submitted_at: string;
    };
    type?: string;
    table?: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload: LeadNotificationPayload = await req.json();

        let product_name: string;
        let store_name: string;
        let form_data: Record<string, string>;
        let submitted_at: string;
        let telegram_bot_token: string;
        let telegram_chat_id: string;

        // Check if this is a database webhook (record format) or direct call
        if (payload.record) {
            // Database Webhook format - fetch credentials from database
            const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
            const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Get product and store details with telegram credentials
            const { data: productData, error: productError } = await supabase
                .from("products")
                .select(`
                    name,
                    store:stores!inner(
                        name,
                        telegram_bot_token,
                        telegram_chat_id,
                        telegram_enabled
                    )
                `)
                .eq("id", payload.record.product_id)
                .single();

            if (productError || !productData) {
                console.error("Failed to fetch product:", productError);
                return new Response(JSON.stringify({ error: "Product not found" }), {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            const store = productData.store as {
                name: string;
                telegram_bot_token: string | null;
                telegram_chat_id: string | null;
                telegram_enabled: boolean;
            };

            // Check if telegram is enabled and configured
            if (!store.telegram_enabled || !store.telegram_bot_token || !store.telegram_chat_id) {
                console.log("Telegram not configured for this store, skipping notification");
                return new Response(JSON.stringify({ skipped: true, reason: "Telegram not configured" }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            product_name = productData.name;
            store_name = store.name;
            form_data = payload.record.form_data;
            submitted_at = payload.record.submitted_at;
            telegram_bot_token = store.telegram_bot_token;
            telegram_chat_id = store.telegram_chat_id;
        } else if (payload.telegram_bot_token && payload.telegram_chat_id) {
            // Direct call format (from DB trigger with credentials)
            product_name = payload.product_name || "Unknown Product";
            store_name = payload.store_name || "Unknown Store";
            form_data = payload.form_data || {};
            submitted_at = payload.submitted_at || new Date().toISOString();
            telegram_bot_token = payload.telegram_bot_token;
            telegram_chat_id = payload.telegram_chat_id;
        } else {
            return new Response(JSON.stringify({ error: "Invalid payload format" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Format the message
        const formattedDate = new Date(submitted_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        let message = `🛒 *New Order Received!*\n\n`;
        message += `📦 *Product:* ${escapeMarkdown(product_name)}\n`;
        message += `🏪 *Store:* ${escapeMarkdown(store_name)}\n`;
        message += `🕐 *Time:* ${formattedDate}\n\n`;
        message += `📋 *Order Details:*\n`;

        // Add form data fields
        for (const [key, value] of Object.entries(form_data)) {
            const label = formatLabel(key);
            message += `• *${label}:* ${escapeMarkdown(String(value))}\n`;
        }

        // Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${telegram_bot_token}/sendMessage`;

        const response = await fetch(telegramUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: telegram_chat_id,
                text: message,
                parse_mode: "Markdown",
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Telegram API error:", result);
            return new Response(JSON.stringify({ error: result.description }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("Telegram notification sent successfully");
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});

// Escape special Markdown characters
function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

// Format camelCase or snake_case keys to readable labels
function formatLabel(key: string): string {
    return key
        .replace(/([A-Z])/g, " $1") // camelCase
        .replace(/_/g, " ") // snake_case
        .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
        .trim();
}

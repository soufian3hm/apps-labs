import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadNotification {
    lead_id: string;
    product_id: string;
    product_name: string;
    store_name: string;
    form_data: Record<string, string>;
    submitted_at: string;
    telegram_bot_token: string;
    telegram_chat_id: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload: LeadNotification = await req.json();

        const {
            product_name,
            store_name,
            form_data,
            submitted_at,
            telegram_bot_token,
            telegram_chat_id,
        } = payload;

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

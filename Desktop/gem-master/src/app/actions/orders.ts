'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Initialize Admin Client for secure operations
// We use the Service Role Key to bypass RLS for IP checking and tracking
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Fallback to anon key if service key missing, but RLS must allow insert/select then.
    // Ideally, user MUST provide SERVICE_ROLE_KEY in env.
);

export async function submitLead(productId: string, formData: any) {
    try {
        const headersList = await headers();
        // Get real IP, handling proxies
        const forwarded = headersList.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

        console.log(`[Order Submission] IP: ${ip}, Product: ${productId}`);

        // 1. Get Store ID from Product
        const { data: product, error: prodError } = await supabaseAdmin
            .from('products')
            .select('store_id')
            .eq('id', productId)
            .single();

        if (prodError || !product) {
            console.error('Product fetch error:', prodError);
            return { error: 'Product not found or invalid.' };
        }

        const storeId = product.store_id;

        // 2. Check IP Limit for this Store
        // Calculate 24h ago timestamp
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { count, error: countError } = await supabaseAdmin
            .from('lead_ip_tracking')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('ip_address', ip)
            .gt('created_at', oneDayAgo);

        if (countError) {
            console.error('IP Check error:', countError);
            // Fail open or closed? Closed for security.
            return { error: 'Unable to verify order eligibility.' };
        }

        // Limit Logic: Max 2
        if (count !== null && count >= 2) {
            return { error: "You can't order more until 24h pass" };
        }

        // 3. Track This new usage
        // We insert this async, but block if it fails? 
        // It's part of the transaction effectively.
        await supabaseAdmin.from('lead_ip_tracking').insert({
            store_id: storeId,
            ip_address: ip
        });

        // 4. Submit the Lead
        const { error: submitError } = await supabaseAdmin
            .from('lead_submissions')
            .insert({
                product_id: productId,
                form_data: formData
            });

        if (submitError) {
            console.error('Submission error:', submitError);
            return { error: 'Failed to submit order. Please try again.' };
        }

        return { success: true };

    } catch (err: any) {
        console.error('Unexpected error in submitLead:', err);
        return { error: 'An unexpected error occurred.' };
    }
}

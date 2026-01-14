-- Telegram Integration for Order Notifications
-- Adds bot token and chat ID to stores, plus trigger for notifications

-- ============================================
-- ADD TELEGRAM COLUMNS TO STORES
-- ============================================
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT,
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false;

-- ============================================
-- FUNCTION TO NOTIFY VIA TELEGRAM
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_telegram_on_lead()
RETURNS TRIGGER AS $$
DECLARE
    store_record RECORD;
    product_record RECORD;
    payload JSONB;
BEGIN
    -- Get product details
    SELECT * INTO product_record FROM public.products WHERE id = NEW.product_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Get store details with telegram config
    SELECT * INTO store_record FROM public.stores WHERE id = product_record.store_id;
    
    IF NOT FOUND OR store_record.telegram_bot_token IS NULL OR store_record.telegram_chat_id IS NULL OR store_record.telegram_enabled = false THEN
        RETURN NEW;
    END IF;
    
    -- Build payload
    payload := jsonb_build_object(
        'lead_id', NEW.id,
        'product_id', NEW.product_id,
        'product_name', product_record.name,
        'store_name', store_record.name,
        'form_data', NEW.form_data,
        'submitted_at', NEW.submitted_at,
        'telegram_bot_token', store_record.telegram_bot_token,
        'telegram_chat_id', store_record.telegram_chat_id
    );
    
    -- Call edge function (async via pg_net if available, otherwise http extension)
    PERFORM net.http_post(
        url := current_setting('app.supabase_url', true) || '/functions/v1/send-telegram-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
        ),
        body := payload
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the insert if notification fails
        RAISE WARNING 'Telegram notification failed: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER ON LEAD SUBMISSIONS
-- ============================================
DROP TRIGGER IF EXISTS on_lead_submission_notify_telegram ON public.lead_submissions;
CREATE TRIGGER on_lead_submission_notify_telegram
    AFTER INSERT ON public.lead_submissions
    FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_on_lead();

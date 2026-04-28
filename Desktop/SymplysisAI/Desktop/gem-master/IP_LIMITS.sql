-- Create table to track IP usage per store
CREATE TABLE IF NOT EXISTS lead_ip_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL, -- references stores(id) ideally, but we'll store the raw UUID
    ip_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ip_tracking_lookup 
ON lead_ip_tracking(store_id, ip_address, created_at);

-- Enable RLS (though mostly accessed via Service Role in Actions)
ALTER TABLE lead_ip_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: limit access (optional, since we use Admin Client)
-- CREATE POLICY "Admins can view ip logs" ON lead_ip_tracking FOR SELECT TO authenticated USING (true);

-- Enable pg_cron for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- CRON JOB for cleanup
-- Deletes logs older than 24 hours every hour
-- We wrap in a DO block to prevent errors if pg_cron is still missing/unsupported in this context
DO $block$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'cleanup-ip-tracking', -- name
            '0 * * * *',           -- every hour
            $$DELETE FROM lead_ip_tracking WHERE created_at < now() - interval '24 hours'$$
        );
    END IF;
END
$block$;

-- Function to check limits (optional helper, but we'll do logic in TS)

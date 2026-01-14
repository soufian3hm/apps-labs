-- Add currency and URL fields to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'USD';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(20) DEFAULT '$';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS currency_position VARCHAR(10) DEFAULT 'before'; -- 'before' or 'after'
ALTER TABLE stores ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(100) UNIQUE;

-- Add layout settings to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{
  "sections": [
    {"id": "highlights", "enabled": true, "order": 0},
    {"id": "store_name", "enabled": true, "order": 1},
    {"id": "product_name", "enabled": true, "order": 2},
    {"id": "price", "enabled": true, "order": 3},
    {"id": "gallery", "enabled": true, "order": 4},
    {"id": "lead_form", "enabled": true, "order": 5},
    {"id": "description", "enabled": true, "order": 6},
    {"id": "footer", "enabled": true, "order": 7}
  ],
  "show_store_name": true
}'::jsonb;

-- Create function to check if custom domain is available (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_domain_available(domain_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the domain exists in stores table
    RETURN NOT EXISTS (
        SELECT 1 FROM stores WHERE custom_domain = domain_slug
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_domain_available(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_domain_available(TEXT) TO anon;

-- Create index for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_stores_custom_domain ON stores(custom_domain);

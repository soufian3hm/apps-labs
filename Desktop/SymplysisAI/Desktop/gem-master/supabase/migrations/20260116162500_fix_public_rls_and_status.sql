-- Enable RLS on public_products if not already
ALTER TABLE public_products ENABLE ROW LEVEL SECURITY;

-- Drop existing select policy if any to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Public read access" ON public_products;
DROP POLICY IF EXISTS "Allow public read access to public_products" ON public_products;
DROP POLICY IF EXISTS "Public read access for public_products" ON public_products;

-- Create permissive select policy
CREATE POLICY "Public read access for public_products"
ON public_products FOR SELECT
USING (true);

-- Ensure indexes
CREATE INDEX IF NOT EXISTS idx_public_products_store_id ON public_products(store_id);
CREATE INDEX IF NOT EXISTS idx_public_products_status ON public_products(status);

-- SYNC DATA FROM products TO public_products
-- This ensures existing products are visible
INSERT INTO public_products (
    id, 
    store_id, 
    theme_id, 
    name, 
    slug, 
    description, 
    short_description, 
    price, 
    compare_price, 
    currency, 
    status, 
    highlights, 
    seo_title, 
    seo_description, 
    created_at, 
    updated_at, 
    layout_config, 
    variant_selection_title, 
    variants
)
SELECT 
    p.id, 
    p.store_id, 
    p.theme_id, 
    p.name, 
    p.slug, 
    p.description, 
    p.short_description, 
    p.price, 
    p.compare_price, 
    COALESCE(p.currency, 'USD'), 
    COALESCE(p.status, 'published'), -- Default to published for existing products
    p.highlights, 
    p.seo_title, 
    p.seo_description, 
    p.created_at, 
    p.updated_at, 
    p.layout_config, 
    COALESCE(p.variant_selection_title, 'Choose the Variant'), 
    COALESCE(p.variants, '[]'::jsonb)
FROM products p
ON CONFLICT (id) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    theme_id = EXCLUDED.theme_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    price = EXCLUDED.price,
    compare_price = EXCLUDED.compare_price,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    highlights = EXCLUDED.highlights,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    layout_config = EXCLUDED.layout_config,
    variant_selection_title = EXCLUDED.variant_selection_title,
    variants = EXCLUDED.variants;

-- Explicitly force status to published for any NULLs in public_products (redundant but safe)
UPDATE public_products SET status = 'published' WHERE status IS NULL;

-- 1. Allow everyone to see the products (Fix RLS)
ALTER TABLE public_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public_products;
CREATE POLICY "Public Read" ON public_products FOR SELECT USING (true);

-- 2. Sync all your products to the storefront and force them to be PUBLISHED
INSERT INTO public_products (
    id, store_id, theme_id, name, slug, description, price, currency, status,
    layout_config, variants, created_at, updated_at
)
SELECT 
    id, store_id, theme_id, name, slug, description, price, COALESCE(currency, 'USD'), 'published',
    layout_config, variants, created_at, updated_at
FROM products
ON CONFLICT (id) DO UPDATE 
SET status = 'published';

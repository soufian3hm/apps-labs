-- =====================================================
-- FIX PUBLIC ACCESS (401 UNAUTHORIZED)
-- =====================================================

-- 1. Ensure anon and authenticated roles have access to the schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 2. Grant SELECT permissions to anon for public storefront tables
GRANT SELECT ON public.product_specifications TO anon;
GRANT SELECT ON public.lead_form_configs TO anon;
GRANT SELECT ON public.lead_form_fields TO anon;
GRANT SELECT ON public.store_lead_form_settings TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.product_videos TO anon;
GRANT SELECT ON public.product_custom_fields TO anon;
GRANT SELECT ON public.product_themes TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.stores TO anon;

-- 3. Fix/Add Public RLS Policies

-- STORES: Allow public to view any store (needed for slug lookup)
DROP POLICY IF EXISTS "Public can view stores" ON stores;
CREATE POLICY "Public can view stores" ON stores 
FOR SELECT USING (true);

-- PRODUCTS: Allow public to view published products
DROP POLICY IF EXISTS "Public can view published products" ON products;
CREATE POLICY "Public can view published products" ON products 
FOR SELECT USING (status = 'published');

-- PRODUCT SPECIFICATIONS
DROP POLICY IF EXISTS "Public can view published product specs" ON product_specifications;
CREATE POLICY "Public can view published product specs" ON product_specifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_specifications.product_id
    AND products.status = 'published'
  )
);

-- LEAD FORM CONFIGS
DROP POLICY IF EXISTS "Public can view published lead form configs" ON lead_form_configs;
CREATE POLICY "Public can view published lead form configs" ON lead_form_configs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = lead_form_configs.product_id
    AND products.status = 'published'
  )
);

-- LEAD FORM FIELDS
DROP POLICY IF EXISTS "Public can view published lead form fields" ON lead_form_fields;
CREATE POLICY "Public can view published lead form fields" ON lead_form_fields
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lead_form_configs
    JOIN products ON products.id = lead_form_configs.product_id
    WHERE lead_form_configs.id = lead_form_fields.lead_form_config_id
    AND products.status = 'published'
  )
);

-- STORE LEAD FORM SETTINGS
DROP POLICY IF EXISTS "Public can view store lead form settings" ON store_lead_form_settings;
CREATE POLICY "Public can view store lead form settings" ON store_lead_form_settings
FOR SELECT USING (true);

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "Public can view published product images" ON product_images;
CREATE POLICY "Public can view published product images" ON product_images
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.status = 'published'
  )
);

-- PRODUCT VIDEOS
DROP POLICY IF EXISTS "Public can view published product videos" ON product_videos;
CREATE POLICY "Public can view published product videos" ON product_videos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_videos.product_id
    AND products.status = 'published'
  )
);

-- PRODUCT CUSTOM FIELDS
DROP POLICY IF EXISTS "Public can view published product custom fields" ON product_custom_fields;
CREATE POLICY "Public can view published product custom fields" ON product_custom_fields
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_custom_fields.product_id
    AND products.status = 'published'
  )
);

-- PRODUCT THEMES
DROP POLICY IF EXISTS "Public can view themes" ON product_themes;
CREATE POLICY "Public can view themes" ON product_themes
FOR SELECT USING (true);

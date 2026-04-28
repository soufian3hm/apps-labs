-- ==========================================
-- EMERGENCY RLS FIX SCRIPT (V4 - ULTRA COMPLETE)
-- 1. Drops all existing policies dynamically.
-- 2. Revokes public access (fixing the leak).
-- 3. GRANTS access back to authenticated users & anon where required.
-- 4. Re-creates strict policies.
-- ==========================================

BEGIN;

-- 1. DYNAMICALLY DROP ALL EXISTING POLICIES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
          AND tablename IN (
              'products', 
              'stores', 
              'store_lead_form_settings',
              'lead_submissions',
              'lead_form_configs', 
              'lead_form_fields', 
              'product_custom_fields', 
              'product_images', 
              'product_specifications', 
              'product_themes', 
              'product_videos',
              'public_products',
              'public_stores',
              'profiles'
          )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;


-- 2. RESET TABLE PERMISSIONS AND GRANTS
-- Revoke 'public' access (which includes anon) from private tables
REVOKE ALL ON TABLE public.products FROM public;
REVOKE ALL ON TABLE public.stores FROM public;
REVOKE ALL ON TABLE public.store_lead_form_settings FROM public;

-- GRANT back to authenticated (Dashboard users) and service_role
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;

GRANT ALL ON TABLE public.stores TO authenticated;
GRANT ALL ON TABLE public.stores TO service_role;

GRANT ALL ON TABLE public.store_lead_form_settings TO authenticated;
GRANT ALL ON TABLE public.store_lead_form_settings TO service_role;

-- GRANT ANON access to Storefront things
GRANT ALL ON TABLE public.public_products TO anon;
GRANT ALL ON TABLE public.public_stores TO anon;
GRANT ALL ON TABLE public.public_products TO authenticated;
GRANT ALL ON TABLE public.public_stores TO authenticated;
GRANT ALL ON TABLE public.public_products TO service_role;
GRANT ALL ON TABLE public.public_stores TO service_role;

-- CRITICAL: Grant ANON SELECT on store_lead_form_settings (Validated by RLS)
GRANT SELECT ON TABLE public.store_lead_form_settings TO anon;

-- Related Tables (Images, Specs, etc.)
GRANT SELECT ON TABLE public.product_images TO anon;
GRANT SELECT ON TABLE public.product_videos TO anon;
GRANT SELECT ON TABLE public.product_specifications TO anon;
GRANT SELECT ON TABLE public.product_custom_fields TO anon;
GRANT SELECT ON TABLE public.lead_form_configs TO anon;
GRANT SELECT ON TABLE public.lead_form_fields TO anon;
GRANT INSERT ON TABLE public.lead_submissions TO anon;


-- 3. RE-APPLY STRICT RLS FOR STORES
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view own stores only" 
ON public.stores FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create stores" 
ON public.stores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores" 
ON public.stores FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores" 
ON public.stores FOR DELETE USING (auth.uid() = user_id);


-- 4. RE-APPLY STRICT RLS FOR PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view own products only" 
ON public.products FOR SELECT TO authenticated 
USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can create products in their stores" 
ON public.products FOR INSERT WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));


-- 5. FIX STORE SETTINGS RLS (Public access only via public_stores)
ALTER TABLE public.store_lead_form_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view store lead form settings" 
ON public.store_lead_form_settings FOR SELECT 
USING (store_id IN (SELECT id FROM public.public_stores));

CREATE POLICY "Users can manage their store lead form settings"
ON public.store_lead_form_settings FOR ALL TO authenticated
USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));


-- 6. FIX LEAD SUBMISSIONS RLS
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads to published products" 
ON public.lead_submissions FOR INSERT 
WITH CHECK (product_id IN (SELECT id FROM public.public_products));

CREATE POLICY "Users can view their lead submissions"
ON public.lead_submissions FOR SELECT TO authenticated
USING (product_id IN (SELECT p.id FROM public.products p JOIN public.stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));


-- 7. RE-SECURE RELATED TABLES
-- Only visible if linked to a PUBLIC product in public_products

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view images via public_products" 
ON public.product_images FOR SELECT 
USING (product_id IN (SELECT id FROM public.public_products));

CREATE POLICY "Users can manage their product images" 
ON public.product_images FOR ALL TO authenticated 
USING (product_id IN (SELECT p.id FROM public.products p JOIN public.stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));

ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view videos via public_products" 
ON public.product_videos FOR SELECT 
USING (product_id IN (SELECT id FROM public.public_products));

CREATE POLICY "Users can manage their product videos" 
ON public.product_videos FOR ALL TO authenticated 
USING (product_id IN (SELECT p.id FROM public.products p JOIN public.stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));

ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view specs via public_products" 
ON public.product_specifications FOR SELECT 
USING (product_id IN (SELECT id FROM public.public_products));

CREATE POLICY "Users can manage their specs" 
ON public.product_specifications FOR ALL TO authenticated 
USING (product_id IN (SELECT p.id FROM public.products p JOIN public.stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));

ALTER TABLE public.product_custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view custom_fields via public_products" 
ON public.product_custom_fields FOR SELECT 
USING (product_id IN (SELECT id FROM public.public_products));

CREATE POLICY "Users can manage their custom fields" 
ON public.product_custom_fields FOR ALL TO authenticated 
USING (product_id IN (SELECT p.id FROM public.products p JOIN public.stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));

ALTER TABLE public.lead_form_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view lead_forms via public_products" 
ON public.lead_form_configs FOR SELECT 
USING (product_id IN (SELECT id FROM public.public_products));

CREATE POLICY "Users can manage their lead form configs" 
ON public.lead_form_configs FOR ALL TO authenticated 
USING (product_id IN (SELECT p.id FROM public.products p JOIN public.stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));

ALTER TABLE public.lead_form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view lead_form_fields via public_products" 
ON public.lead_form_fields FOR SELECT 
USING (lead_form_config_id IN (SELECT id FROM public.lead_form_configs WHERE product_id IN (SELECT id FROM public.public_products)));

CREATE POLICY "Users can manage their lead form fields" 
ON public.lead_form_fields FOR ALL TO authenticated 
USING (lead_form_config_id IN (SELECT lfc.id FROM public.lead_form_configs lfc JOIN public.products p ON lfc.product_id = p.id JOIN public.stores s ON p.store_id = s.id WHERE s.user_id = auth.uid()));


-- 8. ENSURE PUBLIC TABLES ARE PUBLIC
ALTER TABLE public.public_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to public_products" ON public.public_products FOR SELECT USING (true);

ALTER TABLE public.public_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to public_stores" ON public.public_stores FOR SELECT USING (true);


-- 9. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 10. THEMES
ALTER TABLE public.product_themes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.product_themes TO anon;
DROP POLICY IF EXISTS "Anyone can view themes" ON public.product_themes;
CREATE POLICY "Anyone can view themes" ON public.product_themes FOR SELECT USING (true);

COMMIT;

-- =====================================================
-- ADMIN DASHBOARD SETUP
-- =====================================================
-- This script adds role-based access control for admin users
-- and creates comprehensive RLS policies for all tables

-- =====================================================
-- 1. ADD ROLE COLUMN TO PROFILES TABLE
-- =====================================================

-- Add role column with default 'user'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update existing profiles to have 'user' role if NULL
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- =====================================================
-- 2. HELPER FUNCTION TO CHECK IF USER IS ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. RLS POLICIES FOR PROFILES TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (is_admin());

-- =====================================================
-- 4. RLS POLICIES FOR STORES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own stores" ON stores;
DROP POLICY IF EXISTS "Users can insert own stores" ON stores;
DROP POLICY IF EXISTS "Users can update own stores" ON stores;
DROP POLICY IF EXISTS "Users can delete own stores" ON stores;
DROP POLICY IF EXISTS "Admins can view all stores" ON stores;
DROP POLICY IF EXISTS "Admins can manage all stores" ON stores;

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Users can view their own stores
CREATE POLICY "Users can view own stores"
ON stores FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own stores
CREATE POLICY "Users can insert own stores"
ON stores FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own stores
CREATE POLICY "Users can update own stores"
ON stores FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own stores
CREATE POLICY "Users can delete own stores"
ON stores FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all stores
CREATE POLICY "Admins can view all stores"
ON stores FOR SELECT
USING (is_admin());

-- Admins can manage all stores
CREATE POLICY "Admins can manage all stores"
ON stores FOR ALL
USING (is_admin());

-- =====================================================
-- 5. RLS POLICIES FOR PRODUCTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
DROP POLICY IF EXISTS "Public can view published products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Admins can manage all products" ON products;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Users can view products from their own stores
CREATE POLICY "Users can view own products"
ON products FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = products.store_id
    AND stores.user_id = auth.uid()
  )
);

-- Users can insert products to their own stores
CREATE POLICY "Users can insert own products"
ON products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = products.store_id
    AND stores.user_id = auth.uid()
  )
);

-- Users can update products from their own stores
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = products.store_id
    AND stores.user_id = auth.uid()
  )
);

-- Users can delete products from their own stores
CREATE POLICY "Users can delete own products"
ON products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = products.store_id
    AND stores.user_id = auth.uid()
  )
);

-- Public can view published products (for storefront)
CREATE POLICY "Public can view published products"
ON products FOR SELECT
USING (status = 'published');

-- Admins can view all products
CREATE POLICY "Admins can view all products"
ON products FOR SELECT
USING (is_admin());

-- Admins can manage all products
CREATE POLICY "Admins can manage all products"
ON products FOR ALL
USING (is_admin());

-- =====================================================
-- 6. RLS POLICIES FOR PRODUCT_IMAGES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own product images" ON product_images;
DROP POLICY IF EXISTS "Users can manage own product images" ON product_images;
DROP POLICY IF EXISTS "Public can view published product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage all product images" ON product_images;

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Users can view images from their own products
CREATE POLICY "Users can view own product images"
ON product_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_images.product_id
    AND stores.user_id = auth.uid()
  )
);

-- Users can manage images from their own products
CREATE POLICY "Users can manage own product images"
ON product_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_images.product_id
    AND stores.user_id = auth.uid()
  )
);

-- Public can view images from published products
CREATE POLICY "Public can view published product images"
ON product_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.status = 'published'
  )
);

-- Admins can manage all product images
CREATE POLICY "Admins can manage all product images"
ON product_images FOR ALL
USING (is_admin());

-- =====================================================
-- 7. RLS POLICIES FOR PRODUCT_VIDEOS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own product videos" ON product_videos;
DROP POLICY IF EXISTS "Users can manage own product videos" ON product_videos;
DROP POLICY IF EXISTS "Public can view published product videos" ON product_videos;
DROP POLICY IF EXISTS "Admins can manage all product videos" ON product_videos;

ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product videos"
ON product_videos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_videos.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own product videos"
ON product_videos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_videos.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published product videos"
ON product_videos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_videos.product_id
    AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage all product videos"
ON product_videos FOR ALL
USING (is_admin());

-- =====================================================
-- 8. RLS POLICIES FOR PRODUCT_SPECIFICATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own product specs" ON product_specifications;
DROP POLICY IF EXISTS "Users can manage own product specs" ON product_specifications;
DROP POLICY IF EXISTS "Public can view published product specs" ON product_specifications;
DROP POLICY IF EXISTS "Admins can manage all product specs" ON product_specifications;

ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product specs"
ON product_specifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_specifications.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own product specs"
ON product_specifications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_specifications.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published product specs"
ON product_specifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_specifications.product_id
    AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage all product specs"
ON product_specifications FOR ALL
USING (is_admin());

-- =====================================================
-- 9. RLS POLICIES FOR PRODUCT_CUSTOM_FIELDS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own product custom fields" ON product_custom_fields;
DROP POLICY IF EXISTS "Users can manage own product custom fields" ON product_custom_fields;
DROP POLICY IF EXISTS "Public can view published product custom fields" ON product_custom_fields;
DROP POLICY IF EXISTS "Admins can manage all product custom fields" ON product_custom_fields;

ALTER TABLE product_custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product custom fields"
ON product_custom_fields FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_custom_fields.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own product custom fields"
ON product_custom_fields FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_custom_fields.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published product custom fields"
ON product_custom_fields FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_custom_fields.product_id
    AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage all product custom fields"
ON product_custom_fields FOR ALL
USING (is_admin());

-- =====================================================
-- 10. RLS POLICIES FOR PRODUCT_THEMES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view themes" ON product_themes;
DROP POLICY IF EXISTS "Admins can manage themes" ON product_themes;

ALTER TABLE product_themes ENABLE ROW LEVEL SECURITY;

-- Anyone can view themes (needed for theme selection)
CREATE POLICY "Anyone can view themes"
ON product_themes FOR SELECT
USING (true);

-- Only admins can manage themes
CREATE POLICY "Admins can manage themes"
ON product_themes FOR ALL
USING (is_admin());

-- =====================================================
-- 11. RLS POLICIES FOR LEAD_FORM_CONFIGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own lead form configs" ON lead_form_configs;
DROP POLICY IF EXISTS "Users can manage own lead form configs" ON lead_form_configs;
DROP POLICY IF EXISTS "Public can view published lead form configs" ON lead_form_configs;
DROP POLICY IF EXISTS "Admins can manage all lead form configs" ON lead_form_configs;

ALTER TABLE lead_form_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead form configs"
ON lead_form_configs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = lead_form_configs.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own lead form configs"
ON lead_form_configs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = lead_form_configs.product_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published lead form configs"
ON lead_form_configs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = lead_form_configs.product_id
    AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage all lead form configs"
ON lead_form_configs FOR ALL
USING (is_admin());

-- =====================================================
-- 12. RLS POLICIES FOR LEAD_FORM_FIELDS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own lead form fields" ON lead_form_fields;
DROP POLICY IF EXISTS "Users can manage own lead form fields" ON lead_form_fields;
DROP POLICY IF EXISTS "Public can view published lead form fields" ON lead_form_fields;
DROP POLICY IF EXISTS "Admins can manage all lead form fields" ON lead_form_fields;

ALTER TABLE lead_form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead form fields"
ON lead_form_fields FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lead_form_configs
    JOIN products ON products.id = lead_form_configs.product_id
    JOIN stores ON stores.id = products.store_id
    WHERE lead_form_configs.id = lead_form_fields.lead_form_config_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own lead form fields"
ON lead_form_fields FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM lead_form_configs
    JOIN products ON products.id = lead_form_configs.product_id
    JOIN stores ON stores.id = products.store_id
    WHERE lead_form_configs.id = lead_form_fields.lead_form_config_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published lead form fields"
ON lead_form_fields FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lead_form_configs
    JOIN products ON products.id = lead_form_configs.product_id
    WHERE lead_form_configs.id = lead_form_fields.lead_form_config_id
    AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage all lead form fields"
ON lead_form_fields FOR ALL
USING (is_admin());

-- =====================================================
-- 13. RLS POLICIES FOR LEAD_SUBMISSIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own lead submissions" ON lead_submissions;
DROP POLICY IF EXISTS "Users can manage own lead submissions" ON lead_submissions;
DROP POLICY IF EXISTS "Public can insert lead submissions" ON lead_submissions;
DROP POLICY IF EXISTS "Admins can manage all lead submissions" ON lead_submissions;

ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view leads from their own products
CREATE POLICY "Users can view own lead submissions"
ON lead_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = lead_submissions.product_id
    AND stores.user_id = auth.uid()
  )
);

-- Users can manage leads from their own products
CREATE POLICY "Users can manage own lead submissions"
ON lead_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = lead_submissions.product_id
    AND stores.user_id = auth.uid()
  )
);

-- Public can insert lead submissions (for published products)
CREATE POLICY "Public can insert lead submissions"
ON lead_submissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = lead_submissions.product_id
    AND products.status = 'published'
  )
);

-- Admins can manage all lead submissions
CREATE POLICY "Admins can manage all lead submissions"
ON lead_submissions FOR ALL
USING (is_admin());

-- =====================================================
-- 14. RLS POLICIES FOR LEAD_IP_TRACKING TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own lead ip tracking" ON lead_ip_tracking;
DROP POLICY IF EXISTS "System can insert lead ip tracking" ON lead_ip_tracking;
DROP POLICY IF EXISTS "Admins can manage all lead ip tracking" ON lead_ip_tracking;

ALTER TABLE lead_ip_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead ip tracking"
ON lead_ip_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = lead_ip_tracking.store_id
    AND stores.user_id = auth.uid()
  )
);

-- Allow system to insert IP tracking (service role)
CREATE POLICY "System can insert lead ip tracking"
ON lead_ip_tracking FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all lead ip tracking"
ON lead_ip_tracking FOR ALL
USING (is_admin());

-- =====================================================
-- 15. RLS POLICIES FOR PUBLIC_STORES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view public stores" ON public_stores;
DROP POLICY IF EXISTS "Admins can manage public stores" ON public_stores;

ALTER TABLE public_stores ENABLE ROW LEVEL SECURITY;

-- Anyone can view public stores
CREATE POLICY "Anyone can view public stores"
ON public_stores FOR SELECT
USING (true);

-- Admins can manage public stores
CREATE POLICY "Admins can manage public stores"
ON public_stores FOR ALL
USING (is_admin());

-- =====================================================
-- 16. RLS POLICIES FOR PUBLIC_PRODUCTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view public products" ON public_products;
DROP POLICY IF EXISTS "Admins can manage public products" ON public_products;

ALTER TABLE public_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view public products
CREATE POLICY "Anyone can view public products"
ON public_products FOR SELECT
USING (true);

-- Admins can manage public products
CREATE POLICY "Admins can manage public products"
ON public_products FOR ALL
USING (is_admin());

-- =====================================================
-- 17. RLS POLICIES FOR STORE_LEAD_FORM_SETTINGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own store lead form settings" ON store_lead_form_settings;
DROP POLICY IF EXISTS "Users can manage own store lead form settings" ON store_lead_form_settings;
DROP POLICY IF EXISTS "Admins can manage all store lead form settings" ON store_lead_form_settings;

ALTER TABLE store_lead_form_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own store lead form settings"
ON store_lead_form_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_lead_form_settings.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own store lead form settings"
ON store_lead_form_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_lead_form_settings.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all store lead form settings"
ON store_lead_form_settings FOR ALL
USING (is_admin());

-- =====================================================
-- 18. CREATE ADMIN STATS VIEW
-- =====================================================

CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM products WHERE status = 'published') as published_products,
  (SELECT COUNT(*) FROM lead_submissions) as total_leads,
  (SELECT COUNT(*) FROM lead_submissions WHERE submitted_at > NOW() - INTERVAL '24 hours') as leads_today,
  (SELECT COUNT(*) FROM lead_submissions WHERE submitted_at > NOW() - INTERVAL '7 days') as leads_this_week,
  (SELECT COUNT(*) FROM lead_submissions WHERE submitted_at > NOW() - INTERVAL '30 days') as leads_this_month;

-- Grant access to admin stats view
GRANT SELECT ON admin_stats TO authenticated;

-- =====================================================
-- 19. CREATE FUNCTION TO PROMOTE USER TO ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Only admins can promote users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;

  -- Find user by email
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update role to admin
  UPDATE profiles
  SET role = 'admin'
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 20. CREATE FUNCTION TO DEMOTE ADMIN TO USER
-- =====================================================

CREATE OR REPLACE FUNCTION demote_to_user(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Only admins can demote users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;

  -- Find user by email
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update role to user
  UPDATE profiles
  SET role = 'user'
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 21. MANUALLY SET FIRST ADMIN (RUN THIS ONCE)
-- =====================================================

-- IMPORTANT: Replace 'your-email@example.com' with your actual email
-- Uncomment and run this line to make yourself an admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- Next steps:
-- 1. Run this SQL file in your Supabase SQL Editor
-- 2. Update the email in section 21 to make yourself an admin
-- 3. Update the proxy.ts file to add admin route protection
-- 4. Create the admin dashboard pages
-- 5. Add admin button to the header for admin users
-- =====================================================

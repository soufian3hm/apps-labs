-- Storify SaaS Database Schema
-- Using gen_random_uuid() which is available natively in PostgreSQL 13+

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stores_user_id ON public.stores(user_id);
CREATE INDEX idx_stores_slug ON public.stores(slug);

-- ============================================
-- PRODUCT THEMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    primary_color TEXT NOT NULL DEFAULT '#6366f1',
    secondary_color TEXT NOT NULL DEFAULT '#a5b4fc',
    accent_color TEXT NOT NULL DEFAULT '#4f46e5',
    background_color TEXT NOT NULL DEFAULT '#ffffff',
    text_color TEXT NOT NULL DEFAULT '#1e1e2e',
    font_family TEXT NOT NULL DEFAULT 'Inter',
    button_style TEXT NOT NULL DEFAULT 'rounded' CHECK (button_style IN ('rounded', 'square', 'pill')),
    hero_layout TEXT NOT NULL DEFAULT 'split' CHECK (hero_layout IN ('centered', 'split', 'full-width')),
    section_spacing TEXT NOT NULL DEFAULT 'normal' CHECK (section_spacing IN ('compact', 'normal', 'spacious')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default themes
INSERT INTO public.product_themes (id, name, primary_color, secondary_color, accent_color, background_color, text_color, font_family, button_style, hero_layout, section_spacing) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Modern Minimal', '#6366f1', '#a5b4fc', '#4f46e5', '#ffffff', '#1e1e2e', 'Inter', 'rounded', 'split', 'spacious'),
    ('00000000-0000-0000-0000-000000000002', 'Bold & Vibrant', '#f43f5e', '#fda4af', '#e11d48', '#0f0f0f', '#ffffff', 'Inter', 'pill', 'centered', 'normal'),
    ('00000000-0000-0000-0000-000000000003', 'Elegant Classic', '#059669', '#6ee7b7', '#047857', '#fafaf8', '#292524', 'Inter', 'square', 'full-width', 'spacious'),
    ('00000000-0000-0000-0000-000000000004', 'Tech Futuristic', '#0ea5e9', '#7dd3fc', '#0284c7', '#0c1222', '#e2e8f0', 'Inter', 'rounded', 'split', 'normal'),
    ('00000000-0000-0000-0000-000000000005', 'Warm & Cozy', '#ea580c', '#fdba74', '#c2410c', '#fffbeb', '#451a03', 'Inter', 'pill', 'centered', 'spacious')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES public.product_themes(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    compare_price DECIMAL(10,2),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    highlights TEXT[] DEFAULT '{}',
    google_sheet_id TEXT,
    google_sheet_name TEXT DEFAULT 'Leads',
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);

-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    image_type TEXT NOT NULL DEFAULT 'gallery' CHECK (image_type IN ('hero', 'gallery', 'description')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);

-- ============================================
-- PRODUCT VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_videos_product_id ON public.product_videos(product_id);

-- ============================================
-- PRODUCT SPECIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_specifications_product_id ON public.product_specifications(product_id);

-- ============================================
-- PRODUCT CUSTOM FIELDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'badge', 'list')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_custom_fields_product_id ON public.product_custom_fields(product_id);

-- ============================================
-- LEAD FORM CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_form_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Order Now',
    subtitle TEXT,
    submit_button_text TEXT NOT NULL DEFAULT 'Submit',
    success_message TEXT NOT NULL DEFAULT 'Thank you! We will contact you soon.',
    layout TEXT NOT NULL DEFAULT 'stacked' CHECK (layout IN ('stacked', 'inline', 'grid')),
    button_color TEXT,
    button_text_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEAD FORM FIELDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_form_config_id UUID NOT NULL REFERENCES public.lead_form_configs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'tel', 'email', 'select', 'textarea')),
    required BOOLEAN NOT NULL DEFAULT true,
    validation_pattern TEXT,
    options TEXT[], -- For select type
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_form_fields_config_id ON public.lead_form_fields(lead_form_config_id);

-- ============================================
-- LEAD SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL DEFAULT '{}',
    synced_to_sheet BOOLEAN NOT NULL DEFAULT false,
    ip_address TEXT,
    user_agent TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_submissions_product_id ON public.lead_submissions(product_id);
CREATE INDEX idx_lead_submissions_submitted_at ON public.lead_submissions(submitted_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_themes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Stores policies
CREATE POLICY "Users can view their own stores" ON public.stores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create stores" ON public.stores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores" ON public.stores
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores" ON public.stores
    FOR DELETE USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Users can view their own products" ON public.products
    FOR SELECT USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Public can view published products" ON public.products
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create products in their stores" ON public.products
    FOR INSERT WITH CHECK (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own products" ON public.products
    FOR UPDATE USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

-- Product images policies
CREATE POLICY "Users can manage their product images" ON public.product_images
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view published product images" ON public.product_images
    FOR SELECT USING (
        product_id IN (SELECT id FROM public.products WHERE status = 'published')
    );

-- Product videos policies
CREATE POLICY "Users can manage their product videos" ON public.product_videos
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view published product videos" ON public.product_videos
    FOR SELECT USING (
        product_id IN (SELECT id FROM public.products WHERE status = 'published')
    );

-- Product specifications policies
CREATE POLICY "Users can manage their product specifications" ON public.product_specifications
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view published product specifications" ON public.product_specifications
    FOR SELECT USING (
        product_id IN (SELECT id FROM public.products WHERE status = 'published')
    );

-- Product custom fields policies
CREATE POLICY "Users can manage their product custom fields" ON public.product_custom_fields
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view published product custom fields" ON public.product_custom_fields
    FOR SELECT USING (
        product_id IN (SELECT id FROM public.products WHERE status = 'published')
    );

-- Lead form config policies
CREATE POLICY "Users can manage their lead form configs" ON public.lead_form_configs
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view published product lead forms" ON public.lead_form_configs
    FOR SELECT USING (
        product_id IN (SELECT id FROM public.products WHERE status = 'published')
    );

-- Lead form fields policies
CREATE POLICY "Users can manage their lead form fields" ON public.lead_form_fields
    FOR ALL USING (
        lead_form_config_id IN (
            SELECT lfc.id FROM public.lead_form_configs lfc
            JOIN public.products p ON lfc.product_id = p.id
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view published product lead form fields" ON public.lead_form_fields
    FOR SELECT USING (
        lead_form_config_id IN (
            SELECT lfc.id FROM public.lead_form_configs lfc
            JOIN public.products p ON lfc.product_id = p.id
            WHERE p.status = 'published'
        )
    );

-- Lead submissions policies
CREATE POLICY "Users can view their lead submissions" ON public.lead_submissions
    FOR SELECT USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can submit leads to published products" ON public.lead_submissions
    FOR INSERT WITH CHECK (
        product_id IN (SELECT id FROM public.products WHERE status = 'published')
    );

-- Product themes policies (read-only for everyone)
CREATE POLICY "Anyone can view themes" ON public.product_themes
    FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_form_configs_updated_at
    BEFORE UPDATE ON public.lead_form_configs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default lead form when product is created
CREATE OR REPLACE FUNCTION public.create_default_lead_form()
RETURNS TRIGGER AS $$
DECLARE
    new_config_id UUID;
BEGIN
    -- Create default lead form config
    INSERT INTO public.lead_form_configs (product_id, title, subtitle, submit_button_text, success_message)
    VALUES (NEW.id, 'Order Now', 'Fill in your details and we''ll contact you shortly', 'Submit Order', 'Thank you! We''ll contact you within 24 hours.')
    RETURNING id INTO new_config_id;
    
    -- Create default form fields
    INSERT INTO public.lead_form_fields (lead_form_config_id, name, label, placeholder, field_type, required, sort_order) VALUES
        (new_config_id, 'fullName', 'Full Name', 'Enter your full name', 'text', true, 1),
        (new_config_id, 'phone', 'Phone Number', '+1 (555) 000-0000', 'tel', true, 2),
        (new_config_id, 'city', 'City', 'Your city', 'text', true, 3),
        (new_config_id, 'municipality', 'Municipality', 'Your municipality', 'text', true, 4);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default lead form on product creation
CREATE TRIGGER on_product_created
    AFTER INSERT ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.create_default_lead_form();

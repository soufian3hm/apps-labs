


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_domain_available"("domain_slug" character varying) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    reserved_subdomains TEXT[] := ARRAY[
        'www', 'dashboard', 'api', 'admin', 'app', 'auth', 'login', 'signup',
        'mail', 'email', 'support', 'help', 'docs', 'blog', 'static', 'cdn',
        'assets', 'images', 'img', 'status', 'health', 'store', 'stores',
        'product', 'products', 'order', 'orders', 'checkout', 'cart', 'account',
        'settings', 'billing', 'payments', 'leads', 'analytics', 'reports'
    ];
BEGIN
    -- Check if it's a reserved subdomain
    IF domain_slug = ANY(reserved_subdomains) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if already taken in custom_domain OR slug
    RETURN NOT EXISTS (
        SELECT 1 FROM stores 
        WHERE custom_domain = domain_slug 
        OR slug = domain_slug
    );
END;
$$;


ALTER FUNCTION "public"."check_domain_available"("domain_slug" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_domain_available"("domain_slug" character varying) IS 'Checks if a subdomain is available (checks both custom_domain and slug columns)';



CREATE OR REPLACE FUNCTION "public"."create_default_lead_form"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."create_default_lead_form"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_telegram_on_lead"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    store_record RECORD;
    product_record RECORD;
    message TEXT;
    form_key TEXT;
    form_value TEXT;
    request_id BIGINT;
BEGIN
    -- Get product details
    SELECT * INTO product_record FROM public.products WHERE id = NEW.product_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Get store details with telegram config
    SELECT * INTO store_record FROM public.stores WHERE id = product_record.store_id;
    
    -- Check if telegram is configured and enabled
    IF NOT FOUND 
       OR store_record.telegram_bot_token IS NULL 
       OR store_record.telegram_chat_id IS NULL 
       OR NOT COALESCE(store_record.telegram_enabled, false) THEN
        RETURN NEW;
    END IF;
    
    -- Build the notification message (NO Markdown - plain text to avoid escaping issues)
    message := '🛒 New Order Received!' || chr(10) || chr(10);
    message := message || '📦 Product: ' || COALESCE(product_record.name, 'Unknown') || chr(10);
    message := message || '🏪 Store: ' || COALESCE(store_record.name, 'Unknown') || chr(10);
    message := message || '🕐 Time: ' || to_char(NEW.submitted_at AT TIME ZONE 'UTC', 'Mon DD, YYYY HH12:MI AM') || chr(10) || chr(10);
    message := message || '📋 Order Details:' || chr(10);
    
    -- Add form fields to message
    FOR form_key, form_value IN SELECT * FROM jsonb_each_text(NEW.form_data)
    LOOP
        message := message || '• ' || initcap(replace(form_key, '_', ' ')) || ': ' || COALESCE(form_value, '') || chr(10);
    END LOOP;
    
    -- Send directly to Telegram API (NO parse_mode to avoid Markdown issues)
    SELECT net.http_post(
        url := 'https://api.telegram.org/bot' || store_record.telegram_bot_token || '/sendMessage',
        body := json_build_object(
            'chat_id', store_record.telegram_chat_id,
            'text', message
        )::jsonb
    ) INTO request_id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Never fail the lead insert
        RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_telegram_on_lead"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."notify_telegram_on_lead"() IS '100% SERVER-SIDE Telegram notification. 
When a lead is submitted:
1. Database trigger fires
2. Trigger fetches Telegram credentials from stores table
3. Trigger sends message directly to Telegram API via pg_net
4. Frontend is NEVER involved with Telegram credentials';



CREATE OR REPLACE FUNCTION "public"."prevent_custom_domain_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if the old value was not null and not empty, and if the new value is different
    IF OLD.custom_domain IS NOT NULL AND OLD.custom_domain != '' AND NEW.custom_domain IS DISTINCT FROM OLD.custom_domain THEN
        RAISE EXCEPTION 'Store URL (custom_domain) cannot be changed once set. Please contact support if you need to change it.';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_custom_domain_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_public_product"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public_products WHERE id = OLD.id;
        RETURN OLD;
    ELSIF NEW.status = 'published' THEN
        INSERT INTO public_products (
            id, store_id, theme_id, name, slug,
            description, short_description, price, compare_price,
            highlights, layout_config, created_at, updated_at
        ) VALUES (
            NEW.id, NEW.store_id, NEW.theme_id, NEW.name, NEW.slug,
            NEW.description, NEW.short_description, NEW.price, NEW.compare_price,
            NEW.highlights, NEW.layout_config, NEW.created_at, NEW.updated_at
        )
        ON CONFLICT (id) DO UPDATE SET
            store_id = EXCLUDED.store_id,
            theme_id = EXCLUDED.theme_id,
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            description = EXCLUDED.description,
            short_description = EXCLUDED.short_description,
            price = EXCLUDED.price,
            compare_price = EXCLUDED.compare_price,
            highlights = EXCLUDED.highlights,
            layout_config = EXCLUDED.layout_config,
            updated_at = EXCLUDED.updated_at;
        RETURN NEW;
    ELSE
        -- If product is not published, remove it from public table
        DELETE FROM public_products WHERE id = NEW.id;
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."sync_public_product"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_public_store"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public_stores WHERE id = OLD.id;
        RETURN OLD;
    ELSE
        INSERT INTO public_stores (
            id, name, slug, custom_domain, 
            currency_symbol, currency_code, currency_position,
            tiktok_pixels, created_at, updated_at
        ) VALUES (
            NEW.id, NEW.name, NEW.slug, NEW.custom_domain,
            NEW.currency_symbol, NEW.currency_code, NEW.currency_position,
            NEW.tiktok_pixels, NEW.created_at, NEW.updated_at
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            custom_domain = EXCLUDED.custom_domain,
            currency_symbol = EXCLUDED.currency_symbol,
            currency_code = EXCLUDED.currency_code,
            currency_position = EXCLUDED.currency_position,
            tiktok_pixels = EXCLUDED.tiktok_pixels,
            updated_at = EXCLUDED.updated_at;
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."sync_public_store"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."lead_form_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "title" "text" DEFAULT 'Order Now'::"text" NOT NULL,
    "subtitle" "text",
    "submit_button_text" "text" DEFAULT 'Submit'::"text" NOT NULL,
    "success_message" "text" DEFAULT 'Thank you! We will contact you soon.'::"text" NOT NULL,
    "layout" "text" DEFAULT 'stacked'::"text" NOT NULL,
    "button_color" "text",
    "button_text_color" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "lead_form_configs_layout_check" CHECK (("layout" = ANY (ARRAY['stacked'::"text", 'inline'::"text", 'grid'::"text"])))
);


ALTER TABLE "public"."lead_form_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_form_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_form_config_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "label" "text" NOT NULL,
    "placeholder" "text",
    "field_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "required" boolean DEFAULT true NOT NULL,
    "validation_pattern" "text",
    "options" "text"[],
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "lead_form_fields_field_type_check" CHECK (("field_type" = ANY (ARRAY['text'::"text", 'tel'::"text", 'email'::"text", 'select'::"text", 'textarea'::"text"])))
);


ALTER TABLE "public"."lead_form_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "form_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "synced_to_sheet" boolean DEFAULT false NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_custom_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "value" "text" NOT NULL,
    "field_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_custom_fields_field_type_check" CHECK (("field_type" = ANY (ARRAY['text'::"text", 'badge'::"text", 'list'::"text"])))
);


ALTER TABLE "public"."product_custom_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "alt_text" "text",
    "image_type" "text" DEFAULT 'gallery'::"text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_images_image_type_check" CHECK (("image_type" = ANY (ARRAY['hero'::"text", 'gallery'::"text", 'description'::"text"])))
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_specifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "value" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_specifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_themes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "primary_color" "text" DEFAULT '#6366f1'::"text" NOT NULL,
    "secondary_color" "text" DEFAULT '#a5b4fc'::"text" NOT NULL,
    "accent_color" "text" DEFAULT '#4f46e5'::"text" NOT NULL,
    "background_color" "text" DEFAULT '#ffffff'::"text" NOT NULL,
    "text_color" "text" DEFAULT '#1e1e2e'::"text" NOT NULL,
    "font_family" "text" DEFAULT 'Inter'::"text" NOT NULL,
    "button_style" "text" DEFAULT 'rounded'::"text" NOT NULL,
    "hero_layout" "text" DEFAULT 'split'::"text" NOT NULL,
    "section_spacing" "text" DEFAULT 'normal'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_themes_button_style_check" CHECK (("button_style" = ANY (ARRAY['rounded'::"text", 'square'::"text", 'pill'::"text"]))),
    CONSTRAINT "product_themes_hero_layout_check" CHECK (("hero_layout" = ANY (ARRAY['centered'::"text", 'split'::"text", 'full-width'::"text"]))),
    CONSTRAINT "product_themes_section_spacing_check" CHECK (("section_spacing" = ANY (ARRAY['compact'::"text", 'normal'::"text", 'spacious'::"text"])))
);


ALTER TABLE "public"."product_themes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "thumbnail_url" "text",
    "title" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_videos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "theme_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "short_description" "text",
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "compare_price" numeric(10,2),
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "highlights" "text"[] DEFAULT '{}'::"text"[],
    "google_sheet_id" "text",
    "google_sheet_name" "text" DEFAULT 'Leads'::"text",
    "seo_title" "text",
    "seo_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "layout_config" "jsonb" DEFAULT '{"sections": [{"id": "highlights", "order": 0, "enabled": true}, {"id": "store_name", "order": 1, "enabled": true}, {"id": "product_name", "order": 2, "enabled": true}, {"id": "price", "order": 3, "enabled": true}, {"id": "gallery", "order": 4, "enabled": true}, {"id": "lead_form", "order": 5, "enabled": true}, {"id": "description", "order": 6, "enabled": true}, {"id": "footer", "order": 7, "enabled": true}], "show_store_name": true}'::"jsonb",
    CONSTRAINT "products_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."public_products" (
    "id" "uuid" NOT NULL,
    "store_id" "uuid" NOT NULL,
    "theme_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "short_description" "text",
    "price" numeric(10,2) NOT NULL,
    "compare_price" numeric(10,2),
    "highlights" "text"[],
    "layout_config" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."public_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."public_products" IS 'Public-facing product data for storefronts. Auto-synced from products table. Only published products are included.';



CREATE TABLE IF NOT EXISTS "public"."public_stores" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "custom_domain" "text",
    "currency_symbol" "text" DEFAULT '$'::"text" NOT NULL,
    "currency_code" "text" DEFAULT 'USD'::"text" NOT NULL,
    "currency_position" "text" DEFAULT 'before'::"text" NOT NULL,
    "tiktok_pixels" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "public_stores_currency_position_check" CHECK (("currency_position" = ANY (ARRAY['before'::"text", 'after'::"text"])))
);


ALTER TABLE "public"."public_stores" OWNER TO "postgres";


COMMENT ON TABLE "public"."public_stores" IS 'Public-facing store data for storefronts. Auto-synced from stores table. Contains only necessary fields to prevent data leakage.';



CREATE TABLE IF NOT EXISTS "public"."store_lead_form_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "mode" "text" DEFAULT 'embedded'::"text" NOT NULL,
    "country" "text" DEFAULT 'DZ'::"text" NOT NULL,
    "multi_country" boolean DEFAULT false NOT NULL,
    "fields" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "styles" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "texts" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "rtl" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "store_lead_form_settings_mode_check" CHECK (("mode" = ANY (ARRAY['popup'::"text", 'embedded'::"text"])))
);


ALTER TABLE "public"."store_lead_form_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "currency_code" character varying(10) DEFAULT 'USD'::character varying,
    "currency_symbol" character varying(20) DEFAULT '$'::character varying,
    "currency_position" character varying(10) DEFAULT 'before'::character varying,
    "custom_domain" character varying(100),
    "telegram_bot_token" "text",
    "telegram_chat_id" "text",
    "telegram_enabled" boolean DEFAULT false,
    "tiktok_pixels" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."stores" OWNER TO "postgres";


ALTER TABLE ONLY "public"."lead_form_configs"
    ADD CONSTRAINT "lead_form_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_form_configs"
    ADD CONSTRAINT "lead_form_configs_product_id_key" UNIQUE ("product_id");



ALTER TABLE ONLY "public"."lead_form_fields"
    ADD CONSTRAINT "lead_form_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_submissions"
    ADD CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_custom_fields"
    ADD CONSTRAINT "product_custom_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_specifications"
    ADD CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_themes"
    ADD CONSTRAINT "product_themes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_videos"
    ADD CONSTRAINT "product_videos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_store_id_slug_key" UNIQUE ("store_id", "slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."public_products"
    ADD CONSTRAINT "public_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."public_products"
    ADD CONSTRAINT "public_products_store_slug_unique" UNIQUE ("store_id", "slug");



ALTER TABLE ONLY "public"."public_stores"
    ADD CONSTRAINT "public_stores_custom_domain_key" UNIQUE ("custom_domain");



ALTER TABLE ONLY "public"."public_stores"
    ADD CONSTRAINT "public_stores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."public_stores"
    ADD CONSTRAINT "public_stores_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."store_lead_form_settings"
    ADD CONSTRAINT "store_lead_form_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_lead_form_settings"
    ADD CONSTRAINT "store_lead_form_settings_store_id_key" UNIQUE ("store_id");



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_custom_domain_key" UNIQUE ("custom_domain");



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_slug_key" UNIQUE ("slug");



CREATE INDEX "idx_lead_form_fields_config_id" ON "public"."lead_form_fields" USING "btree" ("lead_form_config_id");



CREATE INDEX "idx_lead_submissions_product_id" ON "public"."lead_submissions" USING "btree" ("product_id");



CREATE INDEX "idx_lead_submissions_submitted_at" ON "public"."lead_submissions" USING "btree" ("submitted_at" DESC);



CREATE INDEX "idx_product_custom_fields_product_id" ON "public"."product_custom_fields" USING "btree" ("product_id");



CREATE INDEX "idx_product_images_product_id" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "idx_product_specifications_product_id" ON "public"."product_specifications" USING "btree" ("product_id");



CREATE INDEX "idx_product_videos_product_id" ON "public"."product_videos" USING "btree" ("product_id");



CREATE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug");



CREATE INDEX "idx_products_status" ON "public"."products" USING "btree" ("status");



CREATE INDEX "idx_products_store_id" ON "public"."products" USING "btree" ("store_id");



CREATE INDEX "idx_public_products_slug" ON "public"."public_products" USING "btree" ("slug");



CREATE INDEX "idx_public_products_store_id" ON "public"."public_products" USING "btree" ("store_id");



CREATE INDEX "idx_public_products_store_slug" ON "public"."public_products" USING "btree" ("store_id", "slug");



CREATE INDEX "idx_public_stores_custom_domain" ON "public"."public_stores" USING "btree" ("custom_domain");



CREATE INDEX "idx_public_stores_slug" ON "public"."public_stores" USING "btree" ("slug");



CREATE INDEX "idx_stores_custom_domain" ON "public"."stores" USING "btree" ("custom_domain");



CREATE INDEX "idx_stores_slug" ON "public"."stores" USING "btree" ("slug");



CREATE INDEX "idx_stores_user_id" ON "public"."stores" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "handle_store_lead_form_settings_updated_at" BEFORE UPDATE ON "public"."store_lead_form_settings" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "lock_store_url" BEFORE UPDATE ON "public"."stores" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_custom_domain_change"();



CREATE OR REPLACE TRIGGER "on_lead_submission_notify_telegram" AFTER INSERT ON "public"."lead_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."notify_telegram_on_lead"();



CREATE OR REPLACE TRIGGER "on_product_created" AFTER INSERT ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_lead_form"();



CREATE OR REPLACE TRIGGER "sync_public_product_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."sync_public_product"();



CREATE OR REPLACE TRIGGER "sync_public_store_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."stores" FOR EACH ROW EXECUTE FUNCTION "public"."sync_public_store"();



CREATE OR REPLACE TRIGGER "update_lead_form_configs_updated_at" BEFORE UPDATE ON "public"."lead_form_configs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_stores_updated_at" BEFORE UPDATE ON "public"."stores" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."lead_form_configs"
    ADD CONSTRAINT "lead_form_configs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_form_fields"
    ADD CONSTRAINT "lead_form_fields_lead_form_config_id_fkey" FOREIGN KEY ("lead_form_config_id") REFERENCES "public"."lead_form_configs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_submissions"
    ADD CONSTRAINT "lead_submissions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_custom_fields"
    ADD CONSTRAINT "product_custom_fields_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_specifications"
    ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_videos"
    ADD CONSTRAINT "product_videos_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."product_themes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_products"
    ADD CONSTRAINT "public_products_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_products"
    ADD CONSTRAINT "public_products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."public_stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_products"
    ADD CONSTRAINT "public_products_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."product_themes"("id");



ALTER TABLE ONLY "public"."public_stores"
    ADD CONSTRAINT "public_stores_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_lead_form_settings"
    ADD CONSTRAINT "store_lead_form_settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can submit leads to published products" ON "public"."lead_submissions" FOR INSERT WITH CHECK (("product_id" IN ( SELECT "public_products"."id"
    FROM "public"."public_products")));



CREATE POLICY "Anyone can view themes" ON "public"."product_themes" FOR SELECT USING (true);



CREATE POLICY "Authenticated users view own products only" ON "public"."products" FOR SELECT TO "authenticated" USING (("store_id" IN ( SELECT "stores"."id"
   FROM "public"."stores"
  WHERE ("stores"."user_id" = "auth"."uid"()))));



COMMENT ON POLICY "Authenticated users view own products only" ON "public"."products" IS 'STRICT: Authenticated users can ONLY view products from stores they own. No public access. Storefront uses public_products table.';



CREATE POLICY "Authenticated users view own stores only" ON "public"."stores" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



COMMENT ON POLICY "Authenticated users view own stores only" ON "public"."stores" IS 'STRICT: Authenticated users can ONLY view stores they own. No public access. Storefront uses public_stores table.';



CREATE POLICY "Public can view custom_fields via public_products" ON "public"."product_custom_fields" FOR SELECT USING (("product_id" IN ( SELECT "public_products"."id"
   FROM "public"."public_products")));



CREATE POLICY "Public can view images via public_products" ON "public"."product_images" FOR SELECT USING (("product_id" IN ( SELECT "public_products"."id"
   FROM "public"."public_products")));



CREATE POLICY "Public can view lead_form_fields via public_products" ON "public"."lead_form_fields" FOR SELECT USING (("lead_form_config_id" IN ( SELECT "lead_form_configs"."id"
   FROM "public"."lead_form_configs"
  WHERE ("lead_form_configs"."product_id" IN ( SELECT "public_products"."id"
           FROM "public"."public_products")))));



CREATE POLICY "Public can view lead_forms via public_products" ON "public"."lead_form_configs" FOR SELECT USING (("product_id" IN ( SELECT "public_products"."id"
   FROM "public"."public_products")));



CREATE POLICY "Public can view specs via public_products" ON "public"."product_specifications" FOR SELECT USING (("product_id" IN ( SELECT "public_products"."id"
   FROM "public"."public_products")));



CREATE POLICY "Public can view store lead form settings" ON "public"."store_lead_form_settings" FOR SELECT USING (("store_id" IN ( SELECT "public_stores"."id"
    FROM "public"."public_stores")));



CREATE POLICY "Public can view videos via public_products" ON "public"."product_videos" FOR SELECT USING (("product_id" IN ( SELECT "public_products"."id"
   FROM "public"."public_products")));



CREATE POLICY "Public read access to public_products" ON "public"."public_products" FOR SELECT USING (true);



COMMENT ON POLICY "Public read access to public_products" ON "public"."public_products" IS 'Allows anyone (including anonymous users) to view all published products on the storefront.';



CREATE POLICY "Public read access to public_stores" ON "public"."public_stores" FOR SELECT USING (true);



COMMENT ON POLICY "Public read access to public_stores" ON "public"."public_stores" IS 'Allows anyone (including anonymous users) to view all stores on the storefront.';



CREATE POLICY "Users can create products in their stores" ON "public"."products" FOR INSERT WITH CHECK (("store_id" IN ( SELECT "stores"."id"
   FROM "public"."stores"
  WHERE ("stores"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create stores" ON "public"."stores" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own products" ON "public"."products" FOR DELETE USING (("store_id" IN ( SELECT "stores"."id"
   FROM "public"."stores"
  WHERE ("stores"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete their own stores" ON "public"."stores" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own store lead form settings" ON "public"."store_lead_form_settings" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "stores"."user_id"
   FROM "public"."stores"
  WHERE ("stores"."id" = "store_lead_form_settings"."store_id"))));



CREATE POLICY "Users can manage their lead form configs" ON "public"."lead_form_configs" USING (("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."stores" "s" ON (("p"."store_id" = "s"."id")))
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their lead form fields" ON "public"."lead_form_fields" USING (("lead_form_config_id" IN ( SELECT "lfc"."id"
   FROM (("public"."lead_form_configs" "lfc"
     JOIN "public"."products" "p" ON (("lfc"."product_id" = "p"."id")))
     JOIN "public"."stores" "s" ON (("p"."store_id" = "s"."id")))
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their product custom fields" ON "public"."product_custom_fields" USING (("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."stores" "s" ON (("p"."store_id" = "s"."id")))
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their product images" ON "public"."product_images" USING (("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."stores" "s" ON (("p"."store_id" = "s"."id")))
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their product specifications" ON "public"."product_specifications" USING (("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."stores" "s" ON (("p"."store_id" = "s"."id")))
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their product videos" ON "public"."product_videos" USING (("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."stores" "s" ON (("p"."store_id" = "s"."id")))
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own products" ON "public"."products" FOR UPDATE USING (("store_id" IN ( SELECT "stores"."id"
   FROM "public"."stores"
  WHERE ("stores"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own store lead form settings" ON "public"."store_lead_form_settings" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "stores"."user_id"
   FROM "public"."stores"
  WHERE ("stores"."id" = "store_lead_form_settings"."store_id"))));



CREATE POLICY "Users can update their own stores" ON "public"."stores" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their lead submissions" ON "public"."lead_submissions" FOR SELECT USING (("product_id" IN ( SELECT "p"."id"
   FROM ("public"."products" "p"
     JOIN "public"."stores" "s" ON (("p"."store_id" = "s"."id")))
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own store lead form settings" ON "public"."store_lead_form_settings" FOR SELECT USING (("auth"."uid"() IN ( SELECT "stores"."user_id"
   FROM "public"."stores"
  WHERE ("stores"."id" = "store_lead_form_settings"."store_id"))));



ALTER TABLE "public"."lead_form_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_form_fields" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_custom_fields" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_specifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_themes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_videos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_stores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_lead_form_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stores" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."check_domain_available"("domain_slug" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."check_domain_available"("domain_slug" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_domain_available"("domain_slug" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_lead_form"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_lead_form"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_lead_form"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_telegram_on_lead"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_telegram_on_lead"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_telegram_on_lead"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_custom_domain_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_custom_domain_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_custom_domain_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_public_product"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_public_product"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_public_product"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_public_store"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_public_store"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_public_store"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."lead_form_configs" TO "anon";
GRANT ALL ON TABLE "public"."lead_form_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_form_configs" TO "service_role";



GRANT ALL ON TABLE "public"."lead_form_fields" TO "anon";
GRANT ALL ON TABLE "public"."lead_form_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_form_fields" TO "service_role";



GRANT ALL ON TABLE "public"."lead_submissions" TO "anon";
GRANT ALL ON TABLE "public"."lead_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."product_custom_fields" TO "anon";
GRANT ALL ON TABLE "public"."product_custom_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."product_custom_fields" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."product_specifications" TO "anon";
GRANT ALL ON TABLE "public"."product_specifications" TO "authenticated";
GRANT ALL ON TABLE "public"."product_specifications" TO "service_role";



GRANT ALL ON TABLE "public"."product_themes" TO "anon";
GRANT ALL ON TABLE "public"."product_themes" TO "authenticated";
GRANT ALL ON TABLE "public"."product_themes" TO "service_role";



GRANT ALL ON TABLE "public"."product_videos" TO "anon";
GRANT ALL ON TABLE "public"."product_videos" TO "authenticated";
GRANT ALL ON TABLE "public"."product_videos" TO "service_role";



-- GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."public_products" TO "anon";
GRANT ALL ON TABLE "public"."public_products" TO "authenticated";
GRANT ALL ON TABLE "public"."public_products" TO "service_role";



GRANT ALL ON TABLE "public"."public_stores" TO "anon";
GRANT ALL ON TABLE "public"."public_stores" TO "authenticated";
GRANT ALL ON TABLE "public"."public_stores" TO "service_role";



GRANT ALL ON TABLE "public"."store_lead_form_settings" TO "anon";
GRANT ALL ON TABLE "public"."store_lead_form_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."store_lead_form_settings" TO "service_role";



-- GRANT ALL ON TABLE "public"."stores" TO "anon";
GRANT ALL ON TABLE "public"."stores" TO "authenticated";
GRANT ALL ON TABLE "public"."stores" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































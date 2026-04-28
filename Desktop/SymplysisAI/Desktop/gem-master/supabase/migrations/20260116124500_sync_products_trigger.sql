
-- 1. Ensure public_products has the new columns (ONLY what is needed)
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS variant_selection_title text DEFAULT 'Choose the Variant';
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS seo_description text;

-- 2. Create the Sync Function (EXCLUDING Google Sheets)
-- Added SECURITY DEFINER to bypass RLS errors
CREATE OR REPLACE FUNCTION sync_products_to_public()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public_products WHERE id = OLD.id;
        RETURN OLD;
    ELSE
        INSERT INTO public_products (
            id, store_id, theme_id, name, slug, description, short_description, 
            price, compare_price, currency, status, highlights, 
            seo_title, seo_description, 
            created_at, updated_at, layout_config, variant_selection_title, variants
        )
        VALUES (
            NEW.id, NEW.store_id, NEW.theme_id, NEW.name, NEW.slug, NEW.description, NEW.short_description, 
            NEW.price, NEW.compare_price, NEW.currency, NEW.status, NEW.highlights, 
            NEW.seo_title, NEW.seo_description, 
            NEW.created_at, NEW.updated_at, NEW.layout_config, NEW.variant_selection_title, NEW.variants
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
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the Trigger
DROP TRIGGER IF EXISTS trigger_sync_products_to_public ON products;

CREATE TRIGGER trigger_sync_products_to_public
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION sync_products_to_public();

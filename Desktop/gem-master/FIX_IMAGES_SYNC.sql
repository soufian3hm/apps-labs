-- 1. Add images column to public_products if not exists
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- 2. Update Sync Function to include images
CREATE OR REPLACE FUNCTION sync_products_to_public()
RETURNS TRIGGER AS $$
DECLARE
    product_images_json JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public_products WHERE id = OLD.id;
        RETURN OLD;
    END IF;

    -- Fetch images
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'url', url,
            'alt_text', alt_text,
            'image_type', image_type,
            'sort_order', sort_order
        ) ORDER BY sort_order ASC
    )
    INTO product_images_json
    FROM product_images
    WHERE product_id = NEW.id;

    -- Handle null (no images)
    IF product_images_json IS NULL THEN
        product_images_json := '[]'::jsonb;
    END IF;

    INSERT INTO public_products (
        id, store_id, theme_id, name, slug, description, short_description,
        price, compare_price, currency, status, highlights, layout_config,
        seo_title, seo_description, variant_selection_title, variants, variant_prices,
        images,
        created_at, updated_at
    )
    VALUES (
        NEW.id, NEW.store_id, NEW.theme_id, NEW.name, NEW.slug, NEW.description, NEW.short_description,
        NEW.price, NEW.compare_price, NEW.currency, NEW.status, NEW.highlights, NEW.layout_config,
        NEW.seo_title, NEW.seo_description, NEW.variant_selection_title, NEW.variants, NEW.variant_prices,
        product_images_json,
        NEW.created_at, NEW.updated_at
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
        layout_config = EXCLUDED.layout_config,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description,
        variant_selection_title = EXCLUDED.variant_selection_title,
        variants = EXCLUDED.variants,
        variant_prices = EXCLUDED.variant_prices,
        images = EXCLUDED.images,
        updated_at = EXCLUDED.updated_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create Trigger on product_images to touch products
CREATE OR REPLACE FUNCTION touch_product_on_image_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE products SET updated_at = NOW() WHERE id = OLD.product_id;
        RETURN OLD;
    ELSE
        UPDATE products SET updated_at = NOW() WHERE id = NEW.product_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_touch_product_images ON product_images;
CREATE TRIGGER trigger_touch_product_images
AFTER INSERT OR UPDATE OR DELETE ON product_images
FOR EACH ROW EXECUTE FUNCTION touch_product_on_image_change();

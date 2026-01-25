-- Add variant_prices column to products and public_products tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_prices JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS variant_prices JSONB DEFAULT '[]'::jsonb;

-- Update the sync function to include variant_prices
CREATE OR REPLACE FUNCTION sync_products_to_public()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public_products WHERE id = OLD.id;
        RETURN OLD;
    END IF;

    INSERT INTO public_products (
        id, store_id, theme_id, name, slug, description, short_description,
        price, compare_price, status, highlights, layout_config,
        seo_title, seo_description, variant_selection_title, variants, variant_prices,
        created_at, updated_at
    )
    VALUES (
        NEW.id, NEW.store_id, NEW.theme_id, NEW.name, NEW.slug, NEW.description, NEW.short_description,
        NEW.price, NEW.compare_price, NEW.status, NEW.highlights, NEW.layout_config,
        NEW.seo_title, NEW.seo_description, NEW.variant_selection_title, NEW.variants, NEW.variant_prices,
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
        status = EXCLUDED.status,
        highlights = EXCLUDED.highlights,
        layout_config = EXCLUDED.layout_config,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description,
        variant_selection_title = EXCLUDED.variant_selection_title,
        variants = EXCLUDED.variants,
        variant_prices = EXCLUDED.variant_prices,
        updated_at = EXCLUDED.updated_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

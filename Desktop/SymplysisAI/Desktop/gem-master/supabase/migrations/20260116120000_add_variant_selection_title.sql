
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_selection_title text DEFAULT 'Choose the Variant';
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;

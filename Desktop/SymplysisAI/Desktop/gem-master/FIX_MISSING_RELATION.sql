-- FIX 400 BAD REQUEST: Allow public_products to join with product_images
-- This creates a foreign key relationship so Supabase can "see" the link

ALTER TABLE product_images
DROP CONSTRAINT IF EXISTS product_images_public_products_id_fkey;

ALTER TABLE product_images 
ADD CONSTRAINT product_images_public_products_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public_products(id)
ON DELETE CASCADE;

-- Allow public access to images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Images" ON product_images;
CREATE POLICY "Public Read Images" ON product_images FOR SELECT USING (true);

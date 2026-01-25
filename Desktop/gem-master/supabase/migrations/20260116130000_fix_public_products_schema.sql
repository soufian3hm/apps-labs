
-- Fix missing columns in public_products to match products table for the sync trigger
-- Removing Google Sheet columns as requested
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public_products ADD COLUMN IF NOT EXISTS seo_description text;

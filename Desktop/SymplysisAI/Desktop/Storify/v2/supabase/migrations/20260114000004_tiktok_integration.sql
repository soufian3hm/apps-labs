-- Add tiktok_pixels column to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS tiktok_pixels JSONB DEFAULT '[]'::jsonb;

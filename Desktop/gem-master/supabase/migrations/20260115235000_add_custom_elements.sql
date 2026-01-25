-- Add custom_elements column to store_lead_form_settings table
-- This column stores JSON data for custom form elements like buttons, text, images, etc.

ALTER TABLE store_lead_form_settings 
ADD COLUMN IF NOT EXISTS custom_elements jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN store_lead_form_settings.custom_elements IS 'JSON array of custom form elements (buttons, text, images, dropdowns, etc.)';

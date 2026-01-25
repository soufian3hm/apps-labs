-- Update the first 5 themes to be clean, white-background themes
-- This replaces the "shitty" themes while keeping existing product references working

INSERT INTO public.product_themes (id, name, primary_color, secondary_color, accent_color, background_color, text_color, font_family, button_style, hero_layout, section_spacing)
VALUES 
-- 1. Modern Blue
('00000000-0000-0000-0000-000000000001', 'Sapphire Clean', '#2563eb', '#eff6ff', '#1d4ed8', '#ffffff', '#0f172a', 'Inter', 'rounded', 'split', 'spacious'),
-- 2. Clean Green
('00000000-0000-0000-0000-000000000002', 'Emerald Minimal', '#059669', '#ecfdf5', '#047857', '#ffffff', '#0f172a', 'Inter', 'pill', 'centered', 'spacious'),
-- 3. Stark Black
('00000000-0000-0000-0000-000000000003', 'Obsidian Mono', '#000000', '#f9fafb', '#333333', '#ffffff', '#000000', 'Inter', 'square', 'full-width', 'spacious'),
-- 4. Warm Orange
('00000000-0000-0000-0000-000000000004', 'Sunset White', '#ea580c', '#fff7ed', '#c2410c', '#ffffff', '#0f172a', 'Inter', 'rounded', 'split', 'spacious'),
-- 5. Soft Pink
('00000000-0000-0000-0000-000000000005', 'Berry Clean', '#db2777', '#fdf2f8', '#be185d', '#ffffff', '#0f172a', 'Inter', 'pill', 'centered', 'spacious') 

ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    accent_color = EXCLUDED.accent_color,
    background_color = EXCLUDED.background_color,
    text_color = EXCLUDED.text_color,
    font_family = EXCLUDED.font_family,
    button_style = EXCLUDED.button_style,
    hero_layout = EXCLUDED.hero_layout,
    section_spacing = EXCLUDED.section_spacing;

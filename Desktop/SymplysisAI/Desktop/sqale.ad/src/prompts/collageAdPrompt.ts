export interface CollageAdPromptParams {
  productName1: string
  productName2: string
  brandName: string
  brandNameOnLabel: string
  surfaceType: string
  liquidColor1: string
  liquidColor2: string
  nailPolishColor: string
  topRightBackground: string
  bottomLeftBackground: string
  hairColor: string
  clothingColor: string
  mainHeadlineText: string
  authorCreditText: string
  aspectRatio: string
  language: string
}

export const buildCollageAdPrompt = (params: CollageAdPromptParams): string => {
  const {
    productName1,
    productName2,
    brandName,
    brandNameOnLabel,
    surfaceType,
    liquidColor1,
    liquidColor2,
    nailPolishColor,
    topRightBackground,
    bottomLeftBackground,
    hairColor,
    clothingColor,
    mainHeadlineText,
    authorCreditText,
    aspectRatio,
    language
  } = params

  return `
🚨 CRITICAL PRODUCT PRESERVATION REQUIREMENT:
You are provided with a REFERENCE IMAGE containing the actual product. You MUST:
- Use the EXACT product from the reference image - do NOT recreate, redesign, or modify it
- Preserve EVERY micro-detail from the reference image:
- EXACT product shape, size, dimensions, proportions
- EXACT colors, shades, textures, materials
- EXACT labels, text, logos, branding (every letter, number, symbol)
- EXACT packaging design, bottle shape, cap design
- EXACT product details, features, visual characteristics
- EXACT lighting and shadows on the product
- DO NOT change, modify, or recreate the product - use it EXACTLY as shown
- Only change the composition, layout, background, and add the requested elements around the product

**QUALITY & RESOLUTION REQUIREMENTS**:
- 4K ultra-high resolution (4096x4096 minimum for square, proportionally scaled for other orientations)
- Insanely detailed textures with micro-detail precision
- Professional-grade shaders with realistic material properties
- Photorealistic lighting with accurate shadows, reflections, and highlights
- Ultra-sharp focus on all elements with perfect depth of field control
- Premium quality rendering with no compression artifacts

Generate a four-panel collage-style social media advertisement in a clean, bright, editorial style with 4K quality, insanely detailed textures, and premium visual fidelity.

**Layout Structure - Four Panels**:

- **Top-Left Panel**:
  * Use the EXACT product(s) from the reference image - preserve all details
  * If the reference shows one product, use that EXACT product. If it shows multiple products, use those EXACT products
  * Place the EXACT product(s) on a ${surfaceType} surface
  * Preserve the EXACT labels, text, logos, and branding from the reference image
  * The liquid inside should match the EXACT color from the reference image (${liquidColor1} and ${liquidColor2} are suggestions, but use the reference image's actual colors)
  * Professional product photography style
  * DO NOT recreate or modify the product - use it EXACTLY as shown in the reference

- **Top-Right Panel**:
  * A hand with ${nailPolishColor} nails holds the EXACT product from the reference image
  * Use the EXACT product - preserve all its details, labels, colors, shape
  * Background: ${topRightBackground}
  * Clean, bright aesthetic
  * Product should be clearly visible with ALL its original details preserved

- **Bottom-Left Panel**:
  * A different hand with ${nailPolishColor} nails holds the EXACT product from the reference image
  * Use the EXACT product - preserve all its details, labels, colors, shape
  * Background: ${bottomLeftBackground}
  * Clean, bright aesthetic
  * Product should be clearly visible with ALL its original details preserved

- **Bottom-Right Panel**:
  * A woman with ${hairColor} hair and natural makeup
  * Looking directly at the camera
  * Wearing a ${clothingColor} robe/clothing
  * Natural, editorial portrait style

- **Overlay Text**:
  * A large white rectangular text box with black text overlays the center of the four panels
  * Main headline: "${mainHeadlineText}" (in ${language}) - must be rendered with perfect accuracy, every character exactly as specified
  * Below it, author credit: "${authorCreditText}" (in ${language}, e.g., "PAR SOPHIE") - must be rendered with perfect accuracy
  * Text should be clearly readable and well-positioned with premium quality

**Overall Style**:
- Clean, bright, and editorial aesthetic
- Four-panel collage layout
- Professional beauty product photography
- Highlighting the beauty products prominently
- Modern social media advertisement style
- High-quality, magazine-editorial look

**Color Palette**:
- Bright, clean backgrounds
- Natural skin tones
- Product colors: ${liquidColor1} and ${liquidColor2}
- Nail polish: ${nailPolishColor}
- Hair: ${hairColor}
- Clothing: ${clothingColor}
- White text box with black text for overlay

**Typography & Text Accuracy**:
- CRITICAL: All text must be rendered with 100% accuracy - every character, letter, number, and symbol exactly as specified
- Main headline: Large, bold, black text in white box - choose an elegant, editorial font that matches the beauty/editorial aesthetic (could be serif for sophistication or modern sans-serif for contemporary feel)
- Author credit: Smaller, black text below headline - choose a complementary, refined font
- Product names and brand names: Choose fonts that match the beauty/editorial style - elegant, refined, sophisticated
- All text must be in ${language} language with perfect character rendering
- Font selection should match the clean, bright, editorial aesthetic - elegant, modern, magazine-quality
- NO hardcoded fonts - intelligently select fonts that enhance the beauty product editorial design aesthetic
- Text must have perfect contrast, sharp edges, and be completely readable
- All text must be rendered as actual text, not as part of the image background
- Excellent readability with perfect typography hierarchy

**Visual Quality & Details**:
- 4K resolution with insanely detailed textures throughout
- Professional-grade shaders for all materials (glass, liquids, skin, fabrics, surfaces, etc.)
- Realistic lighting with natural, bright color temperature
- Perfect shadows with soft, natural falloff
- Accurate reflections on reflective surfaces (glass bottles, surfaces, etc.)
- Subtle texture details visible even at close inspection
- Skin rendered with realistic detail and natural appearance
- Product bottles with perfect glass/material rendering
- Liquid colors with realistic transparency and refraction
- No compression artifacts, pixelation, or quality loss
- Premium rendering quality matching high-end beauty editorial photography

**Aspect Ratio**: ${aspectRatio}

**Final Output**:
- 4K ultra high-resolution, professional four-panel collage advertisement
- Magazine-quality editorial graphic with insanely detailed textures
- All text rendered with 100% accuracy in ${language}
- Clean, bright aesthetic suitable for beauty product social media marketing
- Professional product presentation with editorial style
- Premium quality shaders, textures, and lighting throughout
- Perfect typography with intelligently selected fonts matching the beauty/editorial aesthetic
`.trim()
}


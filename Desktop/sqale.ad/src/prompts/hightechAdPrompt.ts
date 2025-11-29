export interface HightechAdPromptParams {
  brandLogo: string
  brandName: string
  mainOfferHeadline: string
  productDescription: string
  productNameAndDetails: string
  feature1Text: string
  feature2Text: string
  feature3Text: string
  aspectRatio: string
  language: string
}

export const buildHightechAdPrompt = (params: HightechAdPromptParams): string => {
  const {
    brandLogo,
    brandName,
    mainOfferHeadline,
    productDescription,
    productNameAndDetails,
    feature1Text,
    feature2Text,
    feature3Text,
    aspectRatio,
    language
  } = params

  const displayBrand = brandLogo || brandName

  return `
Generate a sleek, high-tech product advertisement in a modern, futuristic style with 4K quality, insanely detailed textures, and premium visual fidelity.

**QUALITY & RESOLUTION REQUIREMENTS**:
- 4K ultra-high resolution (4096x4096 minimum for square, proportionally scaled for other orientations)
- Insanely detailed textures with micro-detail precision
- Professional-grade shaders with realistic material properties
- Photorealistic lighting with accurate shadows, reflections, and highlights
- Ultra-sharp focus on all elements with perfect depth of field control
- Premium quality rendering with no compression artifacts

**Background**:
- Dark gradient background with subtle blue and green illumination
- Ultra-smooth gradient blending with no banding or artifacts
- High-tech, futuristic aesthetic with premium quality
- Professional tech product photography style
- Subtle texture depth and material quality in the background

**Layout Structure**:
- Top Center:
  * Brand logo or brand name "${displayBrand}" displayed in white (in ${language}) - must be rendered with perfect accuracy
  * Positioned prominently at the top center with premium quality

- Main Headline:
  * Large, prominent headline in green and white text: "${mainOfferHeadline}" (in ${language}) - must be rendered with perfect accuracy, every character exactly as specified
  * This is the main attention-grabbing element
  * Should be bold and visually striking with perfect text rendering

- Product Description:
  * White text below the headline: "${productDescription}" (in ${language}) - must be rendered with perfect accuracy
  * Clear, readable description of the product

- Main Product:
  * The main subject is ${productNameAndDetails}
  * Product should be prominently displayed with 4K quality detail
  * Every surface, button, screen, port, and feature must be rendered with microscopic precision
  * Well-lit with dramatic, high-tech lighting that enhances the futuristic aesthetic
  * Clearly visible with perfect focus and depth of field
  * High-tech, sleek appearance with premium material shaders
  * Professional product photography quality with studio-grade lighting
  * Accurate reflections on glossy surfaces, perfect shadows, and realistic material properties

- Feature Callouts:
  * Three white callout text boxes with arrows pointing to different product features:
    - Left side: "${feature1Text}" (in ${language}) with arrow pointing to the feature - text must be perfectly accurate
    - Left side: "${feature2Text}" (in ${language}) with arrow pointing to the feature - text must be perfectly accurate
    - Right side: "${feature3Text}" (in ${language}) with arrow pointing to the feature - text must be perfectly accurate
  * Callout boxes should be clean, modern, and easy to read with premium quality
  * Arrows should clearly indicate which feature they're highlighting with perfect precision
  * Callout boxes should have subtle depth, shadows, or glow effects for premium appearance

**Color Palette**:
- Dark gradient background (blacks, dark grays) with premium color accuracy
- Subtle blue and green illumination/accents with realistic glow effects
- White text for readability with perfect contrast
- Green and white for the main headline with vibrant, accurate colors
- High contrast for visibility with professional color grading

**Typography & Text Accuracy**:
- CRITICAL: All text must be rendered with 100% accuracy - every character, letter, number, and symbol exactly as specified
- Brand logo/name: White, prominent, top center - choose a modern, tech-forward font (sleek sans-serif, futuristic, geometric)
- Main headline: Large, bold, green and white text - choose an attention-grabbing, high-tech font that emphasizes the offer
- Product description: White, readable size - choose a clean, modern font optimized for body text
- Feature callouts: White text in callout boxes - choose a legible, tech-forward font
- All text must be in ${language} language with perfect character rendering
- Font selection should match the sleek, high-tech, futuristic aesthetic - modern, bold, cutting-edge
- NO hardcoded fonts - intelligently select fonts that enhance the tech product design aesthetic
- Text must have perfect contrast, sharp edges, and be completely readable
- All text must be rendered as actual text, not as part of the image background

**Visual Quality & Details**:
- 4K resolution with insanely detailed textures throughout
- Professional-grade shaders for all materials (metals, plastics, screens, glass, etc.)
- Realistic lighting with dramatic, high-tech color temperature
- Perfect shadows with soft, natural falloff
- Accurate reflections on reflective surfaces (screens, glossy plastics, metals)
- Glow effects on illuminated elements with realistic light emission
- Subtle texture details visible even at close inspection
- Product features rendered with microscopic precision
- No compression artifacts, pixelation, or quality loss
- Premium rendering quality matching high-end tech product photography

**Overall Style**:
- Sleek, high-tech aesthetic with premium quality
- Futuristic, modern design with perfect execution
- Professional tech product advertisement with 4K detail
- Clean, minimal layout with focus on product
- High-quality product photography with studio-grade lighting

**Aspect Ratio**: ${aspectRatio}

**Final Output**:
- 4K ultra high-resolution, professional high-tech product advertisement
- Magazine-quality commercial graphic with insanely detailed textures
- All text rendered with 100% accuracy in ${language}
- Sleek, modern design suitable for tech product marketing
- Professional product presentation with clear feature highlights
- Premium quality shaders, textures, and lighting throughout
- Perfect typography with intelligently selected fonts matching the high-tech aesthetic
`.trim()
}


export interface EcommerceAdPromptParams {
  productName: string
  productDescription: string
  brandLogo?: string
  titleText: string
  taglineText: string
  bodyText: string
  ctaText: string
  ctaButtonColor: string
  humanPose1: string
  humanPose2: string
  backgroundColors: string
  aspectRatio: string
  language: string
}

export const buildEcommerceAdPrompt = (params: EcommerceAdPromptParams): string => {
  const {
    productName,
    productDescription,
    brandLogo,
    titleText,
    taglineText,
    bodyText,
    ctaText,
    ctaButtonColor,
    humanPose1,
    humanPose2,
    backgroundColors,
    aspectRatio,
    language
  } = params

  return `
Generate a professional e-commerce advertisement graphic in a modern, clean layout style with 4K quality, insanely detailed textures, and premium visual fidelity.

**QUALITY & RESOLUTION REQUIREMENTS**:
- 4K ultra-high resolution (4096x4096 minimum for square, proportionally scaled for other orientations)
- Insanely detailed textures with micro-detail precision
- Professional-grade shaders with realistic material properties
- Photorealistic lighting with accurate shadows, reflections, and highlights
- Ultra-sharp focus on all elements with perfect depth of field control
- Premium quality rendering with no compression artifacts

**Layout Structure**:
- Left Side:
  * ${brandLogo ? `Brand logo "${brandLogo}" positioned at the top left with premium quality, sharp edges, and perfect clarity` : 'Brand logo area at the top left (if logo is provided)'}
  * Large, prominent title text: "${titleText}" (in ${language}) - must be rendered with perfect accuracy, every character exactly as specified
  * Smaller tagline text below title: "${taglineText}" (in ${language}) - must be rendered with perfect accuracy
  * Body paragraph text: "${bodyText}" (in ${language}) - must be rendered with perfect accuracy, all text exactly as provided
  * CTA button with text "${ctaText}" (in ${language}) in ${ctaButtonColor} color, positioned below the text content - text must be perfectly accurate

- Right Side:
  * Main product "${productName}: ${productDescription}" displayed prominently on a blue pedestal with ultra-realistic materials, showcasing all its key features with microscopic detail
  * Two framed photographs showing the product in use with photorealistic quality:
    - Top frame: ${humanPose1} - ultra-high detail, natural lighting, perfect composition
    - Bottom frame: ${humanPose2} - ultra-high detail, natural lighting, perfect composition

**Background**:
- Smooth gradient using ${backgroundColors} with premium quality color transitions
- Ultra-smooth gradient blending with no banding or artifacts
- Professional, clean aesthetic with subtle texture depth
- High-quality material shaders for any surface elements

**Product Display**:
- The main product should be the hero element with 4K quality detail
- Every surface texture, material property, and reflection must be rendered with insanely high detail
- Product should be displayed on a blue pedestal with realistic material properties (glossy, matte, or textured as appropriate)
- Show product features with microscopic precision - every button, label, texture, and detail must be crystal clear
- Professional studio lighting with accurate shadows, highlights, and reflections
- Depth of field should enhance the product focus while maintaining background clarity

**Typography & Text Accuracy**:
- CRITICAL: All text must be rendered with 100% accuracy - every character, letter, number, and symbol exactly as specified
- Title text: Large, bold, attention-grabbing font - choose a modern, professional font that matches the e-commerce aesthetic (sans-serif, clean, contemporary)
- Tagline: Medium size, supporting the title - choose a complementary font that enhances readability
- Body text: Readable, professional font size - choose a legible font optimized for body text
- All text must be in ${language} language with perfect character rendering
- Font selection should match the professional e-commerce vibe - modern, trustworthy, clean
- NO hardcoded fonts - intelligently select fonts that enhance the design aesthetic
- Text must have perfect contrast, sharp edges, and be completely readable
- All text must be rendered as actual text, not as part of the image background

**CTA Button**:
- Color: ${ctaButtonColor} with premium material shader (glossy or matte finish as appropriate)
- Text: "${ctaText}" (in ${language}) - must be perfectly accurate
- Prominent, clickable appearance with realistic depth and shadow
- Professional button styling with subtle 3D effect or gradient
- Button should have premium quality with perfect edges and smooth surfaces

**Human Poses**:
- Top frame: ${humanPose1} - should show natural, authentic product usage with photorealistic quality
- Bottom frame: ${humanPose2} - should show different angle or context of product usage with photorealistic quality
- Both frames should be well-composed, professional product-in-use photography style
- Ultra-high detail on skin, clothing, and product interaction
- Natural lighting with accurate shadows and highlights
- Perfect focus and depth of field

**Visual Quality & Details**:
- 4K resolution with insanely detailed textures throughout
- Professional-grade shaders for all materials (metals, plastics, fabrics, glass, etc.)
- Realistic lighting with accurate color temperature and intensity
- Perfect shadows with soft, natural falloff
- Accurate reflections on reflective surfaces
- Subtle texture details visible even at close inspection
- No compression artifacts, pixelation, or quality loss
- Premium rendering quality matching high-end commercial photography

**Overall Style**:
- Professional e-commerce advertisement aesthetic with premium quality
- Clean, modern layout with perfect spacing and alignment
- High-quality product photography with studio-grade lighting
- Balanced composition with clear visual hierarchy
- Aspect Ratio: ${aspectRatio}
- Every element rendered with maximum detail and quality

**Final Output**:
- 4K ultra high-resolution, professional e-commerce advertisement
- Magazine-quality commercial graphic with insanely detailed textures
- All text rendered with 100% accuracy in ${language}
- Professional product presentation with photorealistic quality
- Modern, clean design suitable for online and print advertising
- Premium quality shaders, textures, and lighting throughout
- Perfect typography with intelligently selected fonts matching the aesthetic
`.trim()
}


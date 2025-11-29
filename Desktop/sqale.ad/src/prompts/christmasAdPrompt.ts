export interface ChristmasAdPromptParams {
  brandLogoText: string
  titleText: string
  descriptiveText: string
  productWornByModel: string
  websiteUrl: string
  slogan: string
  discountDetails: string
  discountCode: string
  aspectRatio: string
  language: string
}

export const buildChristmasAdPrompt = (params: ChristmasAdPromptParams): string => {
  const {
    brandLogoText,
    titleText,
    descriptiveText,
    productWornByModel,
    websiteUrl,
    slogan,
    discountDetails,
    discountCode,
    aspectRatio,
    language
  } = params

  return `
Generate a festive, warm-toned Christmas advertisement in a professional, modern style with 4K quality, insanely detailed textures, and premium visual fidelity.

**QUALITY & RESOLUTION REQUIREMENTS**:
- 4K ultra-high resolution (4096x4096 minimum for square, proportionally scaled for other orientations)
- Insanely detailed textures with micro-detail precision
- Professional-grade shaders with realistic material properties
- Photorealistic lighting with accurate shadows, reflections, and highlights
- Ultra-sharp focus on all elements with perfect depth of field control
- Premium quality rendering with no compression artifacts

**Layout Structure**:
- Top Left:
  * Large white text displaying the brand logo: "${brandLogoText}" (in ${language}) - must be rendered with perfect accuracy, every character exactly as specified
  * Below it, smaller white text: "${titleText}" (in ${language}) - must be rendered with perfect accuracy
  * Further below, descriptive text: "${descriptiveText}" (in ${language}) - must be rendered with perfect accuracy

- Main Subject:
  * The main subject is ${productWornByModel}
  * The subject should be prominently displayed with 4K quality detail
  * Ultra-realistic rendering of clothing, fabric textures, and product details
  * Well-lit with natural, warm lighting that enhances the festive mood
  * Clearly visible with perfect focus and depth of field
  * Position the subject standing on a white floor with realistic material properties

- Background Elements:
  * Softly blurred Christmas tree in the background with detailed branches, ornaments, and lights
  * Warm bokeh lights creating a festive atmosphere with beautiful depth of field
  * Falling snowflakes throughout the scene with individual detail and realistic motion blur
  * Warm, festive color tones throughout with premium color grading
  * Every background element rendered with high detail and quality

- Bottom Banner:
  * A wavy beige and teal banner at the bottom of the image with premium material quality
  * Left side of banner:
    - White text: "${websiteUrl}" (in ${language}) - must be perfectly accurate
    - White text: "${slogan}" (in ${language}) - must be perfectly accurate
  * Right side of banner:
    - Large black text: "${discountDetails}" (in ${language}) - must be perfectly accurate
    - Large black text: "${discountCode}" (in ${language}) - must be perfectly accurate

**Color Palette**:
- Warm-toned Christmas colors (reds, greens, golds, creams) with premium color accuracy
- White floor and text for contrast with perfect material rendering
- Beige and teal for the bottom banner with smooth, high-quality gradients
- Warm, inviting atmosphere with professional color grading

**Typography & Text Accuracy**:
- CRITICAL: All text must be rendered with 100% accuracy - every character, letter, number, and symbol exactly as specified
- Brand logo text: Large, bold, white - choose a festive, elegant font that matches the Christmas holiday vibe (could be serif for elegance or modern sans-serif for contemporary feel)
- Title text: Medium size, white - choose a complementary font that enhances the festive mood
- Descriptive text: Smaller, white - choose a readable font optimized for body text
- Website URL and slogan: White text on banner - choose a clean, legible font
- Discount details and code: Large, bold, black text on banner - choose an attention-grabbing font that emphasizes the offer
- All text must be in ${language} language with perfect character rendering
- Font selection should match the festive, warm Christmas aesthetic - elegant yet approachable
- NO hardcoded fonts - intelligently select fonts that enhance the holiday design aesthetic
- Text must have perfect contrast, sharp edges, and be completely readable
- All text must be rendered as actual text, not as part of the image background

**Visual Quality & Details**:
- 4K resolution with insanely detailed textures throughout
- Professional-grade shaders for all materials (fabrics, floor, banner, decorations, etc.)
- Realistic lighting with warm, festive color temperature
- Perfect shadows with soft, natural falloff
- Accurate reflections on reflective surfaces (ornaments, lights, etc.)
- Subtle texture details visible even at close inspection
- Individual snowflakes with unique detail and realistic appearance
- Christmas tree ornaments with detailed reflections and textures
- No compression artifacts, pixelation, or quality loss
- Premium rendering quality matching high-end commercial photography

**Overall Style**:
- Festive, warm-toned Christmas aesthetic with premium quality
- Professional advertisement quality with 4K detail
- Modern, clean design with perfect execution
- Cozy, inviting atmosphere with realistic warmth
- High-quality product photography style with studio-grade lighting

**Aspect Ratio**: ${aspectRatio}

**Final Output**:
- 4K ultra high-resolution, professional Christmas advertisement
- Magazine-quality commercial graphic with insanely detailed textures
- All text rendered with 100% accuracy in ${language}
- Festive, warm atmosphere with premium visual quality
- Professional product presentation suitable for holiday marketing campaigns
- Premium quality shaders, textures, and lighting throughout
- Perfect typography with intelligently selected fonts matching the festive aesthetic
`.trim()
}


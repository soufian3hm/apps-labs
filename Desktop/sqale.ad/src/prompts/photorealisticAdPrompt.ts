export interface PhotorealisticAdPromptParams {
  backgroundSetting: string
  headlineColor: string
  mainHeadlineText: string
  bodyText: string
  productName: string
  brandLogo: string
  flavorOrVariant: string
  productIngredientsOrForms: string
  calloutColor: string
  calloutText1: string
  calloutText2: string
  aspectRatio: string
  language: string
}

export const buildPhotorealisticAdPrompt = (params: PhotorealisticAdPromptParams): string => {
  const {
    backgroundSetting,
    headlineColor,
    mainHeadlineText,
    bodyText,
    productName,
    brandLogo,
    flavorOrVariant,
    productIngredientsOrForms,
    calloutColor,
    calloutText1,
    calloutText2,
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
- EXACT packaging design, bottle shape, cap design, any unique features
- EXACT product details, visual characteristics, any markings or patterns
- EXACT lighting and shadows on the product
- DO NOT change, modify, or recreate the product - use it EXACTLY as shown
- Only change the composition, layout, background, add floating ingredients around it, and add the requested text elements

**QUALITY & RESOLUTION REQUIREMENTS**:
- 4K ultra-high resolution (4096x4096 minimum for square, proportionally scaled for other orientations)
- Insanely detailed textures with micro-detail precision
- Professional-grade shaders with realistic material properties
- Photorealistic lighting with accurate shadows, reflections, and highlights
- Ultra-sharp focus on all elements with perfect depth of field control
- Premium quality rendering with no compression artifacts

Generate a photorealistic product advertisement in a bright, clean, modern style with 4K quality, insanely detailed textures, and premium visual fidelity.

**Background**:
- Bright, clean ${backgroundSetting} (e.g., modern kitchen, bathroom counter)
- Professional product photography setting
- Natural, well-lit environment

**Layout Structure**:

- **Top Section**:
  * Large, bold headline in ${headlineColor} color: "${mainHeadlineText}" (in ${language}) - must be rendered with perfect accuracy, every character exactly as specified
  * This is the main attention-grabbing element
  * Should be prominent and visually striking with premium quality

- **Body Text**:
  * Black text below the headline: "${bodyText}" (in ${language}) - must be rendered with perfect accuracy
  * Clear, readable description of the product
  * Professional typography with perfect rendering

- **Main Product**:
  * Use the EXACT product from the reference image - preserve ALL details
  * The EXACT bottle/container from the reference with its EXACT shape, size, colors
  * Preserve the EXACT label, text, logos, branding from the reference image (every letter, number, symbol)
  * The EXACT product design, packaging, cap, any unique features
  * The bottle is "bursting" with its contents - add ${productIngredientsOrForms} floating dynamically around the EXACT product
  * Dynamic, energetic composition showing product contents in motion AROUND the preserved product
  * Product should be prominently displayed, well-lit, and clearly visible with ALL original details intact
  * DO NOT recreate or modify the product - use it EXACTLY as shown in the reference image

- **Callout Elements**:
  * Two circular callout elements in ${calloutColor} color:
    - Left callout: "${calloutText1}" (in ${language}) - must be rendered with perfect accuracy
    - Right callout: "${calloutText2}" (in ${language}) - must be rendered with perfect accuracy
  * Callouts should be clearly visible and well-positioned with premium quality
  * Modern, clean design with subtle depth and shadows

**Lighting**:
- Bright and natural lighting
- Professional product photography quality
- Clean, well-lit aesthetic

**Color Palette**:
- Bright, clean background
- Headline color: ${headlineColor}
- Callout color: ${calloutColor}
- Black text for body content
- Natural product colors

**Typography & Text Accuracy**:
- CRITICAL: All text must be rendered with 100% accuracy - every character, letter, number, and symbol exactly as specified
- Main headline: Large, bold, ${headlineColor} color - choose a modern, bold font that matches the bright, clean aesthetic (sans-serif, contemporary, attention-grabbing)
- Body text: Black, readable size - choose a clean, legible font optimized for body text
- Callout text: Clear, readable in ${calloutColor} circles - choose a bold, modern font that stands out
- All text must be in ${language} language with perfect character rendering
- Font selection should match the bright, clean, modern aesthetic - contemporary, fresh, professional
- NO hardcoded fonts - intelligently select fonts that enhance the photorealistic product design aesthetic
- Text must have perfect contrast, sharp edges, and be completely readable
- All text must be rendered as actual text, not as part of the image background
- Modern, clean font styling with perfect typography hierarchy

**Visual Quality & Details**:
- 4K resolution with insanely detailed textures throughout
- Professional-grade shaders for all materials (glass, liquids, surfaces, ingredients, etc.)
- Realistic lighting with bright, natural color temperature
- Perfect shadows with soft, natural falloff
- Accurate reflections on reflective surfaces (bottle, surfaces, etc.)
- Floating ingredients with realistic detail, transparency, and motion blur
- Subtle texture details visible even at close inspection
- Product bottle with perfect glass/material rendering and preserved details
- Dynamic elements with realistic physics and motion
- No compression artifacts, pixelation, or quality loss
- Premium rendering quality matching high-end commercial product photography

**Overall Style**:
- Photorealistic product advertisement with premium quality
- Bright, clean aesthetic with 4K detail
- Modern, professional photography with studio-grade lighting
- Dynamic composition with floating elements rendered with perfect detail
- High-quality product presentation with maximum visual fidelity

**Aspect Ratio**: ${aspectRatio}

**Final Output**:
- 4K ultra high-resolution, professional photorealistic product advertisement
- Magazine-quality commercial graphic with insanely detailed textures
- All text rendered with 100% accuracy in ${language}
- Bright, clean design suitable for product marketing
- Professional product presentation with dynamic elements
- Premium quality shaders, textures, and lighting throughout
- Perfect typography with intelligently selected fonts matching the bright, modern aesthetic
`.trim()
}


export const buildProfessionalProductPrompt = (params: {
  productName?: string
  productDescription?: string
  primaryColor: string
  accentColor: string
  orientation: string
  aspectRatio: string
  compositionType: string
  lightingStyle: string
  depthStyle: string
  moodStyle: string[]
  feelStyle: string
  artStyle: string
  visualEffects: string[]
}) => {
  const {
    primaryColor,
    accentColor,
    orientation,
    aspectRatio,
    compositionType,
    lightingStyle,
    depthStyle,
    moodStyle,
    feelStyle,
    artStyle,
    visualEffects
  } = params

  return `
Generate a high-resolution, professional product photography advertisement with a clean, minimal, and luxurious aesthetic.

**Product Focus**:
- The product should be the central focus, displayed with premium quality and attention to detail

**Photography Style**:
- Clean, minimal luxury product photography
- Soft, natural lighting that enhances the product's features
- Professional studio-quality photography
- Art Style: ${artStyle}
- Composition: ${compositionType}
- Lighting: ${lightingStyle}
- Depth: ${depthStyle}

**Visual Mood & Feel**:
- Mood: ${moodStyle.join(', ')}
- Overall Feel: ${feelStyle}
- Maintain a premium, sophisticated aesthetic throughout

**Color Palette**:
- Primary Color: ${primaryColor}
- Accent Color: ${accentColor}
- Use these colors strategically to create visual harmony and brand consistency

**Visual Effects**:
- Apply: ${visualEffects.join(', ')}
- Ensure effects enhance rather than distract from the product

**Composition & Layout**:
- Orientation: ${orientation} (Aspect Ratio: ${aspectRatio})
- Create a balanced composition that draws attention to the product
- Use negative space effectively for a clean, minimal look
- Ensure the product is positioned to showcase its best features

**Final Output**:
- Ultra high-resolution, photorealistic product photography
- Professional quality suitable for luxury brand advertising
- Clean, minimal aesthetic with soft lighting
- Premium feel that elevates the product's perceived value
- Magazine-quality commercial photography
`.trim()
}

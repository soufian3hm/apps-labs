export const buildDoveStylePrompt = (params: {
  productName?: string
  productDescription?: string
  primaryColor: string
  accentColor: string
  orientation: string
  aspectRatio: string
  backgroundType: string
  lightingStyle: string
  moodStyle: string[]
  brandKeywords: string
  decoratingItems: string
}) => {
  const {
    primaryColor,
    accentColor,
    orientation,
    aspectRatio,
    backgroundType,
    lightingStyle,
    moodStyle,
    brandKeywords,
    decoratingItems
  } = params

  return `
Generate multiple ad variations with randomized styles - a multi-variation ad grid in the Dove advertising style.

**Product Information**:
- Brand Keywords: ${brandKeywords}

**Multi-Variation Approach**:
- Create diverse ad variations with randomized styles, compositions, and layouts
- Each variation should feel fresh and unique while maintaining brand consistency
- Generate variations that test different visual approaches, angles, and presentations
- Style should be inspired by Dove's authentic, real, and trustworthy advertising aesthetic

**Visual Style**:
- Background Type: ${backgroundType}
- Lighting: ${lightingStyle}
- Mood: ${moodStyle.join(', ')}
- Maintain a clean, modern, and fresh aesthetic
- Focus on authenticity and real-world appeal

**Color Palette**:
- Primary Color: ${primaryColor}
- Accent Color: ${accentColor}
- Use colors that convey trust, authenticity, and approachability

**Decorative Elements**:
- Decorating Items: ${decoratingItems}
- Integrate natural, authentic elements that enhance the product story
- Keep decorations minimal and purposeful

**Composition**:
- Orientation: ${orientation} (Aspect Ratio: ${aspectRatio})
- Create varied compositions across different variations
- Experiment with different product placements and layouts
- Each variation should offer a unique perspective

**Brand Essence**:
- Emphasize: ${brandKeywords}
- Create ads that feel trustworthy, authentic, and real
- Focus on genuine product benefits and real-world appeal
- Maintain a modern, fresh, and approachable aesthetic

**Final Output**:
- High-resolution, professional product advertisements
- Multiple style variations with randomized approaches
- Clean, modern aesthetic inspired by Dove's advertising style
- Authentic and trustworthy visual presentation
- Professional quality suitable for multi-variation ad campaigns
`.trim()
}

/**
 * Botanical Beauty Product Ad Prompt Builder
 * 
 * Creates bold, modern, clean advertising visuals for premium botanical beauty brands
 * with intimately integrated botanical elements and dynamic product placement.
 * 
 * EXACT prompts from original code - DO NOT MODIFY
 */

interface BotanicalBeautyPromptParams {
  productName: string
  productDescription: string
  primaryColor: string
  accentColor: string
  orientation: string
  aspectRatio: string
  brandName: string
  headline: string
  features: string[]
  ctaText: string
  paletteName: string
  bgObject: string
  style: string
}

export const buildBotanicalBeautyPrompt = (params: BotanicalBeautyPromptParams): string => {
  const {
    brandName,
    headline,
    features,
    ctaText,
    paletteName,
    bgObject,
    style
  } = params

  return `
Generate a high-resolution, premium product advertisement with a **bold, modern, and clean aesthetic**, for a botanical beauty brand.

**Overall Style**: "${style}". Emphasize strong visual impact, dynamic composition, and strategic use of negative space.

**Product Integration**:
-   Place the uploaded product as the hero. It should be positioned **dynamically and intentionally**, either standing upright, leaning, or arranged in a way that feels art-directed and not merely laid flat.
-   The product should be in crisp, sharp focus, appearing high-end and luxurious.

**Botanical & Prop Elements - CRUCIAL**:
-   Integrate "${bgObject}". These botanicals must be **intimately integrated with the product, appearing to cradle, frame, or interact directly with it.** They should be arranged **very close to the product**, peeking from behind, resting alongside, or forming a subtle bed or foundation for it.
-   The arrangement should be **intentional and harmonious**, not random or scattered, clearly enhancing the product.
-   Ensure all botanicals are **extremely fresh, dewy, and vibrant**, with subtle water droplets to enhance realism and natural appeal.

**Background & Lighting**:
-   Use a **seamless, solid, pure white or extremely light neutral studio background**.
-   Apply **bright, high-key, diffused studio lighting**. Shadows should be minimal, soft, and strategically placed to add subtle depth, not harshness.

**Typography & Layout - Crucial Details**:
-   **Font Style**: All text must use a **bold, modern, and clean sans-serif font**.
-   **Brand Name**: The brand name "${brandName}" should be rendered prominently as a logo, often placed in an upper corner (e.g., top-right or top-left) or integrated creatively, respecting its modern aesthetic.
-   **Headline**: The headline "${headline}" must be **large, impactful, and dynamically aligned**. It should occupy significant negative space, often to one side of the product, flowing with the composition for a magazine-ad aesthetic.
-   **Features/Description**: The text "${features.join(', ')}" should be integrated artfully. It can be a single compelling phrase or multiple lines, positioned clearly and legibly, perhaps below the headline or alongside the product.
-   **CTA Button**: A call-to-action button with text "${ctaText}". The button should be a clean, distinct shape (e.g., rounded rectangle, pill) with a solid color from the palette, placed strategically in an open area, ensuring visual balance.

**Color Grading**:
-   Apply a "${paletteName}" color palette. Colors should be vibrant, fresh, and consistent, maintaining high contrast where needed, especially for text.

**Final Look**:
-   Achieve an ultra high-resolution, photorealistic image with superb detail and textures.
-   The entire composition must feel premium, authentic, and visually striking, capturing the essence of a high-end botanical beauty product advertisement.
-   Ensure no text or elements obscure the product's key details.
`.trim()
}

/**
 * AI Optimization System Prompt for Botanical Beauty Template
 * EXACT prompt from original code - DO NOT MODIFY
 */
export const getBotanicalBeautyOptimizationPrompt = (language: string = 'English'): string => {
  // Add explicit Arabic instruction when Arabic is selected
  const languageInstruction = language === 'Arabic' 
    ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, headline, feature, brand name, CTA, and text element MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
    : '';

  return `
      You are a top-tier art director specializing in creating bold, modern, and clean advertising visuals for premium botanical beauty brands.
      Analyze the provided product image. Generate a refined ad concept focusing on striking typography, dynamic product placement (it should not always be laying flat), and **intimately integrated, non-random botanical arrangements that are very close to the product.**

      Output JSON with the following fields:
      1.  **headline**: A concise, impactful headline that is bold and modern.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      2.  **features**: 1-2 powerful, short phrases that can be integrated dynamically into the layout.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      3.  **brandName**: The brand name, which should be treated as a distinct logo element.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      4.  **ctaText**: A strong, clear call to action.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      5.  **paletteName**: A descriptive color palette (e.g., 'Earthy Greens, Deep Black, Gold accents, and Clean White background').
      6.  **bgObject**: A detailed, strategic arrangement of dewy, fresh botanical elements (e.g., 'a bed of vibrant green moss, whole small limes, and carefully sliced limes, intimately integrated around the product, appearing to cradle it').
      7.  **style**: A concise style descriptor (e.g., "Bold, high-contrast, modern studio, with intimately integrated and art-directed botanicals").
      ${languageInstruction}
      Emphasize a clean, premium, and visually dynamic aesthetic, similar to high-end lifestyle brand advertising. Botanicals must not look random; they should appear purposefully placed right next to or under the product.
    `
}

/**
 * JSON Schema for AI Optimization Response
 * EXACT schema from original code - DO NOT MODIFY
 */
export const botanicalBeautyOptimizationSchema = {
  type: "OBJECT",
  properties: {
    headline: { type: "STRING" },
    features: { type: "ARRAY", items: { type: "STRING" } },
    brandName: { type: "STRING" },
    ctaText: { type: "STRING" },
    paletteName: { type: "STRING" },
    bgObject: { type: "STRING" },
    style: { type: "STRING" }
  },
  required: ["headline", "features", "brandName", "ctaText", "paletteName", "bgObject", "style"]
}

// Ensure this file is recognized as a module
export {}

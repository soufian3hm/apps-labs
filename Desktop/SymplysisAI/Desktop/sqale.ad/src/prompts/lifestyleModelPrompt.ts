// Lifestyle Model Ad Service - Standalone implementation
// Updated to support dynamic environments (Penthouse, Warehouse, Outdoor, Restaurant, etc.)

export interface LifestyleConfig {
  headline: string
  description: string // Changed from features array to single description string
  brandName: string
  ctaText: string
  paletteName: string
  bgObject: string // Contextual background element or prop
  style: string
  environmentContext: string // Added for broader context (e.g., "Luxury Penthouse", "Gritty Warehouse")
  modelDescription: string // Model description with age, gender, clothing
}

export interface LifestyleModelPromptParams {
  productName: string
  productDescription: string
  primaryColor: string
  accentColor: string
  orientation: string
  aspectRatio: string
  lightingStyle: string
  moodStyle: string[]
  feelStyle: string
  brandKeywords: string
  modelDescription: string
  environmentType: string // e.g., "Urban", "Nature", "Luxury", "Studio", "Industrial"
  interactionType: string
  decoratingItems: string
  ctaText: string // User's CTA text from settings
}

// Helper to generate dynamic setting descriptions based on environment type
const getEnvironmentPrompt = (envType: string, decor: string) => {
  const envLower = envType.toLowerCase();
  
  if (envLower.includes('warehouse') || envLower.includes('industrial')) {
    return `
    - Create a modern, industrial warehouse loft setting with exposed brick or concrete walls
    - High ceilings with large industrial windows letting in dramatic light
    - Background should feel urban, gritty yet premium, and spacious
    - Use ${decor} as stylized props on concrete or metal surfaces
    `;
  }
  
  if (envLower.includes('luxury') || envLower.includes('penthouse') || envLower.includes('restaurant')) {
    return `
    - Create a high-end, sophisticated setting (luxury penthouse living area or upscale restaurant table)
    - Elegant bokeh background with warm ambient lighting or city lights out a window
    - Surfaces should be polished (marble, dark wood, or glass)
    - Atmosphere of exclusivity and refined taste
    - Use ${decor} artfully arranged on the table or surface
    `;
  }

  if (envLower.includes('outdoor') || envLower.includes('cycling') || envLower.includes('nature')) {
    return `
    - Create a dynamic outdoor environment (a scenic road, a forest trail, or a sunny park)
    - Natural sunlight, potentially golden hour or bright midday sun depending on mood
    - Background should be a natural landscape with depth
    - ${decor} should be integrated naturally into the outdoor scene (e.g., on a rock, bench, or in motion)
    `;
  }

  // Default / Home / Studio
  return `
    - Create a clean, stylish indoor space (modern living room or bright studio)
    - Soft, neutral background walls with architectural details
    - Light and airy atmosphere
    - Use ${decor} as subtle props arranged naturally in the space
  `;
};

export const buildLifestyleModelPrompt = (params: LifestyleModelPromptParams): string => {
  const environmentDetails = getEnvironmentPrompt(params.environmentType, params.decoratingItems);

  return `
Generate a high-quality lifestyle advertisement for ${params.productName}: ${params.productDescription}

**Setting & Environment**:
${environmentDetails}

**Model & Subject**:
- Feature a ${params.modelDescription} actively ${params.interactionType} the product
- **CRITICAL - Model Diversity - NO ETHNIC BIAS**: The model MUST represent diverse ethnicity, skin tone, and hair color. DO NOT default to Asian models. DO NOT default to any single ethnicity. The description "${params.modelDescription}" specifies the exact ethnicity - FOLLOW IT PRECISELY. If it says "Caucasian", generate a Caucasian person. If it says "Hispanic", generate a Hispanic person. If it says "African-American", generate an African-American person. DO NOT change the ethnicity specified in the description.
- **Ethnicity Requirements**:
  * If the description mentions "Caucasian", "European", "blonde", "brunette Caucasian" - generate a white/Caucasian person with light to medium skin tone
  * If the description mentions "Hispanic", "Latino", "Mexican" - generate a Hispanic/Latino person
  * If the description mentions "African", "Black", "African-American" - generate a Black person with dark skin tone
  * If the description mentions "Middle Eastern" - generate a Middle Eastern person
  * If the description mentions "Asian" - ONLY then generate an Asian person (do NOT default to this)
  * If the description mentions "mixed heritage" - generate a person of mixed ethnicity
- **Age**: young adult, middle-aged, or senior depending on the product
- **Gender**: male, female, or non-binary - choose based on product target audience
- **Hair Color**: Vary hair colors - blonde, brunette, black, red, auburn, etc. Follow the description.
- **Skin Tone**: Include light, medium, tan, olive, and dark skin tones - VARY WIDELY based on the ethnicity specified
- **Clothing**: NOT always sportswear! Choose clothing appropriate for the product and setting:
  - Business products: business casual, professional attire
  - Tech products: casual modern wear, streetwear, or professional
  - Wellness products: comfortable casual, athleisure, or relaxed wear
  - Luxury products: elegant, sophisticated attire
  - Active products: activewear, sportswear
  - Home products: comfortable casual, loungewear
- The pose must match the context (e.g., if cycling, model is in motion or taking a break; if restaurant, model is seated elegantly)
- Capture an authentic moment of interaction
- Model's expression should be natural and genuine
- **MOST IMPORTANT**: Follow the ethnicity specified in "${params.modelDescription}" EXACTLY. Do NOT change it to Asian or any other ethnicity.

**Lighting & Atmosphere**:
- Lighting Style: ${params.lightingStyle}
- The overall mood should be ${params.moodStyle.join(', ')} with a ${params.feelStyle} feel
- Ensure the lighting matches the environment (e.g., warm dimmer light for restaurant, bright sun for outdoors)

**Composition**:
- Frame the scene to showcase the product usage clearly
- Balance the human element with the product visibility
- Use depth of field appropriate for the setting (e.g., blurred background for busy environments)

**Color Palette**:
- **Apply the user's color palette**: Primary color ${params.primaryColor}, Accent color ${params.accentColor}
- Use these colors throughout the image: backgrounds, text overlays, CTA button, and overall color grading
- The color palette should create visual harmony and enhance product visibility
- Ensure text overlays have sufficient contrast for readability
- The CTA button should use colors from this palette (${params.primaryColor} and/or ${params.accentColor})

**Typography & Text Overlay**:
- **Headline**: Large, bold, product-focused headline positioned prominently (e.g., top left or top center). Must be product-focused, NOT generic motivational phrases.
- **Description**: A small, compelling product description (1-2 sentences) that highlights key features or benefits. Display below or alongside the headline. NOT three-word phrases like "RESILIENCE. INNOVATION. CONFIDENCE." - use natural sentences.
- **CTA Button**: "${params.ctaText}" displayed in a clean, rounded rectangular button. Use colors from the palette (${params.primaryColor} and/or ${params.accentColor}). Position strategically (e.g., bottom center or bottom right). The button text should be clearly visible.
- Text should not cover the model's face or the product
- All text should be legible and well-integrated

**Aspect Ratio**: ${params.aspectRatio}

**Final Look**:
- Photorealistic, commercial-grade photography
- Sharp focus on the product and model
- Premium, aspirational aesthetic suited for the brand identity
- The color palette (${params.primaryColor} and ${params.accentColor}) must be prominently used throughout the image
`.trim()
}

export interface OptimizationResult {
  success: boolean
  config?: LifestyleConfig
  error?: string
}

export interface GenerationResult {
  success: boolean
  images?: string[]
  error?: string
}

// Exponential backoff for retries
const fetchWithBackoff = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<any> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 429 && retries > 0) {
        console.warn(`Retrying... attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithBackoff(url, options, retries - 1, delay * 2);
      }
      throw new Error(`Status ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (retries > 0) {
      console.warn(`Retrying... attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
};

export class LifestyleModelService {
  static async optimizeConcept(imageBase64: string, mimeType: string, language: string = 'English'): Promise<OptimizationResult> {
    // Add explicit Arabic instruction when Arabic is selected - ONLY for text that appears in the image
    const languageInstruction = language === 'Arabic' 
      ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT FOR IMAGE TEXT ONLY: 
      - **headline**: MUST be in Arabic (العربية) - this text will appear in the image
      - **description**: MUST be in Arabic (العربية) - this text will appear in the image
      - **ctaText**: MUST be in Arabic (العربية) - this text will appear in the image
      - **brandName**: Copy the brand name EXACTLY as it appears in the product image. If no brand name is visible, generate one in English. DO NOT translate brand names.
      - **ALL OTHER FIELDS** (environmentContext, style, modelDescription, bgObject, paletteName): MUST be in ENGLISH only. These are internal settings and should never be in Arabic.
      Write the Arabic text naturally as if it's your native language.`
      : '';

    // UPDATED SYSTEM PROMPT: Removes the "botanical/indoor" bias
    const systemPrompt = `
      You are a versatile, world-class art director for commercial advertising. 
      Analyze the provided product image and determine the **optimal physical environment** for an ad campaign.
      
      **Do not default to nature or studio unless the product specifically calls for it.**
      
      **CRITICAL - ETHNICITY DIVERSITY**: When describing the model, you MUST vary ethnicity. DO NOT default to Asian. Randomly select from Caucasian, Hispanic, African-American, Middle Eastern, Mixed heritage, and occasionally Asian. Prioritize non-Asian ethnicities in your examples and selections.

      1. **Analyze the Product**: Is it a rugged outdoor item? A luxury perfume? A tech gadget? A beverage?
      2. **Select a Setting**: Choose a setting that fits the product archetype. Examples:
         - *Luxury/Nightlife*: Rooftop bar, dimly lit restaurant, penthouse, velvet textures.
         - *Urban/Street*: Concrete warehouse, graffiti wall, city street, neon lights.
         - *Active/Outdoor*: Cycling path, forest trail, gym, running track.
         - *Domestic*: Cozy living room, kitchen counter, bedside table.
         - *Fresh/Natural*: Garden, sunlight, water (only if it fits the product).

      Output JSON with the following fields:
      1.  **headline**: A concise, impactful headline matching the vibe. Must be product-focused (e.g., "THE ALL NEW FORMULA", "POWERFUL PROCESSOR", "UNLEASH YOUR VOICE").${language === 'Arabic' ? ' MUST be in Arabic - this text appears in the image.' : ''}
      2.  **description**: A small, compelling product description (1-2 sentences) that highlights key features or benefits. NOT three-word phrases like "RESILIENCE. INNOVATION. CONFIDENCE." - instead use natural sentences like "144 LANGUAGES. ENDLESS ADVENTURES" or "Experience the all-new formula with enhanced ingredients".${language === 'Arabic' ? ' MUST be in Arabic - this text appears in the image.' : ''}
      3.  **brandName**: Look closely at the product image for any text, logos, or labels to identify the ACTUAL BRAND NAME. If a brand name is visible, use it exactly as shown. Only if NO text/logo is visible, generate a creative brand name in English. DO NOT translate brand names - copy them exactly as they appear.
      4.  **ctaText**: A strong call to action (e.g., "Shop Now", "Learn More", "Get Started", "Buy Now").${language === 'Arabic' ? ' MUST be in Arabic - this text appears in the image.' : ''}
      5.  **paletteName**: **AI must intelligently choose a color palette** that best suits the product, selected environment, and brand identity. Provide a descriptive color palette name AND include two hex color codes in this format: "Palette Name (Primary: #HEXCODE, Accent: #HEXCODE)". Examples: 
         - "Neon Blue and Concrete Grey (Primary: #3B82F6, Accent: #64748B)"
         - "Warm Amber and Mahogany (Primary: #F59E0B, Accent: #92400E)"
         - "Vibrant Greens and Earth Tones (Primary: #10B981, Accent: #059669)"
         - "Soft Pastels and Cream (Primary: #F3F4F6, Accent: #FCD34D)"
         Always include the hex codes in parentheses so the app can extract them. Consider the product type, environment context, and mood when selecting colors. The palette should enhance product visibility and create visual harmony. MUST be in English.
      6.  **bgObject**: A description of the **surrounding environment elements** and props (e.g., 'a blurred background of a busy cafe with a wooden table surface', 'a textured concrete floor with harsh shadows', 'a sunny park bench'). MUST be in English.
      7.  **style**: A concise style descriptor (e.g., "Gritty Urban Industrial", "High-End Luxury Noir", "Sun-drenched Active Lifestyle"). MUST be in English.
      8.  **environmentContext**: The specific location type (e.g., "Warehouse", "Restaurant", "Forest", "Bedroom"). MUST be in English.
      9.  **modelDescription**: **CRITICAL - RANDOMIZE ETHNICITY**: You MUST vary the ethnicity across different generations. DO NOT default to Asian, DO NOT default to any single ethnicity. Randomly select from the list below for each generation:
         - **Age**: young adult, middle-aged, or senior depending on the product
         - **Gender**: male, female, or non-binary - choose based on product target audience
         - **Ethnicity & Appearance**: **RANDOMLY SELECT** one of these for each generation (do NOT always choose the same one):
           * Caucasian/European person (blonde, brunette, redhead, various skin tones) - USE THIS OFTEN
           * Hispanic/Latino person (Mexican, South American, etc.) - USE THIS OFTEN
           * African/Black person (various skin tones and hair textures) - USE THIS OFTEN
           * Middle Eastern person - USE THIS
           * Mixed heritage person - USE THIS
           * Asian person (East Asian, South Asian, Southeast Asian) - USE THIS BUT NOT EXCLUSIVELY
         - **Hair Color**: Vary hair colors - blonde, brunette, black, red, auburn, etc.
         - **Skin Tone**: Include light, medium, tan, olive, and dark skin tones - VARY WIDELY
         - **Clothing**: Appropriate for the product and setting (business casual, activewear, casual, formal, etc.)
         **IMPORTANT**: Examples to use (prioritize non-Asian): "blonde Caucasian woman in business casual", "Hispanic man with dark hair in modern streetwear", "African-American professional in elegant attire", "light-skinned brunette Caucasian in casual wear", "Middle Eastern person in business attire", "mixed-heritage individual in activewear". Only occasionally use "Asian person" - do NOT default to it. The model should match the product's target audience and represent diverse beauty with NO ETHNIC BIAS. MUST be in English.
      ${languageInstruction}
    `;

    const schema = {
      type: "OBJECT",
      properties: {
        headline: { type: "STRING" },
        description: { type: "STRING" },
        brandName: { type: "STRING" },
        ctaText: { type: "STRING" },
        paletteName: { type: "STRING" },
        bgObject: { type: "STRING" },
        style: { type: "STRING" },
        environmentContext: { type: "STRING" },
        modelDescription: { type: "STRING" }
      },
      required: ["headline", "description", "brandName", "ctaText", "paletteName", "bgObject", "style", "environmentContext", "modelDescription"]
    };

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analyze this product and generate a diverse ad concept (consider Urban, Luxury, Outdoor, or Industrial settings)." },
            { inlineData: { mimeType, data: imageBase64 } }
          ]
        }
      ],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: "application/json", responseSchema: schema }
    };

    try {
      // Get auth token for edge function
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        return { success: false, error: 'Authentication required' }
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/gemini-image-analysis`
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
          prompt: "Analyze this product and generate a diverse ad concept (consider Urban, Luxury, Outdoor, or Industrial settings).",
          mimeType: mimeType,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          responseSchema: schema
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
      }

      const result = await response.json()
      if (!result.success || !result.result) {
        throw new Error(result.error || 'Edge function returned an error')
      }

      const data = result.result
      console.log('🟢 [Lifestyle AI] Parsed Data:', data);
      
      const optimizedConfig: LifestyleConfig = {
        headline: data.headline,
        description: data.description || data.features?.join('. ') || '', // Fallback for old format
        brandName: data.brandName,
        ctaText: data.ctaText,
        paletteName: data.paletteName,
        bgObject: data.bgObject,
        style: data.style,
        environmentContext: data.environmentContext || "Studio",
        modelDescription: data.modelDescription || "diverse person in appropriate attire for the setting"
      };
      
      return {
        success: true,
        config: optimizedConfig
      };
    } catch (err) {
      console.error('Lifestyle optimization failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  static async generateImage(config: LifestyleConfig, imageBase64: string, mimeType: string, userCtaText?: string, userPalette?: string, language: string = 'English', aspectRatio: string = '1:1'): Promise<GenerationResult> {
    // Use user's CTA if provided, otherwise use config CTA
    const ctaText = userCtaText || config.ctaText;
    // Use user's palette if provided, otherwise use config palette
    const paletteName = userPalette || config.paletteName;
    
    // Extract hex color codes from paletteName if they exist
    let primaryColor = '#000000';
    let accentColor = '#FFD700';
    if (paletteName) {
      const paletteMatch = paletteName.match(/Primary:\s*(#[0-9A-Fa-f]{6}),\s*Accent:\s*(#[0-9A-Fa-f]{6})/i);
      if (paletteMatch) {
        primaryColor = paletteMatch[1];
        accentColor = paletteMatch[2];
      } else {
        // Fallback: try to find any hex codes in the string
        const hexCodes = paletteName.match(/#[0-9A-Fa-f]{6}/gi);
        if (hexCodes && hexCodes.length >= 2) {
          primaryColor = hexCodes[0];
          accentColor = hexCodes[1];
        } else if (hexCodes && hexCodes.length === 1) {
          primaryColor = hexCodes[0];
        }
      }
    }

    // Add explicit Arabic instruction when Arabic is selected
    const languageInstruction = language === 'Arabic' 
      ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, headline, description, brand name, CTA, and text element MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.\n\n🎨 ARABIC TYPOGRAPHY FREEDOM: For Arabic text, you have complete creative freedom to choose appropriate, modern, and visually appealing Arabic fonts. Use fonts that look natural, premium, and professional for Arabic typography. Vary the typography style to create unique, visually striking designs. Avoid generic or awkward-looking fonts. The typography should complement the luxury aesthetic and feel authentic to Arabic design sensibilities.`
      : '';
    
    // UPDATED GENERATION PROMPT: Supports diverse environments, models, user settings, aspect ratio, and language
    const prompt = `
Generate an ULTRA HIGH-QUALITY, MAXIMUM RESOLUTION, photorealistic premium product advertisement. This must be magazine-quality, commercial-grade photography with perfect detail, sharpness, and professional lighting.${languageInstruction}

**Overall Context**:
The setting is a **${config.environmentContext}**. The aesthetic style is "**${config.style}**".

**Model & Subject**:
- Feature a **${config.modelDescription}** actively using or interacting with the product
- **CRITICAL - NO ETHNIC BIAS - FOLLOW DESCRIPTION EXACTLY**: The model description "${config.modelDescription}" specifies the EXACT ethnicity - you MUST follow it precisely. DO NOT default to Asian. DO NOT change the ethnicity. If the description says "Caucasian", generate a Caucasian person. If it says "Hispanic", generate a Hispanic person. If it says "African-American", generate an African-American person. If it says "Asian", ONLY then generate an Asian person.
- **Ethnicity Interpretation**:
  * "Caucasian", "European", "blonde Caucasian", "brunette Caucasian" → Generate a white/Caucasian person with light to medium skin tone
  * "Hispanic", "Latino", "Mexican" → Generate a Hispanic/Latino person with tan to medium skin tone
  * "African", "Black", "African-American" → Generate a Black person with dark skin tone
  * "Middle Eastern" → Generate a Middle Eastern person
  * "Asian" → ONLY generate Asian if explicitly mentioned (do NOT default to this)
  * "mixed heritage" → Generate a person of mixed ethnicity
- **Skin Tone**: Match the ethnicity specified - light for Caucasian, medium/tan for Hispanic, dark for African-American, etc.
- **Hair Color**: Follow the description - blonde, brunette, black, red, auburn, etc.
- Model's clothing should match the setting and product type - NOT always sportswear. Consider: business casual, casual wear, formal wear, streetwear, activewear, or comfortable clothing depending on the product and setting
- Capture an authentic moment of product interaction
- The model's pose and expression should feel natural and genuine
- **MOST IMPORTANT**: The ethnicity in "${config.modelDescription}" is EXACT - do NOT change it to Asian or any other ethnicity. Follow it precisely.

**Product Integration & Layout (CRITICAL)**:
- Place the uploaded product as the hero.
- Position it dynamically within the environment (e.g., on a table, on the ground, floating, or being held depending on the context).
- **ASPECT RATIO**: The input image provided has been pre-padded to the target aspect ratio of ${aspectRatio}.
- **NO BLACK BARS / NO EMPTY SPACE**: The generated image must be **FULL BLEED**. You MUST extend the background scenery (${config.environmentContext}) to fill the entire canvas.
- **FILL THE FRAME**: Do not create a "frame" or "border" around the image. The environment must touch all four edges (top, bottom, left, right).
- If the input has transparency or empty space, **FILL IT** with the scene details. Do not leave it black.
- Ensure the product matches the lighting of the scene perfectly.

**Environment & Props**:
- **Background**: Create a detailed **${config.bgObject}**. 
- If the setting is a *Warehouse*: Use concrete, metal, shadows, and industrial textures.
- If the setting is a *Restaurant/Penthouse*: Use bokeh city lights, dark wood, glass, and warm ambient glow.
- If the setting is *Outdoor/Cycling*: Use natural light, road textures, grass, or sky.
- If the setting is *Studio*: Use solid colors or abstract shapes.
- **Interaction**: The product should feel grounded in this specific reality, not just pasted on top.

**Lighting**:
- Adapt lighting to the "${config.style}" style. 
- Use dramatic contrast for urban/night scenes.
- Use bright, diffused light for day/outdoor scenes.

**Color Palette**:
- **Apply the user's color palette**: Primary color ${primaryColor}, Accent color ${accentColor}
- Use these colors throughout the image: backgrounds, text overlays, CTA button, and overall color grading
- The color palette should create visual harmony and enhance product visibility
- Ensure text overlays have sufficient contrast for readability
- The CTA button should use colors from this palette (${primaryColor} and/or ${accentColor})

**Typography & Layout**:
- **Typography Style**: Choose typography that is elegant, balanced, and perfectly integrated with the overall aesthetic. ${language === 'Arabic' ? 'For Arabic text, use appropriate Arabic fonts that are modern, readable, and visually appealing. The font should complement the luxury aesthetic and feel natural for Arabic typography - avoid generic or awkward-looking fonts. Allow creative freedom in font selection to ensure the Arabic text looks premium and professional.' : 'Use modern, bold typography that matches the premium aesthetic.'}
- **Brand Name**: "${config.brandName}" placed prominently.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
- **Headline**: "${config.headline}" large and impactful, using negative space. Must be product-focused. Typography should be visually striking and well-integrated.${language === 'Arabic' ? ' (MUST be in Arabic - use appropriate Arabic typography that looks natural and premium)' : ''}
- **Description**: "${config.description}" displayed as a small, compelling product description below or alongside the headline. NOT three-word phrases - use natural sentences. Ensure readability and visual harmony.${language === 'Arabic' ? ' (MUST be in Arabic - use appropriate Arabic typography)' : ''}
- **CTA Button**: "${ctaText}" in a shape/color that fits the palette "${paletteName}". The button should be clearly visible and use colors from the palette. Typography should be clear and legible.${language === 'Arabic' ? ' (MUST be in Arabic - use appropriate Arabic typography)' : ''}

**Final Look**:
- **ULTRA HIGH RESOLUTION**: Generate at maximum quality and resolution. Every detail must be crisp, sharp, and photorealistic.
- **COMMERCIAL ADVERTISING QUALITY**: This must look like a professional, magazine-quality advertisement with perfect lighting, composition, and color grading.
- **PHOTOREALISTIC DETAIL**: 
  * Sharp focus on the product and model - no blurriness or artifacts
  * Realistic skin textures, fabric details, and material surfaces
  * Perfect lighting with natural shadows and highlights
  * High-quality depth of field effects where appropriate
  * Professional color grading and contrast
- **IMAGE QUALITY REQUIREMENTS**:
  * Maximum resolution and detail
  * No compression artifacts or pixelation
  * Smooth gradients and natural color transitions
  * Sharp edges and clean lines
  * Professional photography-level quality
- Ensure the product stands out against the background (use depth of field/blur if the background is busy).
- **ABSOLUTELY NO BORDERS**: The image must be a full rectangle filled with content.
- **QUALITY PRIORITY**: Image quality and detail are the highest priority - generate the highest quality image possible.
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }] }],
      generationConfig: { 
        responseModalities: ['IMAGE'], // Request only image, not text
        temperature: 0.4, // Lower temperature for more consistent, high-quality results
        topK: 40, // Add topK for better quality control
        topP: 0.95,
        // Add quality hints in the prompt itself
      }
    };

    try {
      // Get auth token for edge function
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        return { success: false, error: 'Authentication required' }
      }

      // Extract reference image data if provided
      let referenceImageBase64 = ''
      let referenceMimeType = 'image/jpeg'
      if (imageBase64) {
        const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          referenceMimeType = matches[1]
          referenceImageBase64 = matches[2]
        } else {
          referenceImageBase64 = imageBase64
        }
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-poster`
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          referenceImage: referenceImageBase64,
          mimeType: referenceMimeType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
      }

      const result = await response.json()

      // Handle edge function response
      if (!result.success) {
        return { success: false, error: result.error || 'Edge function returned an error' };
      }

      // Extract image from response
      let generatedImageBase64 = ''
      let responseMimeType = 'image/png'

      if (result.imageBase64) {
        generatedImageBase64 = result.imageBase64
        responseMimeType = result.mimeType || 'image/png'
      } else if (result.image) {
        generatedImageBase64 = result.image
        responseMimeType = result.mimeType || 'image/png'
      } else if (result.candidates && result.candidates[0]) {
        // Handle Gemini API response format from edge function
        const firstCandidate = result.candidates[0]
        const imagePart = firstCandidate.content?.parts?.find((p: any) => p.inlineData)
        generatedImageBase64 = imagePart?.inlineData?.data
        responseMimeType = imagePart?.inlineData?.mimeType || 'image/png'
      }
      
      if (generatedImageBase64) {
        console.log('✅ [Lifestyle Model] Edge function returned 1 image');
        // Return ONLY ONE image in the array
        return { success: true, images: [`data:${responseMimeType};base64,${generatedImageBase64}`] };
      } else {
        console.error('❌ [Lifestyle Model] No image data in edge function response');
        return { success: false, error: 'AI returned no image. Try again.' };
      }
    } catch (err) {
      console.error('Lifestyle image generation failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }
}
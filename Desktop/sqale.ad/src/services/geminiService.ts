// API keys are now secured in Supabase Edge Functions
// This service now calls edge functions instead of direct API calls
import { supabase } from '../lib/supabase'

const GEMINI_EDGE_FUNCTION_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-text-generation`
const GEMINI_TTS_EDGE_FUNCTION_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-tts`

export interface TextGenerationRequest {
  prompt: string
  tone: string
  language: string
  customTone?: string
  quantity?: number
  temperature?: number
}

export interface TextGenerationResponse {
  content: string
  success: boolean
  error?: string
}

export interface StreamingTextGenerationResponse {
  success: boolean
  error?: string
  stream?: ReadableStream<string>
}

const SYSTEM_PROMPT = `You are an AI Ad Copywriting Assistant designed to help people write high-converting ad copies for their products, services, or offers.
You must guide, structure, and write ad copy that sells — fast and with quality.

You have access to ad strategy logic, copywriting frameworks, psychology of hooks, and language tones to adapt to any product or target audience.

🌍 LANGUAGE SUPPORT

You must support all languages fluently.

If the user gives you a language, write the ad in that language.

If not specified, default to English.

Always make sure your copy sounds natural in the language used (not robotic or literal translation).

🚨 CRITICAL: When Arabic (العربية) is specified as the language, you MUST write ALL content in Arabic. Every word, sentence, headline, description, and text element MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.

🗣️ TONE SUPPORT

You must be able to write in the following tones (and combine them if the user requests):

🧠 Expert → Professional, knowledgeable, trustworthy.

⚡ Daring → Bold, edgy, disruptive.

😄 Playful → Fun, light, witty.

✨ Sophisticated → Elegant, luxurious, premium.

🧲 Persuasive → Emotionally powerful, conversion-focused.

🤝 Supportive → Friendly, encouraging, approachable.

🧰 Custom → Adapt to the exact style or reference the user gives.

When a tone is selected, rewrite or shape the ad to fully match that tone — including word choice, rhythm, and structure.

🎯 CORE STRATEGY (Your Ad Copywriting Logic)

When someone gives you a product or service to advertise:

1. Clarify the Objective

Ask or identify:

What action should the reader take? (buy, click, sign up, book, etc.)

Who is the target audience? (demographics, interests, pain points)

What's the main pain or desire this product solves?

If the user doesn't provide this info, infer intelligently based on product type.

2. Pick a Hook Angle

Choose the most powerful angle for this product from the list below (or combine them if needed):

🩺 Pain Hook → "Tired of X?"

🚀 Transformation Hook → "Turn [problem] into [result] fast."

🧠 Curiosity Hook → "99% ignore this, but it works."

📈 Social Proof Hook → "Trusted by 10,000+ users."

⚡ Urgency Hook → "Only 3 days left."

Your hook must stop the scroll in the first line or two.

3. Use a Proven Framework

Use one of these structures to write the body of the ad:

🅰 AIDA (Attention – Interest – Desire – Action)
🎯 Hook / Attention  
📌 Why they should care  
🔥 Why this offer is powerful  
👉 CTA

🅿 PAS (Problem – Agitate – Solution)
⚠️ Highlight the pain/problem  
💥 Agitate to make it feel urgent  
✅ Present the product as the solution

🅵 FAB (Features – Advantages – Benefits)
⚙️ Explain a key feature  
📈 Show the advantage  
❤️ Show how it benefits the user

Choose the most suitable framework based on the product and goal.

4. Craft Scroll-Stopping Openers

Your first 2 lines must grab attention. You can:

Use shocking stats or claims

Ask a powerful question

Use emoji smartly (not overuse)

Make it emotional or curiosity-driven

Example:

"🦠 Nail fungus doesn't forgive… But here's how to fight back 👇"

5. Write a Clear CTA

Always end your ad with one clear call to action. Examples:

"🛒 Shop Now"

"📲 Try It Free"

"🚀 Book Your Spot"

Do not use multiple CTAs in one ad. Keep it focused and action-driven.

6. Use AI Power Smartly

You must:

Generate multiple variations of hooks and bodies fast.

Rewrite ad copies in different tones.

Translate seamlessly between languages.

Optimize structure for engagement and conversion.

BUT: always keep the core angle strong — don't let it become generic.

7. Advanced Tactics

Include numbers to build trust (e.g., "10,000+ sold", "in 7 days").

Use storytelling for longer ads.

Match the customer's language style, not robotic marketing talk.

Focus on one main idea per ad.

🧪 VARIATION GENERATION

When a user asks for ad copy:

Generate at least 3 variations (short, medium, long)

Optionally offer different hook angles (e.g., pain vs transformation)

Match their requested tone and language

If they give you a reference, mimic that tone closely.

🧭 OUTPUT FORMAT - VERY IMPORTANT

You MUST respond ONLY with the ad copies in this exact format. NO explanations, NO metadata, NO additional text:

[Ad Copy Version 1 - Short]
Your short ad copy here...

[Ad Copy Version 2 - Medium] 
Your medium ad copy here...

[Ad Copy Version 3 - Long]
Your long ad copy here...

RULES:
- Start directly with [Ad Copy Version 1 - Short]
- No tone/language headers or explanations
- No questions at the end
- No "do you want to modify" suggestions
- ONLY the 3 ad copy versions in brackets
- Each version should be complete and ready to use
- Use emojis appropriately based on tone (minimal for sophisticated/expert tones)

🧠 Behavior Rules

Always keep the ad clear, emotional, and action-oriented.

Never write generic fluff. Every line must push toward conversion.

Always adapt to tone, language, and target audience.

If the user provides product details, analyze it and build the ad around the strongest angle.

If not enough info is provided, ask smart questions or make intelligent assumptions.

✅ Your Mission:
Help people turn their product or offer into scroll-stopping, high-converting ads using smart hooks, proven structures, clear CTAs, and tone-matched language — fast and in any language.`

// Script generation types
export interface ScriptGenerationRequest {
  scriptLanguage: string
  productName: string
  targetAudience: string
  productFunction: string
  keyBenefits: string
  toneStyle: string
  accent: string
  optionalCta: string
  includeFreeDelivery?: boolean
  scriptLength?: 'short' | 'normal' | 'long'
}

export interface SpeechGenerationRequest {
  script: string
  toneStyle: string
  voice: string
  accent: string
}

/**
 * Create AI prompt for script generation based on language and accent
 */
function createPrompt(formData: ScriptGenerationRequest): string {
  const { scriptLanguage, accent, productName, targetAudience, productFunction, keyBenefits, optionalCta, includeFreeDelivery = true, scriptLength = 'normal' } = formData

  const freeDeliveryLine = includeFreeDelivery 
    ? (scriptLanguage === 'english' ? '"Free delivery and cash on delivery."' : '"توصيل مجاني والدفع عند الاستلام."')
    : ''

  // Adjust script flow based on length
  let scriptFlow = ''
  if (scriptLength === 'short') {
    scriptFlow = `
**Script Flow (Mandatory for Short Scripts - 15-20 seconds total):**
1. Hook: Start with a strong, emotion-driven or curiosity-driven opening (3-5 seconds).
2. Solution & Key Benefit: Present the product and ONE main benefit (8-10 seconds).
3. Closing & CTA: End with the call to action${includeFreeDelivery ? ' and delivery info' : ''} (4-5 seconds).
${includeFreeDelivery ? `
**Mandatory Closing Line:**
${freeDeliveryLine}` : ''}
`
  } else if (scriptLength === 'long') {
    scriptFlow = `
**Script Flow (Mandatory for Long Scripts - 45-60 seconds total):**
1. Hook: Start with a strong, emotion-driven or curiosity-driven opening (7-10 seconds).
2. Solution Intro: Present the product as the answer to the problem (7-10 seconds).
3. Feature-Benefit Pairs: Highlight 3-4 key features and explain their benefits in detail (20-30 seconds).
4. Trust/Universal Use: Add social proof, testimonials, or mention universal appeal (7-10 seconds).
5. Closing & CTA: End with the call to action${includeFreeDelivery ? ' and delivery info' : ''} (7-10 seconds).
${includeFreeDelivery ? `
**Mandatory Closing Line:**
${freeDeliveryLine}` : ''}
`
  } else {
    // Normal (default) - keep existing flow
    scriptFlow = `
**Script Flow (Mandatory for All):**
1. Hook: Start with a strong, emotion-driven or curiosity-driven opening (5-7 seconds).
2. Solution Intro: Present the product as the answer to the problem (5-7 seconds).
3. Feature-Benefit Pairs: Highlight 2-3 key features and explain their benefits (15-20 seconds).
4. Trust/Universal Use: Add social proof or mention universal appeal (5 seconds).
5. Closing & CTA: End with the call to action${includeFreeDelivery ? ' and delivery info' : ''} (5-7 seconds).
${includeFreeDelivery ? `
**Mandatory Closing Line:**
${freeDeliveryLine}` : ''}
`
  }

  if (scriptLanguage === 'english') {
    // Validate that required fields are not empty
    if (!productName || !targetAudience || !productFunction || !keyBenefits) {
      throw new Error('All required fields (Product Name, Target Audience, Product Function, Key Benefits) must be provided')
    }

    return `
You are an expert advertising copywriter. Generate a persuasive, engaging advertising script in **casual, spoken English** for the following product:

**Product Name:** ${productName}
**Target Audience:** ${targetAudience}
**Product Function:** ${productFunction}
**Key Benefits:** ${keyBenefits}
**Optional CTA:** ${optionalCta || 'Order today'}

**Instructions:**
- Write in casual, conversational English as if speaking naturally to a friend.
- Avoid formal jargon or overly complex sentences.
${scriptLength === 'short' 
  ? '- Keep it very concise, punchy, and engaging (15-20 seconds when read aloud).'
  : scriptLength === 'long'
  ? '- Make it detailed, engaging, and comprehensive (45-60 seconds when read aloud).'
  : '- Keep it concise, punchy, and engaging (30-40 seconds when read aloud).'}
- Focus on benefits over features.
- Use emotion and storytelling where appropriate.
${scriptFlow}

**CRITICAL:** Do NOT write any intro like "Here is the script" or "Here's your ad". Start directly with the actual advertising script ONLY!

**CRITICAL - DO NOT INCLUDE IN SCRIPT:**
- NEVER include instruction text like "(energetic voice, slightly fast)" or any similar voice/style instructions in the actual script text
- NEVER include notes, directions, or meta-commentary in parentheses or brackets
- The script should ONLY contain the actual spoken words that will be read aloud
- Any voice instructions, tone notes, or style directions should NOT appear in the final script output

Script:
`
  } else {
    // Arabic with dialect-specific instructions
    let dialectInstructions = ''
    let exampleScript = ''

    if (accent === 'Libyan') {
      dialectInstructions = `
**Dialect:** Spoken **Libyan Arabic dialect** only. Do NOT use Modern Standard Arabic (MSA).
**Connectors to Use:**  رَاهُو، هَكي، خَاطِر، عَلَاش، هَلْبَا، مَافِيش، تَوّ، بَاهي.
**Diacritics (تشكيل):** Add light, essential diacritics for pronunciation guidance (e.g.,  رَاهُو، هَكي، خَاطِر، عَلَاش، هَلْبَا، مَافِيش، تَوّ، بَاهي.). Do NOT over-diacriticize.

**High-Quality Libyan Script Example (for style and diacritic reference):**
"رَاهُو تَوّ تْعَبْتْ هَلْبَا، نِبِّي نِرْقَدْ شْوَيّ. الحَاجَة هَذِي خَيَال، تْخَلِّيكْ تِرْتَاحْ فِي دَقِيقَة، وَاللِّي جَرَّبْهَا يَعْرِفْ شِنْ نَقُولْ. فِيهَا مِيزَة تْخَلِّيكْ تِنسَى الكَدّ، وَمَافِيشْ زَيّهَا فِي السُّوقْ. طْلُبُوهَا تَوّ، وَالدَّفْعْ عِنْدَ الاسْتِلَامْ، التَّوْصِيلْ سَرِيعْ وَالخِدْمَة بَاهِيَة عَ الآخِر."
`
      exampleScript = ''
    } else if (accent === 'Algerian') {
      dialectInstructions = `
**Dialect:** Spoken **Algerian Arabic dialect** only. Do NOT use Modern Standard Arabic (MSA).
**Connectors to Use:** باش، هكا، بزاف، مكانش
**Diacritics (تشكيل):** Add light, essential diacritics for pronunciation guidance (e.g., بَاش، هَكَا، بْزَاف). Do NOT over-diacriticize.
**Pronouns (CRITICAL):** 
- For addressing men/masculine audience: use "نتا" (nota) - NOT "نتي"
- For addressing women/feminine audience: use "نتي" (nti)
- Use the appropriate pronoun based on the target audience gender.
`
    } else if (accent === 'Tunisian') {
      dialectInstructions = `
**Dialect:** Spoken **Tunisian Arabic dialect** only. Do NOT use Modern Standard Arabic (MSA).
**Connectors to Use:** باش، هكا، برشا، مافماش
**Diacritics (تشكيل):** Add light, essential diacritics for pronunciation guidance (e.g., بَاش، هَكَا، بْرْشَا). Do NOT over-diacriticize.
`
    } else if (accent === 'Classical Arabic') {
      dialectInstructions = `
**Dialect:** Clear and correct **Modern Standard Arabic (MSA)** only. Do NOT use regional dialects.
**Diacritics (تشكيل):** Add light, essential diacritics for clarity and pronunciation (e.g., بِـ، مِن، إلى). Keep it natural, not overly academic.
`
    }

    // Validate that required fields are not empty
    if (!productName || !targetAudience || !productFunction || !keyBenefits) {
      throw new Error('All required fields (Product Name, Target Audience, Product Function, Key Benefits) must be provided')
    }

    return `
أنت كاتب إعلانات محترف. اكتب نص إعلاني مقنع وجذاب بـ**${accent === 'Classical Arabic' ? 'العربية الفصحى' : 'اللهجة العربية المحددة'}** للمنتج التالي:

**اسم المنتج:** ${productName}
**الجمهور المستهدف:** ${targetAudience}
**وظيفة المنتج:** ${productFunction}
**الفوائد الرئيسية:** ${keyBenefits}
**دعوة اختيارية للعمل:** ${optionalCta || 'اطلبها اليوم'}

**التعليمات:**
${dialectInstructions}
- اكتب بأسلوب حواري طبيعي كأنك تتحدث مع صديق.
- تجنب اللغة الرسمية الثقيلة أو الجمل المعقدة.
${scriptLength === 'short'
  ? '- اجعله موجزاً جداً ومؤثراً وجذاباً (15-20 ثانية عند القراءة بصوت عالٍ).'
  : scriptLength === 'long'
  ? '- اجعله مفصلاً ومؤثراً وجذاباً (45-60 ثانية عند القراءة بصوت عالٍ).'
  : '- اجعله موجزاً ومؤثراً وجذاباً (30-40 ثانية عند القراءة بصوت عالٍ).'}
- ركز على الفوائد أكثر من المميزات.
- استخدم العاطفة والقصص حيثما كان ذلك مناسباً.
${scriptFlow}

**مهم جداً:** لا تكتب أي مقدمة مثل "ها هو النص" أو "إليك النص". ابدأ مباشرة بالنص الإعلاني فقط!

**CRITICAL - DO NOT INCLUDE IN SCRIPT:**
- NEVER include مرحبا السلام عليكم hello hi there in the beginning OF THE SCRIPT or any similar in the actual script text

- NEVER include instruction text like "(صوت حماسي، سريع قليلاً)" or any similar voice/style instructions in the actual script text
- NEVER include notes, directions, or meta-commentary in parentheses or brackets
- The script should ONLY contain the actual spoken words that will be read aloud
- Any voice instructions, tone notes, or style directions should NOT appear in the final script output

النص:
`
  }
}

/**
 * Clean up instruction text that shouldn't be read in TTS
 */
function cleanInstructionText(text: string): string {
  // Remove instruction text in parentheses like "(صوت حماسي، سريع قليلاً)" or "(energetic voice, slightly fast)"
  // Match patterns like: (صوت حماسي، سريع قليلاً), (energetic voice), etc.
  let cleaned = text
  
  // Remove Arabic instruction patterns
  cleaned = cleaned.replace(/\([^)]*صوت[^)]*\)/g, '')
  cleaned = cleaned.replace(/\([^)]*سريع[^)]*\)/g, '')
  cleaned = cleaned.replace(/\([^)]*حماسي[^)]*\)/g, '')
  
  // Remove English instruction patterns
  cleaned = cleaned.replace(/\([^)]*voice[^)]*\)/gi, '')
  cleaned = cleaned.replace(/\([^)]*tone[^)]*\)/gi, '')
  cleaned = cleaned.replace(/\([^)]*style[^)]*\)/gi, '')
  cleaned = cleaned.replace(/\([^)]*energetic[^)]*\)/gi, '')
  cleaned = cleaned.replace(/\([^)]*fast[^)]*\)/gi, '')
  cleaned = cleaned.replace(/\([^)]*slow[^)]*\)/gi, '')
  
  // Remove any remaining instruction-like patterns in parentheses that contain common instruction words
  const instructionKeywords = ['صوت', 'سريع', 'بطيء', 'حماسي', 'voice', 'tone', 'style', 'speed', 'pace', 'energetic', 'calm']
  instructionKeywords.forEach(keyword => {
    const regex = new RegExp(`\\([^)]*${keyword}[^)]*\\)`, 'gi')
    cleaned = cleaned.replace(regex, '')
  })
  
  // Clean up multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  return cleaned
}

/**
 * Generate advertising script using Gemini (via edge function)
 */
export async function generateScript(formData: ScriptGenerationRequest): Promise<string> {
  try {
    // Get auth token for edge function
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required')
    }

    const prompt = createPrompt(formData)

    // Call Supabase Edge Function instead of direct API
    const response = await fetch(GEMINI_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        systemPrompt: undefined, // No system prompt for script generation
        temperature: 0.7,
        maxTokens: 8192
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
    }

    const data = await response.json()

    console.log('🔵 [Script Generation] Edge Function Response:', JSON.stringify(data, null, 2))

    // Handle error responses from edge function
    if (!data.success) {
      throw new Error(data.error || 'Edge function returned an error')
    }

    if (!data.content || !data.content.trim()) {
      throw new Error('Empty script content in edge function response')
    }

    // Clean up any instruction text that shouldn't be read in TTS
    const cleanedScript = cleanInstructionText(data.content.trim())
    
    console.log('🔵 [Script Generation] Cleaned script length:', cleanedScript.length)
    
    return cleanedScript
  } catch (error) {
    console.error('❌ [Script Generation] Error:', error)
    throw error
  }
}

/**
 * Generate speech from script using Gemini TTS (via edge function)
 */
export async function generateSpeech(request: SpeechGenerationRequest): Promise<string> {
  try {
    // Get auth token for edge function
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required')
    }

    const { script, toneStyle, voice, accent } = request

    // Map tone style to TTS instruction
    const toneInstructions: { [key: string]: string } = {
      'Energetic': 'an energetic, enthusiastic tone',
      'Commercial': 'a professional, commercial tone',
      'Funny': 'a playful, humorous tone',
      'Warm': 'a warm, friendly tone',
      'Serious': 'a serious, authoritative tone',
      'Luxury': 'a sophisticated, luxurious tone'
    }

    const toneInstruction = toneInstructions[toneStyle] || 'a natural tone'
    const ttsPrompt = `Read the following in a ${accent} accent and ${toneInstruction}: ${script}`

    // Call Supabase Edge Function instead of direct API
    const response = await fetch(GEMINI_TTS_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        text: ttsPrompt,
        voiceName: voice
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `TTS edge function request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Log the response for debugging
    console.log('🎵 [TTS] Edge Function Response:', JSON.stringify(data, null, 2))

    // Handle error responses from edge function
    if (!data.success) {
      throw new Error(data.error || 'Edge function returned an error')
    }

    if (!data.audioBase64) {
      throw new Error('No audio data in edge function response')
    }

    // Validate it's base64 (should only contain base64 characters)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Regex.test(data.audioBase64)) {
      console.error('❌ [TTS] Audio data does not appear to be valid base64:', data.audioBase64.substring(0, 200))
      throw new Error('Audio data is not valid base64 format')
    }

    console.log('✅ [TTS] Successfully extracted audio data, length:', data.audioBase64.length)
    return data.audioBase64
  } catch (error) {
    console.error('Speech generation error:', error)
    throw error
  }
}

export class GeminiService {
  static async generateTextStream({ prompt, tone, language, customTone, quantity = 3, temperature = 0.7 }: TextGenerationRequest): Promise<StreamingTextGenerationResponse> {
    // NOTE: Streaming not yet supported via edge functions
    // For now, fall back to non-streaming and simulate streaming by chunking the response
    // TODO: Add streaming support to edge functions
    
    try {
      // Get auth token for edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const selectedTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      const generateVersions = () => {
        const versions = ['Short', 'Medium', 'Long']
        if (quantity <= 3) {
          return versions.slice(0, quantity)
        } else {
          // For more than 3, we add numbered versions
          const result = [...versions]
          for (let i = 4; i <= quantity; i++) {
            result.push(`Version ${i}`)
          }
          return result
        }
      }
      
      const versionLabels = generateVersions()
      const formatInstructions = versionLabels.map((version, index) => 
        `[Ad Copy Version ${index + 1} - ${version}]`
      ).join(', then ')
      
      const userPrompt = `Language: ${language}
Tone: ${selectedTone}

User Request: ${prompt}

IMPORTANT: Generate exactly ${quantity} ad copy versions. Respond ONLY with the ad copies in this exact format: ${formatInstructions}. NO explanations, NO metadata headers, NO additional suggestions. Start directly with the first version and end after the ${quantity === 1 ? 'version' : `${quantity} versions`}.`

      const fullPrompt = `${SYSTEM_PROMPT}

${userPrompt}`

      // Call edge function (non-streaming for now)
      const response = await fetch(GEMINI_EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemPrompt: SYSTEM_PROMPT,
          temperature: temperature,
          maxTokens: 4000
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Edge function returned an error')
      }

      if (!data.content) {
        throw new Error('Empty content in edge function response')
      }

      // Simulate streaming by chunking the response
      // TODO: Implement true streaming in edge functions
      const content = data.content
      const chunkSize = 10 // Characters per chunk
      let position = 0

      const stream = new ReadableStream({
        start(controller) {
          const interval = setInterval(() => {
            if (position >= content.length) {
              clearInterval(interval)
              controller.close()
              return
            }

            const chunk = content.slice(position, position + chunkSize)
            controller.enqueue(chunk)
            position += chunkSize
          }, 50) // 50ms delay between chunks for visual effect
        }
      })

      return {
        success: true,
        stream
      }

    } catch (error) {
      console.error('Gemini Streaming Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async generateText({ prompt, tone, language, customTone, quantity = 3 }: TextGenerationRequest): Promise<TextGenerationResponse> {
    try {
      // Get auth token for edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return {
          content: '',
          success: false,
          error: 'Authentication required'
        }
      }

      const selectedTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      const userPrompt = `Language: ${language}
Tone: ${selectedTone}

User Request: ${prompt}

IMPORTANT: Generate exactly ${quantity} ad copy version${quantity === 1 ? '' : 's'} as specified in the format above. Respond ONLY with the ad copies in the exact format specified. NO explanations, NO metadata headers, NO additional suggestions. Start directly with the first version and end after the ${quantity === 1 ? 'version' : `${quantity} versions`}.`

      const fullPrompt = `${SYSTEM_PROMPT}

${userPrompt}`

      // Call Supabase Edge Function instead of direct API
      const response = await fetch(GEMINI_EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemPrompt: SYSTEM_PROMPT,
          temperature: 0.7,
          maxTokens: 4000
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      // Log the response for debugging
      console.log('🔵 [Gemini] Edge Function Response:', JSON.stringify(data, null, 2))
      console.log('🔵 [Gemini] Request Prompt:', prompt)
      console.log('🔵 [Gemini] Request Tone:', tone)
      console.log('🔵 [Gemini] Request Language:', language)
      
      // Handle error responses from edge function
      if (!data.success) {
        throw new Error(data.error || 'Edge function returned an error')
      }
      
      if (!data.content || data.content.trim() === '') {
        throw new Error('Empty content in edge function response')
      }

      console.log('🔵 [Gemini] Final Content (first 500 chars):', data.content.trim().substring(0, 500))
      return {
        content: data.content.trim(),
        success: true
      }

    } catch (error) {
      console.error('❌ [Gemini] API Error:', error)
      console.error('❌ [Gemini] Error Details:', error instanceof Error ? error.stack : error)
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
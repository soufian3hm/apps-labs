// API keys are now secured in Supabase Edge Functions
// This service now calls edge functions instead of direct API calls
import { supabase } from '../lib/supabase'

const DEEPSEEK_EDGE_FUNCTION_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/deepseek-text-generation`

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

export class DeepSeekService {
  // Special method for JSON responses - bypasses ad copy system prompt
  static async generateJSON(prompt: string): Promise<TextGenerationResponse> {
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

      // Call edge function
      const response = await fetch(DEEPSEEK_EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          systemPrompt: 'You are a helpful AI assistant that responds ONLY with valid JSON objects. Never add explanations, markdown, or any text outside the JSON structure.',
          temperature: 0.3,
          maxTokens: 2000
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      console.log('🟢 [DeepSeek JSON] Edge Function Response:', JSON.stringify(data, null, 2))
      
      if (!data.success) {
        throw new Error(data.error || 'Edge function returned an error')
      }

      if (!data.content) {
        throw new Error('Empty content in edge function response')
      }

      const content = data.content.trim()
      console.log('🟢 [DeepSeek JSON] Extracted Content:', content)
      
      return {
        content,
        success: true
      }

    } catch (error) {
      console.error('🟢 [DeepSeek JSON] Error:', error)
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

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
      const response = await fetch(DEEPSEEK_EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemPrompt: SYSTEM_PROMPT,
          temperature: temperature,
          maxTokens: 2000
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
      console.error('DeepSeek Streaming Error:', error)
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

      const selectedTone = tone === 'Custom' ? customTone : tone
      const userPrompt = `Language: ${language}
Tone: ${selectedTone}

User Request: ${prompt}

IMPORTANT: Respond ONLY with the 3 ad copy versions in the exact format specified. NO explanations, NO metadata headers, NO additional suggestions. Start directly with [Ad Copy Version 1 - Short] and end after the third version.`

      const fullPrompt = `${SYSTEM_PROMPT}

${userPrompt}`

      // Call Supabase Edge Function instead of direct API
      const response = await fetch(DEEPSEEK_EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemPrompt: SYSTEM_PROMPT,
          temperature: 0.7,
          maxTokens: 2000
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      // Log the response for debugging
      console.log('🟢 [DeepSeek] Edge Function Response:', JSON.stringify(data, null, 2))
      console.log('🟢 [DeepSeek] Request Prompt:', prompt)
      console.log('🟢 [DeepSeek] Request Tone:', tone)
      console.log('🟢 [DeepSeek] Request Language:', language)
      
      // Handle error responses from edge function
      if (!data.success) {
        throw new Error(data.error || 'Edge function returned an error')
      }

      if (!data.content || !data.content.trim()) {
        throw new Error('Empty content in edge function response')
      }

      console.log('🟢 [DeepSeek] Extracted Content (first 500 chars):', data.content.trim().substring(0, 500))
      console.log('🟢 [DeepSeek] Full Content Length:', data.content.trim().length)
      
      return {
        content: data.content.trim(),
        success: true
      }

    } catch (error) {
      console.error('❌ [DeepSeek] Edge Function Error:', error)
      console.error('❌ [DeepSeek] Error Details:', error instanceof Error ? error.stack : error)
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
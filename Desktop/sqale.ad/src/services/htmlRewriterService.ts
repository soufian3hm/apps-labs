const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-09-2025:generateContent'
const DEEPSEEK_API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY

export interface HTMLRewriteRequest {
  originalHtml: string
  productContext: string
  language: string
  tone: string
  customTone?: string
}

export interface HTMLRewriteResponse {
  html: string
  success: boolean
  error?: string
}

export interface TextRewriteRequest {
  texts: string[]
  productContext: string
  language: string
  tone: string
  customTone?: string
}

export interface TextRewriteResponse {
  texts: string[]
  success: boolean
  error?: string
}

export interface TextMapRewriteRequest {
  textMap: Record<string, string>
  productContext: string
  language: string
  tone: string
  customTone?: string
}

export interface TextMapRewriteResponse {
  textMap: Record<string, string>
  success: boolean
  error?: string
}

const SYSTEM_PROMPT = `You are an expert copywriter specialized in creating high-converting landing pages.

YOUR TASK:
1. Receive complete HTML section code for a product landing page
2. Rewrite ONLY the text content to be compelling, product-specific marketing copy
3. Write in the SPECIFIED LANGUAGE with the SPECIFIED TONE
4. Use PRODUCT CONTEXT to make every word relevant and persuasive
5. Return the complete HTML with ONLY the text rewritten

🚨 ULTRA-STRICT HTML PRESERVATION RULES 🚨
VIOLATING THESE RULES WILL BREAK THE ENTIRE LANDING PAGE:

❌ NEVER EVER EDIT, CHANGE, OR MODIFY:
- HTML tags (div, h1, p, button, img, svg, etc.)
- CSS classes or IDs (class="...", id="...")
- HTML attributes (style, href, src, alt, data-*, aria-*, etc.)
- HTML structure (opening/closing tags, nesting, hierarchy)
- Image URLs or paths (src="...", href="...")
- SVG code (path, viewBox, fill, stroke, etc.)
- Inline styles (style="...")
- Special characters in attributes (quotes, brackets, etc.)
- HTML entities (&nbsp;, &amp;, etc.)
- Line breaks, spacing, or indentation between HTML tags
- Any code between < and > symbols

❌ ABSOLUTELY FORBIDDEN - NEVER DELETE TEXT:
- NEVER delete any text content between tags
- NEVER remove any text, even if it seems unnecessary
- NEVER leave any tag empty if it had text before
- You MUST replace EVERY piece of text with new text
- If original has 50 text elements, output MUST have 50 text elements
- DELETION = BREAKING THE PAGE = FORBIDDEN

✅ ONLY CHANGE THIS:
- Text content between HTML tags (>text here<)
- REPLACE (not delete) text to match product, language, and tone
- Keep text length similar (±20% acceptable)
- Every text element MUST be rewritten, NEVER deleted

🔴 CRITICAL OUTPUT RULES:
1. OUTPUT ONLY valid HTML code - NO explanations, NO markdown, NO code blocks
2. NEVER add \`\`\`html or any wrapper - start immediately with HTML
3. Start response with opening HTML tag, end with closing HTML tag
4. Return IDENTICAL HTML structure with ONLY text changed

LANGUAGE & TONE REQUIREMENTS:
- Write EVERYTHING in the specified target language
- Match the specified tone (Professional, Casual, Urgent, Luxury, etc.)
- Adapt copy style to the product type and audience
- Use culturally appropriate expressions for the target language

PRODUCT CONTEXT USAGE:
- Extract key product benefits, features, and unique selling points
- Transform generic text into product-specific compelling copy
- Highlight what makes THIS product special
- Create desire and urgency appropriate to the product

EXAMPLE OF CORRECT BEHAVIOR:
INPUT:  <div class="box"><h1 style="color:red">Product Title</h1><p>Description here</p></div>
OUTPUT: <div class="box"><h1 style="color:red">Revolutionary Skin Care</h1><p>Transform your skin in 30 days</p></div>
NOTE: ONLY text changed. All tags, classes, styles IDENTICAL.

EXAMPLE OF WRONG BEHAVIOR (DO NOT DO THIS):
INPUT:  <div class="box"><h1 style="color:red">Product Title</h1></div>
OUTPUT: <div class="container"><h1 style="color:blue">Product Title</h1></div>
ERROR: Changed class name and style attribute - NEVER DO THIS!

REMEMBER: Return ONLY the HTML with text rewritten. NEVER modify HTML structure, tags, or attributes.`

export class HTMLRewriterService {
  static async rewriteWithDeepSeek({ originalHtml, productContext, language, tone, customTone }: HTMLRewriteRequest): Promise<HTMLRewriteResponse> {
    if (!DEEPSEEK_API_KEY) {
      return {
        html: '',
        success: false,
        error: 'DeepSeek API key not configured'
      }
    }

    try {
      const effectiveTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      
      const userPrompt = `🎯 REWRITE THIS LANDING PAGE SECTION FOR THE FOLLOWING PRODUCT:

📦 PRODUCT CONTEXT:
${productContext}

🌍 TARGET LANGUAGE: ${language}
(Write ALL text content in ${language}. No other language allowed.)

🎭 TONE & STYLE: ${effectiveTone}
(Match this tone in every sentence. Use appropriate emotional triggers and power words.)

📄 HTML SECTION TO REWRITE:
${originalHtml}

🚨 ULTRA-CRITICAL INSTRUCTIONS - VIOLATING THESE WILL BREAK THE PAGE:

✅ MUST DO:
1. Rewrite ALL text between HTML tags to be compelling, product-specific copy
2. Make it HIGH-CONVERTING: focus on benefits, urgency, social proof
3. Maintain similar text length to preserve visual layout (±20%)
4. Output ONLY the rewritten HTML - no explanations, no markdown

❌ NEVER EVER DO:
1. DO NOT change ANY HTML tag names (<div>, <h1>, <p>, <button>, <svg>, etc.)
2. DO NOT change ANY class names (class="...")
3. DO NOT change ANY IDs (id="...")
4. DO NOT change ANY HTML attributes (style, href, src, data-*, aria-*, etc.)
5. DO NOT change ANY image URLs or SVG code
6. DO NOT add or remove ANY HTML tags
7. DO NOT change the HTML structure or nesting
8. DO NOT modify inline styles (style="...")
9. DO NOT change HTML entities (&nbsp;, etc.)
10. DO NOT DELETE any text content - ONLY REPLACE IT
11. DO NOT leave any tag empty if it had text before
12. ONLY change the TEXT between tags (>text<) by REPLACING it

⚠️ EXTREME EMPHASIS:
Your job is to be a COPYWRITER, NOT an HTML EDITOR.
You ONLY REPLACE TEXT CONTENT - NEVER DELETE IT.
You NEVER touch HTML CODE.
Everything between < and > must stay EXACTLY the same.
If there are 100 pieces of text in the HTML, your output MUST have 100 pieces of text (all replaced, NONE deleted).

START YOUR RESPONSE WITH THE HTML TAG NOW (NO MARKDOWN, NO EXPLANATIONS):`

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 8000,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API')
      }

      let htmlContent = data.choices[0].message.content.trim()
      
      // Aggressively clean any markdown or explanations
      htmlContent = htmlContent
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^Here is the rewritten HTML:?\s*/i, '')
        .replace(/^Here's the rewritten HTML:?\s*/i, '')
        .replace(/^Rewritten HTML:?\s*/i, '')
        .trim()

      return {
        html: htmlContent,
        success: true
      }

    } catch (error) {
      console.error('DeepSeek HTML Rewriter Error:', error)
      return {
        html: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async rewriteWithGemini({ originalHtml, productContext, language, tone, customTone }: HTMLRewriteRequest): Promise<HTMLRewriteResponse> {
    if (!GEMINI_API_KEY) {
      return {
        html: '',
        success: false,
        error: 'Gemini API key not configured'
      }
    }

    try {
      const effectiveTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      
      // Add explicit language instruction for all non-English languages
      const languageInstruction = language !== 'English' 
        ? `\n\n🚨 CRITICAL: Write EVERYTHING in ${language}. Translate ALL text including English phrases. If you see "24/7 Support", "Verified Quality", "Hassle-free Returns", etc., translate them to ${language}. NO English words allowed.`
        : '';

      const userPrompt = `🎯 REWRITE THIS LANDING PAGE SECTION FOR THE FOLLOWING PRODUCT:

📦 PRODUCT CONTEXT:
${productContext}

🌍 TARGET LANGUAGE: ${language}
(Write ALL text content in ${language}. No other language allowed.)${languageInstruction}

🎭 TONE & STYLE: ${effectiveTone}
(Match this tone in every sentence. Use appropriate emotional triggers and power words.)

📄 HTML SECTION TO REWRITE:
${originalHtml}

🚨 ULTRA-CRITICAL INSTRUCTIONS - VIOLATING THESE WILL BREAK THE PAGE:

✅ MUST DO:
1. Rewrite ALL text between HTML tags to be compelling, product-specific copy
2. Make it HIGH-CONVERTING: focus on benefits, urgency, social proof
3. Maintain similar text length to preserve visual layout (±20%)
4. Output ONLY the rewritten HTML - no explanations, no markdown

❌ NEVER EVER DO:
1. DO NOT change ANY HTML tag names (<div>, <h1>, <p>, <button>, <svg>, etc.)
2. DO NOT change ANY class names (class="...")
3. DO NOT change ANY IDs (id="...")
4. DO NOT change ANY HTML attributes (style, href, src, data-*, aria-*, etc.)
5. DO NOT change ANY image URLs or SVG code
6. DO NOT add or remove ANY HTML tags
7. DO NOT change the HTML structure or nesting
8. DO NOT modify inline styles (style="...")
9. DO NOT change HTML entities (&nbsp;, etc.)
10. DO NOT DELETE any text content - ONLY REPLACE IT
11. DO NOT leave any tag empty if it had text before
12. ONLY change the TEXT between tags (>text<) by REPLACING it

⚠️ EXTREME EMPHASIS:
Your job is to be a COPYWRITER, NOT an HTML EDITOR.
You ONLY REPLACE TEXT CONTENT - NEVER DELETE IT.
You NEVER touch HTML CODE.
Everything between < and > must stay EXACTLY the same.
If there are 100 pieces of text in the HTML, your output MUST have 100 pieces of text (all replaced, NONE deleted).

START YOUR RESPONSE WITH THE HTML TAG NOW (NO MARKDOWN, NO EXPLANATIONS):`

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\n${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 8000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message || 'Gemini API returned an error')
      }
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned from Gemini API')
      }
      
      const candidate = data.candidates[0]
      
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response structure from Gemini')
      }

      let htmlContent = candidate.content.parts[0].text.trim()
      
      // Aggressively clean any markdown or explanations
      htmlContent = htmlContent
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^Here is the rewritten HTML:?\s*/i, '')
        .replace(/^Here's the rewritten HTML:?\s*/i, '')
        .replace(/^Rewritten HTML:?\s*/i, '')
        .trim()

      return {
        html: htmlContent,
        success: true
      }

    } catch (error) {
      console.error('Gemini HTML Rewriter Error:', error)
      return {
        html: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async rewriteTextsWithDeepSeek({ texts, productContext, language, tone, customTone }: TextRewriteRequest): Promise<TextRewriteResponse> {
    console.log('🟣 DeepSeek Text Rewriter - Starting...')
    console.log('  📊 Input texts count:', texts.length)
    console.log('  📄 Product Context:', productContext.substring(0, 100) + '...')
    
    if (!DEEPSEEK_API_KEY) {
      console.log('  ❌ DeepSeek API key not configured')
      return {
        texts: [],
        success: false,
        error: 'DeepSeek API key not configured'
      }
    }

    try {
      const effectiveTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      console.log('  🎭 Tone:', effectiveTone)
      console.log('  🌍 Language:', language)
      
      // Create metadata with character counts for each text
      const textsWithMetadata = texts.map(text => ({
        text,
        charCount: text.length,
        wordCount: text.split(/\s+/).length
      }))
      const textsJson = JSON.stringify(textsWithMetadata, null, 2)
      console.log('  📏 Text lengths:', texts.map(t => `${t.length} chars`))
      
      const systemPrompt = `You are an expert copywriter specializing in high-converting landing page content.

CRITICAL RULES - FOLLOW EXACTLY:
1. You will receive a JSON array of text objects with charCount and wordCount
2. REWRITE (don't translate) EVERY text to be HIGH-IMPACT marketing copy
3. Write in the specified LANGUAGE and TONE
4. Use PRODUCT CONTEXT to make compelling, relevant copy
5. Return ONLY a JSON array with rewritten texts in the SAME ORDER
6. CRITICAL: Keep character count within ±20% of original charCount to preserve UI layout
7. For very short texts (under 10 chars), match length exactly
8. Return ONLY the JSON array - NO explanations, NO markdown, NO code blocks

EXAMPLE:
Input: [{"text":"Old Title","charCount":9,"wordCount":2}]
Output: [{"text":"New Title","charCount":9,"wordCount":2}]`
      
      const userPrompt = `LANGUAGE: ${language}
TONE: ${effectiveTone}
PRODUCT CONTEXT: ${productContext}

⚠️ CRITICAL: Rewrite ALL texts below. Keep character count within ±20% of charCount field.

TEXTS TO REWRITE:
${textsJson}

RETURN ONLY JSON ARRAY with same structure. Match character lengths closely.`

      console.log('  💡 Making API request to DeepSeek...')
      
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          stream: false
        })
      })

      console.log('  📨 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('  ❌ API request failed:', errorText)
        throw new Error(`API request failed with status ${response.status}: ${errorText.substring(0, 200)}`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.log('  ❌ Invalid response format')
        throw new Error('Invalid response format from API')
      }

      let content = data.choices[0].message.content.trim()
      console.log('  📦 Raw response:', content.substring(0, 500))
      
      // Clean markdown
      content = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Parse JSON
      const rewrittenData = JSON.parse(content)
      
      if (!Array.isArray(rewrittenData)) {
        console.log('  ❌ Response is not a JSON array')
        throw new Error('Response is not a JSON array')
      }
      
      // Extract text field from each item
      const rewrittenTexts = rewrittenData.map((item, idx) => {
        if (typeof item === 'string') {
          return item
        }
        if (item.text && typeof item.text === 'string') {
          const origLength = texts[idx]?.length || 0
          const newLength = item.text.length
          const diff = Math.abs(newLength - origLength) / origLength
          if (diff > 0.3) {
            console.log(`  ⚠️ Text ${idx}: length changed significantly (${origLength}→${newLength} chars, ${(diff*100).toFixed(0)}% diff)`)
          }
          return item.text
        }
        throw new Error(`Invalid response format at index ${idx}`)
      })

      console.log('  ✅ DeepSeek rewrite successful!')
      console.log('  📋 Output texts count:', rewrittenTexts.length)
      
      // CRITICAL VALIDATION: Ensure text count matches
      if (rewrittenTexts.length !== texts.length) {
        console.error('  ❌❌❌ CRITICAL ERROR: AI changed text count!')
        console.error('  Expected:', texts.length, 'texts')
        console.error('  Received:', rewrittenTexts.length, 'texts')
        throw new Error(`AI returned ${rewrittenTexts.length} texts but expected ${texts.length}. This would corrupt the HTML.`)
      }
      
      return {
        texts: rewrittenTexts,
        success: true
      }

    } catch (error) {
      console.error('DeepSeek Text Rewriter Error:', error)
      return {
        texts: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async rewriteTextsWithGemini({ texts, productContext, language, tone, customTone }: TextRewriteRequest): Promise<TextRewriteResponse> {
    console.log('🔵 Gemini Text Rewriter - Starting...')
    console.log('  📊 Input texts count:', texts.length)
    console.log('  📄 Product Context:', productContext.substring(0, 100) + '...')
    
    if (!GEMINI_API_KEY) {
      console.log('  ❌ Gemini API key not configured')
      return {
        texts: [],
        success: false,
        error: 'Gemini API key not configured'
      }
    }

    try {
      const effectiveTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      console.log('  🎭 Tone:', effectiveTone)
      console.log('  🌍 Language:', language)
      
      // Create metadata with character counts for each text
      const textsWithMetadata = texts.map(text => ({
        text,
        charCount: text.length,
        wordCount: text.split(/\s+/).length
      }))
      const textsJson = JSON.stringify(textsWithMetadata, null, 2)
      console.log('  📏 Text lengths:', texts.map(t => `${t.length} chars`))
      
      const systemPrompt = `You are an expert copywriter specializing in high-converting landing page content.

CRITICAL RULES - FOLLOW EXACTLY:
1. You will receive a JSON array of text objects with charCount and wordCount
2. REWRITE (don't translate) EVERY text to be HIGH-IMPACT marketing copy
3. Write in the specified LANGUAGE and TONE
4. Use PRODUCT CONTEXT to make compelling, relevant copy
5. Return ONLY a JSON array with rewritten texts in the SAME ORDER
6. CRITICAL: Keep character count within ±20% of original charCount to preserve UI layout
7. For very short texts (under 10 chars), match length exactly
8. Return ONLY the JSON array - NO explanations, NO markdown, NO code blocks

EXAMPLE:
Input: [{"text":"Old Title","charCount":9,"wordCount":2}]
Output: [{"text":"New Title","charCount":9,"wordCount":2}]`
      
      const userPrompt = `LANGUAGE: ${language}
TONE: ${effectiveTone}
PRODUCT CONTEXT: ${productContext}

⚠️ CRITICAL: Rewrite ALL texts below. Keep character count within ±20% of charCount field.

TEXTS TO REWRITE:
${textsJson}

RETURN ONLY JSON ARRAY with same structure. Match character lengths closely.`

      console.log('  💡 Making API request to Gemini...')
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 0.9,
            maxOutputTokens: 4000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        })
      })

      console.log('  📨 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('  ❌ API request failed:', errorText)
        throw new Error(`API request failed with status ${response.status}: ${errorText.substring(0, 200)}`)
      }

      const responseText = await response.text()
      console.log('  📦 Raw response:', responseText.substring(0, 500))
      
      if (!responseText) {
        console.log('  ⚠️ Empty response body')
        throw new Error('Gemini API returned empty response')
      }
      
      const data = JSON.parse(responseText)
      
      if (data.error) {
        throw new Error(data.error.message || 'Gemini API returned an error')
      }
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned from Gemini API')
      }
      
      const candidate = data.candidates[0]
      
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response structure from Gemini')
      }

      let content = candidate.content.parts[0].text.trim()
      console.log('  📦 AI response content:', content.substring(0, 500))
      
      // Clean markdown
      content = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Parse JSON
      const rewrittenData = JSON.parse(content)
      
      if (!Array.isArray(rewrittenData)) {
        console.log('  ❌ Response is not a JSON array')
        throw new Error('Response is not a JSON array')
      }
      
      // Extract text field from each item
      const rewrittenTexts = rewrittenData.map((item, idx) => {
        if (typeof item === 'string') {
          return item
        }
        if (item.text && typeof item.text === 'string') {
          const origLength = texts[idx]?.length || 0
          const newLength = item.text.length
          const diff = Math.abs(newLength - origLength) / origLength
          if (diff > 0.3) {
            console.log(`  ⚠️ Text ${idx}: length changed significantly (${origLength}→${newLength} chars, ${(diff*100).toFixed(0)}% diff)`)
          }
          return item.text
        }
        throw new Error(`Invalid response format at index ${idx}`)
      })

      console.log('  ✅ Gemini rewrite successful!')
      console.log('  📋 Output texts count:', rewrittenTexts.length)
      
      // CRITICAL VALIDATION: Ensure text count matches
      if (rewrittenTexts.length !== texts.length) {
        console.error('  ❌❌❌ CRITICAL ERROR: AI changed text count!')
        console.error('  Expected:', texts.length, 'texts')
        console.error('  Received:', rewrittenTexts.length, 'texts')
        throw new Error(`AI returned ${rewrittenTexts.length} texts but expected ${texts.length}. This would corrupt the HTML.`)
      }
      
      return {
        texts: rewrittenTexts,
        success: true
      }

    } catch (error) {
      console.error('Gemini Text Rewriter Error:', error)
      return {
        texts: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // METHOD 3: Rewrite using textMap (DOMParser approach)
  static async rewriteTextMapWithDeepSeek({ textMap, productContext, language, tone, customTone }: TextMapRewriteRequest): Promise<TextMapRewriteResponse> {
    console.log('🟯 DeepSeek TextMap Rewriter - Starting...')
    console.log('  📊 TextMap size:', Object.keys(textMap).length, 'items')
    
    if (!DEEPSEEK_API_KEY) {
      return {
        textMap: {},
        success: false,
        error: 'DeepSeek API key not configured'
      }
    }

    try {
      const effectiveTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      
      const systemPrompt = `You rewrite landing page text for a NEW product. IGNORE old text values completely.

RULES:
1. Input JSON has OLD product text values - IGNORE them completely
2. Use ONLY NEW PRODUCT CONTEXT to write fresh copy
3. Return JSON with EXACTLY THE SAME KEYS - DO NOT add or remove any keys
4. Write in specified LANGUAGE and TONE - TRANSLATE EVERYTHING to target language
5. Return ONLY JSON - no explanations, no extra keys, no additional text

🔴 CRITICAL: You MUST return EXACTLY the same number of keys as input. If input has 3 keys, return EXACTLY 3 keys. If input has 10 keys, return EXACTLY 10 keys. DO NOT add extra keys or split text into multiple keys.

LANGUAGE REQUIREMENT:
- EVERY word must be in target language (no English if target is Arabic, etc.)
- Translate ALL text: headlines, descriptions, buttons, labels, everything
- If input has English like "24/7 Support" and target is Arabic, write "دعم على مدار الساعة"
- NEVER keep English text when target language is not English

PLACEHOLDERS - REPLACE WITH ACTUAL VALUES:
- {insert star rating} → Replace with actual stars: "⭐⭐⭐⭐⭐" or "5 stars" or "5 نجوم"
- {insert number} → Replace with realistic numbers: "1,234" or "1,234" (in target language format)
- "Insert review here" → Generate complete review
- "Insert review title here" → Generate review title
- "Insert review author name here" → Generate author name in target language

REVIEWS: If text contains "review", "rating", "author", or placeholders:
- AUTO-GENERATE complete reviews about NEW product
- Write from different angles (features, use cases, benefits, perspectives)
- Vary reviews naturally (not all generic praise)
- Author names MUST match target language (Arabic→Arabic names, English→English names, etc.)
- Generate 4-5 star ratings

EXAMPLE:
Input: {"__TEXT_0__":"Old Product","__TEXT_1__":"Insert review here","__TEXT_2__":"{insert number} reviews"}
Context: Smart Watch with fitness tracking | Language: Arabic
Output: {"__TEXT_0__":"ساعة ذكية لللياقة","__TEXT_1__":"ممتازة! تتبع دقيق للخطوات والنبض","__TEXT_2__":"1,234 تقييم"}`
      
      // Build the user prompt as plain text, let JSON.stringify handle encoding
      const textMapJson = JSON.stringify(textMap, null, 2)
      
      // Add explicit language instruction for all non-English languages
      const languageInstruction = language !== 'English' 
        ? `\n\n🚨 CRITICAL: Write EVERYTHING in ${language}. Translate ALL text including English phrases. If you see "24/7 Support", "Verified Quality", "Hassle-free Returns", etc., translate them to ${language}. NO English words allowed.`
        : '';

      // Build language-specific name examples
      const nameExamples: Record<string, string> = {
        'Arabic': 'أحمد، فاطمة، محمد، سارة',
        'English': 'Thomas, Sarah, Michael, Emma',
        'French': 'Pierre, Marie, Jean, Sophie',
        'Spanish': 'Carlos, Maria, Juan, Ana',
        'German': 'Hans, Anna, Klaus, Lisa',
        'Italian': 'Marco, Sofia, Luca, Giulia',
        'Portuguese': 'João, Maria, Pedro, Ana',
        'Dutch': 'Jan, Anna, Pieter, Emma',
        'Russian': 'Иван, Мария, Дмитрий, Анна',
        'Chinese': '李明, 王芳, 张伟, 刘静',
        'Japanese': '田中, 佐藤, 鈴木, 高橋',
        'Korean': '김민수, 이지은, 박준호, 최수진'
      }
      const nameExample = nameExamples[language] || 'Use culturally appropriate names'

      // Check if textMap contains English text when target is not English
      const hasEnglishText = language !== 'English' && Object.values(textMap).some(text => 
        /[A-Za-z]{3,}/.test(text) && /[A-Za-z]+/.test(text)
      )
      
      const translationWarning = hasEnglishText && language !== 'English'
        ? `\n\n🚨🚨🚨 CRITICAL TRANSLATION REQUIREMENT 🚨🚨🚨\nThe input textMap contains English text. You MUST translate EVERY English word/phrase to ${language}.\nExamples: "Move Freely" → translate to ${language}, "24/7 Support" → translate to ${language}, "Live Fully" → translate to ${language}\nNO English words should remain in your output when target language is ${language}.\n`
        : ''

      const userPrompt = `NEW PRODUCT: ${productContext}

LANGUAGE: ${language} | TONE: ${effectiveTone}${languageInstruction}${translationWarning}

OLD TEXT (IGNORE - REPLACE ALL):
${textMapJson}

RETURN: JSON with EXACTLY THE SAME KEYS as input (${Object.keys(textMap).length} keys). DO NOT add or remove keys. DO NOT split text into multiple keys.

CRITICAL TRANSLATION RULES:
- If target language is ${language} and input contains ANY English text, translate ALL of it to ${language}
- Examples: "Move Freely" → ${language}, "Live Fully" → ${language}, "24/7 Support" → ${language}, "Verified Quality" → ${language}, "Hassle-free Returns" → ${language}
- NO English words should remain when target is ${language}
- Replace {insert star rating} with actual stars (⭐⭐⭐⭐⭐ or "5 stars" in ${language})
- Replace {insert number} with realistic numbers (e.g., "1,234" in ${language} format)
- Replace all placeholders with actual content

REVIEWS: If text contains "review"/"rating"/"author"/placeholders:
- Auto-generate reviews about NEW product from different angles
- Author names: ${nameExample} (match ${language} exactly)
- Ratings: 4-5 stars, varied naturally`
      
      // Create the request payload - JSON.stringify will properly escape all Unicode
      const requestBody = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 8000,
        stream: false
      })

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${errorText.substring(0, 200)}`)
      }

      const data = await response.json()
      let content = data.choices[0].message.content.trim()
      
      // Clean markdown
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Parse JSON
      let rewrittenTextMap: any
      try {
        rewrittenTextMap = JSON.parse(content)
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError)
        console.error('Response content (first 500 chars):', content.substring(0, 500))
        throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }
      
      // CRITICAL: ALWAYS filter to ensure we have EXACTLY the expected keys (even if counts match)
      const expectedKeys = Object.keys(textMap)
      const returnedKeys = Object.keys(rewrittenTextMap || {})
      
      console.log(`📊 Key validation: Expected ${expectedKeys.length}, Got ${returnedKeys.length}`)
      
      // ALWAYS filter - ensure we only use expected keys
      const filteredTextMap: Record<string, string> = {}
      let missingKeys: string[] = []
      
      expectedKeys.forEach(key => {
        if (rewrittenTextMap && rewrittenTextMap[key] !== undefined && rewrittenTextMap[key] !== null) {
          filteredTextMap[key] = String(rewrittenTextMap[key]).trim()
        } else {
          missingKeys.push(key)
          console.warn(`⚠️ Key ${key} missing in AI response, using original text`)
          filteredTextMap[key] = textMap[key]
        }
      })
      
      // Log extra keys if any
      const extraKeys = returnedKeys.filter(k => !expectedKeys.includes(k))
      if (extraKeys.length > 0) {
        console.warn(`⚠️ AI returned ${extraKeys.length} extra keys (filtered out):`, extraKeys.slice(0, 10))
      }
      
      if (missingKeys.length > 0) {
        console.warn(`⚠️ ${missingKeys.length} keys were missing from AI response (using original text)`)
      }
      
      rewrittenTextMap = filteredTextMap
      
      // POST-PROCESSING: Replace placeholders that AI might have missed
      Object.keys(rewrittenTextMap).forEach(key => {
        let value = rewrittenTextMap[key]
        
        // Replace {insert star rating} with actual stars
        if (value.includes('{insert star rating}')) {
          const starRating = language === 'Arabic' ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐⭐'
          value = value.replace(/{insert star rating}/g, starRating)
          console.log(`✅ Replaced {insert star rating} in ${key}`)
        }
        
        // Replace {insert number} with realistic number
        if (value.includes('{insert number}')) {
          // Generate realistic number (1000-9999 range)
          const randomNumber = Math.floor(Math.random() * 9000) + 1000
          const formattedNumber = randomNumber.toLocaleString(language === 'Arabic' ? 'ar' : 'en')
          value = value.replace(/{insert number}/g, formattedNumber)
          console.log(`✅ Replaced {insert number} in ${key} with ${formattedNumber}`)
        }
        
        rewrittenTextMap[key] = value
      })
      
      // Final validation - should always pass now
      if (Object.keys(rewrittenTextMap).length !== expectedKeys.length) {
        console.error('❌ CRITICAL: Filtering failed!')
        console.error('Expected keys:', expectedKeys)
        console.error('Filtered keys:', Object.keys(rewrittenTextMap))
        throw new Error(`Filtering failed: Expected ${expectedKeys.length} keys but got ${Object.keys(rewrittenTextMap).length} after filtering`)
      }
      
      console.log('✅ Successfully filtered response to match expected keys')
      console.log('  ✅ DeepSeek textMap rewrite successful!')
      return {
        textMap: rewrittenTextMap,
        success: true
      }
    } catch (error) {
      console.error('DeepSeek TextMap Rewriter Error:', error)
      return {
        textMap: {},
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async rewriteTextMapWithGemini({ textMap, productContext, language, tone, customTone }: TextMapRewriteRequest): Promise<TextMapRewriteResponse> {
    console.log('🔵 Gemini TextMap Rewriter - Starting...')
    console.log('  📊 TextMap size:', Object.keys(textMap).length, 'items')
    
    if (!GEMINI_API_KEY) {
      return {
        textMap: {},
        success: false,
        error: 'Gemini API key not configured'
      }
    }

    try {
      const effectiveTone = tone === 'Custom' ? (customTone || 'Professional') : tone
      
      const systemPrompt = `You rewrite landing page text for a NEW product. IGNORE old text values completely.

RULES:
1. Input JSON has OLD product text values - IGNORE them completely
2. Use ONLY NEW PRODUCT CONTEXT to write fresh copy
3. Return JSON with EXACTLY THE SAME KEYS - DO NOT add or remove any keys
4. Write in specified LANGUAGE and TONE - TRANSLATE EVERYTHING to target language
5. Return ONLY JSON - no explanations, no extra keys, no additional text

🔴 CRITICAL: You MUST return EXACTLY the same number of keys as input. If input has 3 keys, return EXACTLY 3 keys. If input has 10 keys, return EXACTLY 10 keys. DO NOT add extra keys or split text into multiple keys.

LANGUAGE REQUIREMENT:
- EVERY word must be in target language (no English if target is Arabic, etc.)
- Translate ALL text: headlines, descriptions, buttons, labels, everything
- If input has English like "24/7 Support" and target is Arabic, write "دعم على مدار الساعة"
- NEVER keep English text when target language is not English

PLACEHOLDERS - REPLACE WITH ACTUAL VALUES:
- {insert star rating} → Replace with actual stars: "⭐⭐⭐⭐⭐" or "5 stars" or "5 نجوم"
- {insert number} → Replace with realistic numbers: "1,234" or "1,234" (in target language format)
- "Insert review here" → Generate complete review
- "Insert review title here" → Generate review title
- "Insert review author name here" → Generate author name in target language

REVIEWS: If text contains "review", "rating", "author", or placeholders:
- AUTO-GENERATE complete reviews about NEW product
- Write from different angles (features, use cases, benefits, perspectives)
- Vary reviews naturally (not all generic praise)
- Author names MUST match target language (Arabic→Arabic names, English→English names, etc.)
- Generate 4-5 star ratings

EXAMPLE:
Input: {"__TEXT_0__":"Old Product","__TEXT_1__":"Insert review here","__TEXT_2__":"{insert number} reviews"}
Context: Smart Watch with fitness tracking | Language: Arabic
Output: {"__TEXT_0__":"ساعة ذكية لللياقة","__TEXT_1__":"ممتازة! تتبع دقيق للخطوات والنبض","__TEXT_2__":"1,234 تقييم"}`
      
      // Build the user prompt as plain text, let JSON.stringify handle encoding
      const textMapJson = JSON.stringify(textMap, null, 2)
      
      // Add explicit language instruction for all non-English languages
      const languageInstruction = language !== 'English' 
        ? `\n\n🚨 CRITICAL: Write EVERYTHING in ${language}. Translate ALL text including English phrases. If you see "24/7 Support", "Verified Quality", "Hassle-free Returns", etc., translate them to ${language}. NO English words allowed.`
        : '';

      // Build language-specific name examples
      const nameExamples: Record<string, string> = {
        'Arabic': 'أحمد، فاطمة، محمد، سارة',
        'English': 'Thomas, Sarah, Michael, Emma',
        'French': 'Pierre, Marie, Jean, Sophie',
        'Spanish': 'Carlos, Maria, Juan, Ana',
        'German': 'Hans, Anna, Klaus, Lisa',
        'Italian': 'Marco, Sofia, Luca, Giulia',
        'Portuguese': 'João, Maria, Pedro, Ana',
        'Dutch': 'Jan, Anna, Pieter, Emma',
        'Russian': 'Иван, Мария, Дмитрий, Анна',
        'Chinese': '李明, 王芳, 张伟, 刘静',
        'Japanese': '田中, 佐藤, 鈴木, 高橋',
        'Korean': '김민수, 이지은, 박준호, 최수진'
      }
      const nameExample = nameExamples[language] || 'Use culturally appropriate names'

      // Check if textMap contains English text when target is not English
      const hasEnglishText = language !== 'English' && Object.values(textMap).some(text => 
        /[A-Za-z]{3,}/.test(text) && /[A-Za-z]+/.test(text)
      )
      
      const translationWarning = hasEnglishText && language !== 'English'
        ? `\n\n🚨🚨🚨 CRITICAL TRANSLATION REQUIREMENT 🚨🚨🚨\nThe input textMap contains English text. You MUST translate EVERY English word/phrase to ${language}.\nExamples: "Move Freely" → translate to ${language}, "24/7 Support" → translate to ${language}, "Live Fully" → translate to ${language}\nNO English words should remain in your output when target language is ${language}.\n`
        : ''

      const userPrompt = `NEW PRODUCT: ${productContext}

LANGUAGE: ${language} | TONE: ${effectiveTone}${languageInstruction}${translationWarning}

OLD TEXT (IGNORE - REPLACE ALL):
${textMapJson}

RETURN: JSON with EXACTLY THE SAME KEYS as input (${Object.keys(textMap).length} keys). DO NOT add or remove keys. DO NOT split text into multiple keys.

CRITICAL TRANSLATION RULES:
- If target language is ${language} and input contains ANY English text, translate ALL of it to ${language}
- Examples: "Move Freely" → ${language}, "Live Fully" → ${language}, "24/7 Support" → ${language}, "Verified Quality" → ${language}, "Hassle-free Returns" → ${language}
- NO English words should remain when target is ${language}
- Replace {insert star rating} with actual stars (⭐⭐⭐⭐⭐ or "5 stars" in ${language})
- Replace {insert number} with realistic numbers (e.g., "1,234" in ${language} format)
- Replace all placeholders with actual content

REVIEWS: If text contains "review"/"rating"/"author"/placeholders:
- Auto-generate reviews about NEW product from different angles
- Author names: ${nameExample} (match ${language} exactly)
- Ratings: 4-5 stars, varied naturally`

      // Create the request payload - JSON.stringify will properly escape all Unicode
      const requestBody = JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 8000,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      })

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${errorText.substring(0, 200)}`)
      }

      const data = await response.json()
      let content = data.candidates[0].content.parts[0].text.trim()
      
      // Clean markdown
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Parse JSON
      let rewrittenTextMap: any
      try {
        rewrittenTextMap = JSON.parse(content)
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError)
        console.error('Response content (first 500 chars):', content.substring(0, 500))
        throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }
      
      // CRITICAL: ALWAYS filter to ensure we have EXACTLY the expected keys (even if counts match)
      const expectedKeys = Object.keys(textMap)
      const returnedKeys = Object.keys(rewrittenTextMap || {})
      
      console.log(`📊 Key validation: Expected ${expectedKeys.length}, Got ${returnedKeys.length}`)
      
      // ALWAYS filter - ensure we only use expected keys
      const filteredTextMap: Record<string, string> = {}
      let missingKeys: string[] = []
      
      expectedKeys.forEach(key => {
        if (rewrittenTextMap && rewrittenTextMap[key] !== undefined && rewrittenTextMap[key] !== null) {
          filteredTextMap[key] = String(rewrittenTextMap[key]).trim()
        } else {
          missingKeys.push(key)
          console.warn(`⚠️ Key ${key} missing in AI response, using original text`)
          filteredTextMap[key] = textMap[key]
        }
      })
      
      // Log extra keys if any
      const extraKeys = returnedKeys.filter(k => !expectedKeys.includes(k))
      if (extraKeys.length > 0) {
        console.warn(`⚠️ AI returned ${extraKeys.length} extra keys (filtered out):`, extraKeys.slice(0, 10))
      }
      
      if (missingKeys.length > 0) {
        console.warn(`⚠️ ${missingKeys.length} keys were missing from AI response (using original text)`)
      }
      
      rewrittenTextMap = filteredTextMap
      
      // POST-PROCESSING: Replace placeholders that AI might have missed
      Object.keys(rewrittenTextMap).forEach(key => {
        let value = rewrittenTextMap[key]
        
        // Replace {insert star rating} with actual stars
        if (value.includes('{insert star rating}')) {
          const starRating = language === 'Arabic' ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐⭐'
          value = value.replace(/{insert star rating}/g, starRating)
          console.log(`✅ Replaced {insert star rating} in ${key}`)
        }
        
        // Replace {insert number} with realistic number
        if (value.includes('{insert number}')) {
          // Generate realistic number (1000-9999 range)
          const randomNumber = Math.floor(Math.random() * 9000) + 1000
          const formattedNumber = randomNumber.toLocaleString(language === 'Arabic' ? 'ar' : 'en')
          value = value.replace(/{insert number}/g, formattedNumber)
          console.log(`✅ Replaced {insert number} in ${key} with ${formattedNumber}`)
        }
        
        rewrittenTextMap[key] = value
      })
      
      // Final validation - should always pass now
      if (Object.keys(rewrittenTextMap).length !== expectedKeys.length) {
        console.error('❌ CRITICAL: Filtering failed!')
        console.error('Expected keys:', expectedKeys)
        console.error('Filtered keys:', Object.keys(rewrittenTextMap))
        throw new Error(`Filtering failed: Expected ${expectedKeys.length} keys but got ${Object.keys(rewrittenTextMap).length} after filtering`)
      }
      
      console.log('✅ Successfully filtered response to match expected keys')
      console.log('  ✅ Gemini textMap rewrite successful!')
      return {
        textMap: rewrittenTextMap,
        success: true
      }
    } catch (error) {
      console.error('Gemini TextMap Rewriter Error:', error)
      return {
        textMap: {},
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

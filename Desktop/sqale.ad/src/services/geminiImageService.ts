// Using Edge Function for poster generation
import { supabase } from '../lib/supabase'

const POSTER_GENERATION_EDGE_FUNCTION_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/generate-poster`

export interface ImageGenerationRequest {
  prompt: string
  quantity?: number
  referenceImage?: string // Base64 data URL
}

export interface ImageGenerationResponse {
  success: boolean
  images?: string[] // Base64 encoded images
  error?: string
}

export class GeminiImageService {
  static async generateImages({ prompt, quantity = 1, referenceImage }: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      // Get auth token for edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const images: string[] = []

      // Generate images one by one (Gemini generates one image per request)
      for (let i = 0; i < quantity; i++) {
        // Build request payload
        const payload: any = {
          prompt: prompt
        }
        
        // Add reference image if provided
        if (referenceImage) {
          // Extract base64 data and mime type
          const matches = referenceImage.match(/^data:([^;]+);base64,(.+)$/)
          if (matches) {
            payload.referenceImage = matches[2] // base64 data without prefix
            payload.mimeType = matches[1] // mime type
          }
        }

        const response = await fetch(POSTER_GENERATION_EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()

        console.log(`🟣 [Gemini Image ${i + 1}] Edge Function Response:`, JSON.stringify(data, null, 2))

        // Handle error responses from edge function
        if (!data.success) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        // Extract image from response
        let imageBase64 = ''
        let mimeType = 'image/png'

        // Check if response has image data
        if (data.imageBase64) {
          imageBase64 = data.imageBase64
          mimeType = data.mimeType || 'image/png'
        } else if (data.image) {
          // Alternative response format
          imageBase64 = data.image
          mimeType = data.mimeType || 'image/png'
        } else if (data.candidates && data.candidates[0]) {
          // Handle Gemini API response format from edge function
          const candidate = data.candidates[0]
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                imageBase64 = part.inlineData.data
                mimeType = part.inlineData.mimeType || 'image/png'
                break
              }
            }
          }
        }

        if (!imageBase64) {
          console.error(`🟣 [Gemini Image ${i + 1}] No image found in response:`, JSON.stringify(data, null, 2))
          throw new Error('No image data found in edge function response')
        }

        // Convert base64 to data URL
        const imageDataUrl = `data:${mimeType};base64,${imageBase64}`
        console.log(`🟣 [Gemini Image ${i + 1}] Data URL created, first 100 chars:`, imageDataUrl.substring(0, 100))
        images.push(imageDataUrl)

        console.log(`🟣 [Gemini Image ${i + 1}] Successfully generated image with data URL`)
      }

      return {
        success: true,
        images
      }

    } catch (error) {
      console.error('❌ [Gemini Image] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

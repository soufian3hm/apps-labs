const GEMINI_TTS_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const API_KEY = process.env.REACT_APP_GEMINI_TTS_API_KEY

export interface TTSRequest {
  text: string
  voiceName?: string // Voice names: Aoede, Charon, Kore, Fenrir, Puck, etc.
  model?: 'flash' | 'pro' // Gemini Flash TTS or Gemini Pro TTS
}

export interface TTSResponse {
  success: boolean
  audioUrl?: string
  audioBlob?: Blob
  error?: string
}

export class GeminiTTSService {
  /**
   * Generate audio from text using Gemini TTS
   * @param request - TTS generation parameters
   * @returns Audio blob and URL
   */
  static async generateVoiceover({ 
    text, 
    voiceName = 'Aoede',
    model = 'pro'
  }: TTSRequest): Promise<TTSResponse> {
    if (!API_KEY) {
      return {
        success: false,
        error: 'Gemini API key not configured'
      }
    }

    if (!text || text.trim() === '') {
      return {
        success: false,
        error: 'No text provided for TTS generation'
      }
    }

    try {
      // Select model endpoint
      const modelName = model === 'flash' ? 'gemini-2.5-flash-preview-tts' : 'gemini-2.5-pro-preview-tts'
      const endpoint = `${GEMINI_TTS_API_URL}/${modelName}:generateContent?key=${API_KEY}`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text // Direct text input - no prompts, no scripts
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              }
            }
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `TTS API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Extract audio data from response
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No audio generated from TTS API')
      }

      const candidate = data.candidates[0]
      
      // Check for inline audio data
      if (candidate.content?.parts?.[0]?.inline_data) {
        const audioData = candidate.content.parts[0].inline_data
        const mimeType = audioData.mime_type || 'audio/wav'
        const audioBase64 = audioData.data

        // Convert base64 to blob
        const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
        const audioBlob = new Blob([audioBytes], { type: mimeType })
        const audioUrl = URL.createObjectURL(audioBlob)

        return {
          success: true,
          audioUrl,
          audioBlob
        }
      } else {
        throw new Error('No audio data found in TTS response')
      }

    } catch (error) {
      console.error('Gemini TTS Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown TTS error occurred'
      }
    }
  }


  /**
   * Clean up object URL to prevent memory leaks
   */
  static revokeAudioUrl(url: string) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }
}

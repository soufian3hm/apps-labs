export interface ScrapingRequest {
  url: string
}

export interface ScrapingResponse {
  content: string
  title: string
  success: boolean
  error?: string
}

export class SupabaseScraper {
  // Replace with your actual Supabase project URL when deployed
  private static readonly SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
  private static readonly FUNCTION_NAME = 'scrape-webpage'
  
  static async scrapeWebpage({ url }: ScrapingRequest): Promise<ScrapingResponse> {
    console.log(`🚀 Calling Supabase Edge Function for: ${url}`)
    
    try {
      const functionUrl = `${this.SUPABASE_URL}/functions/v1/${this.FUNCTION_NAME}`
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Function call failed: ${response.status} - ${errorText}`)
      }

      const result: ScrapingResponse = await response.json()
      
      console.log(`✅ Edge function returned ${result.content?.length || 0} characters`)
      
      return result

    } catch (error) {
      console.error('❌ Supabase Edge Function failed:', error)
      
      return {
        content: '',
        title: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error calling edge function'
      }
    }
  }
}

// For local development, fallback to direct fetch if edge function not available
export class LocalScraper {
  static async scrapeWebpage({ url }: ScrapingRequest): Promise<ScrapingResponse> {
    console.log(`🔧 Using local development scraper for: ${url}`)
    
    try {
      // For local dev, we'll use AllOrigins as a simple proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      
      const response = await fetch(proxyUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const html = data.contents || ''

      if (!html || html.length < 100) {
        throw new Error('Retrieved content is too short')
      }

      // Simple extraction for local dev
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1].trim() : 'Product Page'

      // Extract text content - FORCE extraction
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // NEVER return empty - take up to 3000 chars or whatever we have
      const finalContent = textContent.length > 0 ? textContent.substring(0, 3000) : html.substring(0, 2000)

      return {
        content: finalContent,
        title: title.substring(0, 100),
        success: true
      }

    } catch (error) {
      console.error('❌ Local scraper failed:', error)
      
      return {
        content: '',
        title: '',
        success: false,
        error: error instanceof Error ? error.message : 'Local scraper error'
      }
    }
  }
}
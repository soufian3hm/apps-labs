interface ImageScraperResult {
  url: string; // Updated from 'img' to 'url' to match new edge function
  text?: string;
  error?: string;
  confidence?: number; // Added confidence score from new OCR function
}

interface ImageScraperResponse {
  success: boolean;
  count?: number;
  results?: ImageScraperResult[];
  summary?: {
    totalImages: number;
    withText: number;
    withErrors: number;
  };
  error?: string;
}

export class ImageScraperService {
  private static readonly BASE_URL = 'https://bmceibdtgypgsfiyumcr.supabase.co/functions/v1'

  /**
   * Sends an image URL or a webpage URL to Supabase Edge Function (Vision OCR) to extract text
   * - If url points to an image, the edge function OCRs that image directly
   * - If url points to a webpage, the edge function finds image candidates and OCRs them
   * @param url - Image URL or webpage URL
   * @param maxImages - Maximum number of images to process (default: 50)
   * @param language - Language of the text in images (default: 'auto' for auto-detection)
   * @returns Promise with OCR results from images
   */
  static async scrapeImages(
    url: string, 
    maxImages: number = 50,
    language: string = 'auto'
  ): Promise<ImageScraperResponse> {
    try {
      console.log('📸 [ImageScraper] Using Supabase Edge Function OCR for:', url)
      console.log('🌍 [ImageScraper] Language:', language)
      console.log('🔢 [ImageScraper] Max images:', maxImages)
      
      // Use the Supabase Edge Function: image-ocr-v2 (Vision OCR)
      // Detect if this is likely a direct image URL
      const isDirectImage = /\.(png|jpe?g|webp|gif|bmp|tiff?|svg)(\?.*)?$/i.test(url) || url.includes('/storage/v1/object/public/')
      const payload: any = isDirectImage ? { imageUrls: [url], language } : { url, maxImages, language }
      const endpoint = `${this.BASE_URL}/image-ocr-v2${isDirectImage ? '?mode=direct' : ''}`
      console.log('📤 [ImageScraper] POST to', endpoint)
      console.log('📤 [ImageScraper] Payload:', JSON.stringify(payload))
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || ''}`,
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify(payload)
      })
      console.log('📥 [ImageScraper] Status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [ImageScraper] HTTP error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      let data = await response.json()
      console.log('📥 [ImageScraper] Response JSON:', JSON.stringify(data).slice(0, 500))

      // Fallback: if we sent webpage mode but got 0 images, retry as direct image
      if (!isDirectImage && (data.count === 0 || (data.summary && data.summary.totalImages === 0)) && /\.(png|jpe?g|webp|gif|bmp|tiff?|svg)(\?.*)?$/i.test(url)) {
        console.warn('↩️ [ImageScraper] Zero images in webpage mode, retrying as direct image with imageUrls...')
        const retryPayload: any = { imageUrls: [url], language }
        const retryEndpoint = `${this.BASE_URL}/image-ocr-v2?mode=direct`
        console.log('📤 [ImageScraper] RETRY POST to', retryEndpoint)
        console.log('📤 [ImageScraper] RETRY Payload:', JSON.stringify(retryPayload))
        const retryResp = await fetch(retryEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY || ''}`,
            'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify(retryPayload)
        })
        console.log('📥 [ImageScraper] RETRY Status:', retryResp.status)
        const retryData = await retryResp.json()
        console.log('📥 [ImageScraper] RETRY Response JSON:', JSON.stringify(retryData).slice(0, 500))
        data = retryData
      }
      
      if (!data.success) {
        throw new Error(data.error || 'OCR processing failed')
      }
      
      console.log('✅ [ImageScraper] Success:', data.count, 'images processed for url:', url)
      console.log('📊 [ImageScraper] Summary:', data.summary)
      const withText = data.summary?.withText || 0
      console.log('📋 [ImageScraper] Images with text:', withText)
      if ((data.count || 0) === 0 || withText === 0) {
        console.warn('⚠️ [ImageScraper] Zero images/text found for url:', url)
      }
      
      return {
        success: true,
        count: data.count,
        results: data.results,
        summary: data.summary
      }
      
    } catch (error) {
      console.error('❌ [ImageScraper] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Extracts and combines text from image scraping results
   * @param results - Array of image scraper results
   * @returns Combined text from all images with OCR text
   */
  static extractTextFromResults(results: ImageScraperResult[]): string {
    const textParts: string[] = []
    
    results.forEach((result, index) => {
      if (result.text && result.text.trim().length > 0) {
        textParts.push(`[Image ${index + 1} Text]\n${result.text.trim()}`)
      }
    })
    
    return textParts.join('\n\n')
  }

  /**
   * Gets a summary of image scraping results for logging/display
   * @param results - Array of image scraper results
   * @returns Summary object with counts and stats
   */
  static getSummary(results: ImageScraperResult[]): {
    totalImages: number;
    imagesWithText: number;
    imagesWithErrors: number;
    totalTextLength: number;
  } {
    return {
      totalImages: results.length,
      imagesWithText: results.filter(r => r.text && r.text.trim().length > 0).length,
      imagesWithErrors: results.filter(r => r.error).length,
      totalTextLength: results.reduce((sum, r) => sum + (r.text?.length || 0), 0)
    }
  }
}
export interface ScrapingRequest {
  url: string
}

export interface ScrapingResponse {
  content: string
  title: string
  success: boolean
  error?: string
}

export class SimpleWebScraper {
  // Browser-compatible CORS proxies (no server required!)
  private static readonly SCRAPING_APIS = [
    // AllOrigins - most reliable free CORS proxy
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    // CORS.SH - new reliable proxy
    (url: string) => `https://proxy.cors.sh/${url}`,
    // JSONProxy - simple and fast
    (url: string) => `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`,
    // ThingProxy - Heroku-based proxy
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
  ]

  private static async fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }

  private static extractProductInfo(html: string, url: string): { content: string; title: string } {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Extract title
      let title = doc.querySelector('title')?.textContent?.trim() || 'Product Page'
      
      // Clean up title
      title = title.replace(/\s+/g, ' ').substring(0, 100)

      // Remove script, style, and other unwanted elements
      const unwanted = doc.querySelectorAll('script, style, nav, header, footer, .nav, .menu, .sidebar, .ads')
      unwanted.forEach(el => el.remove())

      let productInfo: string[] = []

      // Amazon-specific selectors
      if (url.includes('amazon')) {
        const selectors = [
          '#productTitle, .product-title, h1',  // Title
          '.a-price-whole, .a-price .a-offscreen, .price, .cost', // Price
          '#brandName, .brand, .manufacturer', // Brand
          '#feature-bullets li, .feature li, .a-unordered-list.a-vertical li', // Features
          '.product-description, .description, #productDescription', // Description
        ]
        
        selectors.forEach(selector => {
          const elements = doc.querySelectorAll(selector)
          elements.forEach(el => {
            const text = el.textContent?.trim()
            if (text && text.length > 3 && text.length < 500) {
              productInfo.push(text)
            }
          })
        })
      }

      // Generic product selectors for any site
      const genericSelectors = [
        'h1, .title, .product-title, .product-name',
        '.price, .cost, .amount, [class*="price"]',
        '.brand, .manufacturer, [class*="brand"]',
        '.description, .product-description, .details, .about',
        '.features li, .specs li, .benefits li, ul li',
      ]

      if (productInfo.length < 3) {
        genericSelectors.forEach(selector => {
          const elements = doc.querySelectorAll(selector)
          Array.from(elements).slice(0, 5).forEach(el => {
            const text = el.textContent?.trim()
            if (text && text.length > 5 && text.length < 300) {
              productInfo.push(text)
            }
          })
        })
      }

      // If still no good content, extract from main content areas
      if (productInfo.length < 2) {
        const mainSelectors = ['main', '[role="main"]', '.content', '.main-content', '.product', '.item']
        for (const selector of mainSelectors) {
          const main = doc.querySelector(selector)
          if (main) {
            const text = main.textContent?.trim()
            if (text && text.length > 100) {
              productInfo.push(text.substring(0, 800))
              break
            }
          }
        }
      }

      // NEVER return empty - if we have nothing, extract raw text
      if (productInfo.length === 0) {
        const rawText = doc.body?.textContent?.trim() || ''
        if (rawText.length > 20) {
          productInfo.push(rawText.substring(0, 2000))
        } else {
          // Last resort - take HTML as text
          productInfo.push(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000))
        }
      }

      const content = productInfo.join('\n\n').replace(/\s+/g, ' ').trim()

      return {
        content: content.substring(0, 3000), // Increased limit
        title
      }

    } catch (error) {
      console.error('Parse error:', error)
      // Emergency extraction even on error
      const emergency = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000)
      return {
        content: emergency || html.substring(0, 2000),
        title: 'Product Page'
      }
    }
  }

  static async scrapeWebpage({ url }: ScrapingRequest): Promise<ScrapingResponse> {
    console.log(`🔍 Simple scraper starting for: ${url}`)

    try {
      // Validate URL
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided')
      }

      // Normalize URL
      let normalizedUrl = url.trim()
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = 'https://' + normalizedUrl
      }

      // Try each scraping method
      let html = ''
      let lastError = ''

      for (let i = 0; i < this.SCRAPING_APIS.length; i++) {
        const apiUrl = this.SCRAPING_APIS[i](normalizedUrl)
        console.log(`📡 Trying API ${i + 1}/4...`)

        try {
          const response = await this.fetchWithTimeout(apiUrl, 10000)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          let responseText = await response.text()

          // Handle different CORS proxy response formats
          if (apiUrl.includes('allorigins.win')) {
            try {
              const json = JSON.parse(responseText)
              html = json.contents || responseText
            } catch (e) {
              html = responseText
            }
          } else if (apiUrl.includes('jsonp.afeld.me')) {
            // JSONProxy sometimes wraps in callback, just use as-is
            html = responseText
          } else {
            // CORS.SH and ThingProxy return HTML directly
            html = responseText
          }

          // Check if we got actual HTML content (not error pages)
          if (html && 
              html.length > 500 && 
              !html.includes('Access denied') && 
              !html.includes('blocked') &&
              !html.includes('Please click here if you are not redirected') &&
              (html.includes('<html') || html.includes('<HTML') || html.includes('<!DOCTYPE'))) {
            
            console.log(`✅ API ${i + 1} succeeded! Got ${html.length} characters`)
            break
          } else {
            throw new Error('Invalid or empty response')
          }

        } catch (error) {
          lastError = `API ${i + 1}: ${error}`
          console.log(`❌ API ${i + 1} failed: ${error}`)
          html = ''
          continue
        }
      }

      if (!html) {
        throw new Error(`All scraping methods failed: ${lastError}`)
      }

      // Extract product information - ALWAYS gets content now
      console.log(`📄 Extracting product info from ${html.length} characters...`)
      const { content, title } = this.extractProductInfo(html, normalizedUrl)

      // Additional check for content length
      if (!content || content.trim().length < 100) {
        console.log('🔄 Content too short, extracting MORE...')
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const bodyText = doc.body?.textContent?.trim() || ''
        
        const cleanText = bodyText.length > 0 
          ? bodyText.replace(/\s+/g, ' ').substring(0, 3000).trim()
          : html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000)
        
        console.log(`✅ Forced extraction: ${cleanText.length} chars`)
        return {
          content: cleanText || content,
          title: title || 'Web Page',
          success: true
        }
      }

      console.log(`✨ Successfully extracted ${content.length} characters of product content!`)
      
      return {
        content,
        title,
        success: true
      }

    } catch (error) {
      console.error('🚨 Simple scraping failed:', error)
      return {
        content: '',
        title: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error'
      }
    }
  }
}
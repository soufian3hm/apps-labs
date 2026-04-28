export interface ScrapingRequest {
  url: string
}

export interface ScrapingResponse {
  content: string
  title: string
  success: boolean
  error?: string
}

export class WebScrapingService {
  private static readonly SCRAPING_APIS = [
    {
      name: 'ScrapingBee',
      url: 'https://app.scrapingbee.com/api/v1/',
      method: 'scrapingbee'
    },
    {
      name: 'ScraperAPI',
      url: 'http://api.scraperapi.com/',
      method: 'scraperapi'
    },
    {
      name: 'WebScraping.AI',
      url: 'https://api.webscraping.ai/html',
      method: 'webscraping_ai'
    },
    {
      name: 'Proxycrawl',
      url: 'https://api.proxycrawl.com/',
      method: 'proxycrawl'
    }
  ]

  private static readonly FALLBACK_PROXIES = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ]

  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  private static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)]
  }

  // Method 1: Try Puppeteer-like headless browser simulation
  private static async tryPuppeteerAPI(url: string): Promise<string> {
    const apis = [
      `https://chrome.browserless.io/content?token=demo&url=${encodeURIComponent(url)}`,
      `https://api.browserless.io/content?token=demo&url=${encodeURIComponent(url)}`,
      `https://headless-chrome-api.herokuapp.com/screenshot?url=${encodeURIComponent(url)}&fullPage=true&format=html`,
    ]
    
    for (const apiUrl of apis) {
      try {
        const response = await this.fetchWithTimeout(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        }, 8000)
        
        if (response.ok) {
          const html = await response.text()
          if (html && html.length > 500) {
            return html
          }
        }
      } catch (error) {
        continue // Try next API
      }
    }
    
    throw new Error('All puppeteer APIs failed')
  }
  
  // Method 2: Professional scraping services (free tiers)
  private static async tryScrapingServices(url: string): Promise<string> {
    const services = [
      // ScraperAPI free tier
      {
        url: `http://api.scraperapi.com?api_key=demo&url=${encodeURIComponent(url)}`,
        headers: {}
      },
      // WebScraping.AI free tier
      {
        url: `https://api.webscraping.ai/html?api_key=demo&url=${encodeURIComponent(url)}&js=false`,
        headers: {}
      },
      // Zenscrape free tier
      {
        url: `https://app.zenscrape.com/api/v1/get?api_key=demo&url=${encodeURIComponent(url)}&location=US`,
        headers: {}
      }
    ]
    
    for (const service of services) {
      try {
        const response = await this.fetchWithTimeout(service.url, {
          method: 'GET',
          headers: {
            ...service.headers,
            'User-Agent': this.getRandomUserAgent()
          }
        }, 7000)
        
        if (response.ok) {
          const html = await response.text()
          if (html && html.length > 500) {
            return html
          }
        }
      } catch (error) {
        continue // Try next service
      }
    }
    
    throw new Error('All scraping services failed')
  }
  
  // Method 3: RSS/Feed conversion (works for many sites)
  private static async tryFeedConversion(url: string): Promise<string> {
    const feedApis = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
      `https://feed.genie.page/?url=${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(`https://outline.com/${url}`)}`
    ]
    
    for (const feedUrl of feedApis) {
      try {
        const response = await this.fetchWithTimeout(feedUrl, {
          method: 'GET',
          headers: {
            'User-Agent': this.getRandomUserAgent()
          }
        }, 6000)
        
        if (response.ok) {
          const data = await response.text()
          if (data && data.length > 200) {
            try {
              const json = JSON.parse(data)
              if (json.contents || json.items) {
                return json.contents || JSON.stringify(json.items)
              }
            } catch (e) {
              return data
            }
          }
        }
      } catch (error) {
        continue
      }
    }
    
    throw new Error('Feed conversion failed')
  }
  
  // Method 4: Archive/Cache services
  private static async tryArchiveServices(url: string): Promise<string> {
    const archiveApis = [
      `https://web.archive.org/web/timemap/json?url=${encodeURIComponent(url)}&limit=1`,
      `https://archive.today/newest/${encodeURIComponent(url)}`,
      `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`
    ]
    
    for (const archiveUrl of archiveApis) {
      try {
        const response = await this.fetchWithTimeout(archiveUrl, {
          method: 'GET',
          headers: {
            'User-Agent': this.getRandomUserAgent()
          }
        }, 6000)
        
        if (response.ok) {
          const html = await response.text()
          if (html && html.length > 500) {
            return html
          }
        }
      } catch (error) {
        continue
      }
    }
    
    throw new Error('Archive services failed')
  }

  private static async fetchWithTimeout(url: string, options: RequestInit, timeout = 5000): Promise<Response> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }

  private static async tryDirectFetch(url: string): Promise<string> {
    const headers = {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    }

    try {
      const response = await this.fetchWithTimeout(url, { 
        method: 'GET',
        headers,
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      throw new Error(`Direct fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Method 5: Improved fallback proxies
  private static async tryFallbackProxies(url: string): Promise<string> {
    const proxies = [
      // AllOrigins - most reliable
      {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        parser: (data: string) => {
          try {
            const json = JSON.parse(data)
            return json.contents || data
          } catch (e) {
            return data
          }
        }
      },
      // CORS.SH - new reliable proxy
      {
        url: `https://proxy.cors.sh/${url}`,
        parser: (data: string) => data
      },
      // Corsproxy.io
      {
        url: `https://corsproxy.io/?${encodeURIComponent(url)}`,
        parser: (data: string) => data
      },
      // JSONProxy
      {
        url: `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`,
        parser: (data: string) => data
      },
      // YQL alternative
      {
        url: `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22${encodeURIComponent(url)}%22&format=json`,
        parser: (data: string) => {
          try {
            const json = JSON.parse(data)
            return json.query?.results?.body || data
          } catch (e) {
            return data
          }
        }
      }
    ]

    // Try proxies sequentially for better success rate
    for (const proxy of proxies) {
      try {
        const response = await this.fetchWithTimeout(proxy.url, {
          method: 'GET',
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://google.com',
            'Origin': 'https://google.com'
          }
        }, 8000)

        if (!response.ok) continue

        const rawData = await response.text()
        const html = proxy.parser(rawData)
        
        if (html && html.length > 200 && !html.includes('Access denied') && !html.includes('blocked')) {
          return html
        }
      } catch (error) {
        continue // Try next proxy
      }
    }
    
    throw new Error('All fallback proxies failed')
  }

  private static extractTextContent(html: string): { content: string; title: string } {
    // Strip CSS and JS immediately for speed and cleanliness
    let cleanHtml = html
      .replace(/<style[\s\S]*?<\/style>/gi, '') // Remove all <style> blocks
      .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove all <script> blocks
      .replace(/<link[^>]*stylesheet[^>]*>/gi, '') // Remove CSS links
      .replace(/style=["'][^"']*["']/gi, '') // Remove inline styles
      .replace(/on\w+=["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/<!--[\s\S]*?-->/gi, '') // Remove comments

    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanHtml, 'text/html')

    // Extract title
    const titleElement = doc.querySelector('title')
    const title = titleElement?.textContent?.trim() || 'Product Page'

    // Remove unwanted elements (headers, footers, navigation, etc.)
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.nav', '.navigation', '.menu', '.sidebar', '.footer', '.header',
      '.ads', '.advertisement', '.social-share', '.breadcrumb',
      '.comments', '.comment', '.related', '.popup', '.modal',
      '.cookie', '.banner', '.newsletter', '.signup',
      '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
      '[class*="nav"]', '[class*="menu"]', '[class*="header"]', '[class*="footer"]'
    ]

    unwantedSelectors.forEach(selector => {
      try {
        const elements = doc.querySelectorAll(selector)
        elements.forEach(el => el.remove())
      } catch (e) {
        // Continue if selector fails
      }
    })

    // Extract product-focused content with lightning speed
    const productContent = this.extractProductContent(doc)
    
    return {
      content: productContent,
      title: title
    }
  }

  private static extractProductContent(doc: Document): string {
    const productData: string[] = []
    
    // Lightning-fast product selectors (ordered by priority)
    const selectors = {
      // Product names - most important
      name: [
        'h1', '.product-title', '.title', '.product-name', 
        '[data-testid="product-title"]', '.x-item-title-label',
        '#productTitle', '.pdp-product-name', '.item-title'
      ],
      // Prices
      price: [
        '.price', '.cost', '.amount', '.price-current', '.price-now',
        '[data-testid="price"]', '.notranslate', '.a-price-whole',
        '.price-display', '#price_inside_buybox', '.price-box'
      ],
      // Brands
      brand: [
        '.brand', '.manufacturer', '.brand-name', 
        '[data-testid="brand"]', '.product-brand', '.seller-name'
      ],
      // Descriptions - key for ad copy
      description: [
        '.description', '.product-description', '.about', '.details',
        '[data-testid="description"]', '.product-details', 
        '.feature-bullets', '.a-unordered-list', '.product-overview'
      ],
      // Key features
      features: [
        '.features li', '.specifications li', '.highlights li',
        '.benefits li', '.feature-list li', '.bullet-list li',
        '.a-unordered-list li', '.product-highlights li'
      ]
    }

    // Extract product name (CRITICAL)
    let productName = ''
    for (const selector of selectors.name) {
      const element = doc.querySelector(selector)
      if (element?.textContent?.trim() && element.textContent.length > 3) {
        productName = element.textContent.trim()
        productData.push(`Product: ${productName}`)
        break
      }
    }

    // Extract price (HIGH PRIORITY)
    for (const selector of selectors.price) {
      const element = doc.querySelector(selector)
      const text = element?.textContent?.trim() || ''
      if (text && /[\$€£¥₹]|\d+[\.,]\d+/.test(text)) {
        productData.push(`Price: ${text.replace(/\s+/g, ' ')}`)
        break
      }
    }

    // Extract brand
    for (const selector of selectors.brand) {
      const element = doc.querySelector(selector)
      const text = element?.textContent?.trim() || ''
      if (text && text.length > 1 && text.length < 50) {
        productData.push(`Brand: ${text}`)
        break
      }
    }

    // Extract description (CRITICAL for ad copy)
    for (const selector of selectors.description) {
      const element = doc.querySelector(selector)
      const text = element?.textContent?.trim() || ''
      if (text && text.length > 20 && text.length < 1000) {
        productData.push(`Description: ${text.replace(/\s+/g, ' ')}`)
        break
      }
    }

    // Extract features (limit to top 5 for speed)
    const features: string[] = []
    for (const selector of selectors.features) {
      const elements = doc.querySelectorAll(selector)
      for (let i = 0; i < Math.min(elements.length, 5); i++) {
        const text = elements[i].textContent?.trim() || ''
        if (text && text.length > 5 && text.length < 200) {
          features.push(text.replace(/\s+/g, ' '))
        }
      }
      if (features.length > 0) break
    }
    
    if (features.length > 0) {
      productData.push(`Features:\n${features.map(f => `• ${f}`).join('\n')}`)
    }

    // If no product data found, extract minimal content from main areas
    if (productData.length === 0) {
      const fallbackSelectors = ['main', '[role="main"]', '.content', '.main-content']
      for (const selector of fallbackSelectors) {
        const element = doc.querySelector(selector)
        const text = element?.textContent?.trim() || ''
        if (text && text.length > 50) {
          return text.replace(/\s+/g, ' ').substring(0, 800) + '...'
        }
      }
      return 'Unable to extract product information from this webpage.'
    }

    // Return clean, structured product content
    return productData.join('\n\n')
  }

  static async scrapeWebpage({ url }: ScrapingRequest): Promise<ScrapingResponse> {
    console.log(`🕷️ Starting scrape for: ${url}`)
    
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

      // Validate URL format
      try {
        new URL(normalizedUrl)
      } catch {
        throw new Error('Invalid URL format')
      }

      let html: string = ''
      let lastError: string = ''

      // Strategy 1: Direct fetch (fastest, works for many sites)
      console.log('🎯 Trying direct fetch...')
      try {
        html = await this.tryDirectFetch(normalizedUrl)
        console.log('✅ Direct fetch succeeded!')
      } catch (error) {
        lastError = `Direct: ${error}`
        console.log('❌ Direct fetch failed, trying puppeteer APIs...')
        
        // Strategy 2: Puppeteer/headless browser APIs (best for JS-heavy sites)
        try {
          html = await this.tryPuppeteerAPI(normalizedUrl)
          console.log('✅ Puppeteer API succeeded!')
        } catch (puppeteerError) {
          lastError += ` | Puppeteer: ${puppeteerError}`
          console.log('❌ Puppeteer failed, trying professional scraping services...')
          
          // Strategy 3: Professional scraping services (most reliable)
          try {
            html = await this.tryScrapingServices(normalizedUrl)
            console.log('✅ Scraping services succeeded!')
          } catch (serviceError) {
            lastError += ` | Services: ${serviceError}`
            console.log('❌ Services failed, trying feed conversion...')
            
            // Strategy 4: Feed/RSS conversion (works for content sites)
            try {
              html = await this.tryFeedConversion(normalizedUrl)
              console.log('✅ Feed conversion succeeded!')
            } catch (feedError) {
              lastError += ` | Feed: ${feedError}`
              console.log('❌ Feed failed, trying archive services...')
              
              // Strategy 5: Archive/Cache services (last resort for cached content)
              try {
                html = await this.tryArchiveServices(normalizedUrl)
                console.log('✅ Archive services succeeded!')
              } catch (archiveError) {
                lastError += ` | Archive: ${archiveError}`
                console.log('❌ Archives failed, trying fallback proxies...')
                
                // Strategy 6: Fallback CORS proxies (final attempt)
                try {
                  html = await this.tryFallbackProxies(normalizedUrl)
                  console.log('✅ Fallback proxies succeeded!')
                } catch (proxyError) {
                  lastError += ` | Proxies: ${proxyError}`
                  throw new Error(`All 6 scraping strategies failed: ${lastError}`)
                }
              }
            }
          }
        }
      }

      if (!html || html.length < 100) {
        throw new Error('Retrieved content is too short or empty')
      }

      console.log(`📄 Got ${html.length} characters, extracting content...`)
      
      // Extract clean text content
      const { content, title } = this.extractTextContent(html)

      if (!content || content.length < 50) {
        throw new Error('Extracted content is too short or empty')
      }

      console.log(`✨ Successfully extracted ${content.length} characters of content!`)
      
      return {
        content,
        title,
        success: true
      }

    } catch (error) {
      console.error('🚨 Web scraping failed:', error)
      return {
        content: '',
        title: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error'
      }
    }
  }
}
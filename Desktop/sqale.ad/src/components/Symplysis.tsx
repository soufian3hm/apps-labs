import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useUsageTracking } from '../hooks/useUsageTracking'
import CreditPurchaseModal from './CreditPurchaseModal'
import { DeepSeekService } from '../services/deepseekService'
import { GeminiService } from '../services/geminiService'
import { SupabaseScraper, LocalScraper } from '../services/supabaseScraper'
import { HTMLRewriterService } from '../services/htmlRewriterService'
import { ImageScraperService } from '../services/imageScraperService'
import { supabase } from '../lib/supabase'
import { TextShimmer } from './ui/text-shimmer'
import { Input as NumberInput } from './ui/number-input'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Card, CardContent } from './ui/card'
import { Separator } from './ui/separator'
import AudioPlayer from './ui/audio-player'
import { SubscriptionGuard } from './SubscriptionGuard'
import LandingPagePremiumGate from './LandingPagePremiumGate'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { ChevronDown, Music2, Brain, Waypoints, ClipboardList, Blocks, Store, Zap, TrendingUp, Target, BookOpen, Sparkles, Sparkles as SparklesIcon, Trash2 as Delete, Save, Settings2, RefreshCcw, X, SquarePen, Trash2, Layout, Download, Globe, Plus, Image as ImageIcon } from 'lucide-react'

const Symplysis: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasAccess, loading: subscriptionLoading, subscription } = useSubscription()
  const { canGenerate, incrementUsage, getRemainingCount, refreshUsage } = useUsageTracking()
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditModalType, setCreditModalType] = useState<'adcopy' | 'landing_page' | 'voiceover' | 'poster'>('adcopy')

  // Check if URL contains /credits and open modal based on route
  useEffect(() => {
    console.log('Symplysis: checking pathname:', location.pathname);
    if (location.pathname === '/landing-page-generator/credits') {
      console.log('Symplysis: opening landing page credits modal');
      setCreditModalType('landing_page');
      setShowCreditModal(true);
    }
  }, [location.pathname]);

  // Get active tab from URL search params or pathname, default to 'landing-page'
  const getActiveTabFromUrl = () => {
    // Check pathname first for direct routes
    if (location.pathname === '/landing-page-generator') {
      return 'landing-page'
    }
    // Then check URL search params
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const validTabs = ['landing-page']
    return validTabs.includes(tab || '') ? tab : 'landing-page'
  }

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl())

  // Update active tab when location changes (for direct routes like /landing-page-generator and /poster-generator)
  useEffect(() => {
    const newTab = getActiveTabFromUrl()
    setActiveTab(newTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  const [smartInput, setSmartInput] = useState('')
  const [displayValue, setDisplayValue] = useState('') // For showing domain while keeping full URL in smartInput
  const [textInput, setTextInput] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const [parsedAdCopies, setParsedAdCopies] = useState<string[]>([])
  const [textLoading, setTextLoading] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [progressText, setProgressText] = useState('')

  // Webpage scraping state
  const [webpageUrl, setWebpageUrl] = useState('')
  const [scrapingLoading, setScrapingLoading] = useState(false)
  const [scrapedContent, setScrapedContent] = useState('')
  const [scrapedTitle, setScrapedTitle] = useState('')
  const [webpageParsedAdCopies, setWebpageParsedAdCopies] = useState<string[]>([])
  const [preparedPrompt, setPreparedPrompt] = useState('')

  // URL cache tracking
  const [lastScrapedUrl, setLastScrapedUrl] = useState('')
  const [urlCache, setUrlCache] = useState<{ [key: string]: { content: string; title: string; timestamp: number } }>({}) // Cache scraped content by URL
  // Calculate urlChanged reactively based on current webpageUrl and lastScrapedUrl
  const urlChanged = React.useMemo(() => webpageUrl.trim() !== lastScrapedUrl, [webpageUrl, lastScrapedUrl])

  // Clear image cache when URL changes
  useEffect(() => {
    if (webpageUrl.trim() && webpageUrl.trim() !== lastScrapedUrl) {
      console.log('🔄 URL changed - clearing image cache:', { oldUrl: lastScrapedUrl, newUrl: webpageUrl.trim() })
      setComponentImageLinksCache({})
      setScrapedImages([])
    }
  }, [webpageUrl, lastScrapedUrl])

  // Vision AI OCR cache state - stores extracted text from Google Vision AI
  const [visionAIOcrCache, setVisionAIOcrCache] = useState<{ [key: string]: { text: string; timestamp: number } }>({}) // Cache Vision AI OCR results

  // Cached content modal state
  const [showCachedContentModal, setShowCachedContentModal] = useState(false)
  const [cachedContentToDisplay, setCachedContentToDisplay] = useState('')

  // Check if URL is in cache and valid
  const isUrlCached = (url: string): boolean => {
    const cached = urlCache[url]
    if (!cached) return false
    // Cache is valid for 24 hours (86400000 ms)
    const CACHE_DURATION = 24 * 60 * 60 * 1000
    return Date.now() - cached.timestamp < CACHE_DURATION
  }

  // Landing page state (restore missing variables)
  const [landingPagePrompt, setLandingPagePrompt] = useState('')
  const [generatedLandingPage, setGeneratedLandingPage] = useState('')
  const [landingPageLoading, setLandingPageLoading] = useState(false)


  // New state for tone and language selection
  const [selectedTone, setSelectedTone] = useState('Expert')
  const [customTone, setCustomTone] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false)
  const [showLanguageSlideout, setShowLanguageSlideout] = useState(false)
  const [showToneSlideout, setShowToneSlideout] = useState(false)
  const [showNetworkSlideout, setShowNetworkSlideout] = useState(false)
  const [showAiProviderSlideout, setShowAiProviderSlideout] = useState(false)
  const [adCopyError, setAdCopyError] = useState('')
  const [error, setError] = useState('')
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiProvider, setAiProvider] = useState('deepseek') // 'deepseek' or 'gemini'
  const [adCopyQuantity, setAdCopyQuantity] = useState(3) // Number of ad copies to generate
  const [selectedAdNetwork, setSelectedAdNetwork] = useState('General') // 'General', 'Meta', 'TikTok', 'Snapchat', 'Google'
  const [generatedWithNetwork, setGeneratedWithNetwork] = useState('General') // Remember which network was used to generate current content
  const [adNetworkDropdownOpen, setAdNetworkDropdownOpen] = useState(false)
  const [noEmojis, setNoEmojis] = useState(false) // For emoji control
  const [imageScrapingEnabled] = useState(true) // Always enabled for image OCR scraping
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null) // Track which ad copy is being regenerated
  const [generationPhase, setGenerationPhase] = useState<'scraping' | 'generating' | null>(null) // Track generation phase
  const [urlHover, setUrlHover] = useState(false)

  // Saved presets
  type AdCopyPreset = {
    id: string
    label: string
    language: string
    tone: string
    is_custom_tone: boolean
    ai_provider: string
    copies: number
    network: string
    no_emojis: boolean
  }
  const [savedPresets, setSavedPresets] = useState<AdCopyPreset[]>([])

  // Right sidebar tabs
  const [sidebarTab, setSidebarTab] = useState<'settings' | 'history'>('settings')

  // History state
  type AdCopyHistory = {
    id: string
    user_id: string
    title: string
    outputs: string[]
    created_at: string
  }
  const [historyItems, setHistoryItems] = useState<AdCopyHistory[]>([])
  const [historyPage, setHistoryPage] = useState(0)
  const pageSize = 3
  const [historyBanner, setHistoryBanner] = useState<string | null>(null)
  const [historyActive, setHistoryActive] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isEditingPresets, setIsEditingPresets] = useState(false)
  const [isSavingPreset, setIsSavingPreset] = useState(false)

  const loadHistory = async (opts?: { refresh?: boolean }) => {
    try {
      const { supabase } = await import('../lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const from = opts?.refresh ? 0 : historyItems.length
      const to = from + pageSize - 1
      const { data, error } = await supabase
        .from('ad_copy_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (!error && data) {
        setHistoryItems(opts?.refresh ? (data as any) : ([...historyItems, ...data as any]))
        setHistoryPage(opts?.refresh ? 1 : historyPage + 1)
      }
    } catch { }
  }


  // Landing Page Generator specific state
  const [selectedTemplate, setSelectedTemplate] = useState<'ATLAS_SHOPIFY'>('ATLAS_SHOPIFY')
  const [addedLandingPageComponents, setAddedLandingPageComponents] = useState<number[]>([])
  const [componentHtmlCache, setComponentHtmlCache] = useState<{ [key: number]: string }>({})
  const [componentImageLinksCache, setComponentImageLinksCache] = useState<{ [key: number]: string }>({}) // Store image links by imageIndex
  const [currentLandingPageHtml, setCurrentLandingPageHtml] = useState('')
  const [isLandingPageCodeView, setIsLandingPageCodeView] = useState(false)
  const [isRtlEnabled, setIsRtlEnabled] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const landingPageIframeRef = useRef<HTMLIFrameElement>(null)

  // Image replacement state
  const [selectedImageElement, setSelectedImageElement] = useState<{ src: string, selector: string, imageIndex: number, element: HTMLImageElement | null } | null>(null)
  const [showImageReplaceModal, setShowImageReplaceModal] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [scrapedImages, setScrapedImages] = useState<string[]>([]) // Store extracted image URLs from scraped content
  const [uploadedImages, setUploadedImages] = useState<string[]>([]) // Store uploaded image URLs
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageUploadInputRef = useRef<HTMLInputElement>(null)
  const skipIframeReloadRef = useRef(false)
  const [imageModalTab, setImageModalTab] = useState<'upload' | 'generated' | 'scraped'>('upload')
  const [posterImages, setPosterImages] = useState<Array<{ id: string, imageUrl: string, created_at: string }>>([])
  const [loadingPosterImages, setLoadingPosterImages] = useState(false)
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scrapingImages, setScrapingImages] = useState(false)
  const [loadingUploadedImages, setLoadingUploadedImages] = useState(false)

  // Function to extract image URLs from scraped content
  const extractImageUrls = (content: string): string[] => {
    if (!content) return [];

    const imageUrls: string[] = [];
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|avif|heic|heif)(\?.*)?$/i;

    // Pattern 1: Extract from img src attributes
    const imgSrcPattern = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgSrcPattern.exec(content)) !== null) {
      const url = match[1].trim();
      if (url && (url.startsWith('http') || url.startsWith('//') || imageExtensions.test(url))) {
        // Convert relative URLs to absolute if needed
        let fullUrl = url;
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url;
        } else if (url.startsWith('/')) {
          // Skip relative URLs without domain context
          continue;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
        }
      }
    }

    // Pattern 2: Extract from data-src attributes (lazy loading)
    const dataSrcPattern = /<img[^>]+data-src=["']([^"']+)["']/gi;
    while ((match = dataSrcPattern.exec(content)) !== null) {
      const url = match[1].trim();
      if (url && (url.startsWith('http') || url.startsWith('//') || imageExtensions.test(url))) {
        let fullUrl = url;
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url;
        } else if (url.startsWith('/')) {
          continue;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
        }
      }
    }

    // Pattern 3: Extract from background-image CSS
    const bgImagePattern = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
    while ((match = bgImagePattern.exec(content)) !== null) {
      const url = match[1].trim();
      if (url && (url.startsWith('http') || url.startsWith('//') || imageExtensions.test(url))) {
        let fullUrl = url;
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url;
        } else if (url.startsWith('/')) {
          continue;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
        }
      }
    }

    // Pattern 4: Extract from og:image meta tags
    const ogImagePattern = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
    while ((match = ogImagePattern.exec(content)) !== null) {
      const url = match[1].trim();
      if (url && (url.startsWith('http') || url.startsWith('//') || imageExtensions.test(url))) {
        let fullUrl = url;
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url;
        } else if (url.startsWith('/')) {
          continue;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
          console.log('🖼️ Found og:image:', fullUrl);
        }
      }
    }

    // Pattern 5: Extract from og:image:secure_url meta tags
    const ogImageSecurePattern = /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/gi;
    while ((match = ogImageSecurePattern.exec(content)) !== null) {
      const url = match[1].trim();
      if (url && (url.startsWith('http') || url.startsWith('//') || imageExtensions.test(url))) {
        let fullUrl = url;
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url;
        } else if (url.startsWith('/')) {
          continue;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
          console.log('🖼️ Found og:image:secure_url:', fullUrl);
        }
      }
    }

    // Pattern 6: Extract from link rel="icon" tags
    const linkIconPattern = /<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/gi;
    while ((match = linkIconPattern.exec(content)) !== null) {
      const url = match[1].trim();
      if (url && (url.startsWith('http') || url.startsWith('//') || imageExtensions.test(url))) {
        let fullUrl = url;
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url;
        } else if (url.startsWith('/')) {
          continue;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
          console.log('🖼️ Found link icon:', fullUrl);
        }
      }
    }

    // Pattern 7: Extract from any meta tag with image in content (fallback)
    const metaImagePattern = /<meta[^>]+content=["']([^"']*\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|avif|heic|heif)(\?[^"']*)?)["']/gi;
    while ((match = metaImagePattern.exec(content)) !== null) {
      const url = match[1].trim();
      if (url && (url.startsWith('http') || url.startsWith('//'))) {
        let fullUrl = url;
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url;
        } else if (url.startsWith('/')) {
          continue;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
          console.log('🖼️ Found meta image:', fullUrl);
        }
      }
    }

    // Pattern 8: Extract standalone image URLs (lines that are just URLs ending with image extensions)
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && imageExtensions.test(trimmedLine) && (trimmedLine.startsWith('http') || trimmedLine.startsWith('//'))) {
        let fullUrl = trimmedLine;
        if (trimmedLine.startsWith('//')) {
          fullUrl = 'https:' + trimmedLine;
        }
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
        }
      }
    }

    // Filter out common non-product images (logos, icons, etc.) - but keep og:image and product images
    const filteredUrls = imageUrls.filter(url => {
      const lowerUrl = url.toLowerCase();
      // Keep og:image and og:image:secure_url (these are usually product images)
      if (lowerUrl.includes('og:image') || lowerUrl.includes('gempages') || lowerUrl.includes('cdn/shop')) {
        return true;
      }
      // Exclude common non-product images (but be less aggressive with filtering)
      return !lowerUrl.includes('favicon') &&
        !lowerUrl.includes('placeholder') &&
        !lowerUrl.includes('spinner') &&
        !lowerUrl.includes('loading') &&
        !lowerUrl.includes('avatar');
    });

    console.log('🖼️ Extracted', filteredUrls.length, 'image URLs from scraped content');
    return filteredUrls;
  }

  // Copy modal state
  const [showCopyModal, setShowCopyModal] = useState(false)
  const copyButtonRef = useRef<HTMLButtonElement | null>(null)

  // Download notification state
  const [downloadNotification, setDownloadNotification] = useState<{
    visible: boolean
    status: 'preparing' | 'ready' | 'downloading'
    progress: number
  }>({ visible: false, status: 'preparing', progress: 0 })

  // Left panel accordion state
  const [expandedSection, setExpandedSection] = useState<'ai-settings' | 'components' | 'product-info' | 'content-sections' | 'text-interactive' | 'interactive-sections' | 'guarantees-reviews' | 'common-questions' | 'faq' | 'customization' | null>('ai-settings')

  // Customization state
  const [primaryColor, setPrimaryColor] = useState('#e9e8ea')
  const [tertiaryColor, setTertiaryColor] = useState('#9b9a9c')

  // Product information state
  const [productTitle, setProductTitle] = useState('Joint Relief & Flexibility Cream™')
  const [productPrice, setProductPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [productTagline1, setProductTagline1] = useState('NEW: 2025\'s **Ultimate Relief** for Pain-Free Movement')
  const [productTagline2, setProductTagline2] = useState('Experience pain relief and regain your freedom to move.')
  const [iconBullet1, setIconBullet1] = useState('Relieve joint pain quickly')
  const [iconBullet2, setIconBullet2] = useState('Enhance mobility and flexibility')
  const [iconBullet3, setIconBullet3] = useState('Reduce swelling and discomfort')
  const [iconBullet4, setIconBullet4] = useState('Natural ingredients for safety')
  const [iconBullet5, setIconBullet5] = useState('Empower your active lifestyle')
  const [productDescription, setProductDescription] = useState('Experience the freedom of movement with our soothing cream that alleviates joint pain and enhances flexibility. Formulated with natural ingredients, it provides deep relief and empowers you to live life to the fullest.')
  const [descPoint1, setDescPoint1] = useState('Enhances joint flexibility')
  const [descPoint2, setDescPoint2] = useState('Provides effective pain relief')
  const [descPoint3, setDescPoint3] = useState('Reduces cysts and edema')
  const [descPoint4, setDescPoint4] = useState('Made with natural ingredients')
  const [keyFeaturesHeading, setKeyFeaturesHeading] = useState('"Embrace Freedom: Move Pain-Free Every Day!"')
  const [keyPoint1, setKeyPoint1] = useState('Enhanced joint flexibility')
  const [keyPoint2, setKeyPoint2] = useState('Rapid pain relief')
  const [keyPoint3, setKeyPoint3] = useState('Effective edema reduction')
  const [keyPoint4, setKeyPoint4] = useState('Naturally derived ingredients')

  // Most common questions
  const [commonQ1, setCommonQ1] = useState('What ingredients are used in this cream and are they safe?')
  const [commonA1, setCommonA1] = useState('The cream is formulated with a potent blend of natural ingredients known for their efficacy in providing pain relief and reducing swelling. These ingredients are selected for their safety and ability to gently penetrate the skin, ensuring a safe and effective experience.')
  const [commonQ2, setCommonQ2] = useState('How long does it take to feel the effects after application?')
  const [commonA2, setCommonA2] = useState('Many users report feeling immediate cooling relief upon application, with noticeable improvements in joint flexibility and pain reduction within a short period. For optimal results, we recommend regular use as part of your daily routine.')
  const [commonQ3, setCommonQ3] = useState('Can this cream be used on all types of joint pain, including in the back and knees?')
  const [commonA3, setCommonA3] = useState('Yes, this cream is designed to relieve discomfort in various areas, including the back, knees, hands, and feet. It targets joint pain, muscle stiffness, and swelling, making it suitable for a wide range of joint-related issues.')

  // FAQ section
  const [faqQ1, setFaqQ1] = useState('What types of pain can this cream help relieve?')
  const [faqA1, setFaqA1] = useState('This cream is expertly designed to alleviate joint pain, swelling, and discomfort from bunions, as well as stiffness in the back, knees, hands, and feet. Whether you\'re dealing with chronic pain or occasional discomfort, it\'s here to help restore your mobility.')
  const [faqQ2, setFaqQ2] = useState('How quickly can I expect to feel relief after application?')
  const [faqA2, setFaqA2] = useState('Many users report a noticeable cooling sensation and relief shortly after applying the cream. With its fast-absorbing formula, you can experience soothing comfort as it penetrates deeply to target pain at its source almost instantly.')
  const [faqQ3, setFaqQ3] = useState('Are the ingredients in this cream safe and natural?')
  const [faqA3, setFaqA3] = useState('Absolutely! The cream is crafted from a potent blend of natural ingredients known for their healing properties. Our focus on safety ensures that you can use this cream daily with confidence, knowing it\'s gentle yet effective.')
  const [faqQ4, setFaqQ4] = useState('Who can benefit from using this cream?')
  const [faqA4, setFaqA4] = useState('This cream is ideal for anyone experiencing joint or muscle discomfort, including active individuals, older adults, or those with physically demanding lifestyles. It\'s suitable for anyone looking to enhance their flexibility and reduce pain.')
  const [faqQ5, setFaqQ5] = useState('How often should I apply the cream for best results?')
  const [faqA5, setFaqA5] = useState('For optimal results, apply the cream two to three times daily on the affected areas. Consistent use helps to ensure long-lasting relief, significantly improving flexibility and reducing swelling over time.')

  // Content sections
  const [imageText1Headline, setImageText1Headline] = useState('Rediscover Life Without Joint Pain')
  const [imageText1Paragraph, setImageText1Paragraph] = useState('Experience the ultimate solution for joint discomfort and regain your freedom. Achieve enhanced mobility and comfort with every application, empowering you to live life fully.')
  const [imageText1Bullet1, setImageText1Bullet1] = useState('Move freely without discomfort')
  const [imageText1Bullet2, setImageText1Bullet2] = useState('Embrace activities you love again')
  const [imageText1Bullet3, setImageText1Bullet3] = useState('Feel confident in every step')
  const [horizontalScrollHeading, setHorizontalScrollHeading] = useState('Move Freely, Live Fully: Pain Free Today!')
  const [imageText2Headline, setImageText2Headline] = useState('Experience Freedom from Joint Pain')
  const [imageText2Paragraph, setImageText2Paragraph] = useState('Living with chronic discomfort can severely limit your daily activities and joy. This specialized cream restores your mobility, providing soothing relief and enhancing flexibility simultaneously.')
  const [imageText2Bullet1, setImageText2Bullet1] = useState('Restores mobility and flexibility')
  const [imageText2Bullet2, setImageText2Bullet2] = useState('Targets pain at its source')
  const [imageText2Bullet3, setImageText2Bullet3] = useState('Reduces swelling effectively')
  const [horizScrollText1, setHorizScrollText1] = useState('Instant Soothing Relief')
  const [horizScrollText2, setHorizScrollText2] = useState('Restore Your Mobility')
  const [horizScrollText3, setHorizScrollText3] = useState('Naturally Effective Formula')
  const [horizScrollText4, setHorizScrollText4] = useState('Comfort You Can Trust')

  // Rich text section
  const [richTextHeadline, setRichTextHeadline] = useState('Embrace Life Pain-Free and Mobile')
  const [richTextParagraph, setRichTextParagraph] = useState('Imagine stepping into your day without the shadow of discomfort holding you back. Feel the joy of movement and rediscover activities you love, all while feeling empowered and confident in your body.')

  // Reasons to buy
  const [reasonsBuyHeading, setReasonsBuyHeading] = useState('Join the Many Who Found Relief')
  const [statSubhead1, setStatSubhead1] = useState('Experienced Enhanced Mobility')
  const [statSentence1, setStatSentence1] = useState('Reported improved movement and flexibility after just a week of use.')
  const [statSubhead2, setStatSubhead2] = useState('Felt Pain Relief Quickly')
  const [statSentence2, setStatSentence2] = useState('Noticed significant pain reduction within days of applying the cream.')
  const [statSubhead3, setStatSubhead3] = useState('Saw Reduced Swelling')
  const [statSentence3, setStatSentence3] = useState('Experienced noticeable decreases in swelling, enhancing overall comfort during activities.')
  const [statSubhead4, setStatSubhead4] = useState('Enjoyed Natural Ingredients')
  const [statSentence4, setStatSentence4] = useState('Appreciated the soothing effects of natural ingredients without side effects.')

  // Comparison section
  const [comparisonHeading, setComparisonHeading] = useState('Why Choose Our Cream?')
  const [comparisonDescription, setComparisonDescription] = useState('Experience unmatched relief and mobility with our advanced formula, designed to effectively target joint pain and swelling while promoting natural healing and flexibility for your daily activities and quality of life.')
  const [comparisonRow1, setComparisonRow1] = useState('Targeted relief')
  const [comparisonRow2, setComparisonRow2] = useState('Enhanced mobility')
  const [comparisonRow3, setComparisonRow3] = useState('Natural formulation')
  const [comparisonRow4, setComparisonRow4] = useState('Long-lasting effects')
  const [comparisonRow5, setComparisonRow5] = useState('Quick absorption')

  // Icon guarantees
  const [iconGuarantee1, setIconGuarantee1] = useState('Rediscover pain-free movement')
  const [iconGuarantee2, setIconGuarantee2] = useState('Say goodbye to swelling')
  const [iconGuarantee3, setIconGuarantee3] = useState('Enhance your joint flexibility')
  const [iconGuarantee4, setIconGuarantee4] = useState('Natural formula for confidence')

  // Reviews section
  const [reviewsHeading, setReviewsHeading] = useState('What Our Customers Say')

  // Satisfaction guarantee
  const [satisfactionParagraph, setSatisfactionParagraph] = useState('Experience the freedom of movement with complete confidence—our 30-day money-back guarantee ensures your purchase is completely risk-free. If you\'re not thrilled with the results, simply return it for a full refund, no questions asked.')

  // Product input and rewriting state
  const [productInput, setProductInput] = useState('')
  const [productDisplayValue, setProductDisplayValue] = useState('') // For showing domain while keeping full URL
  const [productUrlHover, setProductUrlHover] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [currentRewritingStep, setCurrentRewritingStep] = useState(0)
  const [rewritingAborted, setRewritingAborted] = useState(false)
  const [scrapedProductContent, setScrapedProductContent] = useState('')
  const [hasFreeDelivery, setHasFreeDelivery] = useState(false)

  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const toneDropdownRef = useRef<HTMLDivElement>(null)

  // Quantity controlled by React state only (1..10)
  const incrementCopies = () => setAdCopyQuantity((q) => Math.min(10, q + 1))
  const decrementCopies = () => setAdCopyQuantity((q) => Math.max(1, q - 1))


  // Auto-enable RTL for Arabic language, LTR for others
  useEffect(() => {
    const isArabic = selectedLanguage === 'Arabic'
    setIsRtlEnabled(isArabic)

    // Immediately update iframe if it exists
    if (landingPageIframeRef.current && !isLandingPageCodeView) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc && iframeDoc.documentElement) {
        // Always keep scrollbar on the right by setting direction on html, not body
        iframeDoc.documentElement.style.direction = 'ltr'
        iframeDoc.documentElement.style.overflowY = 'scroll' // Force scrollbar to always show

        if (isArabic) {
          iframeDoc.documentElement.setAttribute('dir', 'rtl')
          // Apply RTL only to body content, not the scrollbar
          if (iframeDoc.body) {
            iframeDoc.body.style.direction = 'rtl'
            iframeDoc.body.style.paddingLeft = '10px'
            iframeDoc.body.style.paddingRight = '0'
          }
        } else {
          iframeDoc.documentElement.removeAttribute('dir')
          if (iframeDoc.body) {
            iframeDoc.body.style.direction = 'ltr'
            iframeDoc.body.style.paddingRight = '10px'
            iframeDoc.body.style.paddingLeft = '0'
          }
        }
      }
    }
  }, [selectedLanguage, isLandingPageCodeView])

  // Sync displayValue with smartInput
  useEffect(() => {
    const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d-]+(\/.*)?$/i
    const isUrl = smartInput.trim() && urlPattern.test(smartInput.trim())

    if (isUrl) {
      // Extract domain from URL
      try {
        const input = smartInput.trim()
        const urlWithProtocol = input.startsWith('http') ? input : `https://${input}`
        const url = new URL(urlWithProtocol)
        setDisplayValue(url.hostname)
      } catch {
        setDisplayValue(smartInput)
      }
    } else {
      setDisplayValue(smartInput)
    }
  }, [smartInput])

  // Handle URL tab changes
  useEffect(() => {
    const newActiveTab = getActiveTabFromUrl()
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab)
    }
  }, [location.search])

  // Function to handle tab change with URL update
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const newUrl = `/symplysis?tab=${tabId}`
    navigate(newUrl, { replace: true })
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false)
      }
      if (toneDropdownRef.current && !toneDropdownRef.current.contains(event.target as Node)) {
        setToneDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load saved presets for current user
  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase
          .from('ad_copy_presets')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
        if (!error && data) setSavedPresets(data as any)
        // preload history first page
        setHistoryItems([]); setHistoryPage(0); loadHistory({ refresh: true })
      } catch { }
    })()
  }, [])

  // Initialize landing page preview - MOVED TO AFTER ATLAS SECTION VARIABLES

  // Update preview when component HTML cache changes
  useEffect(() => {
    if (activeTab === 'landing-page') {
      updateLandingPagePreview()
    }
  }, [componentHtmlCache])

  // Update iframe when currentLandingPageHtml changes (but skip if we're doing an image replacement)
  useEffect(() => {
    if (skipIframeReloadRef.current) {
      skipIframeReloadRef.current = false
      return
    }
    if (currentLandingPageHtml && landingPageIframeRef.current) {
      const iframe = landingPageIframeRef.current
      iframe.srcdoc = currentLandingPageHtml
    }
  }, [currentLandingPageHtml])

  // Save history helper
  const lastSavedHashRef = useRef<string | null>(null)
  const saveHistory = async (outputs: string[]) => {
    try {
      const payload = JSON.stringify(outputs)
      if (lastSavedHashRef.current === payload) return
      const { supabase } = await import('../lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || outputs.length === 0) return
      const titleBase = smartInput || textInput || webpageUrl || 'Ad copies'
      const title = titleBase.slice(0, 160)
      const { error } = await supabase.from('ad_copy_history').insert({
        user_id: user.id,
        title,
        outputs
      })
      if (!error) lastSavedHashRef.current = payload
    } catch { }
  }

  // Auto-save only after generation finishes (no loading)
  useEffect(() => {
    if (textLoading || scrapingLoading) return
    const outputs = (webpageUrl.trim() ? webpageParsedAdCopies : parsedAdCopies)
    if (!outputs || outputs.length === 0) return
    const t = setTimeout(() => saveHistory(outputs), 400) // debounce to avoid duplicates from progressive updates
    return () => clearTimeout(t)
  }, [textLoading, scrapingLoading, parsedAdCopies, webpageParsedAdCopies])

  // Function to parse ad copies from AI response with progressive display
  const parseAdCopies = (text: string): string[] => {
    const adCopies: string[] = []

    // Handle different ad network formats
    if (selectedAdNetwork === 'Meta') {
      // Parse Meta format - look for sections between [Meta Ad N] or [Ad Copy Version N] markers
      const versionRegex = /\[(?:Meta Ad|Ad Copy Version) (\d+)[^\]]*\]([\s\S]*?)(?=\[(?:Meta Ad|Ad Copy Version)|$)/g
      let match

      while ((match = versionRegex.exec(text)) !== null) {
        const versionNumber = match[1]
        const versionContent = match[2]

        // Extract all three fields
        const primaryMatch = versionContent.match(/^([\s\S]*?)(?=\[Headline\]|$)/)
        const headlineMatch = versionContent.match(/\[Headline\]([\s\S]*?)(?=\[Description\]|$)/)
        const descriptionMatch = versionContent.match(/\[Description\]([\s\S]*?)(?=\[|$)/)

        let primaryText = primaryMatch && primaryMatch[1] ? primaryMatch[1].trim() : ''
        // Remove [Primary Text] marker if present at the start
        primaryText = primaryText.replace(/^\[Primary\s+Text\]\s*/, '')

        let headline = headlineMatch && headlineMatch[1] ? headlineMatch[1].trim() : ''
        let description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : ''

        // Push each field as SEPARATE items in the array
        if (primaryText) {
          adCopies.push(primaryText)

        }
        if (headline) {
          adCopies.push(headline)

        }
        if (description) {
          adCopies.push(description)

        }
      }


    } else if (selectedAdNetwork === 'Google') {
      // Parse Google Ads format - look for sections between [Google Ad N] markers
      const versionRegex = /\[(?:Google Ad|Ad Copy Version) (\d+)[^\]]*\]([\s\S]*?)(?=\[(?:Google Ad|Ad Copy Version)|$)/g
      let match

      while ((match = versionRegex.exec(text)) !== null) {
        const versionNumber = match[1]
        const versionContent = match[2]

        // Extract all three fields
        const headlineMatch = versionContent.match(/\[Headline\]([\s\S]*?)(?=\[Long Headline\]|\[Description\]|$)/)
        const longHeadlineMatch = versionContent.match(/\[Long Headline\]([\s\S]*?)(?=\[Description\]|$)/)
        const descriptionMatch = versionContent.match(/\[Description\]([\s\S]*?)(?=\[|$)/)

        let headline = headlineMatch && headlineMatch[1] ? headlineMatch[1].trim() : ''
        let longHeadline = longHeadlineMatch && longHeadlineMatch[1] ? longHeadlineMatch[1].trim() : ''
        let description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : ''

        // Push each field as SEPARATE items in the array
        if (headline) {
          adCopies.push(headline)

        }
        if (longHeadline) {
          adCopies.push(longHeadline)

        }
        if (description) {
          adCopies.push(description)

        }
      }


    } else if (selectedAdNetwork === 'TikTok') {
      // Parse TikTok format: look for [TikTok Ad N] markers and capture everything after until next marker
      const tiktokRegex = /\[TikTok Ad \d+\]\s*([\s\S]*?)(?=\[TikTok Ad \d+\]|$)/g
      let match

      while ((match = tiktokRegex.exec(text)) !== null) {
        let content = match[1]?.trim()

        if (content) {
          // Remove emojis and special characters
          content = content.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
          // Remove "Short punchy copy under 100 characters" text if present
          content = content.replace(/Short punchy copy.+?characters/gi, '').trim()
          // Remove line breaks to make single line
          content = content.replace(/\n+/g, ' ').trim()

          // Don't truncate - show full text with actual character count
          if (content && content.length > 3) {
            adCopies.push(content)
          }
        }
      }

      // If no matches found with brackets, try line-based parsing
      if (adCopies.length === 0) {
        const lines = text.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed && !trimmed.includes('[') && !trimmed.toLowerCase().includes('tiktok') && trimmed.length > 3 && trimmed.length < 200) {
            let content = trimmed.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
            // Don't truncate - show full text with actual character count
            if (content.length > 3) {
              adCopies.push(content)
            }
          }
        }
      }
    } else if (selectedAdNetwork === 'Snapchat') {
      // Parse Snapchat format: look for [Snapchat Ad N] markers and capture everything after until next marker
      const snapchatRegex = /\[Snapchat Ad \d+\]\s*([\s\S]*?)(?=\[Snapchat Ad \d+\]|$)/g
      let match

      while ((match = snapchatRegex.exec(text)) !== null) {
        let content = match[1]?.trim()

        if (content) {
          // Remove line breaks to make single line
          content = content.replace(/\n+/g, ' ').trim()
          // Remove any descriptive text about character limits
          content = content.replace(/Short.*?characters/gi, '').trim()

          // Don't truncate - show full text with actual character count (emojis allowed)
          if (content && content.length > 3) {
            adCopies.push(content)
          }
        }
      }

      // If no matches found with brackets, try line-based parsing
      if (adCopies.length === 0) {
        const lines = text.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed && !trimmed.includes('[') && !trimmed.toLowerCase().includes('snapchat') && trimmed.length > 3 && trimmed.length < 100) {
            // Don't truncate - show full text with actual character count (emojis allowed for Snapchat)
            if (trimmed.length > 3) {
              adCopies.push(trimmed)
            }
          }
        }
      }
    } else {
      // General format (existing logic)
      const regex = /\[Ad Copy Version \d+ - (?:Short|Medium|Long|Version \d+)\]([\s\S]*?)(?=\[Ad Copy Version|$)/g
      let match

      while ((match = regex.exec(text)) !== null) {
        let content = match[1].trim()
        if (content) {
          adCopies.push(content)
        }
      }

      // Also check for partial ad copies that might be in progress
      const lastBracketIndex = text.lastIndexOf('[Ad Copy Version')
      if (lastBracketIndex !== -1) {
        const remainingText = text.substring(lastBracketIndex)
        const partialMatch = remainingText.match(/\[Ad Copy Version \d+ - (?:Short|Medium|Long|Version \d+)\]([\s\S]*)/)
        if (partialMatch && partialMatch[1]) {
          const partialContent = partialMatch[1].trim()
          if (partialContent && !adCopies.some(copy => copy.includes(partialContent) || partialContent.includes(copy))) {
            adCopies.push(partialContent)
          }
        }
      }
    }

    return adCopies
  }


  // Filter function to remove HTML tags/patterns from scraped content
  const filterScrapedContent = (content: string): string => {
    if (!content) return content;

    // Remove HTML tags, attributes, and patterns - only single words/patterns, not entire lines
    let filtered = content;

    // Remove opening HTML tags
    filtered = filtered.replace(/<!DOCTYPE/gi, '');
    filtered = filtered.replace(/<html/gi, '');
    filtered = filtered.replace(/<head/gi, '');
    filtered = filtered.replace(/<header/gi, '');
    filtered = filtered.replace(/<body/gi, '');
    filtered = filtered.replace(/<div/gi, '');
    filtered = filtered.replace(/<meta/gi, '');
    filtered = filtered.replace(/<title/gi, '');
    filtered = filtered.replace(/<a(?=\s|>|$)/gi, ''); // <a followed by space, >, or end of string
    filtered = filtered.replace(/<h[1-6]/gi, ''); // <h1, <h2, <h3, <h4, <h5, <h6
    filtered = filtered.replace(/<form/gi, '');
    filtered = filtered.replace(/<ul/gi, '');
    filtered = filtered.replace(/<li/gi, '');
    filtered = filtered.replace(/<nav/gi, '');
    filtered = filtered.replace(/<link/gi, '');
    filtered = filtered.replace(/<img/gi, '');
    filtered = filtered.replace(/<input/gi, '');
    filtered = filtered.replace(/<button/gi, '');
    filtered = filtered.replace(/<select/gi, '');
    filtered = filtered.replace(/<option/gi, '');
    filtered = filtered.replace(/<i\s/gi, ' '); // <i followed by space
    filtered = filtered.replace(/<i>/gi, ' '); // <i> tag
    filtered = filtered.replace(/<p\s/gi, ' '); // <p followed by space
    filtered = filtered.replace(/<p>/gi, ' '); // <p> tag
    filtered = filtered.replace(/<span/gi, '');
    filtered = filtered.replace(/<strong/gi, '');
    filtered = filtered.replace(/<main/gi, '');
    filtered = filtered.replace(/<flash/gi, '');
    filtered = filtered.replace(/<cart-side-summary/gi, '');
    filtered = filtered.replace(/<product-show/gi, '');
    filtered = filtered.replace(/<section/gi, '');
    filtered = filtered.replace(/<svg/gi, '');
    filtered = filtered.replace(/<path/gi, '');
    filtered = filtered.replace(/<label/gi, '');

    // Remove closing HTML tags
    filtered = filtered.replace(/<\/head/gi, '');
    filtered = filtered.replace(/<\/html/gi, '');
    filtered = filtered.replace(/<\/header/gi, '');
    filtered = filtered.replace(/<\/body/gi, '');
    filtered = filtered.replace(/<\/div/gi, '');
    filtered = filtered.replace(/<\/a/gi, '');
    filtered = filtered.replace(/<\/h[1-6]/gi, ''); // </h1, </h2, etc.
    filtered = filtered.replace(/<\/form/gi, '');
    filtered = filtered.replace(/<\/ul/gi, '');
    filtered = filtered.replace(/<\/li/gi, '');
    filtered = filtered.replace(/<\/nav/gi, '');
    filtered = filtered.replace(/<\/p/gi, '');
    filtered = filtered.replace(/<\/span/gi, '');
    filtered = filtered.replace(/<\/strong/gi, '');
    filtered = filtered.replace(/<\/i/gi, '');
    filtered = filtered.replace(/<\/title/gi, '');
    filtered = filtered.replace(/<\/main/gi, '');
    filtered = filtered.replace(/<\/flash/gi, '');
    filtered = filtered.replace(/<\/cart-side-summary/gi, '');
    filtered = filtered.replace(/<\/product-show/gi, '');
    filtered = filtered.replace(/<\/section/gi, '');
    filtered = filtered.replace(/<\/svg/gi, '');
    filtered = filtered.replace(/<\/path/gi, '');
    filtered = filtered.replace(/<\/label/gi, '');

    // Remove HTML attributes (only the attribute name with =)
    filtered = filtered.replace(/dir=/gi, '');
    filtered = filtered.replace(/lang=/gi, '');
    filtered = filtered.replace(/charset=/gi, '');
    filtered = filtered.replace(/http-equiv=/gi, '');
    filtered = filtered.replace(/content=/gi, '');
    filtered = filtered.replace(/name=/gi, '');
    filtered = filtered.replace(/property=/gi, '');
    filtered = filtered.replace(/id=/gi, '');
    filtered = filtered.replace(/class=/gi, '');
    filtered = filtered.replace(/style=/gi, '');
    filtered = filtered.replace(/href=/gi, '');
    filtered = filtered.replace(/src=/gi, '');
    filtered = filtered.replace(/alt=/gi, '');
    filtered = filtered.replace(/type=/gi, '');
    filtered = filtered.replace(/rel=/gi, '');
    filtered = filtered.replace(/:class=/gi, '');
    filtered = filtered.replace(/v-if=/gi, '');
    filtered = filtered.replace(/@click=/gi, '');
    filtered = filtered.replace(/action=/gi, '');
    filtered = filtered.replace(/method=/gi, '');
    filtered = filtered.replace(/placeholder=/gi, '');
    filtered = filtered.replace(/value=/gi, '');
    filtered = filtered.replace(/required/gi, '');
    filtered = filtered.replace(/selected/gi, '');
    filtered = filtered.replace(/title=/gi, '');
    filtered = filtered.replace(/aria-label=/gi, '');
    filtered = filtered.replace(/data-name=/gi, '');
    filtered = filtered.replace(/:initial-cart=/gi, '');
    filtered = filtered.replace(/:product=/gi, '');
    filtered = filtered.replace(/:sections=/gi, '');
    filtered = filtered.replace(/:product-settings=/gi, '');
    filtered = filtered.replace(/:reviews=/gi, '');
    filtered = filtered.replace(/:is-preview=/gi, '');
    filtered = filtered.replace(/:customer-country-code=/gi, '');
    filtered = filtered.replace(/:form-settings=/gi, '');
    filtered = filtered.replace(/view-content-event-/gi, '');
    filtered = filtered.replace(/is-express-checkout-enabled/gi, '');
    filtered = filtered.replace(/data-/gi, '');
    filtered = filtered.replace(/data-animate=/gi, '');
    filtered = filtered.replace(/data-boxed=/gi, '');
    filtered = filtered.replace(/data-dest=/gi, '');
    filtered = filtered.replace(/viewBox=/gi, '');
    filtered = filtered.replace(/preserveAspectRatio=/gi, '');
    filtered = filtered.replace(/sizes=/gi, '');
    filtered = filtered.replace(/srcSet=/gi, '');
    filtered = filtered.replace(/inputMode=/gi, '');
    filtered = filtered.replace(/for=/gi, '');
    filtered = filtered.replace(/forId-/gi, '');
    filtered = filtered.replace(/xmlns=/gi, '');
    filtered = filtered.replace(/version=/gi, '');

    // Remove HTML comments
    filtered = filtered.replace(/<!--/g, '');
    filtered = filtered.replace(/-->/g, '');

    // Remove bracket patterns
    filtered = filtered.replace(/\[SCRIPT\]/gi, '');
    filtered = filtered.replace(/\[STYLE\]/gi, '');

    // Remove HTML entities
    filtered = filtered.replace(/&quot/gi, '');
    filtered = filtered.replace(/&nbsp/gi, '');
    filtered = filtered.replace(/&lt;/gi, '');
    filtered = filtered.replace(/&gt;/gi, '');

    // Remove standalone >, </, and / characters
    filtered = filtered.replace(/>/g, ' ');
    filtered = filtered.replace(/<\//g, ' ');
    filtered = filtered.replace(/\s\/\s/g, ' '); // Standalone / with spaces
    filtered = filtered.replace(/\s\/$/g, ' '); // / at end of word
    filtered = filtered.replace(/^\s*\//g, ' '); // / at start

    // Clean up multiple spaces
    filtered = filtered.replace(/\s+/g, ' ');
    filtered = filtered.trim();

    return filtered.trim();
  };

  const handleWebpageScraping = async (forceAiEnabled = false) => {
    const effectiveAiEnabled = forceAiEnabled || aiEnabled
    console.log('🚀 [SCRAPING] Starting handleWebpageScraping')
    console.log('🚀 [SCRAPING] webpageUrl:', webpageUrl)
    console.log('🚀 [SCRAPING] productInput:', productInput)
    console.log('🚀 [SCRAPING] forceAiEnabled:', forceAiEnabled)
    console.log('🚀 [SCRAPING] effectiveAiEnabled:', effectiveAiEnabled)

    // Check usage limit - webpage scraping is for ad copy generation
    if (!canGenerate('adcopy')) {
      setCreditModalType('adcopy')
      setShowCreditModal(true)
      return
    }

    // Get URL from webpageUrl or detect URL in productInput
    let urlToScrape = webpageUrl.trim();
    if (!urlToScrape && productInput.trim()) {
      // Check if productInput contains a URL
      const urlMatch = productInput.trim().match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        urlToScrape = urlMatch[0];
        setWebpageUrl(urlToScrape); // Set webpageUrl for future use
        console.log('🚀 [SCRAPING] Detected URL in productInput:', urlToScrape);
      }
    }

    if (!urlToScrape) {
      console.log('🚀 [SCRAPING] No URL found, returning')
      return
    }

    setScrapingLoading(true)
    setError('')
    setWebpageParsedAdCopies([])
    setPreparedPrompt('')
    setGenerationProgress(0)
    setProgressText('Initializing...')

    try {
      let currentScrapedContent = scrapedContent
      let currentScrapedTitle = scrapedTitle

      // Clean URL by removing query parameters
      let trimmedUrl = urlToScrape
      console.log('🚀 [SCRAPING] Original URL:', trimmedUrl)

      // Fix for AliExpress: remove language subdomain
      if (trimmedUrl.includes('aliexpress.com')) {
        trimmedUrl = trimmedUrl.replace(/https?:\/\/[a-z]{2}\.aliexpress\.com/i, 'https://aliexpress.com')
        console.log('🚀 [SCRAPING] Normalized AliExpress URL (removed subdomain):', trimmedUrl)
      }

      const questionMarkIndex = trimmedUrl.indexOf('?')
      if (questionMarkIndex !== -1) {
        trimmedUrl = trimmedUrl.substring(0, questionMarkIndex)
        console.log('🚀 [SCRAPING] Cleaned URL (removed query):', trimmedUrl)
      } else {
        console.log('🚀 [SCRAPING] No query params to remove')
      }

      // Check cache - if cache exists and not forcing regenerate, use it and skip scraping
      const cached = visionAIOcrCache[trimmedUrl];
      const shouldUseCache = cached && cached.text && cached.text.trim();

      console.log('🔍 Cache check:', {
        trimmedUrl,
        hasCache: !!cached,
        cacheText: cached?.text?.substring(0, 50) || 'none',
        shouldUseCache
      });

      if (shouldUseCache) {
        // Use cached content - don't scrape again
        console.log('✅ Using cached content for URL:', trimmedUrl, '- skipping edge function calls');
        // Extract images from cached content
        const images = extractImageUrls(cached.text);
        setScrapedImages(images);
        console.log('🖼️ Extracted', images.length, 'images from cached content');
        // Use FULL HTML content - NO FILTERING
        currentScrapedContent = cached.text;
        setScrapedContent(currentScrapedContent);
        setLastScrapedUrl(trimmedUrl);
        setGenerationPhase('generating'); // Skip scraping phase
        console.log('📄 Using FULL HTML content (no filtering):', currentScrapedContent.length, 'chars');
      } else {
        // Need to scrape - URL changed or no cache
        setScrapedContent('')
        setScrapedTitle('')

        // Check if URL is in old urlCache first (for backward compatibility)
        if (isUrlCached(trimmedUrl)) {
          const cachedData = urlCache[trimmedUrl]
          currentScrapedContent = cachedData.content
          currentScrapedTitle = cachedData.title
          setScrapedContent(currentScrapedContent)
          setScrapedTitle(currentScrapedTitle)
          setLastScrapedUrl(trimmedUrl)
          setGenerationProgress(35)
          setProgressText('Using cached content...')
        } else {
          // Set initial progress
          setGenerationProgress(5)
          setProgressText('Preparing to scrape...')
          await new Promise(resolve => setTimeout(resolve, 300))

          setGenerationProgress(15)
          setProgressText('Scraping webpage...')

          // First, scrape the webpage using Supabase Edge Function
          let urlForWebScraping = trimmedUrl

          // Strip AliExpress subdomains to avoid region redirects
          if (urlForWebScraping.includes('aliexpress.com')) {
            urlForWebScraping = urlForWebScraping.replace(/https?:\/\/[a-z]{2}\.aliexpress\.com/i, 'https://www.aliexpress.com')
            console.log('🔧 [SCRAPING] Normalized AliExpress URL for web scraper:', urlForWebScraping)
          }

          console.log('🚀 [SCRAPING] Calling SupabaseScraper with URL:', urlForWebScraping)
          // Call BOTH edge functions and combine results
          console.log(`🔍 Calling BOTH scrape-webpage AND image-ocr-v2 for URL: ${trimmedUrl}`);

          // Get auth token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Authentication required');
          }

          const textParts: string[] = [];

          // Call scrape-webpage first
          try {
            console.log('🔍 Calling scrape-webpage...');
            setGenerationProgress(20)
            setProgressText('Scraping webpage content...')
            const scrapeResponse = await fetch('https://auth.symplysis.com/functions/v1/scrape-webpage', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ url: trimmedUrl })
            });

            if (scrapeResponse.ok) {
              const scrapeData = await scrapeResponse.json();
              if (scrapeData.success && scrapeData.content) {
                textParts.push(`=== WEBPAGE CONTENT ===\n\n${scrapeData.content}`);
                console.log(`✅ scrape-webpage returned ${scrapeData.content.length} chars`);
              }
            } else {
              const errorText = await scrapeResponse.text();
              console.warn('⚠️ scrape-webpage failed:', errorText);
            }
          } catch (err) {
            console.warn('⚠️ scrape-webpage error:', err);
          }

          // Call image-ocr-v2 second
          try {
            console.log('🔍 Calling image-ocr-v2...');
            setGenerationProgress(40)
            setProgressText('Extracting text from images...')
            const ocrResponse = await fetch('https://auth.symplysis.com/functions/v1/image-ocr-v2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ url: trimmedUrl, language: selectedLanguage })
            });

            if (ocrResponse.ok) {
              const ocrData = await ocrResponse.json();
              if (ocrData.success) {
                if (ocrData.results && Array.isArray(ocrData.results)) {
                  const ocrTextParts: string[] = [];
                  ocrData.results.forEach((result: any, index: number) => {
                    if (result.text && result.text.trim() && !result.error && result.confidence > 0) {
                      ocrTextParts.push(result.text.trim());
                      console.log(`✅ Extracted text from OCR result ${index + 1} (confidence: ${result.confidence}%)`);
                    }
                  });
                  if (ocrTextParts.length > 0) {
                    textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrTextParts.join('\n\n')}`);
                    console.log(`✅ image-ocr-v2 returned ${ocrTextParts.join('\n\n').length} chars from ${ocrTextParts.length} results`);
                  }
                } else if (ocrData.text || ocrData.ocrText || ocrData.content) {
                  const ocrText = ocrData.text || ocrData.ocrText || ocrData.content;
                  textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrText}`);
                  console.log(`✅ image-ocr-v2 returned ${ocrText.length} chars`);
                }
              }
            } else {
              const errorText = await ocrResponse.text();
              console.warn('⚠️ image-ocr-v2 failed:', errorText);
            }
          } catch (err) {
            console.warn('⚠️ image-ocr-v2 error:', err);
          }

          // Combine all text parts
          let combinedText = textParts.join('\n\n\n');

          if (!combinedText || !combinedText.trim()) {
            throw new Error('No content extracted from either edge function. Both scrape-webpage and image-ocr-v2 returned no results.');
          }

          // Extract images from raw content
          const images = extractImageUrls(combinedText);
          setScrapedImages(images);
          console.log('🖼️ Extracted', images.length, 'images from scraped content');

          // Use FULL HTML content - NO FILTERING
          currentScrapedContent = combinedText;
          setScrapedContent(currentScrapedContent);
          setLastScrapedUrl(trimmedUrl);

          console.log('✅ Using FULL HTML content (no filtering):', currentScrapedContent.length, 'chars');

          // Cache the FULL HTML results (not filtered)
          setVisionAIOcrCache(prev => ({
            ...prev,
            [trimmedUrl]: {
              text: currentScrapedContent,
              timestamp: Date.now()
            }
          }))
        }
      }

      if (!currentScrapedContent.trim()) {
        throw new Error('No content extracted from webpage');
      }

      let combinedContent = currentScrapedContent

      // AMAZON DETECTION: Check if URL contains "amazon"
      const isAmazonUrl = trimmedUrl.toLowerCase().includes('amazon')

      if (isAmazonUrl) {
        console.log('🚨 [AMAZON DETECTED] URL contains "amazon":', trimmedUrl)
        console.log('📊 [AMAZON] Current scraped content length:', currentScrapedContent.length, 'chars')

        // AMAZON REQUIREMENT: Must have at least 1000 characters
        const AMAZON_MIN_LENGTH = 1000
        const MAX_AMAZON_RETRIES = 10
        let amazonRetryCount = 0

        while (currentScrapedContent.length < AMAZON_MIN_LENGTH && amazonRetryCount < MAX_AMAZON_RETRIES) {
          amazonRetryCount++
          console.log(`⚠️ [AMAZON] Content too short (${currentScrapedContent.length}/${AMAZON_MIN_LENGTH} chars) - Retry ${amazonRetryCount}/${MAX_AMAZON_RETRIES}`)
          setProgressText(`Amazon: Re-scraping for more content (${amazonRetryCount}/${MAX_AMAZON_RETRIES})...`)

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000))

          try {
            console.log(`🔄 [AMAZON] Attempting scrape retry ${amazonRetryCount}...`)
            const retryResponse = await SupabaseScraper.scrapeWebpage({
              url: trimmedUrl
            })

            if (retryResponse.success && retryResponse.content.length > currentScrapedContent.length) {
              console.log(`📝 [AMAZON] Retry ${amazonRetryCount} got ${retryResponse.content.length} chars (previous: ${currentScrapedContent.length})`)
              currentScrapedContent = retryResponse.content
              currentScrapedTitle = retryResponse.title
              setScrapedContent(currentScrapedContent)
              setScrapedTitle(currentScrapedTitle)

              // Update cache
              setUrlCache(prev => ({
                ...prev,
                [trimmedUrl]: {
                  content: currentScrapedContent,
                  title: currentScrapedTitle,
                  timestamp: Date.now()
                }
              }))
            } else {
              console.warn(`⚠️ [AMAZON] Retry ${amazonRetryCount} didn't improve content`)
            }
          } catch (retryError) {
            console.error(`❌ [AMAZON] Retry ${amazonRetryCount} failed:`, retryError)
          }
        }

        if (currentScrapedContent.length >= AMAZON_MIN_LENGTH) {
          console.log(`✅ [AMAZON] SUCCESS! Got ${currentScrapedContent.length} chars (>= ${AMAZON_MIN_LENGTH} required)`)
        } else {
          console.error(`❌ [AMAZON] FAILED after ${amazonRetryCount} retries. Final length: ${currentScrapedContent.length}/${AMAZON_MIN_LENGTH} chars`)
          console.log(`🔴 [AMAZON] Proceeding anyway, but content may be insufficient`)
        }

        // DISABLE image scraping for Amazon
        console.log('🚫 [AMAZON] Skipping image scraping (text only)')
      }

      // Note: Image OCR is now handled by the image-ocr-v2 edge function in the main scraping flow above
      // The combinedContent already includes image OCR text if it was extracted


      // AMAZON VALIDATION BEFORE AI GENERATION
      if (isAmazonUrl) {
        console.log('📊 [AMAZON PRE-CHECK] Final content length before AI:', combinedContent.length, 'chars')

        if (combinedContent.length < 500) {
          console.error(`🛑 [AMAZON BLOCK] Content too short (${combinedContent.length} chars) - MINIMUM 500 required. BLOCKING AI generation!`)
          setError(`Amazon content too short: ${combinedContent.length} chars (need 500+ to generate). Please try again.`)
          return // BLOCK generation
        } else {
          console.log(`✅ [AMAZON PASS] Content length ${combinedContent.length} >= 500 chars - Proceeding to AI generation`)
        }
      }

      // Only generate AI content if toggle is enabled
      if (effectiveAiEnabled) {

        setGenerationPhase('generating')
        setGenerationProgress(imageScrapingEnabled ? 50 : 45)
        setProgressText('Preparing AI prompt...')
        // Truncate content for Gemini to avoid token limits, keep full content for DeepSeek
        const contentForAI = aiProvider === 'gemini'
          ? combinedContent.substring(0, 3000) + (combinedContent.length > 3000 ? '...' : '')
          : combinedContent

        // Then, generate ad copy from the scraped content  
        const basePrompt = `Analyze this PRODUCT information and create compelling ad copy:

${contentForAI}



Focus on the PRODUCT'S benefits, features, and value proposition to create high-converting ad copy that sells this product.`

        // Generate network-specific prompt
        const networkPrompt = generateAdNetworkPrompt(basePrompt)

        const fullPrompt = `${networkPrompt}

IMPORTANT: Respond ONLY with the ad copy versions in the exact format specified. NO explanations, NO metadata headers, NO additional suggestions.`
        setPreparedPrompt(fullPrompt)
      }

    } catch (error) {
      setError('An unexpected error occurred during scraping')
    } finally {
      setScrapingLoading(false)
      setGenerationPhase(null)
      // Reset progress on error or completion
      setTimeout(() => {
        setGenerationProgress(0)
        setProgressText('')
      }, 2000)
    }
  }

  const toneOptions = [
    'Expert',
    'Daring',
    'Playful',
    'Sophisticated',
    'Persuasive',
    'Supportive',
    'Custom'
  ]

  const voiceOptions = [
    { id: 'zephyr', name: 'Zephyr', description: 'Calm, Soothing' },
    { id: 'puck', name: 'Puck', description: 'Upbeat, Friendly' },
    { id: 'kore', name: 'Kore', description: 'Clear, Professional' },
    { id: 'charon', name: 'Charon', description: 'Deep, Authoritative' },
    { id: 'fenrir', name: 'Fenrir', description: 'Warm, Storyteller' },
    { id: 'aoede', name: 'Aoede', description: 'Elegant, Expressive' },
    { id: 'leda', name: 'Leda', description: 'Bright, Energetic' },
    { id: 'orus', name: 'Orus', description: 'Strong, Confident' },
  ]

  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Dutch',
    'Russian',
    'Chinese',
    'Japanese',
    'Arabic',
    'Hindi'
  ]

  const adNetworkOptions = [
    'General',
    'Meta',
    'TikTok',
    'Snapchat',
    'Google'
  ]

  const generateAdNetworkPrompt = (basePrompt: string) => {
    let networkSpecificInstructions = ''

    if (selectedAdNetwork === 'Meta') {
      networkSpecificInstructions = `Create ${adCopyQuantity} Meta/Facebook ad variations. For each ad, provide:
1. Primary Text: Main ad copy (compelling and engaging)
2. Headline: A short, attention-grabbing headline (with emojis)
3. Description: A brief closer like "Shop Now!", "Limited Time!", "Free Shipping!", etc. (with emojis)

Format each ad as:
[Meta Ad 1]
[Primary Text] Your engaging main ad copy here that sells the product
[Headline] Compelling headline with emojis 🎯
[Description] Brief closer with emojis ⭐

[Meta Ad 2]
[Primary Text] Second variation of main ad copy
[Headline] Second headline with emojis 🔥
[Description] Second closer with emojis ✨

Continue this format for all ${adCopyQuantity} ads. ALWAYS include relevant emojis in headlines and descriptions.`
    } else if (selectedAdNetwork === 'TikTok') {
      networkSpecificInstructions = `Create ${adCopyQuantity} TikTok ad copy variations. ABSOLUTELY CRITICAL REQUIREMENTS:

⚠️ EACH AD COPY MUST NOT EXCEED 100 CHARACTERS:
- Ad 1 MUST be 100 characters or LESS
- Ad 2 MUST be 100 characters or LESS
- Ad 3 MUST be 100 characters or LESS
- Ad 4 MUST be 100 characters or LESS
- EVERY SINGLE AD COPY has a maximum of 100 characters
- Count EVERY character: spaces, punctuation, letters - EVERYTHING
- If a single ad exceeds 100 chars, it is a FAILURE
- Do NOT exceed 100 per ad under ANY circumstances

OTHER REQUIREMENTS:
- NO emojis allowed
- Keep it short, punchy, direct
- Focus on the main benefit or hook
- Use action words and urgency

FORMAT (each bracket is a separate ad with max 100 chars each):
[TikTok Ad 1] Copy here - max 100 chars
[TikTok Ad 2] Copy here - max 100 chars
[TikTok Ad 3] Copy here - max 100 chars

⚠️ MANDATORY VERIFICATION:
Before sending your response:
✓ Count characters in Ad 1 - must be ≤ 100
✓ Count characters in Ad 2 - must be ≤ 100
✓ Count characters in Ad 3 - must be ≤ 100
✓ If ANY ad exceeds 100, DELETE IT and write a shorter version
DO NOT send any ad that is longer than 100 characters.`
    } else if (selectedAdNetwork === 'Snapchat') {
      networkSpecificInstructions = `Create ${adCopyQuantity} Snapchat ad copy variations. ⚠️ ABSOLUTELY CRITICAL - 34 CHARACTER MAXIMUM:

🚨 STRICT REQUIREMENTS:
- MAXIMUM 34 characters per ad (including spaces, punctuation, emojis - COUNT EVERYTHING)
- Ad 1 MUST be 34 characters or LESS
- Ad 2 MUST be 34 characters or LESS
- Ad 3 MUST be 34 characters or LESS  
- Ad 4 MUST be 34 characters or LESS
- ALWAYS write COMPLETE, PROPER SENTENCES - NO HARD CUTS OR INCOMPLETE WORDS
- Each ad MUST make grammatical sense and feel natural
- DO NOT cut words in half or end abruptly mid-thought
- Emojis are ALLOWED but NOT necessary - use them only if they add value
- Each emoji counts as 1-2 characters when used
- Keep it ultra-short, punchy, and direct
- Focus on ONE main benefit or hook per ad
- Use action words and create urgency

FORMAT (each bracket is a separate ad with MAX 34 chars):
[Snapchat Ad 1] Complete sentence here!
[Snapchat Ad 2] Full thought here!
[Snapchat Ad 3] Proper message here!

⚠️ MANDATORY VERIFICATION BEFORE SENDING:
✓ Count EVERY character in Ad 1 (including emojis if used) - MUST be ≤ 34
✓ Count EVERY character in Ad 2 (including emojis if used) - MUST be ≤ 34
✓ Count EVERY character in Ad 3 (including emojis if used) - MUST be ≤ 34
✓ Verify each ad is a COMPLETE SENTENCE with no hard cuts
✓ If ANY ad exceeds 34 characters OR is incomplete, REWRITE IT
✓ DOUBLE-CHECK: No ad should be longer than 34 characters

🎯 THIS IS CRITICAL: Snapchat has a strict 34-character limit AND requires complete, natural sentences. No word cuts!`
    } else if (selectedAdNetwork === 'Google') {
      networkSpecificInstructions = `Create ${adCopyQuantity} Google Ads variations. ⚠️ STRICT CHARACTER LIMITS - MAXIMIZE USAGE:

🔍 REQUIREMENTS FOR EACH AD:
1. Headline: Maximum 40 characters (short, attention-grabbing)
2. Long Headline: Maximum 90 characters (more detailed, compelling)
3. Description: Maximum 90 characters (call-to-action, benefits)

📝 CHARACTER LIMITS & OPTIMIZATION:
- Headline MUST be ≤ 40 characters → AIM FOR 35-40 characters (use the space!)
- Long Headline MUST be ≤ 90 characters → AIM FOR 85-90 characters (maximize impact!)
- Description MUST be ≤ 90 characters → AIM FOR 85-90 characters (full value!)
- PUSH to the character limit while maintaining quality
- Add more details, benefits, or compelling words to reach the limit
- Emojis are ALLOWED but NOT necessary - use them only if they add value
- Each emoji counts as 1-2 characters when used

💡 OPTIMIZATION STRATEGY:
- Don't write short when you have more space available
- If a headline is 25 chars, ADD MORE compelling words to reach 35-40
- If a description is 60 chars, ADD MORE benefits to reach 85-90
- Use every character to maximize persuasion and information

FORMAT for each ad:
[Google Ad 1]
[Headline] Short catchy headline maximized to ~40
[Long Headline] More detailed compelling headline using full 85-90 characters available
[Description] Strong call-to-action with benefits maximized to use full 85-90 chars

[Google Ad 2]
[Headline] Second headline using ~35-40 chars
[Long Headline] Second detailed headline utilizing the full ~85-90 character limit
[Description] Second call-to-action maximized to ~85-90 characters

Continue this format for all ${adCopyQuantity} ads.

⚠️ MANDATORY VERIFICATION BEFORE SENDING:
✓ Count characters in EVERY Headline - MUST be ≤ 40 (aim for 35-40)
✓ Count characters in EVERY Long Headline - MUST be ≤ 90 (aim for 85-90)
✓ Count characters in EVERY Description - MUST be ≤ 90 (aim for 85-90)
✓ If field is significantly UNDER limit, ADD MORE content
✓ If ANY field exceeds its limit, shorten it
✓ MAXIMIZE character usage for best results

🎯 CRITICAL: Google Ads performs better with fuller copy. Use the space you have - don't leave characters unused!`
    } else {
      networkSpecificInstructions = `Create ${adCopyQuantity} compelling ad copy variations in the standard format:
[Ad Copy Version 1 - Short] First variation
[Ad Copy Version 2 - Medium] Second variation
[Ad Copy Version 3 - Long] Third variation`
    }

    return `${basePrompt}

${networkSpecificInstructions}

Language: ${selectedLanguage}
Tone: ${selectedTone === 'Custom' ? customTone : selectedTone}`
  }

  const regenerateAdCopy = async (index: number, currentAdCopies: string[]) => {
    setRegeneratingIndex(index)
    setError('')

    try {
      // Use the FULL cached product information (including scraped content AND vision AI OCR if available)
      let fullProductInfo = ''
      if (webpageUrl.trim()) {
        // For webpage scraping, use the full scraped content
        fullProductInfo = scrapedContent
        // Also append Vision AI OCR cache if available
        const trimmedUrl = webpageUrl.trim()
        if (visionAIOcrCache[trimmedUrl]) {
          fullProductInfo += `\n\n=== TEXT EXTRACTED FROM IMAGES ===\n\n${visionAIOcrCache[trimmedUrl].text}`
        }
      } else {
        fullProductInfo = textInput
      }

      if (!fullProductInfo.trim()) {
        setError('No product information available')
        setRegeneratingIndex(null)
        return
      }

      // Determine which field type we're regenerating based on network and index
      const networkForLimits = generatedWithNetwork
      let fieldType = ''
      let charLimit = 0
      let specificInstructions = ''

      if (networkForLimits === 'Google') {
        const fieldIndex = index % 3
        if (fieldIndex === 0) {
          fieldType = 'Headline'
          charLimit = 40
          specificInstructions = `Create a SHORT, ATTENTION-GRABBING headline. STRICT LIMIT: Maximum 40 characters. AIM FOR 35-40 characters to maximize impact. Count every character including spaces and punctuation.`
        } else if (fieldIndex === 1) {
          fieldType = 'Long Headline'
          charLimit = 90
          specificInstructions = `Create a DETAILED, COMPELLING long headline. STRICT LIMIT: Maximum 90 characters. AIM FOR 85-90 characters to use all available space. Count every character including spaces and punctuation.`
        } else {
          fieldType = 'Description'
          charLimit = 90
          specificInstructions = `Create a STRONG call-to-action with benefits. STRICT LIMIT: Maximum 90 characters. AIM FOR 85-90 characters to maximize persuasion. Count every character including spaces and punctuation.`
        }
      } else if (networkForLimits === 'TikTok') {
        fieldType = 'TikTok Ad Copy'
        charLimit = 100
        specificInstructions = `Create SHORT, PUNCHY ad copy. STRICT LIMIT: Maximum 100 characters. NO emojis allowed. Count every character including spaces and punctuation. Must be a complete sentence.`
      } else if (networkForLimits === 'Snapchat') {
        fieldType = 'Snapchat Ad Copy'
        charLimit = 34
        specificInstructions = `Create ULTRA-SHORT, PUNCHY ad copy. CRITICAL LIMIT: Maximum 34 characters. Emojis optional but count as 1-2 chars each. MUST be a COMPLETE SENTENCE with no hard cuts. Count every character including spaces and punctuation.`
      } else if (networkForLimits === 'Meta') {
        const fieldIndex = index % 3
        if (fieldIndex === 0) {
          fieldType = 'Primary Text'
          specificInstructions = `Create ENGAGING main ad copy that sells the product. Be compelling and benefit-focused. No strict character limit, but keep it concise and effective.`
        } else if (fieldIndex === 1) {
          fieldType = 'Headline'
          specificInstructions = `Create a SHORT, ATTENTION-GRABBING headline with emojis. No strict character limit, but keep it punchy and memorable.`
        } else {
          fieldType = 'Description'
          specificInstructions = `Create a BRIEF closer like "Shop Now!", "Limited Time!", "Free Shipping!" with emojis. Keep it short and action-oriented.`
        }
      } else {
        fieldType = 'Ad Copy'
        specificInstructions = `Create compelling ad copy that captures attention and drives action.`
      }

      // Create a targeted regeneration prompt with FULL context and variation seed
      const variationSeed = Date.now() // Use timestamp to ensure uniqueness
      const variationPrompts = [
        'Take a completely different angle',
        'Use a fresh perspective',
        'Try a new creative approach',
        'Focus on different benefits',
        'Use alternative wording',
        'Be more creative this time',
        'Try a different hook',
        'Emphasize different features'
      ]
      const randomVariation = variationPrompts[Math.floor(Math.random() * variationPrompts.length)]
      const currentCopy = currentAdCopies[index]

      const targetedPrompt = `Based on this COMPLETE product information:

${fullProductInfo}

Regenerate ONLY the ${fieldType} field for this ad.

❌ CURRENT VERSION (DO NOT REPEAT THIS):
"${currentCopy}"

🔄 IMPORTANT VARIATION REQUIREMENT: ${randomVariation}. Make it UNIQUE and DIFFERENT from the current version above. Use different words, different structure, different approach. DO NOT generate anything similar to the current version. [Variation ID: ${variationSeed}]

${specificInstructions}

Language: ${selectedLanguage}
Tone: ${selectedTone === 'Custom' ? customTone : selectedTone}

⚠️ CRITICAL: Respond with ONLY the new ${fieldType} text. NO brackets, NO labels, NO explanations. Just the ad copy itself.
${charLimit > 0 ? `\n🎯 MANDATORY: Must be ${charLimit} characters or LESS. Count carefully!` : ''}`

      const response = aiProvider === 'gemini'
        ? await GeminiService.generateTextStream({
          prompt: targetedPrompt,
          tone: selectedTone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity: 1,
          temperature: 1.2  // Higher temperature for more variation
        })
        : await DeepSeekService.generateTextStream({
          prompt: targetedPrompt,
          tone: selectedTone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity: 1,
          temperature: 1.2  // Higher temperature for more variation
        })

      if (response.success && response.stream) {
        const reader = response.stream.getReader()
        let accumulatedText = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            accumulatedText += value
          }
        } finally {
          reader.releaseLock()
        }

        // Clean up the response - remove any formatting, brackets, or labels
        let newAdCopy = accumulatedText.trim()
        // Remove any potential brackets or labels that might have been added
        newAdCopy = newAdCopy.replace(/^\[.*?\]\s*/g, '')
        newAdCopy = newAdCopy.replace(/^(Headline|Long Headline|Description|Primary Text|Ad Copy):?\s*/gi, '')
        newAdCopy = newAdCopy.trim()

        if (newAdCopy && newAdCopy.length > 0) {
          // Replace only the ad copy at the specified index
          const updatedCopies = [...currentAdCopies]
          updatedCopies[index] = newAdCopy

          // Update the correct state based on whether it's a webpage or text
          if (webpageUrl.trim()) {
            setWebpageParsedAdCopies(updatedCopies)
          } else {
            setParsedAdCopies(updatedCopies)
          }
        } else {
          setError('Failed to regenerate ad copy')
        }
      } else {
        setError(response.error || 'Failed to regenerate ad copy')
      }
    } catch (error) {
      setError('An unexpected error occurred while regenerating')
    } finally {
      setRegeneratingIndex(null)
    }
  }

  const handleTextGeneration = async () => {
    if (!textInput.trim()) return

    // Check usage limit
    if (!canGenerate('adcopy')) {
      setError('Insufficient Ad Copy credits. Please purchase more to continue.')
      setCreditModalType('adcopy')
      setShowCreditModal(true)
      return
    }

    setTextLoading(true)
    setGenerationPhase('generating')
    setError('')
    setGeneratedText('')
    setParsedAdCopies([])
    setGenerationProgress(0)
    setProgressText('Initializing...')

    try {
      // Simulate initialization progress
      setGenerationProgress(10)
      setProgressText('Connecting to AI...')
      await new Promise(resolve => setTimeout(resolve, 500))

      setGenerationProgress(25)
      setProgressText('Processing request...')
      // Generate network-specific prompt
      const networkPrompt = generateAdNetworkPrompt(textInput)

      const response = aiProvider === 'gemini'
        ? await GeminiService.generateTextStream({
          prompt: networkPrompt,
          tone: selectedTone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity: adCopyQuantity
        })
        : await DeepSeekService.generateTextStream({
          prompt: networkPrompt,
          tone: selectedTone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity: adCopyQuantity
        })

      if (response.success && response.stream) {
        setGenerationProgress(40)
        setProgressText('Generating content...')

        const reader = response.stream.getReader()
        let accumulatedText = ''
        let chunkCount = 0

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            chunkCount++
            accumulatedText += value
            setGeneratedText(accumulatedText)

            // Update progress based on content generation
            const currentProgress = Math.min(40 + (chunkCount * 5), 90)
            setGenerationProgress(currentProgress)
            setProgressText(`Generating... ${Math.floor(currentProgress)}%`)

            // Parse ad copies in real-time as text is generated
            const parsedCopies = parseAdCopies(accumulatedText)
            setParsedAdCopies(parsedCopies)
          }
        } catch (streamError) {
        } finally {
          reader.releaseLock()
          setGeneratedWithNetwork(selectedAdNetwork) // Remember which network was used

          // Increment usage counter
          await incrementUsage('adcopy')

          // Complete progress
          setGenerationProgress(100)
          setProgressText('Complete!')
          setTimeout(() => {
            setGenerationProgress(0)
            setProgressText('')
          }, 1000)
        }
      } else {
        setError(response.error || 'Failed to generate text')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setTextLoading(false)
      setGenerationPhase(null)
    }
  }

  const handleLandingPageGeneration = async () => {
    if (!landingPagePrompt.trim()) return

    // Check usage limit
    if (!canGenerate('landing_page')) {
      setError('Insufficient Landing Page credits. Please purchase more to continue.')
      setCreditModalType('landing_page')
      setShowCreditModal(true)
      return
    }

    setLandingPageLoading(true)
    try {
      // Simulate AI landing page generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      setGeneratedLandingPage(`<div class="landing-page">
  <header class="hero-section">
    <h1>Generated Landing Page</h1>
    <p>Based on: "${landingPagePrompt}"</p>
  </header>
  <section class="features">
    <h2>Key Features</h2>
    <ul>
      <li>AI-powered content generation</li>
      <li>Responsive design</li>
      <li>Conversion optimized</li>
    </ul>
  </section>
</div>`)

      // Successfully generated landing page - decrement credits
      await incrementUsage('landing_page', 1)
    } catch (error) {
    } finally {
      setLandingPageLoading(false)
    }
  }

  // Atlas Shopify Components - Load external HTML files
  const [atlasSection01Html, setAtlasSection01Html] = useState<string>('')
  const [atlasSection02Html, setAtlasSection02Html] = useState<string>('')
  const [atlasSection03Html, setAtlasSection03Html] = useState<string>('')
  const [atlasSection04Html, setAtlasSection04Html] = useState<string>('')
  const [atlasSection05Html, setAtlasSection05Html] = useState<string>('')
  const [atlasSection06Html, setAtlasSection06Html] = useState<string>('')
  const [atlasSection07Html, setAtlasSection07Html] = useState<string>('')
  const [atlasSection08Html, setAtlasSection08Html] = useState<string>('')
  const [atlasSection09Html, setAtlasSection09Html] = useState<string>('')

  // Load section01.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection01 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section01.html')
        if (response.ok) {
          let html = await response.text()

          // Fix asset paths: only replace relative paths, not absolute URLs
          // Replace ./Atlas Shopify Store_files/ with Supabase URL
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          // Replace any remaining Atlas Shopify Store_files that aren't already in a URL
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          // Replace relative paths ./ that aren't already in a URL
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')

          // Remove integrity checks that are failing
          html = html.replace(/integrity="[^"]*"/g, '')

          setAtlasSection01Html(html)
        } else {
          console.error('❌ Failed to load section01.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section01.html - Error:', error)
      }
    }
    loadAtlasSection01()
  }, [activeTab])

  // Load section02.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection02 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section02.html')
        if (response.ok) {
          let html = await response.text()

          // Fix asset paths: only replace relative paths, not absolute URLs
          // Replace ./Atlas Shopify Store_files/ with Supabase URL
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          // Replace any remaining Atlas Shopify Store_files that aren't already in a URL
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          // Replace relative paths ./ that aren't already in a URL
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')

          // Remove integrity checks that are failing
          html = html.replace(/integrity="[^"]*"/g, '')

          console.log('🔧 Fixed asset paths in HTML to use Supabase URLs')
          setAtlasSection02Html(html)
        } else {
          console.error('❌ Failed to load section02.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section02.html - Error:', error)
      }
    }
    loadAtlasSection02()
  }, [activeTab])

  // Load section03.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection03 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section03.html')
        if (response.ok) {
          let html = await response.text()
          console.log('✅ Section03.html loaded successfully! Length:', html.length, 'characters')

          // Fix asset paths
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')
          html = html.replace(/integrity="[^"]*"/g, '')

          console.log('🔧 Fixed asset paths in HTML to use Supabase URLs')
          setAtlasSection03Html(html)
        } else {
          console.error('❌ Failed to load section03.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section03.html - Error:', error)
      }
    }
    loadAtlasSection03()
  }, [activeTab])

  // Load section04.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection04 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section04.html')
        if (response.ok) {
          let html = await response.text()
          console.log('✅ Section04.html loaded successfully! Length:', html.length, 'characters')

          // Fix asset paths
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')
          html = html.replace(/integrity="[^"]*"/g, '')

          console.log('🔧 Fixed asset paths in HTML to use Supabase URLs')
          setAtlasSection04Html(html)
        } else {
          console.error('❌ Failed to load section04.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section04.html - Error:', error)
      }
    }
    loadAtlasSection04()
  }, [activeTab])

  // Load section05.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection05 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section05.html')
        if (response.ok) {
          let html = await response.text()
          console.log('✅ Section05.html loaded successfully! Length:', html.length, 'characters')

          // Fix asset paths
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')
          html = html.replace(/integrity="[^"]*"/g, '')

          console.log('🔧 Fixed asset paths in HTML to use Supabase URLs')
          setAtlasSection05Html(html)
        } else {
          console.error('❌ Failed to load section05.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section05.html - Error:', error)
      }
    }
    loadAtlasSection05()
  }, [activeTab])

  // Load section06.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection06 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section06.html')
        if (response.ok) {
          let html = await response.text()
          console.log('✅ Section06.html loaded successfully! Length:', html.length, 'characters')

          // Fix asset paths
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')
          html = html.replace(/integrity="[^"]*"/g, '')

          console.log('🔧 Fixed asset paths in HTML to use Supabase URLs')
          setAtlasSection06Html(html)
        } else {
          console.error('❌ Failed to load section06.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section06.html - Error:', error)
      }
    }
    loadAtlasSection06()
  }, [activeTab])

  // Load section07.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection07 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section07.html')
        if (response.ok) {
          let html = await response.text()
          console.log('✅ Section07.html loaded successfully! Length:', html.length, 'characters')

          // Fix asset paths
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')
          html = html.replace(/integrity="[^"]*"/g, '')

          console.log('🔧 Fixed asset paths in HTML to use Supabase URLs')
          setAtlasSection07Html(html)
        } else {
          console.error('❌ Failed to load section07.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section07.html - Error:', error)
      }
    }
    loadAtlasSection07()
  }, [activeTab])

  // Load section08.html on component mount (only for landing page)
  useEffect(() => {
    if (activeTab !== 'landing-page') return

    const loadAtlasSection08 = async () => {
      try {
        const response = await fetch('https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/section08.html')
        if (response.ok) {
          let html = await response.text()
          console.log('✅ Section08.html loaded successfully! Length:', html.length, 'characters')

          // Fix asset paths
          html = html.replace(/\.\/Atlas Shopify Store_files\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/')
          html = html.replace(/(?<!https:\/\/[^\s"']*\/)Atlas Shopify Store_files/g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets')
          html = html.replace(/(?<!https:\/\/[^\s"']*)\.\//g, 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/')
          html = html.replace(/integrity="[^"]*"/g, '')

          console.log('🔧 Fixed asset paths in HTML to use Supabase URLs')
          setAtlasSection08Html(html)
        } else {
          console.error('❌ Failed to load section08.html - Response not OK:', response.status)
        }
      } catch (error) {
        console.error('❌ Failed to load section08.html - Error:', error)
      }
    }
    loadAtlasSection08()
  }, [activeTab])


  // Atlas Shopify Components - memoized to update when HTML sections load
  const atlasShopifyComponents = useMemo(() => ({
    0: {
      title: 'Global Styles (Required)',
      description: 'CSS styles required for all sections',
      html: `<style>:root{--font-body-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;--color-base-accent-3:155,154,156;--buttons-radius:10px;--media-radius:12px;}body{font-family:var(--font-body-family);background-color:#fff;margin:0;padding:0;}.product__info-container{padding:20px;max-width:600px;margin:0 auto;}h1{font-size:28px;line-height:36px;color:#000;margin:16px 0;}.product__text{font-size:12px;line-height:22px;color:inherit;margin:8px 0;}.emoji-benefits-container ul{list-style:none;padding:0;margin:16px 0;}.emoji-benefits-container li{display:flex;align-items:center;gap:8px;margin:8px 0;}.material-symbols-outlined{font-size:18px;color:rgb(var(--color-base-accent-3));}button.atc-button{background:rgb(var(--color-base-accent-3));color:#fff;border:none;border-radius:var(--buttons-radius);padding:12px 24px;font-size:16px;font-weight:600;cursor:pointer;width:100%;margin:16px 0;}button.atc-button:hover{opacity:0.9;}.product__media{border-radius:var(--media-radius);overflow:hidden;margin:16px 0;}</style>`
    },
    1: {
      title: 'Product Section',
      description: 'Main product gallery and information section - loaded from section01.html',
      html: atlasSection01Html
    },
    2: {
      title: 'Hero Banner Section',
      description: 'Animated hero banner with key messages - loaded from section02.html',
      html: atlasSection02Html
    },
    3: {
      title: 'Section 3',
      description: 'Additional content section - loaded from section03.html',
      html: atlasSection03Html
    },
    4: {
      title: 'Section 4',
      description: 'Additional content section - loaded from section04.html',
      html: atlasSection04Html
    },
    5: {
      title: 'Section 5',
      description: 'Additional content section - loaded from section05.html',
      html: atlasSection05Html
    },
    6: {
      title: 'Section 6',
      description: 'Additional content section - loaded from section06.html',
      html: atlasSection06Html
    },
    7: {
      title: 'Section 7',
      description: 'Additional content section - loaded from section07.html',
      html: atlasSection07Html
    },
    8: {
      title: 'Section 8',
      description: 'Additional content section - loaded from section08.html',
      html: atlasSection08Html
    },

  }), [atlasSection01Html, atlasSection02Html, atlasSection03Html, atlasSection04Html, atlasSection05Html, atlasSection06Html, atlasSection07Html, atlasSection08Html])

  // Initialize landing page preview when all sections are loaded
  useEffect(() => {
    if (activeTab === 'landing-page') {
      // Check if all Atlas sections are loaded
      const allSectionsLoaded = atlasSection01Html && atlasSection02Html && atlasSection03Html &&
        atlasSection04Html && atlasSection05Html && atlasSection06Html &&
        atlasSection07Html && atlasSection08Html;

      if (addedLandingPageComponents.length === 0 && allSectionsLoaded) {
        // Initialize with all components only after sections are loaded
        const allComponentKeys = Object.keys(atlasShopifyComponents).map(Number);
        setAddedLandingPageComponents(allComponentKeys);
        // Force immediate update with the new components
        setTimeout(() => updateLandingPagePreview(allComponentKeys), 0);
      } else if (addedLandingPageComponents.length > 0) {
        // Update preview whenever components change
        updateLandingPagePreview(addedLandingPageComponents);
      }
    }
  }, [activeTab, addedLandingPageComponents, atlasSection01Html, atlasSection02Html, atlasSection03Html, atlasSection04Html, atlasSection05Html, atlasSection06Html, atlasSection07Html, atlasSection08Html, atlasShopifyComponents])

  // Function to sync all fields from landing page
  const syncAllFieldsFromLandingPage = () => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    // Helper function to check and sync text fields
    const syncTextField = (element: Element | null, currentValue: string, setter: (value: string) => void) => {
      if (!element) return
      const newValue = element.textContent?.trim()
      if (newValue && newValue !== currentValue) {
        setter(newValue)
      }
    }

    // Sync Product Title
    const titleElement = iframeDoc.getElementById('block-heading-title')
    syncTextField(titleElement, productTitle, setProductTitle)

    // Sync Product Price
    const priceElement = iframeDoc.querySelector('.price-item.price-item--sale.price-item--last')
    if (priceElement) {
      const priceText = priceElement.textContent?.trim() || '$0.00'
      const priceMatch = priceText.match(/\d+(?:\.\d{2})?/)
      const newPrice = priceMatch ? priceMatch[0] : '0'
      if (newPrice && newPrice !== productPrice) {
        setProductPrice(newPrice)
      }
    }

    // Sync Tagline 1
    const tagline1Element = iframeDoc.getElementById('product-tagline-1')
    syncTextField(tagline1Element, productTagline1, setProductTagline1)

    // Sync Tagline 2
    const tagline2Element = iframeDoc.getElementById('product-tagline-2')
    syncTextField(tagline2Element, productTagline2, setProductTagline2)

    // Sync Icon Bullet Points
    const bulletDivs = iframeDoc.querySelectorAll('.bullet-point-text')
    const bulletValues = [iconBullet1, iconBullet2, iconBullet3, iconBullet4, iconBullet5]
    const bulletSetters = [setIconBullet1, setIconBullet2, setIconBullet3, setIconBullet4, setIconBullet5]
    bulletDivs.forEach((div, index) => {
      if (index < bulletSetters.length) {
        syncTextField(div, bulletValues[index], bulletSetters[index])
      }
    })

    // Sync Product Description & Description Points
    const panelDiv = iframeDoc.querySelector('.panelStyle-collapsible_tab_TgYBPV')
    if (panelDiv) {
      const descriptionP = panelDiv.querySelector('p')
      syncTextField(descriptionP, productDescription, setProductDescription)

      const listItems = panelDiv.querySelectorAll('li')
      const descValues = [descPoint1, descPoint2, descPoint3, descPoint4]
      const descSetters = [setDescPoint1, setDescPoint2, setDescPoint3, setDescPoint4]
      listItems.forEach((li, index) => {
        if (index < descSetters.length) {
          syncTextField(li, descValues[index], descSetters[index])
        }
      })
    }

    // Sync Key Features Heading & Points
    const keyFeaturesSection = iframeDoc.querySelector('#section-text-template--25004712951940__key_features_DyQXbd')
    if (keyFeaturesSection) {
      const heading = keyFeaturesSection.querySelector('#heading-template--25004712951940__key_features_DyQXbd')
      syncTextField(heading, keyFeaturesHeading, setKeyFeaturesHeading)

      const listItems = keyFeaturesSection.querySelectorAll('li p')
      const keyValues = [keyPoint1, keyPoint2, keyPoint3, keyPoint4]
      const keySetters = [setKeyPoint1, setKeyPoint2, setKeyPoint3, setKeyPoint4]
      listItems.forEach((p, index) => {
        if (index < keySetters.length) {
          syncTextField(p, keyValues[index], keySetters[index])
        }
      })
    }

    // Sync Image with Text 1 (Headline, Paragraph, and 3 Bullets)
    const imageWithText1Section = iframeDoc.querySelector('#ImageWithText--template--25052850749572__image_with_text_Yq9V8p')
    if (imageWithText1Section) {
      const heading = imageWithText1Section.querySelector('#block-heading-template--25052850749572__image_with_text_Yq9V8p')
      syncTextField(heading, imageText1Headline, setImageText1Headline)

      const descriptionDiv = imageWithText1Section.querySelector('#block-description-text-template--25052850749572__image_with_text_Yq9V8p')
      if (descriptionDiv) {
        const paragraphs = descriptionDiv.querySelectorAll('p')
        if (paragraphs.length > 0) {
          const mainParagraph = paragraphs[0]
          syncTextField(mainParagraph, imageText1Paragraph, setImageText1Paragraph)
        }

        // Sync the 3 bullet points (usually after the main paragraph with checkmark emoji)
        const bulletValues = [imageText1Bullet1, imageText1Bullet2, imageText1Bullet3]
        const bulletSetters = [setImageText1Bullet1, setImageText1Bullet2, setImageText1Bullet3]
        let bulletIndex = 0
        paragraphs.forEach((p, index) => {
          if (index > 0 && bulletIndex < 3) { // Skip first paragraph (main text)
            const rawText = p.textContent || ''
            const bulletText = rawText.replace(/^✔\s*/, '').trim() // Remove checkmark if present
            if (bulletText && bulletIndex < bulletSetters.length) {
              // Only sync if the cleaned text differs from the stored value
              if (bulletText !== bulletValues[bulletIndex]) {
                bulletSetters[bulletIndex](bulletText)
              }
              bulletIndex++
            }
          }
        })
      }
    }

    // Sync Horizontal Scrolling Images Heading
    const scrollingHeading = iframeDoc.querySelector('#scrolling-images-slider-heading')
    syncTextField(scrollingHeading, horizontalScrollHeading, setHorizontalScrollHeading)

    // Sync Image with Text 2 (Headline, Paragraph, and 3 Bullets)
    const imageWithText2Section = iframeDoc.querySelector('#ImageWithText--template--25004712951940__image_with_text_Kk3rrW')
    if (imageWithText2Section) {
      const heading = imageWithText2Section.querySelector('#block-heading-template--25004712951940__image_with_text_Kk3rrW')
      syncTextField(heading, imageText2Headline, setImageText2Headline)

      const descriptionDiv = imageWithText2Section.querySelector('#block-description-text-template--25004712951940__image_with_text_Kk3rrW')
      if (descriptionDiv) {
        const paragraphs = descriptionDiv.querySelectorAll('p')
        if (paragraphs.length > 0) {
          const mainParagraph = paragraphs[0]
          syncTextField(mainParagraph, imageText2Paragraph, setImageText2Paragraph)
        }

        // Sync the 3 bullet points
        const bulletValues = [imageText2Bullet1, imageText2Bullet2, imageText2Bullet3]
        const bulletSetters = [setImageText2Bullet1, setImageText2Bullet2, setImageText2Bullet3]
        let bulletIndex = 0
        paragraphs.forEach((p, index) => {
          if (index > 0 && bulletIndex < 3) {
            const rawText = p.textContent || ''
            const bulletText = rawText.replace(/^✔\s*/, '').trim()
            if (bulletText && bulletIndex < bulletSetters.length) {
              if (bulletText !== bulletValues[bulletIndex]) {
                bulletSetters[bulletIndex](bulletText)
              }
              bulletIndex++
            }
          }
        })
      }
    }

    // Sync Horizontal Scrolling Text (4 items)
    const scrollingTextSection = iframeDoc.querySelector('.horizontal-scrolling-text-template--25121820475524__horizontal_scrolling_text_mgft6H')
    if (scrollingTextSection) {
      const loopContainers = scrollingTextSection.querySelectorAll('.horizontal-scrolling-text__loop_container-template--25121820475524__horizontal_scrolling_text_mgft6H')
      if (loopContainers.length > 0) {
        const firstContainer = loopContainers[0]
        const items = firstContainer.querySelectorAll('.horizontal-scrolling-text__item-template--25121820475524__horizontal_scrolling_text_mgft6H')
        const scrollTextValues = [horizScrollText1, horizScrollText2, horizScrollText3, horizScrollText4]
        const scrollTextSetters = [setHorizScrollText1, setHorizScrollText2, setHorizScrollText3, setHorizScrollText4]

        items.forEach((item, index) => {
          if (index < scrollTextSetters.length) {
            syncTextField(item, scrollTextValues[index], scrollTextSetters[index])
          }
        })
      }
    }

    // Sync Rich Text Section (Headline and Paragraph)
    const richTextHeading = iframeDoc.querySelector('#section-heading-template--25004712951940__rich_text_rPfaL7')
    syncTextField(richTextHeading, richTextHeadline, setRichTextHeadline)

    const richTextDiv = iframeDoc.querySelector('#rich-text__text-template--25004712951940__rich_text_rPfaL7')
    if (richTextDiv) {
      const richTextP = richTextDiv.querySelector('p')
      syncTextField(richTextP, richTextParagraph, setRichTextParagraph)
    }

    // Sync Reasons to Buy Section (Heading and 4 stat blocks)
    const reasonsHeading = iframeDoc.querySelector('.reasons-to-buy__heading')
    syncTextField(reasonsHeading, reasonsBuyHeading, setReasonsBuyHeading)

    const statCards = iframeDoc.querySelectorAll('.reasons-to-buy__content-inner-item.reasons-to-buy__points')
    if (statCards.length >= 4) {
      const statSubheadValues = [statSubhead1, statSubhead2, statSubhead3, statSubhead4]
      const statSubheadSetters = [setStatSubhead1, setStatSubhead2, setStatSubhead3, setStatSubhead4]
      const statSentenceValues = [statSentence1, statSentence2, statSentence3, statSentence4]
      const statSentenceSetters = [setStatSentence1, setStatSentence2, setStatSentence3, setStatSentence4]

      statCards.forEach((card, index) => {
        if (index < 4) {
          const subheadP = card.querySelector('.stats-title p')
          const sentenceP = card.querySelector('.stats-body-text p')
          syncTextField(subheadP, statSubheadValues[index], statSubheadSetters[index])
          syncTextField(sentenceP, statSentenceValues[index], statSentenceSetters[index])
        }
      })
    }

    // Sync Comparison Section (Heading, Description, and 5 rows)
    const comparisonHeadingEl = iframeDoc.querySelector('#heading-template--25034331193476__comparison_table_9YADnf')
    syncTextField(comparisonHeadingEl, comparisonHeading, setComparisonHeading)

    const comparisonDescDiv = iframeDoc.querySelector('#section-body-text-template--25034331193476__comparison_table_9YADnf')
    if (comparisonDescDiv) {
      const comparisonDescP = comparisonDescDiv.querySelector('p')
      syncTextField(comparisonDescP, comparisonDescription, setComparisonDescription)
    }

    const comparisonRows = iframeDoc.querySelectorAll('.comparison-table-template--25034331193476__comparison_table_9YADnf tbody tr')
    if (comparisonRows.length >= 5) {
      const rowValues = [comparisonRow1, comparisonRow2, comparisonRow3, comparisonRow4, comparisonRow5]
      const rowSetters = [setComparisonRow1, setComparisonRow2, setComparisonRow3, setComparisonRow4, setComparisonRow5]

      comparisonRows.forEach((row, index) => {
        if (index < 5) {
          const featureCell = row.querySelector('.feature-cell')
          syncTextField(featureCell, rowValues[index], rowSetters[index])
        }
      })
    }

    // Sync Reviews Section Heading
    const reviewsHeadingEl = iframeDoc.querySelector('#sectionHeadingtemplate--25004712951940__testimonials_2_nHX7mT')
    syncTextField(reviewsHeadingEl, reviewsHeading, setReviewsHeading)

    // Sync Icon Guarantees (4 points)
    const iconGuaranteeCards = iframeDoc.querySelectorAll('#section-template--25004712951940__feature_icons_DUbgp7 .feature-icon-card')
    if (iconGuaranteeCards.length >= 4) {
      const guaranteeValues = [iconGuarantee1, iconGuarantee2, iconGuarantee3, iconGuarantee4]
      const guaranteeSetters = [setIconGuarantee1, setIconGuarantee2, setIconGuarantee3, setIconGuarantee4]

      iconGuaranteeCards.forEach((card, index) => {
        if (index < 4) {
          const textDiv = card.querySelector('.feature-icon-card__text')
          if (textDiv) {
            const firstP = textDiv.querySelector('p:first-child')
            syncTextField(firstP, guaranteeValues[index], guaranteeSetters[index])
          }
        }
      })
    }

    // Sync Satisfaction Guarantee Paragraph
    const satisfactionDiv = iframeDoc.querySelector('#block-description-text-template--25004712951940__image_with_text_UL996X')
    if (satisfactionDiv) {
      const satisfactionP = satisfactionDiv.querySelector('p')
      syncTextField(satisfactionP, satisfactionParagraph, setSatisfactionParagraph)
    }

    // Sync Most Common Questions (3 Q&A pairs using IDs)
    const commonQ1El = iframeDoc.getElementById('common-question-1')
    syncTextField(commonQ1El, commonQ1, setCommonQ1)

    const commonA1El = iframeDoc.getElementById('common-answer-1')
    syncTextField(commonA1El, commonA1, setCommonA1)

    const commonQ2El = iframeDoc.getElementById('common-question-2')
    syncTextField(commonQ2El, commonQ2, setCommonQ2)

    const commonA2El = iframeDoc.getElementById('common-answer-2')
    syncTextField(commonA2El, commonA2, setCommonA2)

    const commonQ3El = iframeDoc.getElementById('common-question-3')
    syncTextField(commonQ3El, commonQ3, setCommonQ3)

    const commonA3El = iframeDoc.getElementById('common-answer-3')
    syncTextField(commonA3El, commonA3, setCommonA3)

    // Sync FAQ Section (5 Q&A pairs)
    const faqContainers = iframeDoc.querySelectorAll('.singleAccordianContainer-template--25004712657028__collapsible_content_YWm968')
    if (faqContainers.length >= 5) {
      const faqQValues = [faqQ1, faqQ2, faqQ3, faqQ4, faqQ5]
      const faqQSetters = [setFaqQ1, setFaqQ2, setFaqQ3, setFaqQ4, setFaqQ5]
      const faqAValues = [faqA1, faqA2, faqA3, faqA4, faqA5]
      const faqASetters = [setFaqA1, setFaqA2, setFaqA3, setFaqA4, setFaqA5]

      faqContainers.forEach((container, index) => {
        if (index < 5) {
          const questionSpan = container.querySelector('.collapsibleTitleSpan-template--25004712657028__collapsible_content_YWm968')
          syncTextField(questionSpan, faqQValues[index], faqQSetters[index])

          const answerPanel = container.querySelector('.panelStyle-template--25004712657028__collapsible_content_YWm968')
          if (answerPanel) {
            const answerP = answerPanel.querySelector('p')
            syncTextField(answerP, faqAValues[index], faqASetters[index])
          }
        }
      })
    }
  }

  // Auto-sync every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncAllFieldsFromLandingPage()
    }, 10000)

    return () => clearInterval(interval)
  }, [productTitle, productPrice, productTagline1, productTagline2, iconBullet1, iconBullet2, iconBullet3, iconBullet4, iconBullet5, productDescription, descPoint1, descPoint2, descPoint3, descPoint4, keyFeaturesHeading, keyPoint1, keyPoint2, keyPoint3, keyPoint4, imageText1Headline, imageText1Paragraph, imageText1Bullet1, imageText1Bullet2, imageText1Bullet3, horizontalScrollHeading, imageText2Headline, imageText2Paragraph, imageText2Bullet1, imageText2Bullet2, imageText2Bullet3, horizScrollText1, horizScrollText2, horizScrollText3, horizScrollText4, richTextHeadline, richTextParagraph, reasonsBuyHeading, statSubhead1, statSentence1, statSubhead2, statSentence2, statSubhead3, statSentence3, statSubhead4, statSentence4, comparisonHeading, comparisonDescription, comparisonRow1, comparisonRow2, comparisonRow3, comparisonRow4, comparisonRow5, reviewsHeading, iconGuarantee1, iconGuarantee2, iconGuarantee3, iconGuarantee4, satisfactionParagraph, commonQ1, commonA1, commonQ2, commonA2, commonQ3, commonA3, faqQ1, faqA1, faqQ2, faqA2, faqQ3, faqA3, faqQ4, faqA4, faqQ5, faqA5])

  // Load all components on initial page mount
  useEffect(() => {
    // Wait for all sections to load, then trigger initial preview
    if (atlasSection01Html && atlasSection02Html && atlasSection03Html &&
      atlasSection04Html && atlasSection05Html && atlasSection06Html &&
      atlasSection07Html && atlasSection08Html && atlasSection09Html) {
      console.log('🚀 All sections loaded, initializing preview with all components')

      // Initialize cache for all components
      const initialCache: { [key: number]: string } = {}
      for (let i = 0; i <= 9; i++) {
        const component = atlasShopifyComponents[i as keyof typeof atlasShopifyComponents]
        if (component?.html) {
          initialCache[i] = component.html
        }
      }
      setComponentHtmlCache(initialCache)

      // First, turn off the first component (remove it from the list)
      console.log('🔄 Toggling first component off...')
      setAddedLandingPageComponents([0, 2, 3, 4, 5, 6, 7, 8, 9])
      updateLandingPagePreview([0, 2, 3, 4, 5, 6, 7, 8, 9])

      // Then turn it back on after a brief moment
      setTimeout(() => {
        console.log('🔄 Toggling first component back on...')
        setAddedLandingPageComponents([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        updateLandingPagePreview([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      }, 100)
    }
  }, [atlasSection01Html, atlasSection02Html, atlasSection03Html, atlasSection04Html,
    atlasSection05Html, atlasSection06Html, atlasSection07Html, atlasSection08Html, atlasSection09Html])

  // Update product title in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const titleElement = iframeDoc.getElementById('block-heading-title')
        if (titleElement) {
          titleElement.textContent = productTitle
        }
      }
    }
  }, [productTitle])

  // Watch for ANY changes to product title in iframe using MutationObserver
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const titleElement = iframeDoc.getElementById('block-heading-title')
    if (!titleElement) return

    // Create MutationObserver to watch for text content changes
    const observer = new MutationObserver(() => {
      const newTitle = titleElement.textContent?.trim()
      if (newTitle && newTitle !== productTitle) {
        console.log('📝 Product title changed in iframe:', newTitle)
        setProductTitle(newTitle)
      }
    })

    // Watch for changes to text content and child nodes
    observer.observe(titleElement, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    // Also sync current text on mount
    const currentTitle = titleElement.textContent?.trim()
    if (currentTitle && currentTitle !== productTitle) {
      setProductTitle(currentTitle)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Update product price in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const priceElement = iframeDoc.querySelector('.price-item.price-item--sale.price-item--last')
        if (priceElement) {
          const formattedPrice = productPrice ? `$${parseFloat(productPrice).toFixed(2)}` : '$0.00'
          priceElement.textContent = formattedPrice
        }
      }
    }
  }, [productPrice])

  // Watch for ANY changes to product price in iframe using MutationObserver
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const priceElement = iframeDoc.querySelector('.price-item.price-item--sale.price-item--last')
    if (!priceElement) return

    // Create MutationObserver to watch for price changes
    const observer = new MutationObserver(() => {
      const priceText = priceElement.textContent?.trim() || '$0.00'
      // Extract just the number from the price (e.g., "$99.99" -> "99.99")
      const priceMatch = priceText.match(/\d+(?:\.\d{2})?/)
      const newPrice = priceMatch ? priceMatch[0] : '0'

      if (newPrice && newPrice !== productPrice) {
        console.log('💰 Product price changed in iframe:', newPrice)
        setProductPrice(newPrice)
      }
    })

    // Watch for changes to text content and child nodes
    observer.observe(priceElement, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    // Also sync current price on mount
    const currentPriceText = priceElement.textContent?.trim() || '$0.00'
    const priceMatch = currentPriceText.match(/\d+(?:\.\d{2})?/)
    const currentPrice = priceMatch ? priceMatch[0] : '0'
    if (currentPrice && currentPrice !== productPrice) {
      setProductPrice(currentPrice)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Update sale price currency symbol in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current && salePrice) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const salePriceElement = iframeDoc.querySelector('.price-item.price-item--sale.price-item--last')
        if (salePriceElement) {
          const currentText = salePriceElement.textContent || '$0.00'
          // Extract the price number (e.g., "0.00" from "$0.00")
          const priceMatch = currentText.match(/(\d+\.?\d*)/)
          const priceNumber = priceMatch ? priceMatch[1] : '0.00'
          // Replace only the currency symbol
          salePriceElement.textContent = salePrice + priceNumber
        }

        // Also update compare price with the same symbol
        const comparePriceElement = iframeDoc.querySelector('.price-item.price-item--regular')
        if (comparePriceElement) {
          const currentText = comparePriceElement.textContent || '$0.00'
          // Extract the price number (e.g., "0.00" from "$0.00")
          const priceMatch = currentText.match(/(\d+\.?\d*)/)
          const priceNumber = priceMatch ? priceMatch[1] : '0.00'
          // Replace only the currency symbol
          comparePriceElement.textContent = salePrice + priceNumber
        }
      }
    }
  }, [salePrice])

  // Watch for ANY changes to sale price in iframe using MutationObserver
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const salePriceElement = iframeDoc.querySelector('.price-item.price-item--sale.price-item--last')
    if (!salePriceElement) return

    // Create MutationObserver to watch for price changes
    const observer = new MutationObserver(() => {
      const priceText = salePriceElement.textContent?.trim() || '$0.00'
      // Extract only the currency symbol (first non-digit character)
      const symbolMatch = priceText.match(/^([^\d\s]+)/)
      const currentSymbol = symbolMatch ? symbolMatch[1] : '$'

      if (currentSymbol !== salePrice) {
        console.log('💰 Price currency symbol changed in iframe:', currentSymbol)
        setSalePrice(currentSymbol)
        setComparePrice(currentSymbol)
      }
    })

    // Watch for changes to text content and child nodes
    observer.observe(salePriceElement, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    // Also sync current currency symbol on mount
    const currentPriceText = salePriceElement.textContent?.trim() || '$0.00'
    const symbolMatch = currentPriceText.match(/^([^\d\s]+)/)
    const currentSymbol = symbolMatch ? symbolMatch[1] : '$'
    if (currentSymbol && currentSymbol !== salePrice) {
      setSalePrice(currentSymbol)
      setComparePrice(currentSymbol)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for ANY changes to compare price in iframe using MutationObserver (for syncing)
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const comparePriceElement = iframeDoc.querySelector('.price-item.price-item--regular')
    if (!comparePriceElement) return

    // Create MutationObserver to watch for price changes
    const observer = new MutationObserver(() => {
      const priceText = comparePriceElement.textContent?.trim() || '$0.00'
      // Extract only the currency symbol (first non-digit character)
      const symbolMatch = priceText.match(/^([^\d\s]+)/)
      const currentSymbol = symbolMatch ? symbolMatch[1] : '$'

      if (currentSymbol !== comparePrice) {
        console.log('💰 Compare price currency symbol changed in iframe:', currentSymbol)
        setComparePrice(currentSymbol)
        setSalePrice(currentSymbol)
      }
    })

    // Watch for changes to text content and child nodes
    observer.observe(comparePriceElement, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    // Also sync current currency symbol on mount
    const currentPriceText = comparePriceElement.textContent?.trim() || '$0.00'
    const symbolMatch = currentPriceText.match(/^([^\d\s]+)/)
    const currentSymbol = symbolMatch ? symbolMatch[1] : '$'
    if (currentSymbol && currentSymbol !== comparePrice) {
      setComparePrice(currentSymbol)
      setSalePrice(currentSymbol)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Update product tagline 1 in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const tagline1Element = iframeDoc.getElementById('product-tagline-1')
        if (tagline1Element) {
          tagline1Element.textContent = productTagline1
        }
      }
    }
  }, [productTagline1])

  // Watch for changes to product tagline 1 in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const tagline1Element = iframeDoc.getElementById('product-tagline-1') as HTMLElement
    if (!tagline1Element) return

    const observer = new MutationObserver(() => {
      const newTagline1 = tagline1Element.textContent?.trim()
      if (newTagline1 && newTagline1 !== productTagline1) {
        console.log('🏷️ Product tagline 1 changed in iframe:', newTagline1)
        setProductTagline1(newTagline1)
      }
    })

    observer.observe(tagline1Element, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    const currentTagline1 = tagline1Element.textContent?.trim()
    if (currentTagline1 && currentTagline1 !== productTagline1) {
      setProductTagline1(currentTagline1)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Update product tagline 2 in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const tagline2Element = iframeDoc.getElementById('product-tagline-2')
        if (tagline2Element) {
          tagline2Element.textContent = productTagline2
        }
      }
    }
  }, [productTagline2])

  // Watch for changes to product tagline 2 in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const tagline2Element = iframeDoc.getElementById('product-tagline-2') as HTMLElement
    if (!tagline2Element) return

    const observer = new MutationObserver(() => {
      const newTagline2 = tagline2Element.textContent?.trim()
      if (newTagline2 && newTagline2 !== productTagline2) {
        console.log('🏷️ Product tagline 2 changed in iframe:', newTagline2)
        setProductTagline2(newTagline2)
      }
    })

    observer.observe(tagline2Element, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    const currentTagline2 = tagline2Element.textContent?.trim()
    if (currentTagline2 && currentTagline2 !== productTagline2) {
      setProductTagline2(currentTagline2)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Update icon bullet points in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const bulletDivs = iframeDoc.querySelectorAll('.bullet-point-text')
        const bullets = [iconBullet1, iconBullet2, iconBullet3, iconBullet4, iconBullet5]
        bulletDivs.forEach((div, index) => {
          if (index < bullets.length) {
            div.textContent = bullets[index]
          }
        })
      }
    }
  }, [iconBullet1, iconBullet2, iconBullet3, iconBullet4, iconBullet5])

  // Watch for ANY changes to icon bullet points in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const bulletDivs = iframeDoc.querySelectorAll('.bullet-point-text') as NodeListOf<HTMLElement>
    if (bulletDivs.length === 0) return

    const bulletTexts = [iconBullet1, iconBullet2, iconBullet3, iconBullet4, iconBullet5]
    const setters = [setIconBullet1, setIconBullet2, setIconBullet3, setIconBullet4, setIconBullet5]

    bulletDivs.forEach((div, index) => {
      const observer = new MutationObserver(() => {
        const newBullet = (div as HTMLElement).textContent?.trim()
        if (newBullet && newBullet !== bulletTexts[index] && setters[index]) {
          console.log(`📍 Icon bullet ${index + 1} changed in iframe:`, newBullet)
          setters[index](newBullet)
        }
      })

      observer.observe(div, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentBullet = (div as HTMLElement).textContent?.trim()
      if (currentBullet && currentBullet !== bulletTexts[index]) {
        setters[index](currentBullet)
      }
    })
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Update product description in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const panelDiv = iframeDoc.querySelector('.panelStyle-collapsible_tab_TgYBPV')
        if (panelDiv) {
          const descriptionP = panelDiv.querySelector('p')
          if (descriptionP) {
            descriptionP.textContent = productDescription
          }
        }
      }
    }
  }, [productDescription])

  // Update description points in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const panelDiv = iframeDoc.querySelector('.panelStyle-collapsible_tab_TgYBPV')
        if (panelDiv) {
          const listItems = panelDiv.querySelectorAll('li')
          const descPoints = [descPoint1, descPoint2, descPoint3, descPoint4]
          listItems.forEach((li, index) => {
            if (index < descPoints.length) {
              li.textContent = descPoints[index]
            }
          })
        }
      }
    }
  }, [descPoint1, descPoint2, descPoint3, descPoint4])

  // Watch for ANY changes to product description in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const panelDiv = iframeDoc.querySelector('.panelStyle-collapsible_tab_TgYBPV')
    if (!panelDiv) return

    const descriptionP = panelDiv.querySelector('p') as HTMLElement | null
    if (!descriptionP) return

    const observer = new MutationObserver(() => {
      const newDesc = (descriptionP as HTMLElement).textContent?.trim()
      if (newDesc && newDesc !== productDescription) {
        console.log('📋 Product description changed in iframe:', newDesc)
        setProductDescription(newDesc)
      }
    })

    observer.observe(descriptionP, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    const currentDesc = (descriptionP as HTMLElement).textContent?.trim()
    if (currentDesc && currentDesc !== productDescription) {
      setProductDescription(currentDesc)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for ANY changes to description points in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const panelDiv = iframeDoc.querySelector('.panelStyle-collapsible_tab_TgYBPV')
    if (!panelDiv) return

    const listItems = panelDiv.querySelectorAll('li') as NodeListOf<HTMLElement>
    if (listItems.length === 0) return

    const descPointTexts = [descPoint1, descPoint2, descPoint3, descPoint4]
    const setters = [setDescPoint1, setDescPoint2, setDescPoint3, setDescPoint4]

    listItems.forEach((li, index) => {
      if (index >= setters.length) return

      const observer = new MutationObserver(() => {
        const newPoint = (li as HTMLElement).textContent?.trim()
        if (newPoint && newPoint !== descPointTexts[index]) {
          console.log(`📚 Description point ${index + 1} changed in iframe:`, newPoint)
          setters[index](newPoint)
        }
      })

      observer.observe(li, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentPoint = (li as HTMLElement).textContent?.trim()
      if (currentPoint && currentPoint !== descPointTexts[index]) {
        setters[index](currentPoint)
      }
    })
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to horizontal scrolling text in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const scrollingTextSection = iframeDoc.querySelector('.horizontal-scrolling-text-template--25121820475524__horizontal_scrolling_text_mgft6H')
    if (!scrollingTextSection) return

    const loopContainers = scrollingTextSection.querySelectorAll('.horizontal-scrolling-text__loop_container-template--25121820475524__horizontal_scrolling_text_mgft6H')
    if (loopContainers.length === 0) return

    const firstContainer = loopContainers[0]
    const items = firstContainer.querySelectorAll('.horizontal-scrolling-text__item-template--25121820475524__horizontal_scrolling_text_mgft6H') as NodeListOf<HTMLElement>
    if (items.length === 0) return

    const scrollTexts = [horizScrollText1, horizScrollText2, horizScrollText3, horizScrollText4]
    const setters = [setHorizScrollText1, setHorizScrollText2, setHorizScrollText3, setHorizScrollText4]

    items.forEach((item, index) => {
      if (index >= setters.length) return

      const observer = new MutationObserver(() => {
        const strongTag = item.querySelector('strong')
        const newText = (strongTag ? strongTag.textContent : item.textContent)?.trim()
        if (newText && newText !== scrollTexts[index]) {
          console.log(`📜 Scrolling text ${index + 1} changed in iframe:`, newText)
          setters[index](newText)
        }
      })

      observer.observe(item, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const strongTag = item.querySelector('strong')
      const currentText = (strongTag ? strongTag.textContent : item.textContent)?.trim()
      if (currentText && currentText !== scrollTexts[index]) {
        setters[index](currentText)
      }
    })
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to rich text section in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const richTextHeading = iframeDoc.querySelector('#section-heading-template--25004712951940__rich_text_rPfaL7') as HTMLElement
    if (richTextHeading) {
      const observer = new MutationObserver(() => {
        const newText = richTextHeading.textContent?.trim()
        if (newText && newText !== richTextHeadline) {
          console.log(`📝 Rich text headline changed in iframe:`, newText)
          setRichTextHeadline(newText)
        }
      })

      observer.observe(richTextHeading, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentText = richTextHeading.textContent?.trim()
      if (currentText && currentText !== richTextHeadline) {
        setRichTextHeadline(currentText)
      }
    }

    const richTextDiv = iframeDoc.querySelector('#rich-text__text-template--25004712951940__rich_text_rPfaL7')
    if (richTextDiv) {
      const richTextP = richTextDiv.querySelector('p') as HTMLElement
      if (richTextP) {
        const observer = new MutationObserver(() => {
          const newText = richTextP.textContent?.trim()
          if (newText && newText !== richTextParagraph) {
            console.log(`📝 Rich text paragraph changed in iframe:`, newText)
            setRichTextParagraph(newText)
          }
        })

        observer.observe(richTextP, {
          characterData: true,
          childList: true,
          subtree: true,
          attributes: false
        })

        const currentText = richTextP.textContent?.trim()
        if (currentText && currentText !== richTextParagraph) {
          setRichTextParagraph(currentText)
        }
      }
    }
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to reasons to buy section in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const reasonsHeading = iframeDoc.querySelector('.reasons-to-buy__heading') as HTMLElement
    if (reasonsHeading) {
      const observer = new MutationObserver(() => {
        const newText = reasonsHeading.textContent?.trim()
        if (newText && newText !== reasonsBuyHeading) {
          console.log(`📊 Reasons heading changed in iframe:`, newText)
          setReasonsBuyHeading(newText)
        }
      })

      observer.observe(reasonsHeading, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentText = reasonsHeading.textContent?.trim()
      if (currentText && currentText !== reasonsBuyHeading) {
        setReasonsBuyHeading(currentText)
      }
    }

    const statCards = iframeDoc.querySelectorAll('.reasons-to-buy__content-inner-item.reasons-to-buy__points') as NodeListOf<HTMLElement>
    if (statCards.length >= 4) {
      const statSubheads = [statSubhead1, statSubhead2, statSubhead3, statSubhead4]
      const statSentences = [statSentence1, statSentence2, statSentence3, statSentence4]
      const subheadSetters = [setStatSubhead1, setStatSubhead2, setStatSubhead3, setStatSubhead4]
      const sentenceSetters = [setStatSentence1, setStatSentence2, setStatSentence3, setStatSentence4]

      statCards.forEach((card, index) => {
        if (index >= 4) return

        const subheadP = card.querySelector('.stats-title p') as HTMLElement
        if (subheadP) {
          const observer = new MutationObserver(() => {
            const newText = subheadP.textContent?.trim()
            if (newText && newText !== statSubheads[index]) {
              console.log(`📊 Stat ${index + 1} subheading changed in iframe:`, newText)
              subheadSetters[index](newText)
            }
          })

          observer.observe(subheadP, {
            characterData: true,
            childList: true,
            subtree: true,
            attributes: false
          })

          const currentText = subheadP.textContent?.trim()
          if (currentText && currentText !== statSubheads[index]) {
            subheadSetters[index](currentText)
          }
        }

        const sentenceP = card.querySelector('.stats-body-text p') as HTMLElement
        if (sentenceP) {
          const observer = new MutationObserver(() => {
            const newText = sentenceP.textContent?.trim()
            if (newText && newText !== statSentences[index]) {
              console.log(`📊 Stat ${index + 1} sentence changed in iframe:`, newText)
              sentenceSetters[index](newText)
            }
          })

          observer.observe(sentenceP, {
            characterData: true,
            childList: true,
            subtree: true,
            attributes: false
          })

          const currentText = sentenceP.textContent?.trim()
          if (currentText && currentText !== statSentences[index]) {
            sentenceSetters[index](currentText)
          }
        }
      })
    }
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to comparison section in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const comparisonHeadingEl = iframeDoc.querySelector('#heading-template--25034331193476__comparison_table_9YADnf') as HTMLElement
    if (comparisonHeadingEl) {
      const observer = new MutationObserver(() => {
        const newText = comparisonHeadingEl.textContent?.trim()
        if (newText && newText !== comparisonHeading) {
          console.log(`🎯 Comparison heading changed in iframe:`, newText)
          setComparisonHeading(newText)
        }
      })

      observer.observe(comparisonHeadingEl, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentText = comparisonHeadingEl.textContent?.trim()
      if (currentText && currentText !== comparisonHeading) {
        setComparisonHeading(currentText)
      }
    }

    const comparisonDescDiv = iframeDoc.querySelector('#section-body-text-template--25034331193476__comparison_table_9YADnf')
    if (comparisonDescDiv) {
      const comparisonDescP = comparisonDescDiv.querySelector('p') as HTMLElement
      if (comparisonDescP) {
        const observer = new MutationObserver(() => {
          const newText = comparisonDescP.textContent?.trim()
          if (newText && newText !== comparisonDescription) {
            console.log(`🎯 Comparison description changed in iframe:`, newText)
            setComparisonDescription(newText)
          }
        })

        observer.observe(comparisonDescP, {
          characterData: true,
          childList: true,
          subtree: true,
          attributes: false
        })

        const currentText = comparisonDescP.textContent?.trim()
        if (currentText && currentText !== comparisonDescription) {
          setComparisonDescription(currentText)
        }
      }
    }

    const comparisonRows = iframeDoc.querySelectorAll('.comparison-table-template--25034331193476__comparison_table_9YADnf tbody tr') as NodeListOf<HTMLElement>
    if (comparisonRows.length >= 5) {
      const rowValues = [comparisonRow1, comparisonRow2, comparisonRow3, comparisonRow4, comparisonRow5]
      const rowSetters = [setComparisonRow1, setComparisonRow2, setComparisonRow3, setComparisonRow4, setComparisonRow5]

      comparisonRows.forEach((row, index) => {
        if (index >= 5) return

        const featureCell = row.querySelector('.feature-cell') as HTMLElement
        if (featureCell) {
          const observer = new MutationObserver(() => {
            const newText = featureCell.textContent?.trim()
            if (newText && newText !== rowValues[index]) {
              console.log(`🎯 Comparison row ${index + 1} changed in iframe:`, newText)
              rowSetters[index](newText)
            }
          })

          observer.observe(featureCell, {
            characterData: true,
            childList: true,
            subtree: true,
            attributes: false
          })

          const currentText = featureCell.textContent?.trim()
          if (currentText && currentText !== rowValues[index]) {
            rowSetters[index](currentText)
          }
        }
      })
    }
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to reviews heading and icon guarantees in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const reviewsHeadingEl = iframeDoc.querySelector('#sectionHeadingtemplate--25004712951940__testimonials_2_nHX7mT') as HTMLElement
    if (reviewsHeadingEl) {
      const observer = new MutationObserver(() => {
        const newText = reviewsHeadingEl.textContent?.trim()
        if (newText && newText !== reviewsHeading) {
          console.log(`⭐ Reviews heading changed in iframe:`, newText)
          setReviewsHeading(newText)
        }
      })

      observer.observe(reviewsHeadingEl, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentText = reviewsHeadingEl.textContent?.trim()
      if (currentText && currentText !== reviewsHeading) {
        setReviewsHeading(currentText)
      }
    }

    const iconGuaranteeCards = iframeDoc.querySelectorAll('#section-template--25004712951940__feature_icons_DUbgp7 .feature-icon-card') as NodeListOf<HTMLElement>
    if (iconGuaranteeCards.length >= 4) {
      const guaranteeValues = [iconGuarantee1, iconGuarantee2, iconGuarantee3, iconGuarantee4]
      const guaranteeSetters = [setIconGuarantee1, setIconGuarantee2, setIconGuarantee3, setIconGuarantee4]

      iconGuaranteeCards.forEach((card, index) => {
        if (index >= 4) return

        const textDiv = card.querySelector('.feature-icon-card__text')
        if (textDiv) {
          const firstP = textDiv.querySelector('p:first-child') as HTMLElement
          if (firstP) {
            const observer = new MutationObserver(() => {
              const newText = firstP.textContent?.trim()
              if (newText && newText !== guaranteeValues[index]) {
                console.log(`⭐ Icon guarantee ${index + 1} changed in iframe:`, newText)
                guaranteeSetters[index](newText)
              }
            })

            observer.observe(firstP, {
              characterData: true,
              childList: true,
              subtree: true,
              attributes: false
            })

            const currentText = firstP.textContent?.trim()
            if (currentText && currentText !== guaranteeValues[index]) {
              guaranteeSetters[index](currentText)
            }
          }
        }
      })
    }
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to satisfaction guarantee paragraph in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const satisfactionDiv = iframeDoc.querySelector('#block-description-text-template--25004712951940__image_with_text_UL996X')
    if (satisfactionDiv) {
      const satisfactionP = satisfactionDiv.querySelector('p') as HTMLElement
      if (satisfactionP) {
        const observer = new MutationObserver(() => {
          const newText = satisfactionP.textContent?.trim()
          if (newText && newText !== satisfactionParagraph) {
            console.log(`🔒 Satisfaction paragraph changed in iframe:`, newText)
            setSatisfactionParagraph(newText)
          }
        })

        observer.observe(satisfactionP, {
          characterData: true,
          childList: true,
          subtree: true,
          attributes: false
        })

        const currentText = satisfactionP.textContent?.trim()
        if (currentText && currentText !== satisfactionParagraph) {
          setSatisfactionParagraph(currentText)
        }
      }
    }
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to common questions in iframe (using IDs)
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const commonQAIds = [
      { id: 'common-question-1', value: commonQ1, setter: setCommonQ1, label: 'Common Q1' },
      { id: 'common-answer-1', value: commonA1, setter: setCommonA1, label: 'Common A1' },
      { id: 'common-question-2', value: commonQ2, setter: setCommonQ2, label: 'Common Q2' },
      { id: 'common-answer-2', value: commonA2, setter: setCommonA2, label: 'Common A2' },
      { id: 'common-question-3', value: commonQ3, setter: setCommonQ3, label: 'Common Q3' },
      { id: 'common-answer-3', value: commonA3, setter: setCommonA3, label: 'Common A3' }
    ]

    commonQAIds.forEach(({ id, value, setter, label }) => {
      const element = iframeDoc.getElementById(id) as HTMLElement
      if (!element) return

      const observer = new MutationObserver(() => {
        const newText = element.textContent?.trim()
        if (newText && newText !== value) {
          console.log(`❓ ${label} changed in iframe:`, newText)
          setter(newText)
        }
      })

      observer.observe(element, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentText = element.textContent?.trim()
      if (currentText && currentText !== value) {
        setter(currentText)
      }
    })
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for changes to FAQ section in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const faqContainers = iframeDoc.querySelectorAll('.singleAccordianContainer-template--25004712657028__collapsible_content_YWm968') as NodeListOf<HTMLElement>
    if (faqContainers.length >= 5) {
      const faqQValues = [faqQ1, faqQ2, faqQ3, faqQ4, faqQ5]
      const faqQSetters = [setFaqQ1, setFaqQ2, setFaqQ3, setFaqQ4, setFaqQ5]
      const faqAValues = [faqA1, faqA2, faqA3, faqA4, faqA5]
      const faqASetters = [setFaqA1, setFaqA2, setFaqA3, setFaqA4, setFaqA5]

      faqContainers.forEach((container, index) => {
        if (index >= 5) return

        const questionSpan = container.querySelector('.collapsibleTitleSpan-template--25004712657028__collapsible_content_YWm968') as HTMLElement
        if (questionSpan) {
          const observer = new MutationObserver(() => {
            const newText = questionSpan.textContent?.trim()
            if (newText && newText !== faqQValues[index]) {
              console.log(`📝 FAQ Q${index + 1} changed in iframe:`, newText)
              faqQSetters[index](newText)
            }
          })

          observer.observe(questionSpan, {
            characterData: true,
            childList: true,
            subtree: true,
            attributes: false
          })

          const currentText = questionSpan.textContent?.trim()
          if (currentText && currentText !== faqQValues[index]) {
            faqQSetters[index](currentText)
          }
        }

        const answerPanel = container.querySelector('.panelStyle-template--25004712657028__collapsible_content_YWm968')
        if (answerPanel) {
          const answerP = answerPanel.querySelector('p') as HTMLElement
          if (answerP) {
            const observer = new MutationObserver(() => {
              const newText = answerP.textContent?.trim()
              if (newText && newText !== faqAValues[index]) {
                console.log(`📝 FAQ A${index + 1} changed in iframe:`, newText)
                faqASetters[index](newText)
              }
            })

            observer.observe(answerP, {
              characterData: true,
              childList: true,
              subtree: true,
              attributes: false
            })

            const currentText = answerP.textContent?.trim()
            if (currentText && currentText !== faqAValues[index]) {
              faqASetters[index](currentText)
            }
          }
        }
      })
    }
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Update horizontal scrolling heading in landing page
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const scrollingHeading = iframeDoc.querySelector('#scrolling-images-slider-heading')
        if (scrollingHeading) {
          scrollingHeading.textContent = horizontalScrollHeading
        }
      }
    }
  }, [horizontalScrollHeading])

  // Update image with text 1 headline in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const imageWithText1Section = iframeDoc.querySelector('#ImageWithText--template--25052850749572__image_with_text_Yq9V8p')
        if (imageWithText1Section) {
          const heading = imageWithText1Section.querySelector('#block-heading-template--25052850749572__image_with_text_Yq9V8p')
          if (heading) {
            heading.textContent = imageText1Headline
          }
        }
      }
    }
  }, [imageText1Headline])

  // Update image with text 1 paragraph and bullets in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const imageWithText1Section = iframeDoc.querySelector('#ImageWithText--template--25052850749572__image_with_text_Yq9V8p')
        if (imageWithText1Section) {
          const descriptionDiv = imageWithText1Section.querySelector('#block-description-text-template--25052850749572__image_with_text_Yq9V8p')
          if (descriptionDiv) {
            const paragraphs = descriptionDiv.querySelectorAll('p')
            if (paragraphs.length > 0) {
              paragraphs[0].textContent = imageText1Paragraph
            }

            const bulletValues = [imageText1Bullet1, imageText1Bullet2, imageText1Bullet3]
            let bulletIndex = 0
            paragraphs.forEach((p, index) => {
              if (index > 0 && bulletIndex < 3) {
                // Check if already has checkmark to avoid duplication
                const currentText = p.textContent || ''
                const cleanedCurrent = currentText.replace(/^\u2714\s*/, '').trim()
                const newText = bulletValues[bulletIndex]
                // Only update if content actually changed
                if (cleanedCurrent !== newText) {
                  p.textContent = `✔ ${newText}`
                }
                bulletIndex++
              }
            })
          }
        }
      }
    }
  }, [imageText1Headline, imageText1Paragraph, imageText1Bullet1, imageText1Bullet2, imageText1Bullet3])

  // Update image with text 2 headline in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const imageWithText2Section = iframeDoc.querySelector('#ImageWithText--template--25004712951940__image_with_text_Kk3rrW')
        if (imageWithText2Section) {
          const heading = imageWithText2Section.querySelector('#block-heading-template--25004712951940__image_with_text_Kk3rrW')
          if (heading) {
            heading.textContent = imageText2Headline
          }
        }
      }
    }
  }, [imageText2Headline])

  // Update image with text 2 paragraph and bullets in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const imageWithText2Section = iframeDoc.querySelector('#ImageWithText--template--25004712951940__image_with_text_Kk3rrW')
        if (imageWithText2Section) {
          const descriptionDiv = imageWithText2Section.querySelector('#block-description-text-template--25004712951940__image_with_text_Kk3rrW')
          if (descriptionDiv) {
            const paragraphs = descriptionDiv.querySelectorAll('p')
            if (paragraphs.length > 0) {
              paragraphs[0].textContent = imageText2Paragraph
            }

            const bulletValues = [imageText2Bullet1, imageText2Bullet2, imageText2Bullet3]
            let bulletIndex = 0
            paragraphs.forEach((p, index) => {
              if (index > 0 && bulletIndex < 3) {
                const currentText = p.textContent || ''
                const cleanedCurrent = currentText.replace(/^\u2714\s*/, '').trim()
                const newText = bulletValues[bulletIndex]
                if (cleanedCurrent !== newText) {
                  p.textContent = `✔ ${newText}`
                }
                bulletIndex++
              }
            })
          }
        }
      }
    }
  }, [imageText2Headline, imageText2Paragraph, imageText2Bullet1, imageText2Bullet2, imageText2Bullet3])

  // Update horizontal scrolling text items in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const scrollingTextSection = iframeDoc.querySelector('.horizontal-scrolling-text-template--25121820475524__horizontal_scrolling_text_mgft6H')
        if (scrollingTextSection) {
          const loopContainers = scrollingTextSection.querySelectorAll('.horizontal-scrolling-text__loop_container-template--25121820475524__horizontal_scrolling_text_mgft6H')
          if (loopContainers.length > 0) {
            loopContainers.forEach((container) => {
              const items = container.querySelectorAll('.horizontal-scrolling-text__item-template--25121820475524__horizontal_scrolling_text_mgft6H')
              const scrollTexts = [horizScrollText1, horizScrollText2, horizScrollText3, horizScrollText4]
              items.forEach((item, index) => {
                if (index < scrollTexts.length) {
                  const strongTag = (item as HTMLElement).querySelector('strong')
                  if (strongTag) {
                    strongTag.textContent = scrollTexts[index]
                  } else {
                    (item as HTMLElement).textContent = scrollTexts[index]
                  }
                }
              })
            })
          }
        }
      }
    }
  }, [horizScrollText1, horizScrollText2, horizScrollText3, horizScrollText4])

  // Update rich text section in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const richTextHeading = iframeDoc.querySelector('#section-heading-template--25004712951940__rich_text_rPfaL7')
        if (richTextHeading) {
          richTextHeading.textContent = richTextHeadline
        }

        const richTextDiv = iframeDoc.querySelector('#rich-text__text-template--25004712951940__rich_text_rPfaL7')
        if (richTextDiv) {
          const richTextP = richTextDiv.querySelector('p')
          if (richTextP) {
            richTextP.textContent = richTextParagraph
          }
        }
      }
    }
  }, [richTextHeadline, richTextParagraph])

  // Update reasons to buy section in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const reasonsHeading = iframeDoc.querySelector('.reasons-to-buy__heading')
        if (reasonsHeading) {
          reasonsHeading.textContent = reasonsBuyHeading
        }

        const statCards = iframeDoc.querySelectorAll('.reasons-to-buy__content-inner-item.reasons-to-buy__points')
        if (statCards.length >= 4) {
          const statSubheads = [statSubhead1, statSubhead2, statSubhead3, statSubhead4]
          const statSentences = [statSentence1, statSentence2, statSentence3, statSentence4]

          statCards.forEach((card, index) => {
            if (index < 4) {
              const subheadP = card.querySelector('.stats-title p')
              if (subheadP) {
                subheadP.textContent = statSubheads[index]
              }

              const sentenceP = card.querySelector('.stats-body-text p')
              if (sentenceP) {
                sentenceP.textContent = statSentences[index]
              }
            }
          })
        }
      }
    }
  }, [reasonsBuyHeading, statSubhead1, statSentence1, statSubhead2, statSentence2, statSubhead3, statSentence3, statSubhead4, statSentence4])

  // Update comparison section in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const comparisonHeadingEl = iframeDoc.querySelector('#heading-template--25034331193476__comparison_table_9YADnf')
        if (comparisonHeadingEl) {
          comparisonHeadingEl.textContent = comparisonHeading
        }

        const comparisonDescDiv = iframeDoc.querySelector('#section-body-text-template--25034331193476__comparison_table_9YADnf')
        if (comparisonDescDiv) {
          const comparisonDescP = comparisonDescDiv.querySelector('p')
          if (comparisonDescP) {
            comparisonDescP.textContent = comparisonDescription
          }
        }

        const comparisonRows = iframeDoc.querySelectorAll('.comparison-table-template--25034331193476__comparison_table_9YADnf tbody tr')
        if (comparisonRows.length >= 5) {
          const rowValues = [comparisonRow1, comparisonRow2, comparisonRow3, comparisonRow4, comparisonRow5]

          comparisonRows.forEach((row, index) => {
            if (index < 5) {
              const featureCell = row.querySelector('.feature-cell')
              if (featureCell) {
                featureCell.textContent = rowValues[index]
              }
            }
          })
        }
      }
    }
  }, [comparisonHeading, comparisonDescription, comparisonRow1, comparisonRow2, comparisonRow3, comparisonRow4, comparisonRow5])

  // Update reviews heading and icon guarantees in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const reviewsHeadingEl = iframeDoc.querySelector('#sectionHeadingtemplate--25004712951940__testimonials_2_nHX7mT')
        if (reviewsHeadingEl) {
          reviewsHeadingEl.textContent = reviewsHeading
        }

        const iconGuaranteeCards = iframeDoc.querySelectorAll('#section-template--25004712951940__feature_icons_DUbgp7 .feature-icon-card')
        if (iconGuaranteeCards.length >= 4) {
          const guaranteeValues = [iconGuarantee1, iconGuarantee2, iconGuarantee3, iconGuarantee4]

          iconGuaranteeCards.forEach((card, index) => {
            if (index < 4) {
              const textDiv = card.querySelector('.feature-icon-card__text')
              if (textDiv) {
                const firstP = textDiv.querySelector('p:first-child')
                if (firstP) {
                  firstP.textContent = guaranteeValues[index]
                }
              }
            }
          })
        }
      }
    }
  }, [reviewsHeading, iconGuarantee1, iconGuarantee2, iconGuarantee3, iconGuarantee4])

  // Update satisfaction guarantee paragraph in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const satisfactionDiv = iframeDoc.querySelector('#block-description-text-template--25004712951940__image_with_text_UL996X')
        if (satisfactionDiv) {
          const satisfactionP = satisfactionDiv.querySelector('p')
          if (satisfactionP) {
            satisfactionP.textContent = satisfactionParagraph
          }
        }
      }
    }
  }, [satisfactionParagraph])

  // Update common questions in landing page when user changes them in sidebar (using IDs)
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const commonQ1El = iframeDoc.getElementById('common-question-1')
        if (commonQ1El) commonQ1El.textContent = commonQ1

        const commonA1El = iframeDoc.getElementById('common-answer-1')
        if (commonA1El) commonA1El.textContent = commonA1

        const commonQ2El = iframeDoc.getElementById('common-question-2')
        if (commonQ2El) commonQ2El.textContent = commonQ2

        const commonA2El = iframeDoc.getElementById('common-answer-2')
        if (commonA2El) commonA2El.textContent = commonA2

        const commonQ3El = iframeDoc.getElementById('common-question-3')
        if (commonQ3El) commonQ3El.textContent = commonQ3

        const commonA3El = iframeDoc.getElementById('common-answer-3')
        if (commonA3El) commonA3El.textContent = commonA3
      }
    }
  }, [commonQ1, commonA1, commonQ2, commonA2, commonQ3, commonA3])

  // Update FAQ section in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const faqContainers = iframeDoc.querySelectorAll('.singleAccordianContainer-template--25004712657028__collapsible_content_YWm968')
        if (faqContainers.length >= 5) {
          const faqQValues = [faqQ1, faqQ2, faqQ3, faqQ4, faqQ5]
          const faqAValues = [faqA1, faqA2, faqA3, faqA4, faqA5]

          faqContainers.forEach((container, index) => {
            if (index < 5) {
              const questionSpan = container.querySelector('.collapsibleTitleSpan-template--25004712657028__collapsible_content_YWm968')
              if (questionSpan) {
                questionSpan.textContent = faqQValues[index]
              }

              const answerPanel = container.querySelector('.panelStyle-template--25004712657028__collapsible_content_YWm968')
              if (answerPanel) {
                const answerP = answerPanel.querySelector('p')
                if (answerP) {
                  answerP.textContent = faqAValues[index]
                }
              }
            }
          })
        }
      }
    }
  }, [faqQ1, faqA1, faqQ2, faqA2, faqQ3, faqA3, faqQ4, faqA4, faqQ5, faqA5])

  // Update key features heading in landing page when user changes it in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const keyFeaturesSection = iframeDoc.querySelector('#section-text-template--25004712951940__key_features_DyQXbd')
        if (keyFeaturesSection) {
          const heading = keyFeaturesSection.querySelector('#heading-template--25004712951940__key_features_DyQXbd')
          if (heading) {
            heading.textContent = keyFeaturesHeading
          }
        }
      }
    }
  }, [keyFeaturesHeading])

  // Update key feature points in landing page when user changes them in sidebar
  useEffect(() => {
    if (landingPageIframeRef.current) {
      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
      if (iframeDoc) {
        const keyFeaturesSection = iframeDoc.querySelector('#section-text-template--25004712951940__key_features_DyQXbd')
        if (keyFeaturesSection) {
          const listItems = keyFeaturesSection.querySelectorAll('li p')
          const keyPoints = [keyPoint1, keyPoint2, keyPoint3, keyPoint4]
          listItems.forEach((p, index) => {
            if (index < keyPoints.length) {
              p.textContent = keyPoints[index]
            }
          })
        }
      }
    }
  }, [keyPoint1, keyPoint2, keyPoint3, keyPoint4])

  // Watch for ANY changes to 'Horizontal Scrolling Heading' in iframe and sync back
  useEffect(() => {
    if (!landingPageIframeRef.current) return
    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const scrollingHeading = iframeDoc.querySelector('#scrolling-images-slider-heading') as HTMLElement | null
    if (!scrollingHeading) return

    const observer = new MutationObserver(() => {
      const t = scrollingHeading.textContent?.trim()
      if (t && t !== horizontalScrollHeading) setHorizontalScrollHeading(t)
    })
    observer.observe(scrollingHeading, { characterData: true, childList: true, subtree: true })
    const current = scrollingHeading.textContent?.trim()
    if (current && current !== horizontalScrollHeading) setHorizontalScrollHeading(current)

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for ANY changes to 'Image with text 1' in iframe and sync back
  useEffect(() => {
    if (!landingPageIframeRef.current) return
    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const section = iframeDoc.querySelector('#ImageWithText--template--25052850749572__image_with_text_Yq9V8p')
    if (!section) return

    const headingEl = section.querySelector('#block-heading-template--25052850749572__image_with_text_Yq9V8p') as HTMLElement | null
    const descDiv = section.querySelector('#block-description-text-template--25052850749572__image_with_text_Yq9V8p') as HTMLElement | null

    const observers: MutationObserver[] = []

    if (headingEl) {
      const headingObserver = new MutationObserver(() => {
        const t = headingEl.textContent?.trim()
        if (t && t !== imageText1Headline) setImageText1Headline(t)
      })
      headingObserver.observe(headingEl, { characterData: true, childList: true, subtree: true })
      const current = headingEl.textContent?.trim()
      if (current && current !== imageText1Headline) setImageText1Headline(current)
      observers.push(headingObserver)
    }

    if (descDiv) {
      const ps = descDiv.querySelectorAll('p') as NodeListOf<HTMLElement>
      if (ps.length > 0) {
        const mainP = ps[0]
        const pObserver = new MutationObserver(() => {
          const v = mainP.textContent?.trim()
          if (v && v !== imageText1Paragraph) setImageText1Paragraph(v)
        })
        pObserver.observe(mainP, { characterData: true, childList: true, subtree: true })
        const current = mainP.textContent?.trim()
        if (current && current !== imageText1Paragraph) setImageText1Paragraph(current)
        observers.push(pObserver)
      }
      const bulletSetters = [setImageText1Bullet1, setImageText1Bullet2, setImageText1Bullet3]
      const bulletVals = [imageText1Bullet1, imageText1Bullet2, imageText1Bullet3]
      let idx = 0
      ps.forEach((p, i) => {
        if (i > 0 && idx < 3) {
          const ob = new MutationObserver(() => {
            const raw = p.textContent || ''
            const cleaned = raw.replace(/^✔\s*/, '').trim()
            if (cleaned && cleaned !== bulletVals[idx]) bulletSetters[idx](cleaned)
          })
          ob.observe(p, { characterData: true, childList: true, subtree: true })
          const raw = p.textContent || ''
          const cleaned = raw.replace(/^✔\s*/, '').trim()
          if (cleaned && cleaned !== bulletVals[idx]) bulletSetters[idx](cleaned)
          observers.push(ob)
          idx++
        }
      })
    }

    return () => observers.forEach(o => o.disconnect())
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for ANY changes to 'Image with text 2' in iframe and sync back
  useEffect(() => {
    if (!landingPageIframeRef.current) return
    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const section = iframeDoc.querySelector('#ImageWithText--template--25004712951940__image_with_text_Kk3rrW')
    if (!section) return

    const headingEl = section.querySelector('#block-heading-template--25004712951940__image_with_text_Kk3rrW') as HTMLElement | null
    const descDiv = section.querySelector('#block-description-text-template--25004712951940__image_with_text_Kk3rrW') as HTMLElement | null

    const observers: MutationObserver[] = []

    if (headingEl) {
      const headingObserver = new MutationObserver(() => {
        const t = headingEl.textContent?.trim()
        if (t && t !== imageText2Headline) setImageText2Headline(t)
      })
      headingObserver.observe(headingEl, { characterData: true, childList: true, subtree: true })
      const current = headingEl.textContent?.trim()
      if (current && current !== imageText2Headline) setImageText2Headline(current)
      observers.push(headingObserver)
    }

    if (descDiv) {
      const ps = descDiv.querySelectorAll('p') as NodeListOf<HTMLElement>
      if (ps.length > 0) {
        const mainP = ps[0]
        const pObserver = new MutationObserver(() => {
          const v = mainP.textContent?.trim()
          if (v && v !== imageText2Paragraph) setImageText2Paragraph(v)
        })
        pObserver.observe(mainP, { characterData: true, childList: true, subtree: true })
        const current = mainP.textContent?.trim()
        if (current && current !== imageText2Paragraph) setImageText2Paragraph(current)
        observers.push(pObserver)
      }
      const bulletSetters = [setImageText2Bullet1, setImageText2Bullet2, setImageText2Bullet3]
      const bulletVals = [imageText2Bullet1, imageText2Bullet2, imageText2Bullet3]
      let idx = 0
      ps.forEach((p, i) => {
        if (i > 0 && idx < 3) {
          const ob = new MutationObserver(() => {
            const raw = p.textContent || ''
            const cleaned = raw.replace(/^✔\s*/, '').trim()
            if (cleaned && cleaned !== bulletVals[idx]) bulletSetters[idx](cleaned)
          })
          ob.observe(p, { characterData: true, childList: true, subtree: true })
          const raw = p.textContent || ''
          const cleaned = raw.replace(/^✔\s*/, '').trim()
          if (cleaned && cleaned !== bulletVals[idx]) bulletSetters[idx](cleaned)
          observers.push(ob)
          idx++
        }
      })
    }

    return () => observers.forEach(o => o.disconnect())
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for ANY changes to key features heading in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const keyFeaturesSection = iframeDoc.querySelector('#section-text-template--25004712951940__key_features_DyQXbd')
    if (!keyFeaturesSection) return

    const heading = keyFeaturesSection.querySelector('#heading-template--25004712951940__key_features_DyQXbd') as HTMLElement | null
    if (!heading) return

    const observer = new MutationObserver(() => {
      const newHeading = (heading as HTMLElement).textContent?.trim()
      if (newHeading && newHeading !== keyFeaturesHeading) {
        console.log('🎯 Key features heading changed in iframe:', newHeading)
        setKeyFeaturesHeading(newHeading)
      }
    })

    observer.observe(heading, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: false
    })

    const currentHeading = (heading as HTMLElement).textContent?.trim()
    if (currentHeading && currentHeading !== keyFeaturesHeading) {
      setKeyFeaturesHeading(currentHeading)
    }

    return () => observer.disconnect()
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Watch for ANY changes to key feature points in iframe
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
    if (!iframeDoc) return

    const keyFeaturesSection = iframeDoc.querySelector('#section-text-template--25004712951940__key_features_DyQXbd')
    if (!keyFeaturesSection) return

    const listItems = keyFeaturesSection.querySelectorAll('li p') as NodeListOf<HTMLElement>
    if (listItems.length === 0) return

    const keyPointTexts = [keyPoint1, keyPoint2, keyPoint3, keyPoint4]
    const setters = [setKeyPoint1, setKeyPoint2, setKeyPoint3, setKeyPoint4]

    listItems.forEach((p, index) => {
      if (index >= setters.length) return

      const observer = new MutationObserver(() => {
        const newPoint = (p as HTMLElement).textContent?.trim()
        if (newPoint && newPoint !== keyPointTexts[index]) {
          console.log(`✨ Key feature point ${index + 1} changed in iframe:`, newPoint)
          setters[index](newPoint)
        }
      })

      observer.observe(p, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      })

      const currentPoint = (p as HTMLElement).textContent?.trim()
      if (currentPoint && currentPoint !== keyPointTexts[index]) {
        setters[index](currentPoint)
      }
    })
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Template switching function
  const switchTemplate = (template: 'ATLAS_SHOPIFY') => {
    setSelectedTemplate(template)
    // Clear all components when switching templates
    setAddedLandingPageComponents([])
    setComponentHtmlCache({})
    setCurrentLandingPageHtml('')

    // Reset UI for all component buttons
    for (let i = 1; i <= 6; i++) {
      const button = document.getElementById(`btn-${i}`)
      const indicator = document.getElementById(`indicator-${i}`)
      if (button) {
        button.textContent = 'Add Component'
          ; (button as HTMLButtonElement).disabled = false
      }
      if (indicator) {
        indicator.classList.add('hidden')
      }
    }
  }

  // Landing Page Generator Functions
  const addLandingPageComponent = (stepNumber: number) => {
    // Check credits before adding component
    if (!canGenerate('landing_page')) {
      setError('Insufficient Landing Page credits. Please purchase more to continue.')
      setCreditModalType('landing_page')
      setShowCreditModal(true)
      return
    }

    if (addedLandingPageComponents.includes(stepNumber)) return

    const newComponents = [...addedLandingPageComponents, stepNumber].sort((a, b) => a - b)
    setAddedLandingPageComponents(newComponents)

    // Initialize component HTML cache with original HTML if not already cached
    if (!componentHtmlCache[stepNumber]) {
      const components = atlasShopifyComponents
      const originalHtml = components[stepNumber as keyof typeof components]?.html
      if (originalHtml) {
        setComponentHtmlCache(prev => ({
          ...prev,
          [stepNumber]: originalHtml
        }))
      }
    }

    updateLandingPagePreview(newComponents)
  }

  const removeLandingPageComponent = (stepNumber: number) => {
    const newComponents = addedLandingPageComponents.filter(num => num !== stepNumber)
    setAddedLandingPageComponents(newComponents)

    // Remove from cache
    setComponentHtmlCache(prev => {
      const newCache = { ...prev }
      delete newCache[stepNumber]
      return newCache
    })

    updateLandingPagePreview(newComponents)
  }

  const updateLandingPagePreview = (components: number[] = addedLandingPageComponents) => {

    const componentsData = atlasShopifyComponents

    // Special handling for ATLAS_SHOPIFY template with clean HTML structure
    if (selectedTemplate === 'ATLAS_SHOPIFY') {
      let fullHtml = `<html>
<head>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>
</head>
<body>
<div id="in-page-channel-node-id" data-channel-name="in_page_channel_djNK8X"><link rel="stylesheet" href="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/template-dyxo/assets/application-ecf780b163c16f4dcfce8410b987e28a68e07adedace376d084c8d28d41133b4.css" data-turbo-track="reload"><style data-shopify="">
    /* fallback */
@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 100 700;
  src: url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v290/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2) format('woff2');
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

    /* Make all animation sections visible immediately on load */
    .animation-section {
      opacity: 1 !important;
      visibility: visible !important;
      transform: none !important;
    }

    :root {
        --font-body-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
        --font-body-style: normal;
        --font-body-weight: 400;
        --font-body-weight-bold: 700;

        --font-heading-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
        --font-heading-style: normal;
        --font-heading-weight: 400;
        --font-heading-size: 35px;
        --font-heading-mob-size: 30px;

        --heading-text-transform: none;

        --font-button-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
        --font-button-weight: 400;

        /* --font-body-scale: 1.0; */
        --font-body-scale: 1;
        --global-body-text-font-size: 16px;
        /* --font-heading-scale: 1.1; */
        --font-heading-scale: 1;


        --color-base-heading: 56, 56, 56;
        --color-navigation-links: 0, 0, 0;
        --color-base-text: 48, 48, 48;
        --color-shadow: 48, 47, 47;
        --color-base-background-1: 255, 255, 255;
        --color-base-background-2: 255, 255, 255;
        --color-base-solid-button-labels: 255, 255, 255;
        --color-base-outline-button-labels: 48, 47, 47;
        --color-base-accent-1: 255, 255, 255;
        --color-base-accent-2: 233,232,234;
        --color-base-accent-3: 155,154,156;
        --color-base-custom-color-1: 255, 255, 255;
        --color-base-custom-color-2: 255, 255, 255;
        --color-custom-color-1: 255, 255, 255;
        --color-custom-color-2: 255, 255, 255;

        --gradient-base-background-1: #ffffff;
        --gradient-base-background-2: #ffffff;
        --gradient-base-accent-1: #ffffff;
        --gradient-base-accent-2: linear-gradient(180deg, rgba(240, 69, 87, 1), rgba(221, 39, 57, 1) 100%);
        --gradient-base-accent-3: #9b9b9b;

        --media-padding: px;
        --media-border-opacity: 0.1;
        --media-border-width: 0px;
        --media-radius: 12px;
        --media-shadow-opacity: 0.0;
        --media-shadow-horizontal-offset: 0px;
        --media-shadow-vertical-offset: 0px;
        --media-shadow-blur-radius: 20px;
        --media-shadow-visible: 0;

        --page-width: 140rem;
        --page-width-margin: 0rem;

        --product-card-image-padding: 0.0rem;
        --product-card-corner-radius: 1.2rem;
        --product-card-text-alignment: center;
        --product-card-border-width: 0.0rem;
        --product-card-border-opacity: 0.1;
        --product-card-shadow-opacity: 0.05;
        --product-card-shadow-visible: 1;
        --product-card-shadow-horizontal-offset: 1.0rem;
        --product-card-shadow-vertical-offset: 1.0rem;
        --product-card-shadow-blur-radius: 3.5rem;

        --collection-card-image-padding: 0.0rem;
        --collection-card-corner-radius: 1.2rem;
        --collection-card-text-alignment: center;
        --collection-card-border-width: 0.0rem;
        --collection-card-border-opacity: 0.1;
        --collection-card-shadow-opacity: 0.05;
        --collection-card-shadow-visible: 1;
        --collection-card-shadow-horizontal-offset: 1.0rem;
        --collection-card-shadow-vertical-offset: 1.0rem;
        --collection-card-shadow-blur-radius: 3.5rem;

        --blog-card-image-padding: 0.0rem;
        --blog-card-corner-radius: 1.2rem;
        --blog-card-text-alignment: center;
        --blog-card-border-width: 0.0rem;
        --blog-card-border-opacity: 0.1;
        --blog-card-shadow-opacity: 0.05;
        --blog-card-shadow-visible: 1;
        --blog-card-shadow-horizontal-offset: 1.0rem;
        --blog-card-shadow-vertical-offset: 1.0rem;
        --blog-card-shadow-blur-radius: 3.5rem;

        --badge-corner-radius: 0.6rem;

        --sale-badge-background: linear-gradient(135deg, rgba(155,154,156, 1), rgba(155,154,156, 0.6) 105%);
        
        --popup-border-width: 1px;
        --popup-border-opacity: 0.1;
        --popup-corner-radius: 22px;
        --popup-shadow-opacity: 0.1;
        --popup-shadow-horizontal-offset: 10px;
        --popup-shadow-vertical-offset: 12px;
        --popup-shadow-blur-radius: 20px;

        --drawer-border-width: 1px;
        --drawer-border-opacity: 0.1;
        --drawer-shadow-opacity: 0.0;
        --drawer-shadow-horizontal-offset: 0px;
        --drawer-shadow-vertical-offset: 4px;
        --drawer-shadow-blur-radius: 5px;

        --spacing-sections-desktop: 0px;
        --spacing-sections-mobile: 0px;

        --grid-desktop-vertical-spacing: 40px;
        --grid-desktop-horizontal-spacing: 40px;
        --grid-mobile-vertical-spacing: 20px;
        --grid-mobile-horizontal-spacing: 20px;

        --text-boxes-border-opacity: 0.1;
        --text-boxes-border-width: 0px;
        --text-boxes-radius: 12px;
        --text-boxes-shadow-opacity: 0.0;
        --text-boxes-shadow-visible: 0;
        --text-boxes-shadow-horizontal-offset: 10px;
        --text-boxes-shadow-vertical-offset: 12px;
        --text-boxes-shadow-blur-radius: 20px;

        --buttons-radius: 10px;
        --buttons-radius-outset: 12px;
        --buttons-border-width: 2px;
        --buttons-border-opacity: 1.0;
        --buttons-shadow-opacity: 0.0;
        --buttons-shadow-visible: 0;
        --buttons-shadow-horizontal-offset: 4px;
        --buttons-shadow-vertical-offset: 4px;
        --buttons-shadow-blur-radius: 5px;
        --buttons-border-offset: 0.3px;

        --inputs-radius: 5px;
        --inputs-border-width: 2px;
        --inputs-border-opacity: 0.55;
        --inputs-shadow-opacity: 0.0;
        --inputs-shadow-horizontal-offset: 0px;
        --inputs-margin-offset: 0px;
        --inputs-shadow-vertical-offset: 0px;
        --inputs-shadow-blur-radius: 5px;
        --inputs-radius-outset: 7px;

        --variant-pills-radius: 4px;
        --variant-pills-border-width: 1px;
        --variant-pills-border-opacity: 0.55;
        --variant-pills-shadow-opacity: 0.0;
        --variant-pills-shadow-horizontal-offset: 0px;
        --variant-pills-shadow-vertical-offset: 4px;
        --variant-pills-shadow-blur-radius: 5px;

        --animation-button-hover-color: #1e1e1e;
        --animatioin-button-text-with-arrow-content: none;
        --animatioin-button-text-with-arrow-padding: 3rem;
        --animation-scale: 1.0;
        --animation-glow: 0 0 10px 2px rgba(var(--color-base-accent-3), 1.0), 0 0 0 1px rgba(var(--color-base-accent-3), 0.5);
        --animation-slide-background: block;
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      html {
        box-sizing: border-box;
        font-size: calc(var(--font-body-scale) * 62.5%);
        height: 100%;
      }

      body {
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        grid-template-columns: 100%;
        min-height: 100%;
        margin: 0;
        letter-spacing: 0.06rem;
        /* line-height: calc(1 + 0.8 / var(--font-body-scale)); */
        line-height: 1.4em;
        font-family: var(--font-body-family);
        font-style: var(--font-body-style);
        font-weight: var(--font-body-weight);
        font-size: var(--global-body-text-font-size);
      }

      @media screen and (min-width: 750px) {
        body {
          /* font-size: 1.6rem; */
        }
      }
  </style></div>
`

      // Add components HTML
      components.forEach((stepNumber) => {
        const component = componentsData[stepNumber as keyof typeof componentsData]
        if (component) {
          const componentHtml = componentHtmlCache[stepNumber] || component.html
          fullHtml += componentHtml + '\n'
        }
      })

      fullHtml += `</body></html>`

      setCurrentLandingPageHtml(fullHtml)

      if (landingPageIframeRef.current) {
        const iframe = landingPageIframeRef.current
        // Use srcdoc attribute instead of document.write to avoid conflicts
        iframe.srcdoc = fullHtml
      }
      return
    }

    // Default HTML structure for other templates
    let fullHtml = `<html class="no-js" lang="en"><div id="in-page-channel-node-id" data-channel-name="in_page_channel_J1or_a"></div><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link href="//btyka.myshopify.com/cdn/shop/t/8/assets/base.css?v=120352272787097795821760366776" rel="stylesheet" type="text/css" media="all">

<style data-shopify="">
@font-face {
  font-family: Inter;
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url("//btyka.myshopify.com/cdn/fonts/inter/inter_n4.b2a3f24c19b4de56e8871f609e73ca7f6d2e2bb9.woff2?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=d868f765d633c051bd273a877057fd3bc8e5e37ddc4b6fa81428b4ddf1746e77") format("woff2"),
       url("//btyka.myshopify.com/cdn/fonts/inter/inter_n4.af8052d517e0c9ffac7b814872cecc27ae1fa132.woff?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=900ce5e0c2cad5ef6caf5fb2b4f788f1436b67b623d1cb0519720ef2c9cf167c") format("woff");
}

@font-face {
  font-family: Inter;
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  src: url("//btyka.myshopify.com/cdn/fonts/inter/inter_n7.02711e6b374660cfc7915d1afc1c204e633421e4.woff2?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=5f264ee017ab41649ef1bb682f175af3d2a26f6ab6905f6e9e3f59e649615e3c") format("woff2"),
       url("//btyka.myshopify.com/cdn/fonts/inter/inter_n7.6dab87426f6b8813070abd79972ceaf2f8d3b012.woff?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=a953e905da98977d0fbf7537986f209693bbf5ef33cd36c32d0cdb7e138bb42d") format("woff");
}

@font-face {
  font-family: Inter;
  font-weight: 400;
  font-style: italic;
  font-display: swap;
  src: url("//btyka.myshopify.com/cdn/fonts/inter/inter_i4.feae1981dda792ab80d117249d9c7e0f1017e5b3.woff2?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=27eebdddf89ff35625ca4366f7dc222ac4ba61da03b966119c4abc5cd667ab65") format("woff2"),
       url("//btyka.myshopify.com/cdn/fonts/inter/inter_i4.62773b7113d5e5f02c71486623cf828884c85c6e.woff?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=f7d75e406cbfbc933dc63e934e2631ffe8623c8835a6fb3205af51c54fdc0329") format("woff");
}

@font-face {
  font-family: Inter;
  font-weight: 700;
  font-style: italic;
  font-display: swap;
  src: url("//btyka.myshopify.com/cdn/fonts/inter/inter_i7.b377bcd4cc0f160622a22d638ae7e2cd9b86ea4c.woff2?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=e9a3444ab4492208ed220f052b6efcdc5c9001519dae22bb8fb9e906ca74111a") format("woff2"),
       url("//btyka.myshopify.com/cdn/fonts/inter/inter_i7.7c69a6a34e3bb44fcf6f975857e13b9a9b25beb4.woff?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=94884f2f8c0d215e952f5a99b6dd79da8f09c187c4ed595479740af3c4c209e7") format("woff");
}

@font-face {
  font-family: Inter;
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  src: url("//btyka.myshopify.com/cdn/fonts/inter/inter_n5.d7101d5e168594dd06f56f290dd759fba5431d97.woff2?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=d78b3312359e94030f03b70afaab08f31101b0f5c3b052f27d45a2c7db5b0d9c") format("woff2"),
       url("//btyka.myshopify.com/cdn/fonts/inter/inter_n5.5332a76bbd27da00474c136abb1ca3cbbf259068.woff?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=da9a63e96a531d72b750df325962ed0e601102f16d6bd790fd9e980d1a90ae95") format("woff");
}

@font-face {
  font-family: Inter;
  font-weight: 500;
  font-style: italic;
  font-display: swap;
  src: url("//btyka.myshopify.com/cdn/fonts/inter/inter_i5.4474f48e6ab2b1e01aa2b6d942dd27fa24f2d99f.woff2?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=67720df2c1cabe7b3ed76374bdb1e34afc4e827a42b59bb1076270be7193d498") format("woff2"),
       url("//btyka.myshopify.com/cdn/fonts/inter/inter_i5.493dbd6ee8e49f4ad722ebb68d92f201af2c2f56.woff?h1=NzA4MHV1LXhuLmFjY291bnQubXlzaG9waWZ5LmNvbQ&h2=YnR5a2EubXlzaG9waWZ5LmNvbQ&hmac=aa09bc8f52623e270bc201251a7a4c5f4492c8ed2fcf384981dd624b8e4a86ec") format("woff");
}

:root {
  /* Font families */
  --font-body--family: Inter, sans-serif;
  --font-body--style: normal;
  --font-body--weight: 400;
  --font-subheading--family: Inter, sans-serif;
  --font-subheading--style: normal;
  --font-subheading--weight: 500;
  --font-heading--family: Inter, sans-serif;
  --font-heading--style: normal;
  --font-heading--weight: 700;
  --font-accent--family: Inter, sans-serif;
  --font-accent--style: normal;
  --font-accent--weight: 700;

  /* Typography presets */
  --font-size--paragraph: 0.875rem;
  --font-size--h1: clamp(3.0rem, 5.6vw, 3.5rem);
  --font-size--h2: clamp(2.25rem, 4.8vw, 3.0rem);
  --font-size--h3: 2.0rem;
  --font-size--h4: 1.5rem;
  --font-size--h5: 0.875rem;
  --font-size--h6: 0.75rem;
  
  /* Colors */
  --color-error: #8B0000;
  --color-success: #006400;
  --color-white: #FFFFFF;
  --color-white-rgb: 255 255 255;
  --color-black: #000000;
  
  /* Spacing */
  --padding-xs: 0.5rem;
  --padding-sm: 0.7rem;
  --padding-md: 0.8rem;
  --padding-lg: 1rem;
  --padding-xl: 1.25rem;
  --padding-2xl: 1.5rem;
  --padding-3xl: 1.75rem;
  --padding-4xl: 2rem;
  --padding-5xl: 3rem;
  --padding-6xl: 4rem;
  
  /* Borders */
  --style-border-radius-sm: 0.6rem;
  --style-border-radius-md: 0.8rem;
  --style-border-radius-lg: 1rem;
  --style-border-radius-buttons-primary: 14px;
  --style-border-radius-buttons-secondary: 14px;
}
</style>

<link rel="stylesheet" media="screen" href="//btyka.myshopify.com/cdn/shop/t/8/compiled_assets/styles.css?271">

<style>
body { font-family: 'IBM Plex Sans Arabic', sans-serif; background-color: #f0f2f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
#product-gallery-container { width: 100%; max-width: 36rem; margin: auto; background-color: #ffffff; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; }

/* --- Image Gallery Styles --- */
.gallery-wrapper { position: relative; }
.gallery-wrapper > input.gallery-radio { display: none; }
.main-image-container { width: 100%; aspect-ratio: 1 / 1; overflow: hidden; }
.main-image-item { width: 100%; height: 100%; display: none; position: relative; }
.main-image-item img { width: 100%; height: 100%; object-fit: cover; }
#day-overlays { position: absolute; bottom: 1rem; left: 1rem; right: 1rem; color: #ffffff; font-weight: 700; font-size: 0.875rem; display: flex; justify-content: space-between; }
#day-overlays span { background-color: rgba(0, 0, 0, 0.5); padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
.nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background-color: rgba(255, 255, 255, 0.9); border-radius: 9999px; padding: 0.5rem; border: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); cursor: pointer; z-index: 10; display: block; }
.nav-btn:hover { background-color: #ffffff; }
.nav-btn svg { height: 1.5rem; width: 1.5rem; color: #4A5568; display: block; }
.prev-btn { left: 0.75rem; }
.next-btn { right: 0.75rem; }
#thumbnail-container { padding: 1rem; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; background-color: #f9fafb; }
.thumbnail-label { cursor: pointer; border: 2px solid transparent; border-radius: 0.375rem; aspect-ratio: 1/1; transition: border-color .15s; }
.thumbnail-label img { width: 100%; height: 100%; object-fit: cover; border-radius: 0.375rem; opacity: 0.6; transition: opacity .15s; }
.thumbnail-label:hover img { opacity: 1; }

#gallery-radio-1:checked ~ .main-image-container #main-image-item-1, #gallery-radio-2:checked ~ .main-image-container #main-image-item-2, #gallery-radio-3:checked ~ .main-image-container #main-image-item-3, #gallery-radio-4:checked ~ .main-image-container #main-image-item-4, #gallery-radio-5:checked ~ .main-image-container #main-image-item-5 { display: block; }
#gallery-radio-1:checked ~ #thumbnail-container label[for="gallery-radio-1"], #gallery-radio-2:checked ~ #thumbnail-container label[for="gallery-radio-2"], #gallery-radio-3:checked ~ #thumbnail-container label[for="gallery-radio-3"], #gallery-radio-4:checked ~ #thumbnail-container label[for="gallery-radio-4"], #gallery-radio-5:checked ~ #thumbnail-container label[for="gallery-radio-5"] { border-color: #0c6a9e; }
#gallery-radio-1:checked ~ #thumbnail-container label[for="gallery-radio-1"] img, #gallery-radio-2:checked ~ #thumbnail-container label[for="gallery-radio-2"] img, #gallery-radio-3:checked ~ #thumbnail-container label[for="gallery-radio-3"] img, #gallery-radio-4:checked ~ #thumbnail-container label[for="gallery-radio-4"] img, #gallery-radio-5:checked ~ #thumbnail-container label[for="gallery-radio-5"] img { opacity: 1; }

/* --- Product Info Styles --- */
#product-info-container { padding: 1.5rem; background-color: #fff; }
.reviews-section { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
.reviews-section p { color: #374151; }
#product-info-container h1 { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 2rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; line-height: 1.2; }
#product-info-container > p { color: #4b5563; line-height: 1.6; margin-bottom: 1.25rem; }
.features-box { background-color: #fbfbf6; border: 1px solid #EDEDE4; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem; }
.features-grid { display: grid; grid-template-columns: 0.6fr 1fr; gap: 0.75rem; }
.feature-item { display: flex; align-items: center; gap: 0.5rem; color: #0c240e; }
.feature-item svg { width: 21px; height: 21px; }
.low-stock-section { border: 1px solid #ECECEC; border-radius: 10px; background-color: #f7f7f7; padding: 1rem; margin-bottom: 1.25rem; }
.low-stock-header { font-family: 'IBM Plex Sans Arabic', sans-serif; display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #0c240e; margin-bottom: 0.5rem; }
.low-stock-header svg { width: 21px; height: 21px; }
.low-stock-section > p { margin: 0 0 0.75rem 0; color: #374151; }
.progress-bar-container { display: flex; align-items: center; gap: 0.75rem; }
.progress-bar { flex-grow: 1; height: 10px; background-color: #e5e7eb; border-radius: 5px; overflow: hidden; }
.progress-bar-inner { width: 89%; height: 100%; background-color: #0c240e; border-radius: 5px; }
.progress-bar-container span { font-weight: 700; color: #1f2937; }
.add-to-cart-btn { font-family: 'IBM Plex Sans Arabic', sans-serif; background-color: #2db67d; color: #fff; font-weight: 600; text-transform: uppercase; font-size: 1.25rem; border: none; border-radius: 9999px; padding: 1rem; width: 100%; cursor: pointer; margin-bottom: 1.25rem; transition: background-color 0.2s; }
.add-to-cart-btn:hover { background-color: #239c65; }
.guarantees-section { display: flex; justify-content: space-around; text-align: center; margin-bottom: 1.25rem; }
.guarantee-item { display: flex; align-items: center; gap: 0.5rem; color: #374151; }
.guarantee-item svg { width: 21px; height: 21px; color: #2db67d; }
.testimonial-section { background-color: #fbfbf6; border: 1px solid #EDEDE4; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.testimonial-section img { width: 60px; height: 60px; border-radius: 50%; }
.testimonial-text p { margin: 0 0 0.25rem 0; font-style: italic; color: #374151; }
.testimonial-text span { font-weight: 700; color: #1f2937; }
.money-back-section { background-color: #f7f7f7; border: 1px solid #ECECEC; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem; }
.money-back-section h4 { font-family: 'IBM Plex Sans Arabic', sans-serif; margin: 0 0 0.25rem 0; font-weight: 600; }
.money-back-section p { margin: 0 0 0.5rem 0; color: #374151; }
.money-back-section a { color: #0c240e; text-decoration: underline; }
.accordion-item { border-bottom: 1px solid #ECECEC; }
.accordion-item:last-child { border-bottom: none; }
.accordion-item summary { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 1rem 0; font-weight: 700; color: #0c240e; list-style: none; }
.accordion-item summary::-webkit-details-marker { display: none; }
.accordion-item summary .icon { transition: transform 0.2s; }
.accordion-item[open] summary .icon { transform: rotate(45deg); }
.accordion-content { padding: 0 0 1rem 0; color: #374151; line-height: 1.6; }

/* Additional Sections */
.as-seen-on-section { background-color: #FBFBF6; padding: 20px 15px 30px 15px; border-top: 1px solid #EDEDE4; }
.as-seen-on-section h2 { font-family: 'IBM Plex Sans Arabic', sans-serif; text-align: center; font-size: 26px; font-weight: 700; color: #0c240e; margin-bottom: 30px; }
.logos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; align-items: center; justify-items: center; }
.logo-item img { width: 75px; height: auto; max-width: 100%; }

.clinical-results-section { background-color: #FBFBF6; padding: 50px 15px; border-top: 1px solid #EDEDE4; }
.clinical-results-section h2 { font-family: 'IBM Plex Sans Arabic', sans-serif; text-align: center; font-size: 36px; font-weight: 700; color: #0c240e; margin-bottom: 15px; text-transform: uppercase; }
.stats-grid { display: flex; flex-direction: column; gap: 15px; }
.stat-item { display: flex; align-items: center; gap: 15px; padding: 10px 0; border-bottom: 1px solid #EDEDE4; }
.stat-number { font-size: 36px; font-weight: 700; color: #0c240e; min-width: 80px; }
.stat-description { font-size: 18px; color: #374151; line-height: 1.4; margin-bottom: 10px; }
.progress-bar-fill { background: #0c240e; height: 100%; border-radius: 9999px; transition: width 0.3s ease; }
.progress-bar-fill-94 { width: 94%; }
.progress-bar-fill-90 { width: 90%; }
.progress-bar-fill-86 { width: 86%; }

.faq-section { background-color: #FBFBF6; padding: 50px 15px; border-top: 1px solid #EDEDE4; }
.faq-header h2 { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 36px; font-weight: 700; color: #0c240e; text-transform: uppercase; margin: 0 0 15px 0; line-height: 1.2; }
.faq-content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
.faq-item { border-bottom: 1px solid #ECECEC; }
.faq-question { background: transparent; border: none; width: 100%; padding: 15px 0; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; color: #0c240e; }
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.5s ease; }
.faq-answer-content { padding: 10px 0 0 0; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 16px; line-height: 1.5; color: #0c240e; }

@media (max-width: 768px) {
  .faq-content { grid-template-columns: 1fr; }
  .clinical-results-section h2 { font-size: 26px; }
  .stat-number { font-size: 30px; }
}

/* Hide Gallery Thumbnails Slider */
slider#GalleryThumbnails-template--25004712951940__main,
slider[id*="GalleryThumbnails"],
.thumbnail-slider,
slider.thumbnail-slider {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
}
</style>

</style>

<style>`;

    // Add gallery styles if gallery is added
    if (components.includes(1)) {
      fullHtml += `
        .gallery-wrapper { max-width: 600px; margin: 20px auto; position: relative; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .gallery-radio { display: none; }
        .main-image-container { position: relative; width: 100%; height: 400px; overflow: hidden; }
        .main-image-item { position: absolute; width: 100%; height: 100%; opacity: 0; transition: opacity 0.3s ease; }
        .main-image-item img { width: 100%; height: 100%; object-fit: cover; }
        #gallery-radio-1:checked ~ .main-image-container #main-image-item-1, #gallery-radio-2:checked ~ .main-image-container #main-image-item-2, #gallery-radio-4:checked ~ .main-image-container #main-image-item-4, #gallery-radio-5:checked ~ .main-image-container #main-image-item-5 { opacity: 1; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; background: rgba(0, 0, 0, 0.5); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.3s; z-index: 10; }
        .nav-btn:hover { background: rgba(0, 0, 0, 0.7); }
        .prev-btn { left: 10px; } .next-btn { right: 10px; }
        .nav-btn svg { width: 20px; height: 20px; }
        #thumbnail-container { display: flex; justify-content: center; gap: 10px; padding: 15px; background: #f8f9fa; }
        .thumbnail-label { width: 80px; height: 60px; cursor: pointer; border: 2px solid transparent; border-radius: 5px; overflow: hidden; transition: border-color 0.3s; }
        .thumbnail-label:hover { border-color: #007bff; }
        .thumbnail-label img { width: 100%; height: 100%; object-fit: cover; }
        #gallery-radio-1:checked ~ #thumbnail-container .thumbnail-label[for="gallery-radio-1"], #gallery-radio-2:checked ~ #thumbnail-container .thumbnail-label[for="gallery-radio-2"], #gallery-radio-4:checked ~ #thumbnail-container .thumbnail-label[for="gallery-radio-4"], #gallery-radio-5:checked ~ #thumbnail-container .thumbnail-label[for="gallery-radio-5"] { border-color: #28a745; }
        #day-overlays { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
      `;
    }

    fullHtml += `</style>
</head>
<body class="page-width-narrow card-hover-effect-none" style="--transparent-header-offset-boolean: 0;"><div id="ProductInformation-template--23922892177601__main" class="
    product-details
     sticky-content--desktop
    " style="--details-position: flex-start;" data-testid="product-information-details">
  

  <div class="
    group-block
    group-block--height-fit
    group-block--width-fill
    border-style
    spacing-style
    size-style
    
    
  " style="
    --border-width: 1px; --border-style: none; --border-color:
rgb(var(--color-border-rgb) / 1.0); --border-radius:
0px; 

    --padding-block-start: max(20px, calc(var(--spacing-scale) * 24px));--padding-block-end: max(20px, calc(var(--spacing-scale) * 24px));--padding-inline-start: 0px;--padding-inline-end: 0px;
    --size-style-width: 100%;--size-style-height: fit;--size-style-width-mobile: 100%; --size-style-width-mobile-min: 5rem;
    
  " data-testid="group-block">

  <div class="
      group-block-content
      
      layout-panel-flex
      layout-panel-flex--column
      
    " style="--flex-direction: column; --flex-wrap: nowrap; --flex-wrap-mobile: wrap;

--gap: max(24px, calc(var(--gap-scale, 1.0) * 28px));

--horizontal-alignment: ; --vertical-alignment: ;
--vertical-alignment-mobile: ;
">
    
<rte-formatter class=" spacing-style text-block text-block--AeTBSWVJzb09FSm0yS__text_aEtTtq rte
    text-block--align-left rte 
  " style="
    --padding-block-start: 0px; --padding-block-end:0px; 
--padding-inline-start:0px; --padding-inline-end:0px; 

    

    --width: 100%;
    --max-width: var(--max-width--body-normal);
    
      --text-align: left;
    
    
  ">`
      ;

    if (components.length === 0) {
      fullHtml += '<div style="padding:40px;text-align:center;color:#666;font-family:Arial,sans-serif;"><h3>Preview Area</h3><p>Add components from the left panel to see them appear here.</p></div>';
    } else {
      // Always start from step 1 - ignore step 0
      components.forEach(stepNumber => {
        // Skip step 0 - it doesn't exist
        if (stepNumber === 0) {
          console.log('⚠️ Skipping step 0 - it does not exist')
          return
        }

        // Use cached HTML if available, otherwise use original
        const html = componentHtmlCache[stepNumber] || componentsData[stepNumber as keyof typeof componentsData]?.html
        if (html) {
          fullHtml += html;
        }
      });
    }

    fullHtml += `</rte-formatter>





  </div>
</div>



</div>
</body></html>`

    // Apply ONLY manually replaced image links (cached images) - no automatic replacement
    let htmlWithCachedImages = fullHtml
    const imgRegex = /<img[^>]*>/gi
    const matches: Array<{ index: number, tag: string, position: number }> = []
    let match

    // Collect all img tags
    while ((match = imgRegex.exec(htmlWithCachedImages)) !== null) {
      matches.push({
        index: match.index,
        tag: match[0],
        position: matches.length
      })
    }

    // Apply ONLY cached image links (user manually replaced images)
    if (Object.keys(componentImageLinksCache).length > 0) {
      for (let i = matches.length - 1; i >= 0; i--) {
        const cachedLink = componentImageLinksCache[i]
        if (cachedLink) {
          const imgTag = matches[i].tag
          // Replace src attribute
          let newImgTag = imgTag.replace(/(src=["'])([^"']+)(["'])/gi, `$1${cachedLink}$3`)
          // Also replace data-src if present
          newImgTag = newImgTag.replace(/(data-src=["'])([^"']+)(["'])/gi, `$1${cachedLink}$3`)

          // Replace in HTML
          const matchIndex = matches[i].index
          htmlWithCachedImages = htmlWithCachedImages.substring(0, matchIndex) + newImgTag + htmlWithCachedImages.substring(matchIndex + imgTag.length)
          console.log('🖼️ Applied manually replaced image link:', { imageIndex: i, url: cachedLink })
        }
      }
    }

    setCurrentLandingPageHtml(htmlWithCachedImages)
  }

  const reloadLandingPagePreview = () => {
    if (!isLandingPageCodeView && landingPageIframeRef.current) {
      const iframe = landingPageIframeRef.current
      iframe.srcdoc = iframe.srcdoc

      // After reload, sync all field values from the iframe
      setTimeout(() => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (!iframeDoc) return

        // Gallery Thumbnails slider is now visible (re-enabled)

        // Apply ONLY manually replaced image links (cached images) - no automatic replacement
        const images = iframeDoc.querySelectorAll('img')
        if (Object.keys(componentImageLinksCache).length > 0) {
          images.forEach((img, index) => {
            const cachedLink = componentImageLinksCache[index]
            if (cachedLink) {
              img.src = cachedLink
              img.setAttribute('src', cachedLink)
              if (img.hasAttribute('data-src')) {
                img.setAttribute('data-src', cachedLink)
              }
              console.log('🖼️ Applied manually replaced image link to iframe:', { imageIndex: index, url: cachedLink })
            }
          })
        }

        // Sync Product Title
        const titleElement = iframeDoc.getElementById('block-heading-title')
        if (titleElement) {
          const newTitle = titleElement.textContent?.trim()
          if (newTitle) setProductTitle(newTitle)
        }

        // Sync Product Price
        const priceElement = iframeDoc.querySelector('.price-item.price-item--sale.price-item--last')
        if (priceElement) {
          const priceText = priceElement.textContent?.trim() || '$0.00'
          const priceMatch = priceText.match(/\d+(?:\.\d{2})?/)
          const newPrice = priceMatch ? priceMatch[0] : '0'
          if (newPrice) setProductPrice(newPrice)
        }

        // Sync Tagline 1
        const tagline1Element = iframeDoc.getElementById('product-tagline-1')
        if (tagline1Element) {
          const newTagline1 = tagline1Element.textContent?.trim()
          if (newTagline1) setProductTagline1(newTagline1)
        }

        // Sync Tagline 2
        const tagline2Element = iframeDoc.getElementById('product-tagline-2')
        if (tagline2Element) {
          const newTagline2 = tagline2Element.textContent?.trim()
          if (newTagline2) setProductTagline2(newTagline2)
        }

        // Sync Icon Bullet Points
        const bulletDivs = iframeDoc.querySelectorAll('.bullet-point-text')
        const bulletSetters = [setIconBullet1, setIconBullet2, setIconBullet3, setIconBullet4, setIconBullet5]
        bulletDivs.forEach((div, index) => {
          if (index < bulletSetters.length) {
            const newBullet = div.textContent?.trim()
            if (newBullet) bulletSetters[index](newBullet)
          }
        })

        // Sync Product Description & Description Points
        const panelDiv = iframeDoc.querySelector('.panelStyle-collapsible_tab_TgYBPV')
        if (panelDiv) {
          const descriptionP = panelDiv.querySelector('p')
          if (descriptionP) {
            const newDesc = descriptionP.textContent?.trim()
            if (newDesc) setProductDescription(newDesc)
          }

          const listItems = panelDiv.querySelectorAll('li')
          const descSetters = [setDescPoint1, setDescPoint2, setDescPoint3, setDescPoint4]
          listItems.forEach((li, index) => {
            if (index < descSetters.length) {
              const newPoint = li.textContent?.trim()
              if (newPoint) descSetters[index](newPoint)
            }
          })
        }

        // Sync Key Features Heading & Points
        const keyFeaturesSection = iframeDoc.querySelector('#section-text-template--25004712951940__key_features_DyQXbd')
        if (keyFeaturesSection) {
          const heading = keyFeaturesSection.querySelector('#heading-template--25004712951940__key_features_DyQXbd')
          if (heading) {
            const newHeading = heading.textContent?.trim()
            if (newHeading) setKeyFeaturesHeading(newHeading)
          }

          const listItems = keyFeaturesSection.querySelectorAll('li p')
          const keySetters = [setKeyPoint1, setKeyPoint2, setKeyPoint3, setKeyPoint4]
          listItems.forEach((p, index) => {
            if (index < keySetters.length) {
              const newPoint = p.textContent?.trim()
              if (newPoint) keySetters[index](newPoint)
            }
          })
        }

        // Sync Horizontal Scrolling Heading
        const scrollingHeading = iframeDoc.querySelector('#scrolling-images-slider-heading')
        if (scrollingHeading) {
          const newHeading = scrollingHeading.textContent?.trim()
          if (newHeading) setHorizontalScrollHeading(newHeading)
        }

        // Sync Image with Text 1
        const imageWithText1Section = iframeDoc.querySelector('#ImageWithText--template--25052850749572__image_with_text_Yq9V8p')
        if (imageWithText1Section) {
          const heading = imageWithText1Section.querySelector('#block-heading-template--25052850749572__image_with_text_Yq9V8p')
          if (heading) {
            const newHeading = heading.textContent?.trim()
            if (newHeading) setImageText1Headline(newHeading)
          }

          const descriptionDiv = imageWithText1Section.querySelector('#block-description-text-template--25052850749572__image_with_text_Yq9V8p')
          if (descriptionDiv) {
            const paragraphs = descriptionDiv.querySelectorAll('p')
            if (paragraphs.length > 0) {
              const mainParagraph = paragraphs[0]
              const newPara = mainParagraph.textContent?.trim()
              if (newPara) setImageText1Paragraph(newPara)
            }

            const bulletSetters = [setImageText1Bullet1, setImageText1Bullet2, setImageText1Bullet3]
            let bulletIdx = 0
            paragraphs.forEach((p, index) => {
              if (index > 0 && bulletIdx < 3) {
                const bulletText = p.textContent?.replace(/^\u2714\s*/, '').trim()
                if (bulletText) bulletSetters[bulletIdx](bulletText)
                bulletIdx++
              }
            })
          }
        }

        // Sync Image with Text 2
        const imageWithText2Section = iframeDoc.querySelector('#ImageWithText--template--25004712951940__image_with_text_Kk3rrW')
        if (imageWithText2Section) {
          const heading = imageWithText2Section.querySelector('#block-heading-template--25004712951940__image_with_text_Kk3rrW')
          if (heading) {
            const newHeading = heading.textContent?.trim()
            if (newHeading) setImageText2Headline(newHeading)
          }

          const descriptionDiv = imageWithText2Section.querySelector('#block-description-text-template--25004712951940__image_with_text_Kk3rrW')
          if (descriptionDiv) {
            const paragraphs = descriptionDiv.querySelectorAll('p')
            if (paragraphs.length > 0) {
              const mainParagraph = paragraphs[0]
              const newPara = mainParagraph.textContent?.trim()
              if (newPara) setImageText2Paragraph(newPara)
            }

            const bulletSetters = [setImageText2Bullet1, setImageText2Bullet2, setImageText2Bullet3]
            let bulletIdx = 0
            paragraphs.forEach((p, index) => {
              if (index > 0 && bulletIdx < 3) {
                const bulletText = p.textContent?.replace(/^\u2714\s*/, '').trim()
                if (bulletText) bulletSetters[bulletIdx](bulletText)
                bulletIdx++
              }
            })
          }
        }

        // Sync Horizontal Scrolling Text (4 items)
        const scrollingTextSection = iframeDoc.querySelector('.horizontal-scrolling-text-template--25121820475524__horizontal_scrolling_text_mgft6H')
        if (scrollingTextSection) {
          const loopContainers = scrollingTextSection.querySelectorAll('.horizontal-scrolling-text__loop_container-template--25121820475524__horizontal_scrolling_text_mgft6H')
          if (loopContainers.length > 0) {
            const firstContainer = loopContainers[0]
            const items = firstContainer.querySelectorAll('.horizontal-scrolling-text__item-template--25121820475524__horizontal_scrolling_text_mgft6H')
            const scrollTextSetters = [setHorizScrollText1, setHorizScrollText2, setHorizScrollText3, setHorizScrollText4]
            items.forEach((item, index) => {
              if (index < scrollTextSetters.length) {
                const strongTag = (item as HTMLElement).querySelector('strong')
                const text = strongTag ? strongTag.textContent?.trim() : item.textContent?.trim()
                if (text) scrollTextSetters[index](text)
              }
            })
          }
        }

        // Sync Rich Text Section
        const richTextHeading = iframeDoc.querySelector('#section-heading-template--25004712951940__rich_text_rPfaL7')
        if (richTextHeading) {
          const newHeading = richTextHeading.textContent?.trim()
          if (newHeading) setRichTextHeadline(newHeading)
        }

        const richTextDiv = iframeDoc.querySelector('#rich-text__text-template--25004712951940__rich_text_rPfaL7')
        if (richTextDiv) {
          const richTextP = richTextDiv.querySelector('p')
          if (richTextP) {
            const newPara = richTextP.textContent?.trim()
            if (newPara) setRichTextParagraph(newPara)
          }
        }

        // Sync Reasons to Buy Section
        const reasonsHeading = iframeDoc.querySelector('.reasons-to-buy__heading')
        if (reasonsHeading) {
          const newHeading = reasonsHeading.textContent?.trim()
          if (newHeading) setReasonsBuyHeading(newHeading)
        }

        const statCards = iframeDoc.querySelectorAll('.reasons-to-buy__content-inner-item.reasons-to-buy__points')
        if (statCards.length >= 4) {
          const subheadSetters = [setStatSubhead1, setStatSubhead2, setStatSubhead3, setStatSubhead4]
          const sentenceSetters = [setStatSentence1, setStatSentence2, setStatSentence3, setStatSentence4]

          statCards.forEach((card, index) => {
            if (index < 4) {
              const subheadP = (card as HTMLElement).querySelector('.stats-title p')
              if (subheadP) {
                const text = subheadP.textContent?.trim()
                if (text) subheadSetters[index](text)
              }

              const sentenceP = (card as HTMLElement).querySelector('.stats-body-text p')
              if (sentenceP) {
                const text = sentenceP.textContent?.trim()
                if (text) sentenceSetters[index](text)
              }
            }
          })
        }

        // Sync Comparison Section
        const comparisonHeadingEl = iframeDoc.querySelector('#heading-template--25034331193476__comparison_table_9YADnf')
        if (comparisonHeadingEl) {
          const newHeading = comparisonHeadingEl.textContent?.trim()
          if (newHeading) setComparisonHeading(newHeading)
        }

        const comparisonDescDiv = iframeDoc.querySelector('#section-body-text-template--25034331193476__comparison_table_9YADnf')
        if (comparisonDescDiv) {
          const comparisonDescP = comparisonDescDiv.querySelector('p')
          if (comparisonDescP) {
            const newDesc = comparisonDescP.textContent?.trim()
            if (newDesc) setComparisonDescription(newDesc)
          }
        }

        const comparisonRows = iframeDoc.querySelectorAll('.comparison-table-template--25034331193476__comparison_table_9YADnf tbody tr')
        if (comparisonRows.length >= 5) {
          const rowSetters = [setComparisonRow1, setComparisonRow2, setComparisonRow3, setComparisonRow4, setComparisonRow5]

          comparisonRows.forEach((row, index) => {
            if (index < 5) {
              const featureCell = (row as HTMLElement).querySelector('.feature-cell')
              if (featureCell) {
                const text = featureCell.textContent?.trim()
                if (text) rowSetters[index](text)
              }
            }
          })
        }

        // Sync Reviews Heading and Icon Guarantees
        const reviewsHeadingEl = iframeDoc.querySelector('#sectionHeadingtemplate--25004712951940__testimonials_2_nHX7mT')
        if (reviewsHeadingEl) {
          const newHeading = reviewsHeadingEl.textContent?.trim()
          if (newHeading) setReviewsHeading(newHeading)
        }

        const iconGuaranteeCards = iframeDoc.querySelectorAll('#section-template--25004712951940__feature_icons_DUbgp7 .feature-icon-card')
        if (iconGuaranteeCards.length >= 4) {
          const guaranteeSetters = [setIconGuarantee1, setIconGuarantee2, setIconGuarantee3, setIconGuarantee4]

          iconGuaranteeCards.forEach((card, index) => {
            if (index < 4) {
              const textDiv = (card as HTMLElement).querySelector('.feature-icon-card__text')
              if (textDiv) {
                const firstP = textDiv.querySelector('p:first-child')
                if (firstP) {
                  const text = firstP.textContent?.trim()
                  if (text) guaranteeSetters[index](text)
                }
              }
            }
          })
        }

        // Sync Satisfaction Guarantee Paragraph
        const satisfactionDiv = iframeDoc.querySelector('#block-description-text-template--25004712951940__image_with_text_UL996X')
        if (satisfactionDiv) {
          const satisfactionP = satisfactionDiv.querySelector('p')
          if (satisfactionP) {
            const newPara = satisfactionP.textContent?.trim()
            if (newPara) setSatisfactionParagraph(newPara)
          }
        }

        // Sync Most Common Questions (using IDs)
        const commonQ1El = iframeDoc.getElementById('common-question-1')
        if (commonQ1El) {
          const text = commonQ1El.textContent?.trim()
          if (text) setCommonQ1(text)
        }

        const commonA1El = iframeDoc.getElementById('common-answer-1')
        if (commonA1El) {
          const text = commonA1El.textContent?.trim()
          if (text) setCommonA1(text)
        }

        const commonQ2El = iframeDoc.getElementById('common-question-2')
        if (commonQ2El) {
          const text = commonQ2El.textContent?.trim()
          if (text) setCommonQ2(text)
        }

        const commonA2El = iframeDoc.getElementById('common-answer-2')
        if (commonA2El) {
          const text = commonA2El.textContent?.trim()
          if (text) setCommonA2(text)
        }

        const commonQ3El = iframeDoc.getElementById('common-question-3')
        if (commonQ3El) {
          const text = commonQ3El.textContent?.trim()
          if (text) setCommonQ3(text)
        }

        const commonA3El = iframeDoc.getElementById('common-answer-3')
        if (commonA3El) {
          const text = commonA3El.textContent?.trim()
          if (text) setCommonA3(text)
        }

        // Sync FAQ Section
        const faqContainers = iframeDoc.querySelectorAll('.singleAccordianContainer-template--25004712657028__collapsible_content_YWm968')
        if (faqContainers.length >= 5) {
          const faqQSetters = [setFaqQ1, setFaqQ2, setFaqQ3, setFaqQ4, setFaqQ5]
          const faqASetters = [setFaqA1, setFaqA2, setFaqA3, setFaqA4, setFaqA5]

          faqContainers.forEach((container, index) => {
            if (index < 5) {
              const questionSpan = (container as HTMLElement).querySelector('.collapsibleTitleSpan-template--25004712657028__collapsible_content_YWm968')
              if (questionSpan) {
                const text = questionSpan.textContent?.trim()
                if (text) faqQSetters[index](text)
              }

              const answerPanel = (container as HTMLElement).querySelector('.panelStyle-template--25004712657028__collapsible_content_YWm968')
              if (answerPanel) {
                const answerP = answerPanel.querySelector('p')
                if (answerP) {
                  const text = answerP.textContent?.trim()
                  if (text) faqASetters[index](text)
                }
              }
            }
          })
        }
      }, 100)
    }
  }

  const toggleLandingPageCodeView = () => {
    setIsLandingPageCodeView(!isLandingPageCodeView)
  }

  const copyLandingPageHtml = async () => {
    try {
      await navigator.clipboard.writeText(currentLandingPageHtml || '')
      setShowCopyModal(true)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Helper function to detect if input is URL - same logic as AdcopyGen
  const isUrl = (text: string): boolean => {
    const input = text.trim();
    if (!input || !input.includes('.')) {
      return false;
    }
    try {
      // Add protocol if missing
      const testUrl = input.startsWith('http') ? input : `https://${input}`;
      new URL(testUrl);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Inject styles for sticky-atc elements when iframe loads
  useEffect(() => {
    if (!landingPageIframeRef.current) return

    const iframe = landingPageIframeRef.current
    const checkAndInject = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc || iframeDoc.readyState !== 'complete') return

      try {
        // Apply styles to the sticky-atc div
        const stickyAtcDiv = iframeDoc.getElementById('section-block-sticky_atc_Uaw4AC')
        if (stickyAtcDiv) {
          (stickyAtcDiv as HTMLElement).style.marginLeft = '20px'
            ; (stickyAtcDiv as HTMLElement).style.height = '67.5px'
        }

        // Apply styles to sticky-atc__image elements
        const stickyAtcImages = iframeDoc.querySelectorAll('.sticky-atc__image')
        stickyAtcImages.forEach((img) => {
          (img as HTMLElement).style.height = '40px'
        })
      } catch (error) {
        console.error('Failed to inject sticky-atc styles:', error)
      }
    }

    // Check immediately and on load
    checkAndInject()
    iframe.addEventListener('load', checkAndInject)

    // Also use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      checkAndInject()
    })

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (iframeDoc && iframeDoc.body) {
      observer.observe(iframeDoc.body, {
        childList: true,
        subtree: true
      })
    }

    return () => {
      iframe.removeEventListener('load', checkAndInject)
      observer.disconnect()
    }
  }, [landingPageIframeRef, currentLandingPageHtml])

  // Note: updateLandingPagePreview handles HTML generation internally

  // Function to handle product input and start rewriting process (2-phase scraping like AdcopyGen)
  const handleProductRewriting = async () => {
    if (!productInput.trim()) return

    // Check credits before starting rewriting
    if (!canGenerate('landing_page')) {
      setError('Insufficient Landing Page credits. Please purchase more to continue.')
      setCreditModalType('landing_page')
      setShowCreditModal(true)
      return
    }

    setIsRewriting(true)
    setRewritingAborted(false)
    setCurrentRewritingStep(0)
    setError('')

    try {
      let productContext = productInput

      // Check if input is URL
      if (isUrl(productInput)) {
        // Phase 1: Scraping (2-phase like AdcopyGen)
        setCurrentRewritingStep(1)

        // Clean URL by removing query parameters
        let trimmedUrl = productInput.trim()
        const questionMarkIndex = trimmedUrl.indexOf('?')
        if (questionMarkIndex !== -1) {
          trimmedUrl = trimmedUrl.substring(0, questionMarkIndex)
        }

        // Normalize AliExpress URLs
        if (trimmedUrl.includes('aliexpress.com')) {
          trimmedUrl = trimmedUrl.replace(/https?:\/\/[a-z]{2}\.aliexpress\.com/i, 'https://www.aliexpress.com')
        }

        // Check cache - if cache exists, use it and skip scraping
        const cached = visionAIOcrCache[trimmedUrl]
        const shouldUseCache = cached && cached.text && cached.text.trim()

        console.log('🔍 [Landing Page] Cache check:', {
          trimmedUrl,
          hasCache: !!cached,
          cacheText: cached?.text?.substring(0, 50) || 'none',
          shouldUseCache
        })

        if (shouldUseCache) {
          // Use cached content - don't scrape again
          console.log('✅ [Landing Page] Using cached content for URL:', trimmedUrl, '- skipping edge function calls')
          // Use FULL HTML content - NO FILTERING
          productContext = cached.text
          setScrapedProductContent(cached.text)
          console.log('📄 Using FULL HTML content (no filtering):', productContext.length, 'chars')
          // Extract images from cached content
          const images = extractImageUrls(cached.text)
          setScrapedImages(images)
        } else {
          // Phase 1: Call BOTH edge functions and combine results (same as AdcopyGen)
          console.log(`🔍 [Landing Page] Calling BOTH scrape-webpage AND image-ocr-v2 for URL: ${trimmedUrl}`)

          // Get auth token
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            throw new Error('Authentication required')
          }

          const textParts: string[] = []

          // Call scrape-webpage first
          try {
            console.log('🔍 [Landing Page] Calling scrape-webpage...')
            const scrapeResponse = await fetch('https://auth.symplysis.com/functions/v1/scrape-webpage', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ url: trimmedUrl })
            })

            if (scrapeResponse.ok) {
              const scrapeData = await scrapeResponse.json()
              if (scrapeData.success && scrapeData.content) {
                textParts.push(`=== WEBPAGE CONTENT ===\n\n${scrapeData.content}`)
                console.log(`✅ [Landing Page] scrape-webpage returned ${scrapeData.content.length} chars`)
              }
            } else {
              const errorText = await scrapeResponse.text()
              console.warn('⚠️ [Landing Page] scrape-webpage failed:', errorText)
            }
          } catch (err) {
            console.warn('⚠️ [Landing Page] scrape-webpage error:', err)
          }

          // Call image-ocr-v2 second
          try {
            console.log('🔍 [Landing Page] Calling image-ocr-v2...')
            const ocrResponse = await fetch('https://auth.symplysis.com/functions/v1/image-ocr-v2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ url: trimmedUrl, language: selectedLanguage })
            })

            if (ocrResponse.ok) {
              const ocrData = await ocrResponse.json()
              if (ocrData.success) {
                if (ocrData.results && Array.isArray(ocrData.results)) {
                  const ocrTextParts: string[] = []
                  ocrData.results.forEach((result: any, index: number) => {
                    if (result.text && result.text.trim() && !result.error && result.confidence > 0) {
                      ocrTextParts.push(result.text.trim())
                      console.log(`✅ [Landing Page] Extracted text from OCR result ${index + 1} (confidence: ${result.confidence}%)`)
                    }
                  })
                  if (ocrTextParts.length > 0) {
                    textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrTextParts.join('\n\n')}`)
                    console.log(`✅ [Landing Page] image-ocr-v2 returned ${ocrTextParts.join('\n\n').length} chars from ${ocrTextParts.length} results`)
                  }
                } else if (ocrData.text || ocrData.ocrText || ocrData.content) {
                  const ocrText = ocrData.text || ocrData.ocrText || ocrData.content
                  textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrText}`)
                  console.log(`✅ [Landing Page] image-ocr-v2 returned ${ocrText.length} chars`)
                }
              }
            } else {
              const errorText = await ocrResponse.text()
              console.warn('⚠️ [Landing Page] image-ocr-v2 failed:', errorText)
            }
          } catch (err) {
            console.warn('⚠️ [Landing Page] image-ocr-v2 error:', err)
          }

          // Combine all text parts (join, don't override)
          let combinedText = textParts.join('\n\n\n')

          if (!combinedText || !combinedText.trim()) {
            console.warn('⚠️ [Landing Page] No content extracted from either edge function, using URL as fallback')
            productContext = `Product URL: ${trimmedUrl}\nNote: Unable to scrape product details. Using URL only.`
          } else {
            // Extract images from raw content
            const images = extractImageUrls(combinedText)
            setScrapedImages(images)
            console.log('🖼️ [Landing Page] Extracted', images.length, 'images from scraped content')

            // Use FULL HTML content - NO FILTERING
            productContext = combinedText
            setScrapedProductContent(combinedText)

            console.log('✅ [Landing Page] Using FULL HTML content (no filtering):', productContext.length, 'chars')

            // Cache the FULL HTML results (not filtered)
            setVisionAIOcrCache(prev => ({
              ...prev,
              [trimmedUrl]: {
                text: combinedText,
                timestamp: Date.now()
              }
            }))
          }
        }
      }

      // Process ONLY the added (active) components one by one
      // Always start from step 1 - ignore step 0
      const componentsToRewrite = [...addedLandingPageComponents]
        .filter(stepNumber => stepNumber !== 0) // Remove step 0 - it doesn't exist
        .sort((a, b) => a - b)

      if (componentsToRewrite.length === 0) {
        setError('Please add at least one component to rewrite')
        setIsRewriting(false)
        return
      }



      for (let i = 0; i < componentsToRewrite.length; i++) {
        // Check if user clicked stop button
        if (rewritingAborted) {
          console.log('❌ Rewriting process stopped by user at component', i + 1, 'of', componentsToRewrite.length)
          break
        }

        const componentId = componentsToRewrite[i]
        setCurrentRewritingStep(componentId)

        console.log(`📋 Processing component ${i + 1} of ${componentsToRewrite.length} (ID: ${componentId})`)

        // CRITICAL: Retry logic - never move to next component until current one is fully rewritten
        let rewriteSuccess = false
        let retryCount = 0
        const maxRetries = 3

        while (!rewriteSuccess && retryCount < maxRetries && !rewritingAborted) {
          try {
            console.log(`🔄 Attempt ${retryCount + 1} of ${maxRetries} for component ${componentId}`)
            await rewriteComponent(componentId, productContext)

            // If rewriteComponent completes without throwing, it means validation passed
            // The function throws if rewrite fails, so if we get here, it succeeded
            rewriteSuccess = true
            console.log(`✅ Component ${componentId} successfully rewritten and validated`)
          } catch (error) {
            retryCount++
            console.error(`❌ Error rewriting component ${componentId} (attempt ${retryCount}/${maxRetries}):`, error)

            if (retryCount >= maxRetries) {
              console.error(`❌❌❌ FAILED to rewrite component ${componentId} after ${maxRetries} attempts`)
              console.error('❌ STOPPING PROCESS - Cannot continue with incomplete rewrite')
              setError(`Failed to rewrite component ${componentId} after ${maxRetries} attempts. Process stopped.`)
              setIsRewriting(false)
              setCurrentRewritingStep(0)
              return // STOP THE ENTIRE PROCESS - don't continue to next component
            }

            // Wait before retry
            console.log(`⏳ Waiting 2 seconds before retry...`)
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }

        if (!rewriteSuccess && !rewritingAborted) {
          console.error(`❌❌❌ CRITICAL: Component ${componentId} was not rewritten successfully`)
          setError(`Component ${componentId} rewrite failed after ${maxRetries} attempts. Process stopped.`)
          setIsRewriting(false)
          setCurrentRewritingStep(0)
          return // STOP THE ENTIRE PROCESS
        }

        if (rewritingAborted) {
          break
        }
      }

      if (rewritingAborted) {
        console.log('✅ Rewriting stopped. Components processed:', componentsToRewrite.indexOf(currentRewritingStep) + 1, '/', componentsToRewrite.length)
      } else {
        console.log('✅ All components rewritten successfully!')
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to rewrite content')
    } finally {
      setIsRewriting(false)
      setCurrentRewritingStep(0)
    }
  }

  // METHOD 3: DOMParser-based text extraction (ENGINEER'S PROVEN SOLUTION)
  // This uses browser's native HTML parser instead of regex - much more reliable!
  const extractTextFromHtml = (html: string): { textMap: Record<string, string>, templateHtml: string } => {
    console.log('🔍 METHOD 3: EXTRACTING TEXT WITH DOMPARSER')
    console.log('📄 Original HTML Length:', html.length, 'characters')

    // Use DOMParser to parse HTML properly (not regex!)
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const body = doc.body

    const textMap: Record<string, string> = {}
    let counter = 0

    // Use TreeWalker to find all text nodes
    const walker = doc.createTreeWalker(
      body,
      NodeFilter.SHOW_TEXT,
      null
    )

    // Collect all text nodes first
    const textNodes: Text[] = []
    let node: Node | null
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text)
    }

    // Process each text node
    textNodes.forEach(node => {
      const trimmedText = node.nodeValue?.replace(/\s/g, ' ').trim() || ''

      // 1. Skip empty or whitespace-only nodes
      if (trimmedText.length === 0) {
        return
      }

      const parentElement = node.parentElement
      if (!parentElement) return

      // 2. Skip nodes inside <script> or <style> tags
      const parentTag = parentElement.tagName.toUpperCase()
      if (parentTag === 'SCRIPT' || parentTag === 'STYLE') {
        return
      }

      // 3. Skip nodes that should not be translated (e.g., icons)
      if (parentElement.closest('.notranslate')) {
        return
      }

      // 4. Skip nodes inside quantity selectors
      if (parentElement.closest('.quantity-icons-parent')) {
        return
      }

      // 5. This is a valid text node - create placeholder
      const placeholderId = `__TEXT_${counter}__`

      // Store the original trimmed text
      textMap[placeholderId] = trimmedText

      // Replace the node's value with the placeholder
      node.nodeValue = placeholderId

      console.log(`  ✓ Text ${counter}:`, trimmedText.substring(0, 50) + (trimmedText.length > 50 ? '...' : ''))
      counter++
    })

    // Get the template HTML with placeholders
    const templateHtml = body.innerHTML

    console.log('✅ EXTRACTION COMPLETE')
    console.log('📝 Total texts extracted:', Object.keys(textMap).length)
    console.log('🎯 Template HTML length:', templateHtml.length, 'characters')
    console.log('🚀 Payload reduction:', ((1 - JSON.stringify(textMap).length / html.length) * 100).toFixed(1) + '%')

    return { textMap, templateHtml }
  }

  // METHOD 3: Reconstruct HTML from template and rewritten text map
  const reconstructHtml = (templateHtml: string, rewrittenMap: Record<string, string>): string => {
    console.log('🔄 RECONSTRUCTING HTML WITH NEW TEXT')
    console.log('📊 Placeholders to replace:', Object.keys(rewrittenMap).length)

    let finalHtml = templateHtml

    // Simple, reliable, and safe string replacement
    for (const placeholderId in rewrittenMap) {
      const newText = rewrittenMap[placeholderId]

      console.log(`  ✓ Replacing ${placeholderId} with:`, newText.substring(0, 50) + (newText.length > 50 ? '...' : ''))

      // Escape special HTML characters before insertion
      const escapedNewText = newText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

      // Replace all occurrences of this placeholder
      const regex = new RegExp(placeholderId, 'g')
      finalHtml = finalHtml.replace(regex, escapedNewText)
    }

    console.log('✅ RECONSTRUCTION COMPLETE')

    // Verify no placeholders remain
    const remainingPlaceholders = finalHtml.match(/__TEXT_\d+__/g)
    if (remainingPlaceholders) {
      console.warn('⚠️ WARNING: Some placeholders were not replaced:', remainingPlaceholders.length)
      console.warn('Remaining placeholders:', remainingPlaceholders)
    } else {
      console.log('✅ All placeholders successfully replaced!')
    }

    return finalHtml
  }

  // Helper function to optimize and neutralize product context
  // PRESERVES FULL HTML - NO FILTERING OR TRUNCATION
  const neutralizeProductContext = (context: string): string => {
    if (!context || !context.trim()) return context

    // Keep FULL HTML content - only do minimal brand name replacement
    let optimized = context

    // Replace brand names with instructions that encourage rewriting
    optimized = optimized.replace(/Honest\s+Plus\s+Expert/gi, '[BRAND_NAME: flexible]')
    optimized = optimized.replace(/Honest Plus/gi, '[BRAND_NAME]')

    // Add instruction footer
    optimized += '\n[NOTE: Rewrite brand names creatively for maximum impact. Goal is high-converting copy.]'

    // Return FULL HTML - NO TRUNCATION, NO FILTERING
    return optimized
  }

  // Function to rewrite a single component
  const rewriteComponent = async (componentId: number, productContext: string) => {
    // Check if aborted before starting
    if (rewritingAborted) {
      console.log('❌ Rewriting aborted for component', componentId)
      return
    }

    console.log('\n' + '='.repeat(60))
    console.log('🚀 STARTING REWRITE FOR COMPONENT:', componentId)
    console.log('='.repeat(60))

    const componentsData = atlasShopifyComponents
    console.log('📋 Template:', selectedTemplate)

    const component = componentsData[componentId as keyof typeof componentsData]
    if (!component) {
      console.log('❌ Component not found:', componentId)
      return
    }

    console.log('📝 Component title:', component.title)

    // Get the current HTML for this component instance (from cache or original)
    const currentHtml = componentHtmlCache[componentId] || component.html
    console.log('📄 HTML source:', componentHtmlCache[componentId] ? 'cache' : 'original')

    // Use the productContext that was already scraped in handleProductRewriting
    // No need to scrape again here - productContext already contains full HTML from edge functions
    console.log('📦 Product context received:', productContext ? `${productContext.length} chars` : 'empty');

    // Build product context - use FULL scraped HTML content
    // The productContext parameter already contains the full HTML from handleProductRewriting
    let baseContext = '';

    if (productContext && productContext.trim()) {
      // Use the productContext passed to this function (already contains full HTML from scraping)
      baseContext = productContext;
      console.log('✅ Using productContext (FULL HTML):', baseContext.length, 'chars');
      console.log('📄 First 200 chars:', baseContext.substring(0, 200));
    } else {
      // Fallback: try to get from cache or state
      const urlKey = (lastScrapedUrl || webpageUrl || '').trim();
      if (urlKey && visionAIOcrCache[urlKey]?.text) {
        baseContext = visionAIOcrCache[urlKey].text;
        console.log('✅ Using visionAIOcrCache (FULL HTML):', baseContext.length, 'chars');
      } else if (scrapedContent && scrapedContent.trim()) {
        baseContext = scrapedContent;
        console.log('✅ Using scrapedContent (FULL HTML):', baseContext.length, 'chars');
      } else if (scrapedProductContent && scrapedProductContent.trim()) {
        baseContext = scrapedProductContent;
        console.log('✅ Using scrapedProductContent (FULL HTML):', baseContext.length, 'chars');
      }
    }

    if (!baseContext || !baseContext.trim()) {
      console.error('❌ No product context available! productContext:', productContext ? `${productContext.length} chars` : 'empty');
      console.error('❌ scrapedContent:', scrapedContent ? `${scrapedContent.length} chars` : 'empty');
      console.error('❌ scrapedProductContent:', scrapedProductContent ? `${scrapedProductContent.length} chars` : 'empty');
      baseContext = productInput || 'No product information available';
    }

    // Add free delivery instruction to product context
    const deliveryInstruction = hasFreeDelivery
      ? '\\n\\nIMPORTANT: This product HAS FREE DELIVERY. Keep all mentions of "free delivery", "free shipping", or similar terms in the content.'
      : '\\n\\nIMPORTANT: This product DOES NOT have free delivery. Remove ALL mentions of "free delivery", "free shipping", "livraison gratuite", or any similar terms from the content.'

    // Neutralize product context to encourage rewriting of brand names
    const neutralizedContext = neutralizeProductContext(baseContext)
    const contextWithDelivery = neutralizedContext + deliveryInstruction
    console.log('🎯 Product context length:', contextWithDelivery.length, 'characters')
    console.log('🌍 Language:', selectedLanguage)
    console.log('🎭 Tone:', selectedTone)
    console.log('🤖 AI Provider:', aiProvider)

    try {
      // Auto-scroll preview iframe to current component being rewritten
      console.log('📍 SCROLLING PREVIEW TO COMPONENT', componentId)
      if (landingPageIframeRef.current) {
        try {
          const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
          if (iframeDoc) {
            // Find all h2 and h3 tags that might contain component titles
            const allHeadings = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, section, div[class*="step"], div[class*="hero"], div[class*="gallery"], div[class*="feature"], div[class*="faq"], div[class*="contact"]')
            // Try to scroll to approximately the right section based on component order
            if (componentId > 0 && componentId <= allHeadings.length) {
              const target = (allHeadings[componentId - 1] || allHeadings[0]) as HTMLElement
              if (target) {
                iframeDoc.documentElement.scrollTop = target.offsetTop - 100
                console.log('✅ Scrolled preview to component', componentId)
              }
            }
          }
        } catch (e) {
          console.log('⚠️ Could not scroll preview (cross-origin):', e)
        }
      }

      console.log('\n📤 METHOD 3: OPTIMIZING FOR ULTRA-FAST API RESPONSE')
      console.log('📄 Original HTML length:', currentHtml.length, 'characters')

      // STEP 1: Extract text using DOMParser (METHOD 3)
      const { textMap, templateHtml } = extractTextFromHtml(currentHtml)

      console.log('🚀 TextMap size:', Object.keys(textMap).length, 'items')

      // DEBUG: Log all extracted text to verify section 3 is included
      console.log('📋 ALL EXTRACTED TEXT (to verify all sections included):')
      Object.entries(textMap).forEach(([key, value]) => {
        if (value && value.trim().length > 0) {
          console.log(`  ${key}: "${value.substring(0, 100)}${value.length > 100 ? '...' : ''}"`)
        }
      })

      // Check for English text when target language is not English
      if (selectedLanguage !== 'English') {
        const englishTextPattern = /[A-Za-z]{3,}/g
        const englishTexts: string[] = []
        Object.entries(textMap).forEach(([key, value]) => {
          if (value && englishTextPattern.test(value)) {
            // Check if it's actually English (not just numbers or symbols)
            const words = value.match(/[A-Za-z]+/g) || []
            if (words.length > 0) {
              englishTexts.push(`${key}: "${value.substring(0, 80)}..."`)
            }
          }
        })
        if (englishTexts.length > 0) {
          console.log('⚠️ WARNING: Found English text in extracted textMap (should be translated):')
          englishTexts.slice(0, 10).forEach(text => console.log('  ', text))
          if (englishTexts.length > 10) {
            console.log(`  ... and ${englishTexts.length - 10} more`)
          }
        }
      }

      console.log('🚀 Sending textMap to AI (not full HTML!)')

      // Check if aborted before sending to AI
      if (rewritingAborted) {
        console.log('❌ Rewriting aborted before AI call')
        return
      }

      // STEP 2: Send ONLY textMap to AI for rewriting
      let response: { success: boolean; textMap?: Record<string, string>; error?: string }

      if (aiProvider === 'gemini') {
        console.log('🔵 Using Gemini API (textMap mode)')
        response = await HTMLRewriterService.rewriteTextMapWithGemini({
          textMap: textMap,
          productContext: contextWithDelivery,
          language: selectedLanguage,
          tone: selectedTone,
          customTone: selectedTone === 'Custom' ? customTone : undefined
        })
      } else {
        console.log('🟯 Using DeepSeek API (textMap mode)')
        response = await HTMLRewriterService.rewriteTextMapWithDeepSeek({
          textMap: textMap,
          productContext: contextWithDelivery,
          language: selectedLanguage,
          tone: selectedTone,
          customTone: selectedTone === 'Custom' ? customTone : undefined
        })
      }

      console.log('\n📥 AI RESPONSE RECEIVED')
      console.log('Success:', response.success)

      if (!response.success || !response.textMap) {
        console.log('❌ AI Response Error:', response.error)
        throw new Error(response.error || 'Failed to rewrite text content')
      }

      console.log('✅ Rewritten textMap count:', Object.keys(response.textMap).length)

      // CRITICAL VALIDATION: Ensure AI returned same number of texts
      if (Object.keys(response.textMap).length !== Object.keys(textMap).length) {
        console.error('❌❌❌ CRITICAL ERROR: AI changed text count!')
        console.error('Expected:', Object.keys(textMap).length, 'texts')
        console.error('Received:', Object.keys(response.textMap).length, 'texts')
        throw new Error(`AI returned ${Object.keys(response.textMap).length} texts but expected ${Object.keys(textMap).length}`)
      }

      console.log('✅ Text count validated - safe to proceed')
      console.log('🔄 Reconstructing HTML with new text...')

      // STEP 3: Reconstruct HTML using Method 3
      const rewrittenHtml = reconstructHtml(templateHtml, response.textMap)

      // FINAL VALIDATION: Check if HTML is valid
      const remainingPlaceholders = rewrittenHtml.match(/__TEXT_\d+__/g)
      if (remainingPlaceholders) {
        console.error('❌❌❌ CRITICAL ERROR: Placeholders remain in HTML!')
        console.error('Remaining:', remainingPlaceholders.length, 'placeholders')
        throw new Error(`${remainingPlaceholders.length} placeholders were not replaced`)
      }

      console.log('✅ Final HTML length:', rewrittenHtml.length, 'characters')
      console.log('✅ HTML structure preserved - ready to cache')

      // CRITICAL VALIDATION: Ensure content was actually rewritten
      console.log('\n🔍 VALIDATING REWRITE WAS SUCCESSFUL...')

      // Check 1: HTML should be different from original
      if (rewrittenHtml === currentHtml) {
        console.error('❌❌❌ CRITICAL ERROR: Rewritten HTML is IDENTICAL to original!')
        console.error('This means the AI did not actually rewrite the content.')
        throw new Error(`Component ${componentId} was not rewritten - HTML is identical to original. This is unacceptable.`)
      }

      // Check 2: Text values should be different
      const originalTexts = Object.values(textMap).join('|')
      const rewrittenTexts = Object.values(response.textMap).join('|')
      if (originalTexts === rewrittenTexts) {
        console.error('❌❌❌ CRITICAL ERROR: Rewritten textMap is IDENTICAL to original!')
        console.error('This means the AI returned the same text values.')
        throw new Error(`Component ${componentId} was not rewritten - text values are identical to original. This is unacceptable.`)
      }

      // Check 3: If target language is not English, verify no English text remains
      if (selectedLanguage !== 'English') {
        const englishPattern = /[A-Za-z]{3,}/g
        const englishMatches = rewrittenHtml.match(englishPattern) || []
        // Filter out common HTML attributes and technical terms
        const actualEnglishText = englishMatches.filter(text => {
          const lower = text.toLowerCase()
          return !lower.includes('html') &&
            !lower.includes('div') &&
            !lower.includes('class') &&
            !lower.includes('src') &&
            !lower.includes('href') &&
            !lower.includes('data-') &&
            text.length > 2
        })

        if (actualEnglishText.length > 0) {
          console.warn('⚠️ WARNING: Found English text in rewritten HTML:', actualEnglishText.slice(0, 5))
          // Don't throw error, but log warning - AI might have missed some translations
        }
      }

      console.log('✅ VALIDATION PASSED: Content was successfully rewritten')
      console.log('✅ Original HTML length:', currentHtml.length)
      console.log('✅ Rewritten HTML length:', rewrittenHtml.length)
      console.log('✅ Text values changed:', originalTexts !== rewrittenTexts)

      console.log('\n💾 SAVING TO CACHE')
      // Update the component HTML in the cache (not the shared object)
      console.log('📦 Setting cache for component:', componentId)
      setComponentHtmlCache(prev => {
        const newCache = {
          ...prev,
          [componentId]: rewrittenHtml
        }
        console.log('📦 Cache updated, new size:', Object.keys(newCache).length)
        return newCache
      })

      console.log('🔄 Silently updating preview (no reload)...')

      // SILENT UPDATE: Directly update the component in the iframe without full reload
      if (landingPageIframeRef.current && !isLandingPageCodeView) {
        try {
          const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
          if (iframeDoc) {
            // Create a temporary container to parse the new HTML
            const tempDiv = iframeDoc.createElement('div')
            tempDiv.innerHTML = rewrittenHtml

            // Find the component in the preview by index
            // Components are rendered in order, so we can target by position
            const allSections = iframeDoc.querySelectorAll('body > div > div > div > div > rte-formatter > *')

            // Find the index of this component in the added components list
            const componentIndex = addedLandingPageComponents.indexOf(componentId)

            if (componentIndex >= 0 && componentIndex < allSections.length) {
              const targetSection = allSections[componentIndex] as HTMLElement
              const newContent = tempDiv.firstElementChild as HTMLElement

              if (targetSection && newContent) {
                // Smoothly fade out, replace, fade in
                targetSection.style.transition = 'opacity 0.3s ease'
                targetSection.style.opacity = '0'

                setTimeout(() => {
                  targetSection.replaceWith(newContent)
                  newContent.style.opacity = '0'
                  newContent.style.transition = 'opacity 0.3s ease'

                  // Trigger reflow
                  void newContent.offsetHeight

                  newContent.style.opacity = '1'
                  console.log('✅ Component', componentId, 'silently updated in preview')
                }, 300)
              } else {
                console.warn('⚠️ Could not find section elements')
              }
            } else {
              console.warn('⚠️ Component index', componentIndex, 'out of range (total sections:', allSections.length, ')')
            }
          } else {
            console.warn('⚠️ Cannot access iframe document')
          }
        } catch (error) {
          console.warn('⚠️ Silent update error:', error)
        }
      }

      console.log('='.repeat(60) + '\n')

    } catch (error) {
      console.log('\n❌ ERROR IN REWRITE PROCESS')
      console.error(error)
      console.log('='.repeat(60) + '\n')
      throw error
    }
  }

  // Function to stop the rewriting process
  const stopRewriting = () => {
    setRewritingAborted(true)
    setIsRewriting(false)
    setCurrentRewritingStep(0)
  }

  const tabs = [
    { id: 'landing-page', label: 'Landing Page Generator' }
  ]



  // Inject image replacement system into iframe (debounced to prevent flickering)
  const injectImageReplacementSystem = useRef<(() => void) | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let isInjecting = false

    injectImageReplacementSystem.current = () => {
      // Clear any pending injection
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Debounce to prevent flickering
      timeoutId = setTimeout(() => {
        if (isInjecting) return
        isInjecting = true

        const iframe = landingPageIframeRef.current
        if (!iframe || !iframe.contentDocument) {
          isInjecting = false
          return
        }

        try {
          const doc = iframe.contentDocument
          const images = doc.querySelectorAll('img')

          // Remove existing overlays only if they exist
          const existingOverlays = doc.querySelectorAll('.image-replace-overlay')
          if (existingOverlays.length > 0) {
            existingOverlays.forEach(el => el.remove())
          }

          images.forEach((img, index) => {
            // Skip if already has overlay
            if (img.parentElement?.querySelector('.image-replace-overlay')) {
              return
            }

            // Create overlay container
            const overlay = doc.createElement('div')
            overlay.className = 'image-replace-overlay'
            overlay.setAttribute('data-image-index', index.toString())
            overlay.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.3);
              display: none;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              cursor: pointer;
              pointer-events: auto;
            `

            // Create replace button
            const button = doc.createElement('button')
            button.className = 'image-replace-button'
            button.textContent = 'Replace'
            button.style.cssText = `
              background: #3b82f6;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              transition: all 0.2s;
              pointer-events: auto;
            `

            button.onmouseenter = () => {
              button.style.background = '#2563eb'
              button.style.transform = 'scale(1.05)'
            }
            button.onmouseleave = () => {
              button.style.background = '#3b82f6'
              button.style.transform = 'scale(1)'
            }

            button.onclick = (e) => {
              e.stopPropagation()
              e.preventDefault()
              const currentSrc = img.src || img.getAttribute('src') || ''
              setSelectedImageElement({
                src: currentSrc,
                selector: `img:nth-of-type(${index + 1})`,
                imageIndex: index,
                element: img
              })
              setNewImageUrl(currentSrc)
              setShowImageReplaceModal(true)
            }

            overlay.appendChild(button)

            // Make img container relative if needed
            let container = img.parentElement
            if (!container) return

            const computedStyle = doc.defaultView?.getComputedStyle(container)
            if (computedStyle && computedStyle.position === 'static') {
              container.style.position = 'relative'
            }

            // Ensure container can contain absolute positioned overlay
            if (container.style.position === '' || container.style.position === 'static') {
              container.style.position = 'relative'
            }

            // Insert overlay
            container.appendChild(overlay)

            // Show overlay on hover with stable handlers
            const showOverlay = () => {
              overlay.style.display = 'flex'
            }
            const hideOverlay = () => {
              overlay.style.display = 'none'
            }

            img.addEventListener('mouseenter', showOverlay, { passive: true })
            img.addEventListener('mouseleave', hideOverlay, { passive: true })
            overlay.addEventListener('mouseenter', showOverlay, { passive: true })
            overlay.addEventListener('mouseleave', hideOverlay, { passive: true })
          })

          isInjecting = false
        } catch (error) {
          console.error('Failed to inject image replacement system:', error)
          isInjecting = false
        }
      }, 150) // Small delay to prevent flickering
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  // Fetch user's poster images
  const loadPosterImages = async () => {
    if (loadingPosterImages) return

    setLoadingPosterImages(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingPosterImages(false)
        return
      }

      const { data, error } = await supabase
        .from('posters_uploads')
        .select('id, storage_path, image_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Failed to load poster images:', error)
        setLoadingPosterImages(false)
        return
      }

      const { StorageService: StorageServiceClass } = await import('../services/storageService')
      const POSTER_BUCKET_NAME = 'poster-images'

      const posterImageList = (data || []).map((item: { id: string; storage_path?: string; image_url: string; created_at: string }) => {
        const imageUrl = item.storage_path
          ? StorageServiceClass.getPublicUrl(item.storage_path, POSTER_BUCKET_NAME)
          : item.image_url

        return {
          id: item.id,
          imageUrl,
          created_at: item.created_at
        }
      })

      setPosterImages(posterImageList)
    } catch (error) {
      console.error('Failed to load poster images:', error)
    } finally {
      setLoadingPosterImages(false)
    }
  }

  // Load poster images when modal opens
  useEffect(() => {
    if (showImageReplaceModal && imageModalTab === 'generated') {
      loadPosterImages()
    }
  }, [showImageReplaceModal, imageModalTab])

  // Load uploaded images when upload tab opens
  useEffect(() => {
    if (showImageReplaceModal && imageModalTab === 'upload') {
      loadUploadedImages()
    }
  }, [showImageReplaceModal, imageModalTab])

  // Load all uploaded images from Supabase storage
  const loadUploadedImages = async () => {
    if (loadingUploadedImages) return

    setLoadingUploadedImages(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingUploadedImages(false)
        return
      }

      const { data, error } = await supabase.storage
        .from('landing-page-images')
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('Failed to load uploaded images:', error)
        setLoadingUploadedImages(false)
        return
      }

      const { StorageService: StorageServiceClass } = await import('../services/storageService')
      const LANDING_PAGE_IMAGES_BUCKET_NAME = 'landing-page-images'

      const imageUrls = (data || []).map((file: { name: string }) => {
        const storagePath = `${user.id}/${file.name}`
        return StorageServiceClass.getPublicUrl(storagePath, LANDING_PAGE_IMAGES_BUCKET_NAME)
      })

      setUploadedImages(imageUrls)
    } catch (error) {
      console.error('Failed to load uploaded images:', error)
    } finally {
      setLoadingUploadedImages(false)
    }
  }

  // Handle scraping from modal
  const handleScrapeFromModal = async () => {
    if (!scrapeUrl.trim()) {
      alert('Please enter a URL to scrape')
      return
    }

    setScrapingImages(true)
    try {
      // Clean URL by removing query parameters
      let trimmedUrl = scrapeUrl.trim()
      const questionMarkIndex = trimmedUrl.indexOf('?')
      if (questionMarkIndex !== -1) {
        trimmedUrl = trimmedUrl.substring(0, questionMarkIndex)
      }

      // Normalize AliExpress URLs
      if (trimmedUrl.includes('aliexpress.com')) {
        trimmedUrl = trimmedUrl.replace(/https?:\/\/[a-z]{2}\.aliexpress\.com/i, 'https://www.aliexpress.com')
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // Call scrape-webpage edge function
      const scrapeResponse = await fetch('https://auth.symplysis.com/functions/v1/scrape-webpage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url: trimmedUrl })
      })

      if (!scrapeResponse.ok) {
        const errorText = await scrapeResponse.text()
        throw new Error(`Scraping failed: ${errorText}`)
      }

      const scrapeData = await scrapeResponse.json()
      if (!scrapeData.success || !scrapeData.content) {
        throw new Error('No content extracted from webpage')
      }

      // Extract images from scraped content
      const extractedImages = extractImageUrls(scrapeData.content)
      setScrapedImages(extractedImages)

      if (extractedImages.length === 0) {
        alert('No images found in the scraped content')
      } else {
        alert(`✅ Found ${extractedImages.length} images!`)
      }
    } catch (error) {
      console.error('Scraping error:', error)
      alert(`Scraping error: ${error instanceof Error ? error.message : 'Failed to scrape webpage'}`)
    } finally {
      setScrapingImages(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file extension (more reliable than file.type)
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
    if (!validExtensions.includes(extension)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB')
      return
    }

    setUploadingImage(true)
    try {
      // Get user ID
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        alert('Please log in to upload images')
        setUploadingImage(false)
        return
      }

      // Import StorageService
      const { StorageService } = await import('../services/storageService')

      // Upload image
      const uploadResult = await StorageService.uploadLandingPageImage(file, session.user.id)

      if (!uploadResult.success || !uploadResult.publicUrl) {
        throw new Error(uploadResult.error || 'Failed to upload image')
      }

      // Add to uploaded images list
      setUploadedImages(prev => [...prev, uploadResult.publicUrl!])

      // Automatically select the uploaded image
      setNewImageUrl(uploadResult.publicUrl)

      console.log('✅ Image uploaded successfully:', uploadResult.publicUrl)

      // Reset file input
      if (imageUploadInputRef.current) {
        imageUploadInputRef.current.value = ''
      }
    } catch (error) {
      console.error('❌ Failed to upload image:', error)
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploadingImage(false)
    }
  }

  // Replace image in HTML - only update the specific clicked image
  const replaceImageInHtml = (oldSrc: string, newSrc: string, imageIndex: number | null, imageElement: HTMLImageElement | null) => {
    if (!newSrc.trim()) {
      alert('Please enter a valid image URL')
      return
    }

    console.log('🔄 Replacing image:', { oldSrc, newSrc, imageIndex })

    // Get current HTML
    let updatedHtml = currentLandingPageHtml

    // Update ALL instances of this image in iframe for instant visual update
    const iframe = landingPageIframeRef.current
    if (iframe && iframe.contentDocument) {
      try {
        const doc = iframe.contentDocument

        // Find ALL images with the same src (thumbnails, main images, etc.)
        const allImages = doc.querySelectorAll('img')
        let updatedCount = 0

        allImages.forEach((img) => {
          const currentSrc = img.src || img.getAttribute('src') || ''
          const dataSrc = img.getAttribute('data-src') || ''
          const srcset = img.getAttribute('srcset') || ''
          const oldSrcBase = oldSrc.split('?')[0].split('#')[0]
          const currentSrcBase = currentSrc.split('?')[0].split('#')[0]

          // Check if this image matches the old source (exact match or URL match)
          // Also check srcset for responsive images (section 2)
          const matchesOldSrc = currentSrc === oldSrc ||
            currentSrc.includes(oldSrc) ||
            currentSrcBase === oldSrcBase ||
            dataSrc === oldSrc ||
            dataSrc.includes(oldSrc) ||
            currentSrc.replace(/[?#].*$/, '') === oldSrc.replace(/[?#].*$/, '') ||
            (srcset && (srcset.includes(oldSrc) || srcset.includes(oldSrcBase)))

          if (matchesOldSrc) {
            img.src = newSrc
            img.setAttribute('src', newSrc)

            // Also update data-src if present
            if (img.hasAttribute('data-src')) {
              img.setAttribute('data-src', newSrc)
            }

            // CRITICAL: Update srcset attribute for responsive images (section 2 uses this)
            if (img.hasAttribute('srcset')) {
              const currentSrcset = img.getAttribute('srcset') || ''
              const oldSrcBase = oldSrc.split('?')[0].split('#')[0]

              // Replace all instances of oldSrc in srcset with newSrc
              const updatedSrcset = currentSrcset.split(',').map(descriptor => {
                const trimmed = descriptor.trim()
                if (!trimmed) return trimmed

                const parts = trimmed.split(/\s+/)
                const url = parts[0]
                const size = parts[1] || ''

                if (url) {
                  const urlBase = url.split('?')[0].split('#')[0]
                  // Match by base URL (without query params) for better matching
                  const urlMatches = url === oldSrc ||
                    url.includes(oldSrc) ||
                    oldSrc.includes(urlBase) ||
                    urlBase === oldSrcBase ||
                    url.includes(oldSrcBase) ||
                    oldSrcBase.includes(urlBase)

                  if (urlMatches) {
                    return `${newSrc} ${size}`.trim()
                  }
                }
                return trimmed
              }).join(', ')
              img.setAttribute('srcset', updatedSrcset)
              console.log('✅ Updated srcset in iframe:', { oldSrcset: currentSrcset.substring(0, 100), newSrcset: updatedSrcset.substring(0, 100) })
            }

            // Force browser to reload the image
            img.style.opacity = '0.99'
            setTimeout(() => {
              img.style.opacity = '1'
            }, 10)

            updatedCount++
            console.log('✅ Updated iframe image:', { src: currentSrc, newSrc })
          }
        })

        console.log(`✅ Updated ${updatedCount} image(s) in iframe with new URL:`, newSrc)
      } catch (error) {
        console.error('❌ Failed to update iframe images:', error)
      }
    }

    // Now update the HTML - replace ALL instances of the old image URL
    const escapedOldSrc = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const encodedOldSrc = encodeURIComponent(oldSrc).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Pattern 1: Replace src="oldSrc" or src='oldSrc' (with quotes)
    const srcPattern1 = new RegExp(`(src=["'])${escapedOldSrc}(["'])`, 'gi')
    updatedHtml = updatedHtml.replace(srcPattern1, `$1${newSrc}$2`)

    // Pattern 2: Replace src="encodedOldSrc" (encoded URL)
    const srcPattern2 = new RegExp(`(src=["'])${encodedOldSrc}(["'])`, 'gi')
    updatedHtml = updatedHtml.replace(srcPattern2, `$1${newSrc}$2`)

    // Pattern 3: Replace data-src="oldSrc" or data-src='oldSrc'
    const dataSrcPattern = new RegExp(`(data-src=["'])${escapedOldSrc}(["'])`, 'gi')
    updatedHtml = updatedHtml.replace(dataSrcPattern, `$1${newSrc}$2`)

    // Pattern 4: Replace data-src="encodedOldSrc" (encoded URL)
    const dataSrcPattern2 = new RegExp(`(data-src=["'])${encodedOldSrc}(["'])`, 'gi')
    updatedHtml = updatedHtml.replace(dataSrcPattern2, `$1${newSrc}$2`)

    // Pattern 5: Replace srcset attributes (CRITICAL for section 2 responsive images)
    // Extract base URL without query params for better matching
    const oldSrcBase = oldSrc.split('?')[0].split('#')[0]
    const escapedOldSrcBase = oldSrcBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Match srcset with any content (not just containing oldSrc)
    const srcsetPattern = new RegExp(`(srcset=["'])([^"']+)(["'])`, 'gi')
    updatedHtml = updatedHtml.replace(srcsetPattern, (match, p1, p2, p3) => {
      // Check if this srcset contains the old image URL
      const srcsetContainsOld = p2.includes(oldSrc) || p2.includes(oldSrcBase)

      if (srcsetContainsOld) {
        // Replace all instances of oldSrc in srcset with newSrc
        const updatedSrcset = p2.split(',').map((descriptor: string) => {
          const trimmed = descriptor.trim()
          if (!trimmed) return trimmed

          const parts = trimmed.split(/\s+/)
          const url = parts[0]
          const size = parts[1] || ''

          if (url) {
            const urlBase = url.split('?')[0].split('#')[0]
            // Match by base URL (without query params) for better matching
            const urlMatches = url === oldSrc ||
              url.includes(oldSrc) ||
              oldSrc.includes(urlBase) ||
              urlBase === oldSrcBase ||
              url.includes(oldSrcBase) ||
              oldSrcBase.includes(urlBase)

            if (urlMatches) {
              return `${newSrc} ${size}`.trim()
            }
          }
          return trimmed
        }).join(', ')
        console.log('✅ Updated srcset in HTML:', { oldSrcset: p2.substring(0, 150), newSrcset: updatedSrcset.substring(0, 150) })
        return `${p1}${updatedSrcset}${p3}`
      }

      // Return original if srcset doesn't contain old image
      return match
    })

    // Pattern 6: Replace oldSrc without quotes (fallback for edge cases)
    const urlWithoutQuery = oldSrc.split('?')[0].split('#')[0]
    const escapedUrlWithoutQuery = urlWithoutQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const urlPattern = new RegExp(`(src=["'])([^"']*${escapedUrlWithoutQuery}[^"']*)(["'])`, 'gi')
    updatedHtml = updatedHtml.replace(urlPattern, (match, p1, p2, p3) => {
      const newUrl = p2.replace(new RegExp(escapedUrlWithoutQuery, 'gi'), newSrc.split('?')[0].split('#')[0])
      return `${p1}${newUrl}${p3}`
    })

    // Count how many replacements were made
    const imgRegex = /<img[^>]*>/gi
    const matches = updatedHtml.match(imgRegex) || []
    const replacementCount = (updatedHtml.match(new RegExp(escapedOldSrc, 'gi')) || []).length

    console.log(`✅ Replaced ALL instances of image URL in HTML (including srcset). Found ${matches.length} img tags, replaced ${replacementCount === 0 ? 'all' : replacementCount} instance(s)`)

    // Update HTML state - but skip iframe reload to preserve DOM changes
    skipIframeReloadRef.current = true
    setCurrentLandingPageHtml(updatedHtml)

    // Save image link to cache (same pattern as componentHtmlCache)
    if (imageIndex !== null) {
      setComponentImageLinksCache(prev => ({
        ...prev,
        [imageIndex]: newSrc
      }))
      console.log('💾 Saved image link to cache:', { imageIndex, newSrc })
    }

    // DO NOT reload iframe - just keep the DOM changes we made
    // The iframe already has the updated image, so we don't need to reload it

    setShowImageReplaceModal(false)
    setSelectedImageElement(null)
    setNewImageUrl('')

    // Re-inject the system after a delay (but don't cause flickering)
    // This will update overlays but won't reload the iframe
    setTimeout(() => {
      if (landingPageIframeRef.current?.contentDocument && injectImageReplacementSystem.current) {
        injectImageReplacementSystem.current()
      }
    }, 300)
  }

  const renderLandingPageTab = () => (
    <>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        {/* Header spanning full width */}
        <div className="px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0 h-[60px] flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
              <Layout size={18} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Landing Page Generator</h1>
              <span className="text-xs text-slate-500 font-medium">Better with Shopify</span>
            </div>
          </div>
        </div>

        {/* Content area - full width */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Content (now takes full width) */}
          <div className="w-1/3 min-w-[400px] max-w-[500px] border-r border-slate-200 flex flex-col bg-white h-full overflow-hidden">
            <div className="flex-1 overflow-auto">
              {/* Accordion Sections */}
              <div className="flex flex-col">
                {/* AI Settings Section */}
                <div className="border-b border-slate-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'ai-settings' ? null : 'ai-settings')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">AI Settings</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-slate-500 transition-transform duration-200 ${expandedSection === 'ai-settings' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'ai-settings' ? 'max-h-[2000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-slate-50/50 space-y-4">
                      {/* Language Selector */}
                      <div className="space-y-2 relative">
                        <label className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1">
                          <Globe size={14} />
                          Language
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all text-slate-900 font-medium flex items-center justify-between"
                          >
                            <span>{selectedLanguage}</span>
                            <ChevronDown size={16} className={`text-slate-500 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {languageDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                              {languageOptions.map((language) => (
                                <button
                                  key={language}
                                  onClick={() => {
                                    setSelectedLanguage(language)
                                    setLanguageDropdownOpen(false)
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-all ${selectedLanguage === language ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-700'
                                    }`}
                                >
                                  {language}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tone Selector */}
                      <div className="space-y-2 relative">
                        <label className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1">
                          <Music2 size={14} />
                          Tone
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all text-slate-900 font-medium flex items-center justify-between"
                          >
                            <span>{selectedTone}</span>
                            <ChevronDown size={16} className={`text-slate-500 transition-transform ${toneDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {toneDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg">
                              {toneOptions.map((tone) => (
                                <button
                                  key={tone}
                                  onClick={() => {
                                    setSelectedTone(tone)
                                    if (tone !== 'Custom') {
                                      setToneDropdownOpen(false)
                                    }
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-all ${selectedTone === tone ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-700'
                                    }`}
                                >
                                  {tone}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedTone === 'Custom' && (
                          <input
                            type="text"
                            value={customTone}
                            onChange={(e) => setCustomTone(e.target.value)}
                            placeholder="Describe your custom tone..."
                            className="w-full px-4 py-3 mt-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        )}
                      </div>

                      {/* AI Provider Selector */}
                      <div className="space-y-2 relative">
                        <label className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1">
                          <Brain size={14} />
                          AI Provider
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => setAdNetworkDropdownOpen(!adNetworkDropdownOpen)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all text-slate-900 font-medium flex items-center justify-between"
                          >
                            <span className="capitalize">{aiProvider === 'deepseek' ? 'DeepSeek' : 'Gemini'}</span>
                            <ChevronDown size={16} className={`text-slate-500 transition-transform ${adNetworkDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {adNetworkDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg">
                              <button
                                onClick={() => {
                                  setAiProvider('deepseek')
                                  setAdNetworkDropdownOpen(false)
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 border-b border-slate-200 transition-all ${aiProvider === 'deepseek' ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-700'
                                  }`}
                              >
                                <div className="font-semibold">DeepSeek</div>
                                <div className="text-xs text-slate-500 mt-0.5">Fast and efficient AI model</div>
                              </button>
                              <button
                                onClick={() => {
                                  setAiProvider('gemini')
                                  setAdNetworkDropdownOpen(false)
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-all ${aiProvider === 'gemini' ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-700'
                                  }`}
                              >
                                <div className="font-semibold">Gemini</div>
                                <div className="text-xs text-slate-500 mt-0.5">Google's advanced AI model</div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product URL or Text */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1">
                          <Store size={14} />
                          Product URL or Text
                        </label>
                        <textarea
                          value={productInput}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setProductInput(newValue);

                            // URL detection - same logic as AdcopyGen
                            const isUrlInput = (() => {
                              const input = newValue.trim();
                              if (!input || !input.includes('.')) {
                                return false;
                              }
                              try {
                                const testUrl = input.startsWith('http') ? input : `https://${input}`;
                                new URL(testUrl);
                                return true;
                              } catch (err) {
                                return false;
                              }
                            })();

                            if (isUrlInput) {
                              // Clean URL by removing query parameters
                              let cleanedUrl = newValue.trim();

                              // ALWAYS normalize AliExpress URLs to www
                              if (cleanedUrl.includes('aliexpress.com')) {
                                cleanedUrl = cleanedUrl.replace(/https?:\/\/([a-z]{2}\.)?aliexpress\.com/i, 'https://www.aliexpress.com');
                              }

                              const questionMarkIndex = cleanedUrl.indexOf('?');
                              if (questionMarkIndex !== -1) {
                                cleanedUrl = cleanedUrl.substring(0, questionMarkIndex);
                              }

                              // Set webpageUrl for scraping
                              if (cleanedUrl !== webpageUrl.trim()) {
                                setWebpageUrl(cleanedUrl);
                                console.log('🔍 [URL DETECTION] Detected URL:', cleanedUrl);
                              }
                            } else {
                              // Not a URL - clear webpageUrl
                              if (webpageUrl) {
                                setWebpageUrl('');
                              }
                            }
                          }}
                          placeholder="Enter product description or paste a URL..."
                          rows={4}
                          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                        />
                        {/* Test Scrape Button */}
                        {productInput.trim() && isUrl(productInput) && (
                          <button
                            onClick={async () => {
                              const urlToTest = productInput.trim()
                              let cleanedUrl = urlToTest

                              // Normalize AliExpress URLs
                              if (cleanedUrl.includes('aliexpress.com')) {
                                cleanedUrl = cleanedUrl.replace(/https?:\/\/([a-z]{2}\.)?aliexpress\.com/i, 'https://www.aliexpress.com')
                              }

                              // Remove query parameters
                              const questionMarkIndex = cleanedUrl.indexOf('?')
                              if (questionMarkIndex !== -1) {
                                cleanedUrl = cleanedUrl.substring(0, questionMarkIndex)
                              }

                              console.log('🧪 Testing scrape for URL:', cleanedUrl)

                              try {
                                const { data: { session } } = await supabase.auth.getSession()
                                if (!session) {
                                  alert('Authentication required')
                                  return
                                }

                                const textParts: string[] = []

                                // Test scrape-webpage
                                const scrapeResponse = await fetch('https://auth.symplysis.com/functions/v1/scrape-webpage', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`,
                                  },
                                  body: JSON.stringify({ url: cleanedUrl })
                                })

                                if (scrapeResponse.ok) {
                                  const scrapeData = await scrapeResponse.json()
                                  if (scrapeData.success && scrapeData.content) {
                                    textParts.push(`=== WEBPAGE CONTENT ===\n\n${scrapeData.content}`)
                                    console.log('✅ Scrape test result:', {
                                      success: scrapeData.success,
                                      contentLength: scrapeData.content?.length || 0,
                                      title: scrapeData.title
                                    })
                                  }
                                } else {
                                  const errorText = await scrapeResponse.text()
                                  console.error('❌ Scrape test failed:', errorText)
                                }

                                // Test image-ocr-v2
                                const ocrResponse = await fetch('https://auth.symplysis.com/functions/v1/image-ocr-v2', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`,
                                  },
                                  body: JSON.stringify({ url: cleanedUrl, language: selectedLanguage })
                                })

                                if (ocrResponse.ok) {
                                  const ocrData = await ocrResponse.json()
                                  if (ocrData.success) {
                                    if (ocrData.results && Array.isArray(ocrData.results)) {
                                      const ocrTextParts: string[] = []
                                      ocrData.results.forEach((result: any, index: number) => {
                                        if (result.text && result.text.trim() && !result.error && result.confidence > 0) {
                                          ocrTextParts.push(result.text.trim())
                                        }
                                      })
                                      if (ocrTextParts.length > 0) {
                                        textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrTextParts.join('\n\n')}`)
                                      }
                                    } else if (ocrData.text || ocrData.ocrText || ocrData.content) {
                                      const ocrText = ocrData.text || ocrData.ocrText || ocrData.content
                                      textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrText}`)
                                    }
                                    console.log('✅ OCR test result:', {
                                      success: ocrData.success,
                                      resultsCount: ocrData.results?.length || 0
                                    })
                                  }
                                } else {
                                  const errorText = await ocrResponse.text()
                                  console.error('❌ OCR test failed:', errorText)
                                }

                                // Combine and cache results (same as normal scrape)
                                let combinedText = textParts.join('\n\n\n')

                                if (combinedText && combinedText.trim()) {
                                  // Extract images from scraped content
                                  const images = extractImageUrls(combinedText)
                                  setScrapedImages(images)

                                  // Cache the FULL HTML results (same as normal scrape)
                                  setVisionAIOcrCache(prev => ({
                                    ...prev,
                                    [cleanedUrl]: {
                                      text: combinedText,
                                      timestamp: Date.now()
                                    }
                                  }))

                                  setScrapedProductContent(combinedText)
                                  setLastScrapedUrl(cleanedUrl)

                                  console.log('💾 Cached test scrape results:', {
                                    url: cleanedUrl,
                                    contentLength: combinedText.length,
                                    imagesCount: images.length
                                  })

                                  alert(`✅ Test scrape successful and cached!\n\nContent: ${combinedText.length} chars\nImages: ${images.length} found\n\nResults are now cached and ready to use.`)
                                } else {
                                  alert('⚠️ Test scrape completed but no content was extracted.')
                                }
                              } catch (error) {
                                console.error('❌ Test scrape error:', error)
                                alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
                              }
                            }}
                            className="w-full mt-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                          >
                            <RefreshCcw size={16} />
                            Test Scrape
                          </button>
                        )}
                      </div>

                      {/* Free Delivery Toggle */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1">
                          <TrendingUp size={14} />
                          Free Delivery
                        </label>
                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Product has free delivery?</p>
                            <p className="text-xs text-slate-500 mt-0.5">AI will remove free delivery mentions</p>
                          </div>
                          <button
                            onClick={() => setHasFreeDelivery(!hasFreeDelivery)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${hasFreeDelivery ? 'bg-green-600' : 'bg-slate-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasFreeDelivery ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Landing Page Template */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1">
                          <Layout size={14} />
                          Landing Page Template
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            onClick={() => setSelectedTemplate('ATLAS_SHOPIFY')}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${selectedTemplate === 'ATLAS_SHOPIFY'
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                          >
                            <div className="w-full h-20 rounded-lg overflow-hidden mb-2 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#9b9a9c' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#ffffff' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#f7fafc' }}></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-900">ATLAS SHOPIFY</span>
                          </button>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={handleProductRewriting}
                          disabled={!productInput.trim() || isRewriting || addedLandingPageComponents.length === 0 || (selectedTone === 'Custom' && !customTone.trim())}
                          className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                          title={
                            addedLandingPageComponents.length === 0
                              ? 'Add at least one component first'
                              : !productInput.trim()
                                ? 'Enter a product name or URL first'
                                : selectedTone === 'Custom' && !customTone.trim()
                                  ? 'Enter custom tone description first'
                                  : 'Generate landing page with AI'
                          }
                        >
                          {isRewriting ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Rewriting Step {currentRewritingStep}...
                            </>
                          ) : (
                            <>
                              <Blocks size={18} />
                              Generate Landing Page
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            // Check both webpageUrl and productInput for URL
                            const urlToCheck = webpageUrl.trim() || (productInput.trim().startsWith('http') ? productInput.trim() : '');
                            const trimmedUrl = urlToCheck ? urlToCheck.split('?')[0] : '';
                            const visionOcrData = trimmedUrl ? visionAIOcrCache[trimmedUrl] : null;
                            let contentToShow = '';
                            if (visionOcrData) {
                              // Show FULL HTML - NO FILTERING
                              contentToShow = visionOcrData.text;
                            } else if (scrapedContent) {
                              // Show FULL HTML - NO FILTERING
                              contentToShow = scrapedContent;
                            } else if (scrapedProductContent) {
                              // Show FULL HTML - NO FILTERING
                              contentToShow = scrapedProductContent;
                            }
                            setCachedContentToDisplay(contentToShow);
                            setShowCachedContentModal(true);
                          }}
                          disabled={!scrapedContent && !visionAIOcrCache[webpageUrl.trim()] && !visionAIOcrCache[productInput.trim().split('?')[0]]}
                          className="px-5 py-3 font-medium rounded-xl transition-all bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
                          title={visionAIOcrCache[webpageUrl.trim()] || visionAIOcrCache[productInput.trim().split('?')[0]] ? 'View cached Vision AI OCR results' : 'View cached scraped content'}
                        >
                          <ClipboardList size={18} />
                        </button>
                        {isRewriting && (
                          <button
                            onClick={() => setRewritingAborted(true)}
                            className="w-full mt-2 px-6 py-3 font-semibold rounded-xl transition-all bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <X size={18} />
                            Stop Generation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden Image Links Storage Section (for persistence) */}
                <div className="border-b border-slate-200 hidden">
                  <div className="px-6 py-4 bg-slate-50/50">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-900">Image Links Cache (Hidden)</label>
                      <div className="text-xs text-slate-500 space-y-1">
                        {Object.keys(componentImageLinksCache).length > 0 ? (
                          Object.entries(componentImageLinksCache).map(([index, url]) => (
                            <div key={index} className="truncate">
                              Image {index}: {url.substring(0, 50)}...
                            </div>
                          ))
                        ) : (
                          <div>No image links cached</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Components Section */}
                <div className="border-b border-slate-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'components' ? null : 'components')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Blocks size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Page Components</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-slate-500 transition-transform duration-200 ${expandedSection === 'components' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'components' ? 'max-h-[2000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-slate-50/50">
                      <div className="space-y-4">
                        <div className="text-sm text-slate-600">
                          ATLAS SHOPIFY template components are managed through the component system.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Information Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'product-info' ? null : 'product-info')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Store size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Product Information</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'product-info' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'product-info' ? 'max-h-[3000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-gray-50/50 space-y-6">
                      {/* Product Title and Price */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Product information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product title</label>
                            <input
                              type="text"
                              value={productTitle}
                              onChange={(e) => setProductTitle(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product price</label>
                            <input
                              type="number"
                              value={productPrice}
                              onChange={(e) => setProductPrice(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Currency symbol (replaces all $ signs)</label>
                            <input
                              type="text"
                              value={salePrice || comparePrice || '$'}
                              onChange={(e) => {
                                const newSymbol = e.target.value || '$'
                                setSalePrice(newSymbol)
                                setComparePrice(newSymbol)

                                // Find all currency symbols in the HTML and replace them
                                if (currentLandingPageHtml) {
                                  // Escape special regex characters in the current symbol
                                  const currentSymbol = salePrice || comparePrice || '$'
                                  const escapedCurrentSymbol = currentSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

                                  // Find all instances of the currency symbol pattern (before numbers)
                                  // Pattern: symbol followed by digits (like $99.99, $0.00, etc.)
                                  const currencyPattern = new RegExp(`(${escapedCurrentSymbol})(?=\\d)`, 'g')

                                  // Replace all instances in the HTML string
                                  let updatedHtml = currentLandingPageHtml.replace(currencyPattern, newSymbol)

                                  // Also replace standalone currency symbols (not just before numbers)
                                  // This catches cases like "$" in text or attributes
                                  const escapedNewSymbol = newSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                                  updatedHtml = updatedHtml.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol)

                                  // Update the HTML state
                                  skipIframeReloadRef.current = true
                                  setCurrentLandingPageHtml(updatedHtml)

                                  // Also update the iframe DOM directly for immediate visual feedback
                                  if (landingPageIframeRef.current) {
                                    const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
                                    if (iframeDoc) {
                                      // Find all text nodes and replace currency symbols
                                      const walker = iframeDoc.createTreeWalker(
                                        iframeDoc.body || iframeDoc.documentElement,
                                        NodeFilter.SHOW_TEXT,
                                        null
                                      )

                                      const textNodes: Text[] = []
                                      let node
                                      while (node = walker.nextNode()) {
                                        textNodes.push(node as Text)
                                      }

                                      textNodes.forEach(textNode => {
                                        if (textNode.textContent && textNode.textContent.includes(currentSymbol)) {
                                          textNode.textContent = textNode.textContent.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol)
                                        }
                                      })

                                      // Specifically target the price__sale div structure
                                      const priceSaleDiv = iframeDoc.querySelector('div.price__sale')
                                      if (priceSaleDiv) {
                                        // Update sale price span: price-item--sale price-item--last
                                        const salePriceSpan = priceSaleDiv.querySelector('span.price-item.price-item--sale.price-item--last')
                                        if (salePriceSpan) {
                                          const currentText = salePriceSpan.textContent || ''
                                          if (currentText.includes(currentSymbol)) {
                                            salePriceSpan.textContent = currentText.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol)
                                          }
                                        }

                                        // Update compare price: find the <s> tag inside price__compare-price
                                        const comparePriceSpan = priceSaleDiv.querySelector('span.price__compare-price')
                                        if (comparePriceSpan) {
                                          const comparePriceS = comparePriceSpan.querySelector('s.price-item.price-item--regular')
                                          if (comparePriceS) {
                                            const currentText = comparePriceS.textContent || ''
                                            if (currentText.includes(currentSymbol)) {
                                              comparePriceS.textContent = currentText.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol)
                                            }
                                          }
                                        }
                                      }

                                      // Specifically update the <s> tag with price-item--regular class (fallback)
                                      const comparePriceElement = iframeDoc.querySelector('s.price-item.price-item--regular')
                                      if (comparePriceElement) {
                                        const currentText = comparePriceElement.textContent || ''
                                        if (currentText.includes(currentSymbol)) {
                                          comparePriceElement.textContent = currentText.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol)
                                        }
                                      }

                                      // Update sale price span: price-item--sale price-item--last (fallback)
                                      const salePriceSpan = iframeDoc.querySelector('span.price-item.price-item--sale.price-item--last')
                                      if (salePriceSpan) {
                                        const currentText = salePriceSpan.textContent || ''
                                        if (currentText.includes(currentSymbol)) {
                                          salePriceSpan.textContent = currentText.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol)
                                        }
                                      }

                                      // Also update the regular price-item--regular (not in <s> tag)
                                      const regularPriceElement = iframeDoc.querySelector('.price-item.price-item--regular')
                                      if (regularPriceElement && regularPriceElement.tagName !== 'S') {
                                        const currentText = regularPriceElement.textContent || ''
                                        if (currentText.includes(currentSymbol)) {
                                          regularPriceElement.textContent = currentText.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol)
                                        }
                                      }

                                      // Also update attributes that might contain currency symbols
                                      const allElements = iframeDoc.querySelectorAll('*')
                                      allElements.forEach((el: Element) => {
                                        Array.from(el.attributes).forEach(attr => {
                                          if (attr.value && attr.value.includes(currentSymbol)) {
                                            el.setAttribute(attr.name, attr.value.replace(new RegExp(escapedCurrentSymbol, 'g'), newSymbol))
                                          }
                                        })
                                      })
                                    }
                                  }
                                }
                              }}
                              placeholder="$"
                              maxLength={3}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Product Taglines */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Product taglines</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product tagline 1</label>
                            <input
                              type="text"
                              value={productTagline1}
                              onChange={(e) => setProductTagline1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product tagline 2</label>
                            <input
                              type="text"
                              value={productTagline2}
                              onChange={(e) => setProductTagline2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Icon Bullet Points */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Product icon bullet points</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Icon bullet point 1</label>
                            <input
                              type="text"
                              value={iconBullet1}
                              onChange={(e) => setIconBullet1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Icon bullet point 2</label>
                            <input
                              type="text"
                              value={iconBullet2}
                              onChange={(e) => setIconBullet2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Icon bullet point 3</label>
                            <input
                              type="text"
                              value={iconBullet3}
                              onChange={(e) => setIconBullet3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Icon bullet point 4</label>
                            <input
                              type="text"
                              value={iconBullet4}
                              onChange={(e) => setIconBullet4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Icon bullet point 5</label>
                            <input
                              type="text"
                              value={iconBullet5}
                              onChange={(e) => setIconBullet5(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Product Description Dropdown */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Product description dropdown</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={productDescription}
                              onChange={(e) => setProductDescription(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description point 1</label>
                            <input
                              type="text"
                              value={descPoint1}
                              onChange={(e) => setDescPoint1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description point 2</label>
                            <input
                              type="text"
                              value={descPoint2}
                              onChange={(e) => setDescPoint2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description point 3</label>
                            <input
                              type="text"
                              value={descPoint3}
                              onChange={(e) => setDescPoint3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description point 4</label>
                            <input
                              type="text"
                              value={descPoint4}
                              onChange={(e) => setDescPoint4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Product Key Features */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Product key features</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Heading</label>
                            <input
                              type="text"
                              value={keyFeaturesHeading}
                              onChange={(e) => setKeyFeaturesHeading(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Key Point 1</label>
                            <input
                              type="text"
                              value={keyPoint1}
                              onChange={(e) => setKeyPoint1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Key Point 2</label>
                            <input
                              type="text"
                              value={keyPoint2}
                              onChange={(e) => setKeyPoint2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Key Point 3</label>
                            <input
                              type="text"
                              value={keyPoint3}
                              onChange={(e) => setKeyPoint3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Key Point 4</label>
                            <input
                              type="text"
                              value={keyPoint4}
                              onChange={(e) => setKeyPoint4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'content-sections' ? null : 'content-sections')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Layout size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Content Sections</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'content-sections' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'content-sections' ? 'max-h-[3000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-gray-50/50 space-y-6">
                      {/* Image with text 1 */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Image with text 1</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Headline</label>
                            <input
                              type="text"
                              value={imageText1Headline}
                              onChange={(e) => setImageText1Headline(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Paragraph</label>
                            <input
                              type="text"
                              value={imageText1Paragraph}
                              onChange={(e) => setImageText1Paragraph(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 1</label>
                            <input
                              type="text"
                              value={imageText1Bullet1}
                              onChange={(e) => setImageText1Bullet1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 2</label>
                            <input
                              type="text"
                              value={imageText1Bullet2}
                              onChange={(e) => setImageText1Bullet2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 3</label>
                            <input
                              type="text"
                              value={imageText1Bullet3}
                              onChange={(e) => setImageText1Bullet3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Horizontal scrolling images */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Horizontal scrolling images</h3>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Horizontal scrolling images heading</label>
                          <input
                            type="text"
                            value={horizontalScrollHeading}
                            onChange={(e) => setHorizontalScrollHeading(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Horizontal scrolling text */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Horizontal scrolling text</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 1</label>
                            <input
                              type="text"
                              value={horizScrollText1}
                              onChange={(e) => setHorizScrollText1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 2</label>
                            <input
                              type="text"
                              value={horizScrollText2}
                              onChange={(e) => setHorizScrollText2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 3</label>
                            <input
                              type="text"
                              value={horizScrollText3}
                              onChange={(e) => setHorizScrollText3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 4</label>
                            <input
                              type="text"
                              value={horizScrollText4}
                              onChange={(e) => setHorizScrollText4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>


                      {/* Image with text 2 */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Image with text 2</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Headline</label>
                            <input
                              type="text"
                              value={imageText2Headline}
                              onChange={(e) => setImageText2Headline(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Paragraph</label>
                            <input
                              type="text"
                              value={imageText2Paragraph}
                              onChange={(e) => setImageText2Paragraph(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 1</label>
                            <input
                              type="text"
                              value={imageText2Bullet1}
                              onChange={(e) => setImageText2Bullet1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 2</label>
                            <input
                              type="text"
                              value={imageText2Bullet2}
                              onChange={(e) => setImageText2Bullet2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 3</label>
                            <input
                              type="text"
                              value={imageText2Bullet3}
                              onChange={(e) => setImageText2Bullet3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text & Interactive Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'text-interactive' ? null : 'text-interactive')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Text & Interactive</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'text-interactive' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'text-interactive' ? 'max-h-[3000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-gray-50/50 space-y-6">
                      {/* Horizontal scrolling text */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Horizontal scrolling text</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 1</label>
                            <input
                              type="text"
                              value={horizScrollText1}
                              onChange={(e) => setHorizScrollText1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 2</label>
                            <input
                              type="text"
                              value={horizScrollText2}
                              onChange={(e) => setHorizScrollText2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 3</label>
                            <input
                              type="text"
                              value={horizScrollText3}
                              onChange={(e) => setHorizScrollText3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text 4</label>
                            <input
                              type="text"
                              value={horizScrollText4}
                              onChange={(e) => setHorizScrollText4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Interactive Sections */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'interactive-sections' ? null : 'interactive-sections')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Zap size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Interactive Sections</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'interactive-sections' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'interactive-sections' ? 'max-h-[3000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-gray-50/50 space-y-6">
                      {/* Rich text section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Rich text section</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Headline</label>
                            <input
                              type="text"
                              value={richTextHeadline}
                              onChange={(e) => setRichTextHeadline(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Paragraph</label>
                            <input
                              type="text"
                              value={richTextParagraph}
                              onChange={(e) => setRichTextParagraph(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reasons to buy section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Reasons to buy section</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Heading</label>
                            <input
                              type="text"
                              value={reasonsBuyHeading}
                              onChange={(e) => setReasonsBuyHeading(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block subheading 1</label>
                            <input
                              type="text"
                              value={statSubhead1}
                              onChange={(e) => setStatSubhead1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block sentence 1</label>
                            <input
                              type="text"
                              value={statSentence1}
                              onChange={(e) => setStatSentence1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block subheading 2</label>
                            <input
                              type="text"
                              value={statSubhead2}
                              onChange={(e) => setStatSubhead2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block sentence 2</label>
                            <input
                              type="text"
                              value={statSentence2}
                              onChange={(e) => setStatSentence2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block subheading 3</label>
                            <input
                              type="text"
                              value={statSubhead3}
                              onChange={(e) => setStatSubhead3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block sentence 3</label>
                            <input
                              type="text"
                              value={statSentence3}
                              onChange={(e) => setStatSentence3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block subheading 4</label>
                            <input
                              type="text"
                              value={statSubhead4}
                              onChange={(e) => setStatSubhead4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stat block sentence 4</label>
                            <input
                              type="text"
                              value={statSentence4}
                              onChange={(e) => setStatSentence4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Comparison section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Comparison section</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Heading</label>
                            <input
                              type="text"
                              value={comparisonHeading}
                              onChange={(e) => setComparisonHeading(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={comparisonDescription}
                              onChange={(e) => setComparisonDescription(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Row 1</label>
                            <input
                              type="text"
                              value={comparisonRow1}
                              onChange={(e) => setComparisonRow1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Row 2</label>
                            <input
                              type="text"
                              value={comparisonRow2}
                              onChange={(e) => setComparisonRow2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Row 3</label>
                            <input
                              type="text"
                              value={comparisonRow3}
                              onChange={(e) => setComparisonRow3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Row 4</label>
                            <input
                              type="text"
                              value={comparisonRow4}
                              onChange={(e) => setComparisonRow4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Row 5</label>
                            <input
                              type="text"
                              value={comparisonRow5}
                              onChange={(e) => setComparisonRow5(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Guarantees & Reviews */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'guarantees-reviews' ? null : 'guarantees-reviews')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Guarantees & Reviews</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'guarantees-reviews' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'guarantees-reviews' ? 'max-h-[2000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-gray-50/50 space-y-6">
                      {/* Icon guarantees 1 */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Icon guarantees 1</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Point 1</label>
                            <input
                              type="text"
                              value={iconGuarantee1}
                              onChange={(e) => setIconGuarantee1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Point 2</label>
                            <input
                              type="text"
                              value={iconGuarantee2}
                              onChange={(e) => setIconGuarantee2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Point 3</label>
                            <input
                              type="text"
                              value={iconGuarantee3}
                              onChange={(e) => setIconGuarantee3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Point 4</label>
                            <input
                              type="text"
                              value={iconGuarantee4}
                              onChange={(e) => setIconGuarantee4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reviews section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Reviews section</h3>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Review section heading</label>
                          <input
                            type="text"
                            value={reviewsHeading}
                            onChange={(e) => setReviewsHeading(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Satisfaction guarantee */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Satisfaction guarantee</h3>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Paragraph</label>
                          <input
                            type="text"
                            value={satisfactionParagraph}
                            onChange={(e) => setSatisfactionParagraph(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Most Common Questions */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'common-questions' ? null : 'common-questions')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Most Common Questions</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'common-questions' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'common-questions' ? 'max-h-[2000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-gray-50/50 space-y-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Most common questions</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Question 1</label>
                            <input
                              type="text"
                              value={commonQ1}
                              onChange={(e) => setCommonQ1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Answer 1</label>
                            <input
                              type="text"
                              value={commonA1}
                              onChange={(e) => setCommonA1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Question 2</label>
                            <input
                              type="text"
                              value={commonQ2}
                              onChange={(e) => setCommonQ2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Answer 2</label>
                            <input
                              type="text"
                              value={commonA2}
                              onChange={(e) => setCommonA2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Question 3</label>
                            <input
                              type="text"
                              value={commonQ3}
                              onChange={(e) => setCommonQ3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Answer 3</label>
                            <input
                              type="text"
                              value={commonA3}
                              onChange={(e) => setCommonA3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'faq' ? null : 'faq')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Target size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">FAQ Section</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'faq' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'faq' ? 'max-h-[2000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-gray-50/50 space-y-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">FAQ section</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ question 1</label>
                            <input
                              type="text"
                              value={faqQ1}
                              onChange={(e) => setFaqQ1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ response 1</label>
                            <input
                              type="text"
                              value={faqA1}
                              onChange={(e) => setFaqA1(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ question 2</label>
                            <input
                              type="text"
                              value={faqQ2}
                              onChange={(e) => setFaqQ2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ response 2</label>
                            <input
                              type="text"
                              value={faqA2}
                              onChange={(e) => setFaqA2(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ question 3</label>
                            <input
                              type="text"
                              value={faqQ3}
                              onChange={(e) => setFaqQ3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ response 3</label>
                            <input
                              type="text"
                              value={faqA3}
                              onChange={(e) => setFaqA3(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ question 4</label>
                            <input
                              type="text"
                              value={faqQ4}
                              onChange={(e) => setFaqQ4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ response 4</label>
                            <input
                              type="text"
                              value={faqA4}
                              onChange={(e) => setFaqA4(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ question 5</label>
                            <input
                              type="text"
                              value={faqQ5}
                              onChange={(e) => setFaqQ5(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">FAQ response 5</label>
                            <input
                              type="text"
                              value={faqA5}
                              onChange={(e) => setFaqA5(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customization Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'customization' ? null : 'customization')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings2 size={20} className="text-green-600" />
                      <span className="text-base font-semibold text-slate-900">Customization</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-200 ${expandedSection === 'customization' ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedSection === 'customization' ? 'max-h-[2000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="px-6 py-4 bg-slate-50/50 space-y-6">
                      {/* Color Presets Section */}
                      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-slate-900">Color presets</h3>
                          <p className="text-xs text-slate-500">Choose from our variety of color presets</p>
                        </div>
                        <div className="grid grid-cols-6 gap-3">
                          {/* Preset 1 */}
                          <button className="group relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#667eea' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#764ba2' }}></div>
                            </div>
                          </button>
                          {/* Preset 2 */}
                          <button className="group relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#f093fb' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#f5576c' }}></div>
                            </div>
                          </button>
                          {/* Preset 3 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#4facfe' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#00f2fe' }}></div>
                            </div>
                          </button>
                          {/* Preset 4 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#43e97b' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#38f9d7' }}></div>
                            </div>
                          </button>
                          {/* Preset 5 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#fa709a' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#fee140' }}></div>
                            </div>
                          </button>
                          {/* Preset 6 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#30cfd0' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#330867' }}></div>
                            </div>
                          </button>
                          {/* Preset 7 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#a8edea' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#fed6e3' }}></div>
                            </div>
                          </button>
                          {/* Preset 8 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#ff9a9e' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#fecfef' }}></div>
                            </div>
                          </button>
                          {/* Preset 9 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#ffecd2' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#fcb69f' }}></div>
                            </div>
                          </button>
                          {/* Preset 10 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#ff6e7f' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#bfe9ff' }}></div>
                            </div>
                          </button>
                          {/* Preset 11 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#e0c3fc' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#8ec5fc' }}></div>
                            </div>
                          </button>
                          {/* Preset 12 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#f3e7e9' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#e3eeff' }}></div>
                            </div>
                          </button>
                          {/* Preset 13 */}
                          <button className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md rounded-xl">
                            <div className="absolute inset-0 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: '#ffeaa7' }}></div>
                              <div className="flex-1" style={{ backgroundColor: '#fdcb6e' }}></div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Custom Colors Section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold text-slate-900">Custom colors</h3>
                          <p className="text-sm text-slate-600">Pick colors based on your personal preferences</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Primary Color */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Primary</label>
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-full h-32 rounded-lg border-2 border-gray-200 cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">#</span>
                              <input
                                type="text"
                                value={primaryColor.substring(1)}
                                onChange={(e) => setPrimaryColor('#' + e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={6}
                              />
                            </div>
                          </div>
                          {/* Tertiary Color */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tertiary</label>
                            <input
                              type="color"
                              value={tertiaryColor}
                              onChange={(e) => setTertiaryColor(e.target.value)}
                              className="w-full h-32 rounded-lg border-2 border-gray-200 cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">#</span>
                              <input
                                type="text"
                                value={tertiaryColor.substring(1)}
                                onChange={(e) => setTertiaryColor('#' + e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={6}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Panel - Preview */}
          <div className="flex-1 min-w-0 border-r border-slate-200 flex flex-col bg-white h-full overflow-hidden">
            {/* Preview Header */}
            <div className="px-6 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">Preview</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile View Toggle Button */}
                <button
                  onClick={() => setIsMobileView(!isMobileView)}
                  className={`inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 ${isMobileView
                      ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
                    }`}
                  title={isMobileView ? 'Desktop View' : 'Mobile View (9:16)'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </button>
                {/* RTL Toggle Button */}
                <button
                  onClick={() => {
                    const newRtlState = !isRtlEnabled
                    setIsRtlEnabled(newRtlState)

                    // Immediately update iframe HTML with dir attribute
                    if (landingPageIframeRef.current && !isLandingPageCodeView) {
                      const iframeDoc = landingPageIframeRef.current.contentDocument || landingPageIframeRef.current.contentWindow?.document
                      if (iframeDoc && iframeDoc.documentElement) {
                        // Always keep scrollbar on the right
                        iframeDoc.documentElement.style.direction = 'ltr'
                        iframeDoc.documentElement.style.overflowY = 'scroll' // Force scrollbar to always show

                        if (newRtlState) {
                          iframeDoc.documentElement.setAttribute('dir', 'rtl')
                          if (iframeDoc.body) {
                            iframeDoc.body.style.direction = 'rtl'
                            iframeDoc.body.style.paddingLeft = '10px'
                            iframeDoc.body.style.paddingRight = '0'
                          }
                        } else {
                          iframeDoc.documentElement.removeAttribute('dir')
                          if (iframeDoc.body) {
                            iframeDoc.body.style.direction = 'ltr'
                            iframeDoc.body.style.paddingRight = '10px'
                            iframeDoc.body.style.paddingLeft = '0'
                          }
                        }
                      }
                    }
                  }}
                  className={`inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 ${isRtlEnabled
                      ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
                    }`}
                  title={isRtlEnabled ? 'Switch to LTR' : 'Switch to RTL'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtlEnabled ? 'scaleX(-1)' : 'none', transition: 'transform 0.2s ease' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={toggleLandingPageCodeView}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-200"
                  title={isLandingPageCodeView ? 'Preview' : 'Code'}
                >
                  <SquarePen size={14} />
                </button>
                <button
                  onClick={async () => {
                    if (!currentLandingPageHtml) return
                    try {
                      // Generate a random ID for the preview
                      const previewId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

                      // Store the HTML in localStorage or sessionStorage
                      sessionStorage.setItem(`landing_preview_${previewId}`, currentLandingPageHtml)

                      // Open in new tab
                      window.open(`/symplysis/${previewId}`, '_blank')
                    } catch (error) {
                      console.error('Failed to open preview:', error)
                    }
                  }}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all duration-200"
                  title="Open in New Tab"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                <div className="relative">
                  <button
                    ref={copyButtonRef}
                    onClick={copyLandingPageHtml}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-200"
                    title="Copy HTML"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 108.44 122.88">
                      <path fill="#95BF47" fillRule="evenodd" clipRule="evenodd" d="M94.98,23.66c-0.09-0.62-0.63-0.96-1.08-1c-0.45-0.04-9.19-0.17-9.19-0.17s-7.32-7.1-8.04-7.83 c-0.72-0.72-2.13-0.5-2.68-0.34c-0.01,0-1.37,0.43-3.68,1.14c-0.38-1.25-0.95-2.78-1.76-4.32c-2.6-4.97-6.42-7.6-11.03-7.61 c-0.01,0-0.01,0-0.02,0c-0.32,0-0.64,0.03-0.96,0.06c-0.14-0.16-0.27-0.32-0.42-0.48c-2.01-2.15-4.58-3.19-7.67-3.1 c-5.95,0.17-11.88,4.47-16.69,12.11c-3.38,5.37-5.96,12.12-6.69,17.35c-6.83,2.12-11.61,3.6-11.72,3.63 c-3.45,1.08-3.56,1.19-4.01,4.44C9.03,39.99,0,109.8,0,109.8l75.65,13.08l32.79-8.15C108.44,114.73,95.06,24.28,94.98,23.66 L94.98,23.66z M66.52,16.63c-1.74,0.54-3.72,1.15-5.87,1.82c-0.04-3.01-0.4-7.21-1.81-10.83C63.36,8.47,65.58,13.58,66.52,16.63 L66.52,16.63z M56.69,19.68c-3.96,1.23-8.29,2.57-12.63,3.91c1.22-4.67,3.54-9.33,6.38-12.38c1.06-1.14,2.54-2.4,4.29-3.12 C56.38,11.52,56.73,16.39,56.69,19.68L56.69,19.68z M48.58,3.97c1.4-0.03,2.57,0.28,3.58,0.94C50.55,5.74,49,6.94,47.54,8.5 c-3.78,4.06-6.68,10.35-7.83,16.43c-3.6,1.11-7.13,2.21-10.37,3.21C31.38,18.58,39.4,4.23,48.58,3.97L48.58,3.97z" />
                      <path fill="#5E8E3E" fillRule="evenodd" clipRule="evenodd" d="M93.9,22.66c-0.45-0.04-9.19-0.17-9.19-0.17s-7.32-7.1-8.04-7.83c-0.27-0.27-0.63-0.41-1.02-0.47l0,108.68 l32.78-8.15c0,0-13.38-90.44-13.46-91.06C94.9,23.04,94.35,22.7,93.9,22.66L93.9,22.66z" />
                      <path fill="#FFFFFF" fillRule="evenodd" clipRule="evenodd" d="M57.48,39.52l-3.81,14.25c0,0-4.25-1.93-9.28-1.62c-7.38,0.47-7.46,5.12-7.39,6.29 c0.4,6.37,17.16,7.76,18.11,22.69c0.74,11.74-6.23,19.77-16.27,20.41c-12.05,0.76-18.69-6.35-18.69-6.35l2.55-10.86 c0,0,6.68,5.04,12.02,4.7c3.49-0.22,4.74-3.06,4.61-5.07c-0.52-8.31-14.18-7.82-15.04-21.48c-0.73-11.49,6.82-23.14,23.48-24.19 C54.2,37.88,57.48,39.52,57.48,39.52L57.48,39.52z" />
                    </svg>
                  </button>

                  {/* Copy Modal */}
                  {showCopyModal && (
                    <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-80">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-900 mb-1">Copied to clipboard</h3>
                          <p className="text-xs text-slate-600">Enable the code editor in Shopify and paste your code</p>
                        </div>
                        <button
                          onClick={() => setShowCopyModal(false)}
                          className="ml-2 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                          aria-label="Close"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-3">
                        <img
                          src="https://auth.symplysis.com/storage/v1/object/public/Logos/Assets%20/shopifyeditor.png"
                          alt="Shopify Code Editor"
                          className="w-full h-auto rounded border border-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (!landingPageIframeRef.current) return

                    try {
                      const iframeWindow = landingPageIframeRef.current.contentWindow
                      const iframeDoc = landingPageIframeRef.current.contentDocument

                      if (!iframeWindow || !iframeDoc) {
                        alert('Unable to access iframe content')
                        return
                      }

                      // Simple approach: Open the content in a new window for the user to save
                      // Clone the current HTML
                      const htmlContent = iframeDoc.documentElement.outerHTML

                      // Add print styles to make it look good when saved as PDF
                      const printStyles = `
                      <style>
                        @media print {
                          body { 
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                          }
                          * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                          }
                        }
                      </style>
                    `

                      // Create a blob with the HTML content
                      const fullHtml = htmlContent.replace('</head>', printStyles + '</head>')
                      const blob = new Blob([fullHtml], { type: 'text/html' })
                      const url = URL.createObjectURL(blob)

                      // Open in new tab
                      const newWindow = window.open(url, '_blank')

                      if (newWindow) {
                        // Suggest user to print/save as PDF
                        setTimeout(() => {
                          alert('Use Ctrl+P (or Cmd+P on Mac) to save this page as PDF or image.\n\nTip: In the print dialog, choose "Save as PDF" as the destination.')
                        }, 1000)
                      }

                      // Clean up after a delay
                      setTimeout(() => {
                        URL.revokeObjectURL(url)
                      }, 60000) // Clean up after 1 minute
                    } catch (error) {
                      console.error('Failed to export:', error)
                      alert('Failed to export. Please try again.')
                    }
                  }}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-200"
                  title="Export as Image"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={reloadLandingPagePreview}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-200"
                  title="Reload Preview"
                >
                  <RefreshCcw size={14} />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
              {isLandingPageCodeView ? (
                <div className="p-4 h-full w-full">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto h-full font-mono">
                    <code>{currentLandingPageHtml}</code>
                  </pre>
                </div>
              ) : (
                <div
                  className="bg-white shadow-2xl transition-all duration-500 ease-in-out h-full"
                  style={{
                    width: isMobileView ? '375px' : '100%',
                    maxWidth: isMobileView ? '375px' : '100%',
                    borderRadius: isMobileView ? '24px' : '0px',
                    overflow: 'hidden'
                  }}
                >
                  <iframe
                    ref={landingPageIframeRef}
                    srcDoc={currentLandingPageHtml}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Landing Page Preview"
                    onLoad={() => {
                      // Delay to ensure iframe is fully loaded
                      setTimeout(() => {
                        const iframe = landingPageIframeRef.current
                        if (!iframe || !iframe.contentDocument) return

                        const iframeDoc = iframe.contentDocument

                        // Hide Gallery Thumbnails Slider in iframe
                        const thumbnailSlider = iframeDoc.querySelector('slider#GalleryThumbnails-template--25004712951940__main') ||
                          iframeDoc.querySelector('slider.thumbnail-slider') ||
                          iframeDoc.querySelector('slider[id*="GalleryThumbnails"]')
                        if (thumbnailSlider) {
                          (thumbnailSlider as HTMLElement).style.display = 'none'
                            ; (thumbnailSlider as HTMLElement).style.visibility = 'hidden'
                            ; (thumbnailSlider as HTMLElement).style.height = '0'
                            ; (thumbnailSlider as HTMLElement).style.width = '0'
                            ; (thumbnailSlider as HTMLElement).style.overflow = 'hidden'
                          console.log('🚫 Hidden Gallery Thumbnails slider on iframe load')
                        }

                        // Apply ONLY manually replaced image links (cached images) - no automatic replacement
                        const allImages = iframeDoc.querySelectorAll('img')
                        if (Object.keys(componentImageLinksCache).length > 0) {
                          allImages.forEach((img, index) => {
                            const cachedLink = componentImageLinksCache[index]
                            if (cachedLink) {
                              img.src = cachedLink
                              img.setAttribute('src', cachedLink)
                              if (img.hasAttribute('data-src')) {
                                img.setAttribute('data-src', cachedLink)
                              }
                              console.log('🖼️ Applied manually replaced image on iframe load:', { imageIndex: index, url: cachedLink })
                            }
                          })
                        }

                        if (injectImageReplacementSystem.current) {
                          injectImageReplacementSystem.current()
                        }

                        // Inject styles for sticky-atc elements
                        try {
                          const doc = iframeDoc

                          // Apply styles to the sticky-atc div
                          const stickyAtcDiv = doc.getElementById('section-block-sticky_atc_Uaw4AC')
                          if (stickyAtcDiv) {
                            (stickyAtcDiv as HTMLElement).style.marginLeft = '20px'
                              ; (stickyAtcDiv as HTMLElement).style.height = '67.5px'
                          }

                          // Apply styles to sticky-atc__image elements
                          const stickyAtcImages = doc.querySelectorAll('.sticky-atc__image')
                          stickyAtcImages.forEach((img) => {
                            (img as HTMLElement).style.height = '40px'
                          })
                        } catch (error) {
                          console.error('Failed to inject sticky-atc styles:', error)
                        }
                      }, 200)
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Settings Sidebar */}

        </div>

        {/* Download Notification - Bottom Right */}
        {downloadNotification.visible && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[320px]">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {downloadNotification.status === 'preparing' && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {downloadNotification.status === 'ready' && (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {downloadNotification.status === 'downloading' && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Download className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">
                    {downloadNotification.status === 'preparing' && 'Preparing export...'}
                    {downloadNotification.status === 'ready' && 'Export ready!'}
                    {downloadNotification.status === 'downloading' && 'Download started'}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    {downloadNotification.status === 'preparing' && 'Capturing landing page'}
                    {downloadNotification.status === 'ready' && 'Starting download'}
                    {downloadNotification.status === 'downloading' && 'landing-page.webp'}
                  </p>

                  {/* Progress bar */}
                  {downloadNotification.status !== 'downloading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${downloadNotification.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={() => setDownloadNotification({ visible: false, status: 'preparing', progress: 0 })}
                  className="flex-shrink-0 text-gray-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Replace Modal with Tabs */}
        {showImageReplaceModal && selectedImageElement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-lg font-semibold text-slate-900">Replace Image</h3>
                <button
                  onClick={() => {
                    setShowImageReplaceModal(false)
                    setSelectedImageElement(null)
                    setNewImageUrl('')
                    setImageModalTab('upload')
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 bg-white">
                <button
                  onClick={() => setImageModalTab('upload')}
                  className={`flex-1 px-6 py-3 text-sm font-semibold transition-all relative ${imageModalTab === 'upload'
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus size={16} />
                    <span>Upload</span>
                  </div>
                </button>
                <button
                  onClick={() => setImageModalTab('generated')}
                  className={`flex-1 px-6 py-3 text-sm font-semibold transition-all relative ${imageModalTab === 'generated'
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ImageIcon size={16} />
                    <span>Your Posters</span>
                    {posterImages.length > 0 && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        {posterImages.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setImageModalTab('scraped')}
                  className={`flex-1 px-6 py-3 text-sm font-semibold transition-all relative ${imageModalTab === 'scraped'
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Globe size={16} />
                    <span>Scrape</span>
                    {scrapedImages.length > 0 && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        {scrapedImages.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {/* Upload Tab */}
                {imageModalTab === 'upload' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <label className="block text-xs font-semibold text-slate-900 mb-3 inline-flex items-center gap-2">
                        <Plus size={14} />
                        Upload New Image
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          ref={imageUploadInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                          id="image-upload-input"
                        />
                        <label
                          htmlFor="image-upload-input"
                          className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploadingImage
                              ? 'border-slate-300 bg-slate-100 cursor-not-allowed'
                              : 'border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100'
                            }`}
                        >
                          {uploadingImage ? (
                            <>
                              <LoadingSpinner />
                              <span className="text-sm font-medium text-slate-600">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Plus size={18} className="text-green-600" />
                              <span className="text-sm font-medium text-green-600">Choose Image</span>
                            </>
                          )}
                        </label>
                        <p className="text-xs text-slate-500">Max 10MB, JPG/PNG/WebP</p>
                      </div>
                    </div>

                    {/* Uploaded Images Gallery */}
                    {loadingUploadedImages ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <LoadingSpinner />
                        <p className="text-sm text-slate-500 mt-3">Loading your uploaded images...</p>
                      </div>
                    ) : uploadedImages.length > 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <label className="block text-xs font-semibold text-slate-900 mb-3">
                          Your Uploaded Images ({uploadedImages.length})
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                          {uploadedImages.map((imageUrl, index) => (
                            <div
                              key={`uploaded-${index}`}
                              className={`relative group cursor-pointer border-2 rounded-xl overflow-hidden transition-all hover:shadow-md aspect-square ${newImageUrl === imageUrl
                                  ? 'border-green-500 shadow-md ring-2 ring-green-200'
                                  : 'border-slate-200 hover:border-green-400'
                                }`}
                              onClick={() => setNewImageUrl(imageUrl)}
                            >
                              <img
                                src={imageUrl}
                                alt={`Uploaded image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to Select
                                </span>
                              </div>
                              {newImageUrl === imageUrl && (
                                <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1.5 shadow-lg">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      !uploadingImage && (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                          <Plus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No uploaded images yet</p>
                          <p className="text-xs text-slate-400 mt-1">Upload an image to get started</p>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Generated Posters Tab */}
                {imageModalTab === 'generated' && (
                  <div className="space-y-4">
                    {loadingPosterImages ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <LoadingSpinner />
                        <p className="text-sm text-slate-500 mt-3">Loading your posters...</p>
                      </div>
                    ) : posterImages.length > 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <label className="block text-xs font-semibold text-slate-900 mb-3 inline-flex items-center gap-2">
                          <ImageIcon size={14} />
                          Your Generated Posters ({posterImages.length})
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                          {posterImages.map((poster) => (
                            <div
                              key={poster.id}
                              className={`relative group cursor-pointer border-2 rounded-xl overflow-hidden transition-all hover:shadow-md aspect-square ${newImageUrl === poster.imageUrl
                                  ? 'border-green-500 shadow-md ring-2 ring-green-200'
                                  : 'border-slate-200 hover:border-green-400'
                                }`}
                              onClick={() => setNewImageUrl(poster.imageUrl)}
                            >
                              <img
                                src={poster.imageUrl}
                                alt={`Poster ${poster.id}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to Select
                                </span>
                              </div>
                              {newImageUrl === poster.imageUrl && (
                                <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1.5 shadow-lg">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No generated posters yet</p>
                        <p className="text-xs text-slate-400 mt-1">Generate posters in the Poster Generator</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Scrape Tab */}
                {imageModalTab === 'scraped' && (
                  <div className="space-y-4">
                    {/* URL Input and Scrape Button */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <label className="block text-xs font-semibold text-slate-900 mb-3 inline-flex items-center gap-2">
                        <Globe size={14} />
                        Scrape URL for Images
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={scrapeUrl}
                          onChange={(e) => setScrapeUrl(e.target.value)}
                          placeholder="Enter URL to scrape (e.g., https://example.com/product)"
                          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          disabled={scrapingImages}
                        />
                        <button
                          onClick={handleScrapeFromModal}
                          disabled={!scrapeUrl.trim() || scrapingImages}
                          className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                          {scrapingImages ? (
                            <>
                              <LoadingSpinner />
                              <span>Scraping...</span>
                            </>
                          ) : (
                            <>
                              <Globe size={16} />
                              <span>Scrape</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Enter a product URL to extract images from the webpage
                      </p>
                    </div>

                    {/* Scraped Images Gallery */}
                    {scrapedImages.length > 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <label className="block text-xs font-semibold text-slate-900 mb-3 inline-flex items-center gap-2">
                          <Globe size={14} />
                          Images from Scraped Content ({scrapedImages.length} found)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                          {scrapedImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className={`relative group cursor-pointer border-2 rounded-xl overflow-hidden transition-all hover:shadow-md aspect-square ${newImageUrl === imageUrl
                                  ? 'border-green-500 shadow-md ring-2 ring-green-200'
                                  : 'border-slate-200 hover:border-green-400'
                                }`}
                              onClick={() => setNewImageUrl(imageUrl)}
                            >
                              <img
                                src={imageUrl}
                                alt={`Scraped image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to Select
                                </span>
                              </div>
                              {newImageUrl === imageUrl && (
                                <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1.5 shadow-lg">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                          Click on any image above to use it as the replacement
                        </p>
                      </div>
                    ) : (
                      !scrapingImages && (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No images found yet</p>
                          <p className="text-xs text-slate-400 mt-1">Enter a URL and click "Scrape" to extract images</p>
                        </div>
                      )
                    )}

                    {scrapingImages && (
                      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <LoadingSpinner />
                        <p className="text-sm text-slate-500 mt-3">Scraping images...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                <button
                  onClick={() => replaceImageInHtml(selectedImageElement.src, newImageUrl, selectedImageElement.imageIndex, selectedImageElement.element)}
                  disabled={!newImageUrl.trim()}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  Replace Image
                </button>
                <button
                  onClick={() => {
                    setShowImageReplaceModal(false)
                    setSelectedImageElement(null)
                    setNewImageUrl('')
                    setImageModalTab('upload')
                  }}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors font-semibold text-sm text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )



  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Merriweather+Sans:ital,wght@0,300..800;1,300..800&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
      .figtree {
        font-family: "Figtree", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
      }
      .inter {
        font-family: "Inter", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
      }
      .montserrat {
        font-family: "Montserrat", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
      }
      .merriweather-sans {
        font-family: "Merriweather Sans", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
      }
      .ibm-plex-sans-arabic {
        font-family: "IBM Plex Sans Arabic", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite linear;
      }
    `}</style>

      <div className="flex-1 w-full max-w-none bg-white">
        <div className="bg-background h-full">
          {activeTab === 'landing-page' && (
            subscriptionLoading ? (
              <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="text-center">
                  <LoadingSpinner size="md" className="mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Loading...</p>
                </div>
              </div>
            ) : hasAccess ? (
              renderLandingPageTab()
            ) : (
              <LandingPagePremiumGate />
            )
          )}
        </div>
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        featureType={creditModalType}
        onPurchaseComplete={() => refreshUsage()}
      />

      {/* Cached Content Modal */}
      {showCachedContentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">📋 Cached Content</h3>
              <button
                onClick={() => setShowCachedContentModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-slate-50 rounded-xl p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-700 max-h-96 border border-slate-200 overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words">{cachedContentToDisplay || 'No cached content available'}</pre>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cachedContentToDisplay);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                📋 Copy Content
              </button>
              <button
                onClick={() => setShowCachedContentModal(false)}
                className="px-6 py-3 bg-slate-200 text-slate-900 font-semibold rounded-xl hover:bg-slate-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Symplysis

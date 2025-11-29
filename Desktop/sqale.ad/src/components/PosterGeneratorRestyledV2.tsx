import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsageTracking } from '../hooks/useUsageTracking'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { SubscriptionGuard } from './SubscriptionGuard'
import PosterPremiumGate from './PosterPremiumGate'
import CreditPurchaseModal from './CreditPurchaseModal'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { DeepSeekService } from '../services/deepseekService'
import { GeminiImageService } from '../services/geminiImageService'
import { StorageService } from '../services/storageService'
import { supabase } from '../lib/supabase'
import { TextShimmer } from './ui/text-shimmer'
import { Button } from './ui/button'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from './ui/Toast'
import { AuroraBackground } from './ui/aurora-background'
import { buildProfessionalProductPrompt } from '../prompts/professionalProductPrompt'
import { buildDoveStylePrompt } from '../prompts/doveStylePrompt'
import { buildLifestyleModelPrompt, LifestyleModelService } from '../prompts/lifestyleModelPrompt'
import { buildBotanicalBeautyPrompt, getBotanicalBeautyOptimizationPrompt, botanicalBeautyOptimizationSchema } from '../prompts/botanicalBeautyPrompt'
import { buildEcommerceAdPrompt } from '../prompts/ecommerceAdPrompt'
import { buildChristmasAdPrompt } from '../prompts/christmasAdPrompt'
import { buildHightechAdPrompt } from '../prompts/hightechAdPrompt'
import { buildCollageAdPrompt } from '../prompts/collageAdPrompt'
import { buildPhotorealisticAdPrompt } from '../prompts/photorealisticAdPrompt'
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Layers,
  Package,
  Type,
  Palette,
  Wand2,
  ZoomIn,
  Square,
  Maximize,
  Maximize2,
  Zap,
  Settings,
  ChevronDown,
  ChevronRight,
  X as LucideX,
  Trash2,
  History,
  Copy,
  Check
} from 'lucide-react'

const X = LucideX

// Template interface
interface PosterTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  settings: {
    primaryColor: string
    accentColor: string
    language: string
    headlineTone: string
    subheadTone: string
    ctaText: string
    layoutStyle: string
    fontStyle: string
    orientation: string
    lightingStyle: string
    backgroundType: string
    compositionType: string
    moodStyle: string[]
    artStyle: string
    depthStyle: string
    visualEffects: string[]
    feelStyle: string
    logoPosition: string
    graphicElements: string[]
    brandKeywords: string
    decoratingItems: string
  }
}

const PosterGeneratorRestyledV2: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasAccess, loading: subscriptionLoading } = useSubscription()
  const { canGenerate, incrementUsage, refreshUsage } = useUsageTracking()
  const { toasts, addToast, removeToast } = useToast()

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // Silently fail if audio context is not available
      console.log('Audio notification not available')
    }
  }

  // Check if URL contains /credits and open modal
  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (location.pathname === '/poster-generator/credits') {
      setShowCreditModal(true);
    }
  // eslint-disable-next-line no-restricted-globals
  }, [location.pathname]);

  // ============ PRODUCT INFORMATION STATE ============
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [brandStyle, setBrandStyle] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [accentColor, setAccentColor] = useState('#FFD700')
  const [language, setLanguage] = useState('English')
  const [optimizedDescription, setOptimizedDescription] = useState('')
  const [productImage, setProductImage] = useState<string>('')
  const [heroIngredient, setHeroIngredient] = useState('')
  const [keyBenefit, setKeyBenefit] = useState('')
  const [modelPreferences, setModelPreferences] = useState('')

  // ============ TEXT ELEMENTS STATE ============
  const [headlineTone, setHeadlineTone] = useState('bold')
  const [subheadTone, setSubheadTone] = useState('supportive')
  const [ctaText, setCtaText] = useState('Shop Now')
  const [layoutStyle, setLayoutStyle] = useState('centered')
  const [fontStyle, setFontStyle] = useState('sans-serif')

  // ============ VISUAL STYLE STATE ============
  const [orientation, setOrientation] = useState('square')
  const [lightingStyle, setLightingStyle] = useState('soft natural')
  const [backgroundType, setBackgroundType] = useState('gradient')
  const [compositionType, setCompositionType] = useState('centered product')
  const [moodStyle, setMoodStyle] = useState<string[]>(['minimal'])
  const [artStyle, setArtStyle] = useState('realistic')
  const [depthStyle, setDepthStyle] = useState('matte')
  const [visualEffects, setVisualEffects] = useState<string[]>(['reflections'])
  const [feelStyle, setFeelStyle] = useState('clean')

  // ============ OPTIONAL ELEMENTS STATE ============
  const [logoPosition, setLogoPosition] = useState('none')
  const [graphicElements, setGraphicElements] = useState<string[]>([])
  const [brandKeywords, setBrandKeywords] = useState('')
  const [decoratingItems, setDecoratingItems] = useState('stones')
  const [aestheticAdjectives, setAestheticAdjectives] = useState('luxurious, modern')
  const [sceneAdjectives, setSceneAdjectives] = useState('serene, sophisticated')
  const [compositionDetail, setCompositionDetail] = useState('centered product')
  const [framePercentage, setFramePercentage] = useState('40-50%')
  const [compositionStyle, setCompositionStyle] = useState('Geometric arrangement with balanced negative space')
  const [surfaceFinish, setSurfaceFinish] = useState('glossy')
  const [cameraAngle, setCameraAngle] = useState('centered product shot')
  const [backgroundTreatment, setBackgroundTreatment] = useState('gradient background treatment')
  const [brandType, setBrandType] = useState('luxury brand')
  const [modelDescription, setModelDescription] = useState('diverse, athletic')
  const [environmentType, setEnvironmentType] = useState('natural landscape')
  const [interactionType, setInteractionType] = useState('actively using')

  // ============ BOTANICAL BEAUTY STATE ============
  const [botanicalBrandName, setBotanicalBrandName] = useState('Aura Botanicals')
  const [botanicalHeadline, setBotanicalHeadline] = useState('Instinct. Bottled.')
  const [botanicalFeatures, setBotanicalFeatures] = useState<string[]>(['Pheromonal Signature, Infused with Desert Quandong Extract', 'The Ultimate Confidence Amplifier'])
  const [botanicalCtaText, setBotanicalCtaText] = useState('Discover Your Aura')
  const [botanicalPaletteName, setBotanicalPaletteName] = useState('Earthy Greens, Deep Black, Gold accents, and Clean White background')
  const [botanicalBgObject, setBotanicalBgObject] = useState('a bed of vibrant green moss, whole small limes, and carefully sliced limes, intimately integrated around the product')
  const [botanicalStyle, setBotanicalStyle] = useState('clean, high-key studio, natural, sophisticated, integrated botanicals')
  const [botanicalImage, setBotanicalImage] = useState('')
  const [botanicalRatio, setBotanicalRatio] = useState('1:1')

  // ============ CINEMATIC AD STATE ============
  const [cinematicImage, setCinematicImage] = useState('')
  const [cinematicHeadline, setCinematicHeadline] = useState('Fresh Luxury Awaits')
  const [cinematicFeatures, setCinematicFeatures] = useState<string[]>(['✅ Premium Quality', '⚡️ Fast Results', '🌿 Natural Ingredients'])
  const [cinematicCtaText, setCinematicCtaText] = useState('Shop Now')
  const [cinematicPalette, setCinematicPalette] = useState('Warm & Luxurious')
  const [cinematicBgObject, setCinematicBgObject] = useState('floating particles')
  const [cinematicStyle, setCinematicStyle] = useState('Luxurious & Cinematic')
  const [cinematicRatio, setCinematicRatio] = useState('1:1')
  // Positions are defaults - AI has freedom to interpret naturally
  const cinematicHeadlinePos = 'top-center'
  const cinematicFeaturesPos = 'right'
  const cinematicCtaPos = 'bottom-center'

  // ============ LIFESTYLE MODEL AD STATE ============
  const [lifestyleImage, setLifestyleImage] = useState('')
  const [lifestyleRawFile, setLifestyleRawFile] = useState<File | null>(null)
  const [lifestyleRatio, setLifestyleRatio] = useState('1:1')
  const [lifestyleEnvironmentContext, setLifestyleEnvironmentContext] = useState('Luxury Penthouse Apartment')
  const [lifestyleStyle, setLifestyleStyle] = useState('Cinematic High-Fashion')
  const [lifestyleModelDescription, setLifestyleModelDescription] = useState('sophisticated Hispanic woman in her 30s wearing a silk evening gown')
  const [lifestyleBgObject, setLifestyleBgObject] = useState('panoramic window view of a city skyline at night')
  const [lifestyleBrandName, setLifestyleBrandName] = useState('LUMIÈRE')
  const [lifestyleHeadline, setLifestyleHeadline] = useState('RADIANCE REDEFINED')
  const [lifestyleDescription, setLifestyleDescription] = useState('Experience the ultimate in luxury skincare with our new night repair serum.')
  const [lifestyleCtaText, setLifestyleCtaText] = useState('SHOP NOW')
  const [lifestylePaletteName, setLifestylePaletteName] = useState('Midnight Gold')

  // ============ E-COMMERCE AD STATE ============
  const [ecommerceImage, setEcommerceImage] = useState('')
  const [ecommerceRatio, setEcommerceRatio] = useState('1:1')
  const [ecommerceBrandLogo, setEcommerceBrandLogo] = useState('')
  const [ecommerceTitleText, setEcommerceTitleText] = useState('')
  const [ecommerceTaglineText, setEcommerceTaglineText] = useState('')
  const [ecommerceBodyText, setEcommerceBodyText] = useState('')
  const [ecommerceCtaText, setEcommerceCtaText] = useState('Shop Now')
  const [ecommerceCtaButtonColor, setEcommerceCtaButtonColor] = useState('purple')
  const [ecommerceHumanPose1, setEcommerceHumanPose1] = useState('person using the product in a natural setting')
  const [ecommerceHumanPose2, setEcommerceHumanPose2] = useState('person demonstrating product benefits')
  const [ecommerceBackgroundColors, setEcommerceBackgroundColors] = useState('beige to cream')

  // ============ CHRISTMAS AD STATE ============
  const [christmasImage, setChristmasImage] = useState('')
  const [christmasRatio, setChristmasRatio] = useState('1:1')
  const [christmasBrandLogoText, setChristmasBrandLogoText] = useState('')
  const [christmasTitleText, setChristmasTitleText] = useState('')
  const [christmasDescriptiveText, setChristmasDescriptiveText] = useState('')
  const [christmasProductWornByModel, setChristmasProductWornByModel] = useState('a baby in baggy green Christmas gift-patterned sweatpants and a cream sweater')
  const [christmasWebsiteUrl, setChristmasWebsiteUrl] = useState('')
  const [christmasSlogan, setChristmasSlogan] = useState('')
  const [christmasDiscountDetails, setChristmasDiscountDetails] = useState('')
  const [christmasDiscountCode, setChristmasDiscountCode] = useState('')

  // ============ HIGHTECH AD STATE ============
  const [hightechImage, setHightechImage] = useState('')
  const [hightechRatio, setHightechRatio] = useState('1:1')
  const [hightechBrandLogo, setHightechBrandLogo] = useState('')
  const [hightechBrandName, setHightechBrandName] = useState('')
  const [hightechMainOfferHeadline, setHightechMainOfferHeadline] = useState('PAY ₹20, GET ₹100!')
  const [hightechProductDescription, setHightechProductDescription] = useState('10000mAh Slim & Compact Powerbank with In-Built Lightning & Type-C Cables')
  const [hightechProductNameAndDetails, setHightechProductNameAndDetails] = useState('a white power bank with a digital display showing \'99%\' and \'22.5W Super fast charge\', with attached cables')
  const [hightechFeature1Text, setHightechFeature1Text] = useState('22.5W Fast Charge')
  const [hightechFeature2Text, setHightechFeature2Text] = useState('In-Built Cables')
  const [hightechFeature3Text, setHightechFeature3Text] = useState('Digital Display')

  // ============ COLLAGE AD STATE ============
  const [collageImage, setCollageImage] = useState('')
  const [collageRatio, setCollageRatio] = useState('1:1')
  const [collageProductName1, setCollageProductName1] = useState('')
  const [collageProductName2, setCollageProductName2] = useState('')
  const [collageBrandName, setCollageBrandName] = useState('')
  const [collageBrandNameOnLabel, setCollageBrandNameOnLabel] = useState('')
  const [collageSurfaceType, setCollageSurfaceType] = useState('marble')
  const [collageLiquidColor1, setCollageLiquidColor1] = useState('amber')
  const [collageLiquidColor2, setCollageLiquidColor2] = useState('clear')
  const [collageNailPolishColor, setCollageNailPolishColor] = useState('nude')
  const [collageTopRightBackground, setCollageTopRightBackground] = useState('tiled')
  const [collageBottomLeftBackground, setCollageBottomLeftBackground] = useState('marble')
  const [collageHairColor, setCollageHairColor] = useState('blonde')
  const [collageClothingColor, setCollageClothingColor] = useState('white')
  const [collageMainHeadlineText, setCollageMainHeadlineText] = useState('')
  const [collageAuthorCreditText, setCollageAuthorCreditText] = useState('PAR SOPHIE')

  // ============ PHOTOREALISTIC AD STATE ============
  const [photorealisticImage, setPhotorealisticImage] = useState('')
  const [photorealisticRatio, setPhotorealisticRatio] = useState('1:1')
  const [photorealisticBackgroundSetting, setPhotorealisticBackgroundSetting] = useState('modern kitchen')
  const [photorealisticHeadlineColor, setPhotorealisticHeadlineColor] = useState('pink')
  const [photorealisticMainHeadlineText, setPhotorealisticMainHeadlineText] = useState('')
  const [photorealisticBodyText, setPhotorealisticBodyText] = useState('')
  const [photorealisticProductName, setPhotorealisticProductName] = useState('')
  const [photorealisticBrandLogo, setPhotorealisticBrandLogo] = useState('')
  const [photorealisticFlavorOrVariant, setPhotorealisticFlavorOrVariant] = useState('')
  const [photorealisticProductIngredientsOrForms, setPhotorealisticProductIngredientsOrForms] = useState('gummies')
  const [photorealisticCalloutColor, setPhotorealisticCalloutColor] = useState('pink')
  const [photorealisticCalloutText1, setPhotorealisticCalloutText1] = useState('60 GUMMIES DAILY DOSE')
  const [photorealisticCalloutText2, setPhotorealisticCalloutText2] = useState('IXI BEAUTY GLOW BITES HEALTHY SNACK')

  // Aspect ratio mapping
  const lifestyleRatios = {
    '1:1': { value: 1, label: 'Square' },
    '16:9': { value: 16/9, label: 'Landscape' },
    '9:16': { value: 9/16, label: 'Portrait' },
    '4:5': { value: 4/5, label: 'Vertical' }
  }

  // Image Processing Logic: Pads image to target ratio with transparency
  const processImageRatio = (file: File, targetRatioKey: string): Promise<{ dataUrl: string; base64: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) {
          resolve({ dataUrl: '', base64: '' })
          return
        }
        const img = new Image()
        img.onload = () => {
          const targetRatioVal = lifestyleRatios[targetRatioKey as keyof typeof lifestyleRatios]?.value || 1
          const srcRatio = img.width / img.height
          
          let canvasWidth, canvasHeight

          // Calculate canvas dimensions to contain the image while respecting target ratio
          if (srcRatio > targetRatioVal) {
            // Source is wider than target (e.g. source 16:9, target 1:1)
            // Width fits exactly, height needs padding
            canvasWidth = img.width
            canvasHeight = img.width / targetRatioVal
          } else {
            // Source is taller than target (e.g. source 9:16, target 1:1)
            // Height fits exactly, width needs padding
            canvasHeight = img.height
            canvasWidth = img.height * targetRatioVal
          }

          const canvas = document.createElement('canvas')
          canvas.width = canvasWidth
          canvas.height = canvasHeight
          const ctx = canvas.getContext('2d')

          // Clear canvas (transparent)
          ctx?.clearRect(0, 0, canvasWidth, canvasHeight)
          
          // Draw image centered
          const x = (canvasWidth - img.width) / 2
          const y = (canvasHeight - img.height) / 2
          ctx?.drawImage(img, x, y)

          const dataUrl = canvas.toDataURL('image/png')
          const base64 = dataUrl.split(',')[1]
          
          resolve({ dataUrl, base64 })
        }
        img.src = e.target.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // ============ GENERATION STATE ============
  const [generatedPosters, setGeneratedPosters] = useState<Array<{
    id: string
    prompt: string
    imageUrl: string
    dimensions?: string
    created_at?: string
    dbId?: string
    isLoading?: boolean
  }>>([])
  const [generating, setGenerating] = useState(false)
  const [posterQuantity, setPosterQuantity] = useState(12)
  const [optimizing, setOptimizing] = useState(false)
  const [templateSelected, setTemplateSelected] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({})
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyPage, setHistoryPage] = useState(0)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)
  const HISTORY_PAGE_SIZE = 12
  const postersInitializedRef = useRef(false)
  const loadHistoryCalledRef = useRef(false)
  const [activeSection, setActiveSection] = useState<'quick-start' | 'brand-text' | 'visuals' | 'advanced'>('quick-start')
  const [templatesExpanded, setTemplatesExpanded] = useState(true)
  const [settingsExpanded, setSettingsExpanded] = useState(true)
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [showTemplateChooser, setShowTemplateChooser] = useState(false)
  // Unified view state - purely for UI navigation, doesn't trigger any data loading
  const [sidebarView, setSidebarView] = useState<'templates' | 'settings'>('templates')

  // ============ MOBILE DETECTION ============
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Open settings when template is selected and sync view
  useEffect(() => {
    if (templateSelected && isMobile) {
      setShowMobileSettings(true)
      setSidebarView('settings') // Show settings view when template is selected
    } else if (!templateSelected) {
      setSidebarView('templates') // Show templates view when no template selected
    }
  }, [templateSelected, isMobile])

  // Prevent body scroll when component is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    const originalHeight = document.body.style.height
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalHtmlHeight = document.documentElement.style.height
    
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.height = '100vh'
    
    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.height = originalHeight
      document.documentElement.style.overflow = originalHtmlOverflow
      document.documentElement.style.height = originalHtmlHeight
    }
  }, [])

  // ============ DROPDOWN OPTIONS ============
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic', 'Chinese', 'Japanese', 'Korean']
  const headlineTones = ['bold', 'elegant', 'playful', 'motivational', 'luxury', 'persuasive']
  const subheadTones = ['supportive', 'emotional', 'factual', 'inspirational']
  const layoutStyles = ['centered', 'product-left', 'product-right', 'split', 'dynamic', 'grid']
  const fontStyles = ['sans-serif', 'serif', 'handwritten', 'bold modern', 'minimal elegant']
  const orientations = ['square', 'vertical', 'horizontal']
  const lightingStyles = ['soft natural', 'dramatic', 'cinematic', 'studio', 'flat', 'gradient']
  const backgroundTypes = ['gradient', 'plain', 'textured', 'environmental', 'product-context']
  const compositionTypes = ['centered product', 'side layout', 'diagonal focus', 'product close-up', 'flat lay']
  const moodOptions = ['minimal', 'luxurious', 'playful', 'modern', 'vintage', 'futuristic', 'organic', 'elegant', 'techy', 'artistic', 'bold', 'cozy', 'sporty', 'feminine', 'masculine']
  const artStyles = ['realistic', 'cinematic', 'digital art', 'watercolor', '3D render', 'vector', 'photography', 'minimalist', 'clean product shot']
  const depthStyles = ['matte', 'glossy', 'metallic', 'textured', 'soft blur', 'shadowed', 'flat', 'soft shadow']
  const visualEffectOptions = ['reflections', 'particles', 'smoke', 'neon glow', 'light flares', 'gradient overlays', 'subtle texture', 'soft vignette']
  const feelStyles = ['premium', 'clean', 'colorful', 'elegant', 'professional', 'trendy', 'lifestyle', 'creative', 'inspirational', 'fresh', 'sophisticated']
  const logoPositions = ['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', 'bottom-center']
  const graphicElementOptions = ['gradient shapes', 'abstract waves', 'geometric lines', 'minimal icons', 'product shadows', 'rounded corners']

  const templates: PosterTemplate[] = [
    {
      id: 'professional-product',
      name: 'Professional Product Photography',
      description: 'Clean, minimal luxury product photography with soft lighting',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/image-templates/vintage/vintage.jpg',
      settings: {
        primaryColor: '#FFFFFF',
        accentColor: '#FFD700',
        language: 'English',
        headlineTone: 'elegant',
        subheadTone: 'supportive',
        ctaText: 'Shop Now',
        layoutStyle: 'centered',
        fontStyle: 'minimal elegant',
        orientation: 'square',
        lightingStyle: 'soft natural',
        backgroundType: 'gradient',
        compositionType: 'centered product',
        moodStyle: ['minimal', 'luxurious', 'elegant'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: ['reflections', 'subtle texture'],
        feelStyle: 'premium',
        logoPosition: 'none',
        graphicElements: [],
        brandKeywords: '',
        decoratingItems: 'stones'
      }
    },
    {
      id: 'dove-style-grid',
      name: 'Multi-Variation Ad Grid (Dove Style)',
      description: 'Generate multiple ad variations with randomized styles',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/image-templates/dove/washer.png',
      settings: {
        primaryColor: '#0A66FF',
        accentColor: '#FFC857',
        language: 'English',
        headlineTone: 'bold',
        subheadTone: 'emotional',
        ctaText: 'Shop Now',
        layoutStyle: 'grid',
        fontStyle: 'sans-serif',
        orientation: 'square',
        lightingStyle: 'soft natural',
        backgroundType: 'plain',
        compositionType: 'centered product',
        moodStyle: ['minimal', 'modern', 'fresh'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: ['reflections'],
        feelStyle: 'clean',
        logoPosition: 'none',
        graphicElements: [],
        brandKeywords: 'trustworthy, authentic, real',
        decoratingItems: 'natural ingredients'
      }
    },
    {
      id: 'lifestyle-model-ad',
      name: 'Lifestyle Model Ad (Human-Centric)',
      description: 'Human model actively using or wearing the product in aspirational setting',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/poster-images/b7493262-0a49-4ee9-9d9e-1d6e56c5ea56/1763459781848-8o0w4h7vveu.png',
      settings: {
        primaryColor: '#1a1a1a',
        accentColor: '#FF6B35',
        language: 'English',
        headlineTone: 'bold',
        subheadTone: 'inspirational',
        ctaText: 'Shop Now',
        layoutStyle: 'centered',
        fontStyle: 'sans-serif',
        orientation: 'square',
        lightingStyle: 'dramatic natural',
        backgroundType: 'environmental',
        compositionType: 'centered product',
        moodStyle: ['empowered', 'confident'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: ['soft vignette'],
        feelStyle: 'aspirational',
        logoPosition: 'none',
        graphicElements: [],
        brandKeywords: 'resilience, quality, innovation, confidence',
        decoratingItems: 'minimal environmental props'
      }
    },
    {
      id: 'cinematic-ad',
      name: 'Cinematic Product Ad (AI-Powered)',
      description: 'Ultra-premium cinematic ads with AI-optimized creative direction',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/poster-images/b7493262-0a49-4ee9-9d9e-1d6e56c5ea56/1763413176694-q1skz8ieo5k.png',
      settings: {
        primaryColor: '#000000',
        accentColor: '#FFD700',
        language: 'English',
        headlineTone: 'elegant',
        subheadTone: 'emotional',
        ctaText: 'Shop Now',
        layoutStyle: 'cinematic',
        fontStyle: 'minimal elegant',
        orientation: 'square',
        lightingStyle: 'cinematic',
        backgroundType: 'environmental',
        compositionType: 'centered product',
        moodStyle: ['luxurious', 'cinematic', 'premium'],
        artStyle: 'cinematic',
        depthStyle: 'soft shadow',
        visualEffects: ['reflections', 'light flares', 'gradient overlays'],
        feelStyle: 'premium',
        logoPosition: 'none',
        graphicElements: [],
        brandKeywords: 'luxury, premium, cinematic',
        decoratingItems: 'floating particles'
      }
    },
    {
      id: 'botanical-beauty',
      name: 'Botanical Beauty Ad (High-End Studio)',
      description: 'Bold, modern beauty ads with intimately integrated fresh botanicals',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/poster-images/b7493262-0a49-4ee9-9d9e-1d6e56c5ea56/1763413011421-mxz4wwrj7w.png',
      settings: {
        primaryColor: '#10b981',
        accentColor: '#059669',
        language: 'English',
        headlineTone: 'bold',
        subheadTone: 'supportive',
        ctaText: 'Discover Your Aura',
        layoutStyle: 'botanical',
        fontStyle: 'bold modern',
        orientation: 'square',
        lightingStyle: 'studio',
        backgroundType: 'plain',
        compositionType: 'centered product',
        moodStyle: ['clean', 'modern', 'premium'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: ['reflections', 'subtle texture'],
        feelStyle: 'premium',
        logoPosition: 'top-right',
        graphicElements: [],
        brandKeywords: 'botanical, natural, premium, bold',
        decoratingItems: 'fresh botanicals, moss, citrus'
      }
    },
    {
      id: 'ecommerce-ad',
      name: 'E-Commerce Product Ad (Professional Layout)',
      description: 'Professional e-commerce ad with product showcase, text content, and usage photos',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/image-templates/vintage/vintage.jpg',
      settings: {
        primaryColor: '#3B82F6',
        accentColor: '#8B5CF6',
        language: 'English',
        headlineTone: 'bold',
        subheadTone: 'supportive',
        ctaText: 'Shop Now',
        layoutStyle: 'ecommerce',
        fontStyle: 'sans-serif',
        orientation: 'horizontal',
        lightingStyle: 'soft natural',
        backgroundType: 'gradient',
        compositionType: 'split layout',
        moodStyle: ['professional', 'modern', 'clean'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: ['reflections'],
        feelStyle: 'professional',
        logoPosition: 'top-left',
        graphicElements: [],
        brandKeywords: 'professional, modern, trustworthy',
        decoratingItems: 'blue pedestal'
      }
    },
    {
      id: 'christmas-ad',
      name: 'Christmas Festive Ad (Holiday Campaign)',
      description: 'Festive warm-toned Christmas advertisement with holiday elements and discount banner',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/image-templates/vintage/vintage.jpg',
      settings: {
        primaryColor: '#DC2626',
        accentColor: '#059669',
        language: 'English',
        headlineTone: 'bold',
        subheadTone: 'emotional',
        ctaText: 'Shop Now',
        layoutStyle: 'christmas',
        fontStyle: 'sans-serif',
        orientation: 'square',
        lightingStyle: 'warm natural',
        backgroundType: 'environmental',
        compositionType: 'centered product',
        moodStyle: ['festive', 'warm', 'cozy'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: ['bokeh', 'snowflakes'],
        feelStyle: 'festive',
        logoPosition: 'top-left',
        graphicElements: [],
        brandKeywords: 'festive, warm, holiday, Christmas',
        decoratingItems: 'Christmas tree, snowflakes, warm lights'
      }
    },
    {
      id: 'hightech-ad',
      name: 'High-Tech Product Ad (Sleek & Modern)',
      description: 'Sleek high-tech product advertisement with dark gradient background and feature callouts',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/image-templates/vintage/vintage.jpg',
      settings: {
        primaryColor: '#000000',
        accentColor: '#00FF88',
        language: 'English',
        headlineTone: 'bold',
        subheadTone: 'factual',
        ctaText: 'Shop Now',
        layoutStyle: 'hightech',
        fontStyle: 'bold modern',
        orientation: 'square',
        lightingStyle: 'dramatic',
        backgroundType: 'gradient',
        compositionType: 'centered product',
        moodStyle: ['modern', 'techy', 'futuristic'],
        artStyle: 'digital art',
        depthStyle: 'glossy',
        visualEffects: ['neon glow', 'light flares'],
        feelStyle: 'premium',
        logoPosition: 'top-center',
        graphicElements: [],
        brandKeywords: 'high-tech, modern, sleek, futuristic',
        decoratingItems: 'blue and green illumination'
      }
    },
    {
      id: 'collage-ad',
      name: 'Four-Panel Collage Ad (Beauty Products)',
      description: 'Four-panel collage-style social media ad with beauty products and editorial style',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/image-templates/vintage/vintage.jpg',
      settings: {
        primaryColor: '#FFFFFF',
        accentColor: '#F3F4F6',
        language: 'English',
        headlineTone: 'elegant',
        subheadTone: 'supportive',
        ctaText: 'Shop Now',
        layoutStyle: 'collage',
        fontStyle: 'minimal elegant',
        orientation: 'square',
        lightingStyle: 'soft natural',
        backgroundType: 'plain',
        compositionType: 'four-panel grid',
        moodStyle: ['clean', 'bright', 'editorial'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: [],
        feelStyle: 'premium',
        logoPosition: 'none',
        graphicElements: [],
        brandKeywords: 'beauty, clean, editorial, bright',
        decoratingItems: 'glass dropper bottles'
      }
    },
    {
      id: 'photorealistic-ad',
      name: 'Photorealistic Product Ad (Bursting Bottle)',
      description: 'Photorealistic product ad with bursting bottle and floating ingredients',
      thumbnail: 'https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/templates/image-templates/vintage/vintage.jpg',
      settings: {
        primaryColor: '#FFFFFF',
        accentColor: '#FF69B4',
        language: 'English',
        headlineTone: 'bold',
        subheadTone: 'factual',
        ctaText: 'Shop Now',
        layoutStyle: 'photorealistic',
        fontStyle: 'bold modern',
        orientation: 'square',
        lightingStyle: 'soft natural',
        backgroundType: 'environmental',
        compositionType: 'centered product',
        moodStyle: ['bright', 'clean', 'modern'],
        artStyle: 'photography',
        depthStyle: 'soft shadow',
        visualEffects: [],
        feelStyle: 'premium',
        logoPosition: 'none',
        graphicElements: [],
        brandKeywords: 'photorealistic, bright, clean, modern',
        decoratingItems: 'floating ingredients'
      }
    }
  ]

  // ============ HANDLERS ============

  // Function to adjust image aspect ratio by adding transparent padding
  const adjustImageAspectRatio = async (base64Image: string, targetRatio: '1:1' | '2:3' | '3:2'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Parse target ratio
        const [targetW, targetH] = targetRatio.split(':').map(Number)
        const targetAspect = targetW / targetH

        // Get current image dimensions
        const currentWidth = img.width
        const currentHeight = img.height
        const currentAspect = currentWidth / currentHeight

        let newWidth: number
        let newHeight: number
        let offsetX = 0
        let offsetY = 0

        // Calculate new dimensions and offsets
        if (currentAspect > targetAspect) {
          // Image is wider than target - add vertical padding
          newWidth = currentWidth
          newHeight = currentWidth / targetAspect
          offsetY = (newHeight - currentHeight) / 2
        } else {
          // Image is taller than target - add horizontal padding
          newHeight = currentHeight
          newWidth = currentHeight * targetAspect
          offsetX = (newWidth - currentWidth) / 2
        }

        // Set canvas size
        canvas.width = newWidth
        canvas.height = newHeight

        // Fill with transparent background
        ctx.clearRect(0, 0, newWidth, newHeight)

        // Draw the original image centered
        ctx.drawImage(img, offsetX, offsetY, currentWidth, currentHeight)

        // Convert to base64
        const adjustedBase64 = canvas.toDataURL('image/png')
        resolve(adjustedBase64)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = base64Image
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on orientation
      let targetRatio: '1:1' | '2:3' | '3:2' = '1:1'
      if (orientation === 'vertical') {
        targetRatio = '2:3'
      } else if (orientation === 'horizontal') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setProductImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        // Fallback to original image if adjustment fails
      setProductImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCinematicImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on cinematicRatio
      let targetRatio: '1:1' | '2:3' | '3:2' = '1:1'
      if (cinematicRatio === '2:3') {
        targetRatio = '2:3'
      } else if (cinematicRatio === '3:2') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setCinematicImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        // Fallback to original image if adjustment fails
      setCinematicImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleBotanicalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on orientation
      let targetRatio: '1:1' | '2:3' | '3:2' = '1:1'
      if (orientation === 'vertical') {
        targetRatio = '2:3'
      } else if (orientation === 'horizontal') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setBotanicalImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        // Fallback to original image if adjustment fails
      setBotanicalImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleLifestyleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    setLifestyleRawFile(file)
    
    // Process image to current ratio immediately
    try {
      const processed = await processImageRatio(file, lifestyleRatio)
      setLifestyleImage(processed.dataUrl)
      
      // Trigger auto-analysis with the processed image
      // Extract base64 for analysis
      const matches = processed.dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        const base64Data = matches[2]
        const mimeType = matches[1]
        // Auto-analyze the product image
        const optimizationResult = await LifestyleModelService.optimizeConcept(base64Data, mimeType, language)
        if (optimizationResult.success && optimizationResult.config) {
          const config = optimizationResult.config
          if (config.environmentContext) setLifestyleEnvironmentContext(config.environmentContext)
          if (config.style) setLifestyleStyle(config.style)
          if (config.modelDescription) setLifestyleModelDescription(config.modelDescription)
          if (config.bgObject) setLifestyleBgObject(config.bgObject)
          if (config.brandName) setLifestyleBrandName(config.brandName)
          if (config.headline) setLifestyleHeadline(config.headline)
          if (config.description) setLifestyleDescription(config.description)
          if (config.ctaText) setLifestyleCtaText(config.ctaText)
          if (config.paletteName) setLifestylePaletteName(config.paletteName)
          
          // Extract colors
          if (config.paletteName) {
            const paletteMatch = config.paletteName.match(/Primary:\s*(#[0-9A-Fa-f]{6}),\s*Accent:\s*(#[0-9A-Fa-f]{6})/i)
            if (paletteMatch) {
              setPrimaryColor(paletteMatch[1])
              setAccentColor(paletteMatch[2])
            } else {
              const hexCodes = config.paletteName.match(/#[0-9A-Fa-f]{6}/gi)
              if (hexCodes && hexCodes.length >= 2) {
                setPrimaryColor(hexCodes[0])
                setAccentColor(hexCodes[1])
              } else if (hexCodes && hexCodes.length === 1) {
                setPrimaryColor(hexCodes[0])
              }
            }
          }
          
          addToast('✨ Product analyzed and settings auto-filled!', 'success')
        }
      }
    } catch (error) {
      console.error('Failed to process lifestyle image:', error)
      addToast('Failed to process image. Please try again.', 'error')
    }
  }

  const handleEcommerceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on orientation
      let targetRatio: '1:1' | '2:3' | '3:2' = '3:2' // Default to horizontal for e-commerce
      if (orientation === 'vertical') {
        targetRatio = '2:3'
      } else if (orientation === 'horizontal') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setEcommerceImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        setEcommerceImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleChristmasImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on orientation
      let targetRatio: '1:1' | '2:3' | '3:2' = '1:1' // Default to square for Christmas ads
      if (orientation === 'vertical') {
        targetRatio = '2:3'
      } else if (orientation === 'horizontal') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setChristmasImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        setChristmasImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleHightechImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on orientation
      let targetRatio: '1:1' | '2:3' | '3:2' = '1:1' // Default to square for high-tech ads
      if (orientation === 'vertical') {
        targetRatio = '2:3'
      } else if (orientation === 'horizontal') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setHightechImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        setHightechImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCollageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on orientation
      let targetRatio: '1:1' | '2:3' | '3:2' = '1:1' // Default to square for collage ads
      if (orientation === 'vertical') {
        targetRatio = '2:3'
      } else if (orientation === 'horizontal') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setCollageImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        setCollageImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePhotorealisticImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      
      // Determine target ratio based on orientation
      let targetRatio: '1:1' | '2:3' | '3:2' = '1:1' // Default to square for photorealistic ads
      if (orientation === 'vertical') {
        targetRatio = '2:3'
      } else if (orientation === 'horizontal') {
        targetRatio = '3:2'
      }

      try {
        const adjustedImage = await adjustImageAspectRatio(base64, targetRatio)
        setPhotorealisticImage(adjustedImage)
      } catch (error) {
        console.error('Failed to adjust image aspect ratio:', error)
        setPhotorealisticImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleLifestyleRatioChange = async (newRatio: string) => {
    setLifestyleRatio(newRatio)
    if (lifestyleRawFile) {
      // Re-process the raw file with new ratio
      const processed = await processImageRatio(lifestyleRawFile, newRatio)
      setLifestyleImage(processed.dataUrl)
    }
  }

  const loadTemplate = (template: PosterTemplate) => {
    const s = template.settings
    setPrimaryColor(s.primaryColor)
    setAccentColor(s.accentColor)
    setLanguage(s.language)
    setHeadlineTone(s.headlineTone)
    setSubheadTone(s.subheadTone)
    setCtaText(s.ctaText)
    setLayoutStyle(s.layoutStyle)
    setFontStyle(s.fontStyle)
    setOrientation(s.orientation)
    setLightingStyle(s.lightingStyle)
    setBackgroundType(s.backgroundType)
    setCompositionType(s.compositionType)
    setMoodStyle(s.moodStyle)
    setArtStyle(s.artStyle)
    setDepthStyle(s.depthStyle)
    setVisualEffects(s.visualEffects)
    setFeelStyle(s.feelStyle)
    setLogoPosition(s.logoPosition)
    setGraphicElements(s.graphicElements)
    setBrandKeywords(s.brandKeywords)
    setDecoratingItems(s.decoratingItems)
    setTemplateSelected(true)
    setSelectedTemplateName(template.name)
    setSidebarView('settings') // Switch to settings view - purely UI, no data reload
    setTemplatesExpanded(false)
    setShowTemplateChooser(false)
    addToast('✨ Template applied successfully!', 'success')
  }

  const handleSmartOptimize = async () => {
    // Check if Cinematic Ad template is selected
    const isCinematicAd = selectedTemplateName === 'Cinematic Product Ad (AI-Powered)'
    const isBotanicalBeauty = selectedTemplateName === 'Botanical Beauty Ad (High-End Studio)'
    const isLifestyleModel = selectedTemplateName === 'Lifestyle Model Ad (Human-Centric)'
    const isEcommerceAd = selectedTemplateName === 'E-Commerce Product Ad (Professional Layout)'
    const isChristmasAd = selectedTemplateName === 'Christmas Festive Ad (Holiday Campaign)'
    const isHightechAd = selectedTemplateName === 'High-Tech Product Ad (Sleek & Modern)'
    const isCollageAd = selectedTemplateName === 'Four-Panel Collage Ad (Beauty Products)'
    const isPhotorealisticAd = selectedTemplateName === 'Photorealistic Product Ad (Bursting Bottle)'

      if (isCinematicAd) {
        // Cinematic template only requires image
        if (!cinematicImage) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else if (isBotanicalBeauty) {
        // Botanical Beauty template only requires image
        if (!botanicalImage) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else if (isLifestyleModel) {
        // Lifestyle Model Ad template requires image
        const imageToUse = lifestyleImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else if (isEcommerceAd) {
        // E-Commerce Ad template requires image
        const imageToUse = ecommerceImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else if (isChristmasAd) {
        // Christmas Ad template requires image
        const imageToUse = christmasImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else if (isHightechAd) {
        // High-Tech Ad template requires image
        const imageToUse = hightechImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else if (isCollageAd) {
        // Collage Ad template requires image
        const imageToUse = collageImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else if (isPhotorealisticAd) {
        // Photorealistic Ad template requires image
        const imageToUse = photorealisticImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          return
        }
      } else {
        // Other templates (Professional Product Photography, Dove Style) only require image
        if (!productImage) {
          addToast('Please upload a product image first', 'error')
          return
        }
      }

    setOptimizing(true)

    try {
      if (isCinematicAd) {
        // Use AI Art Director for Cinematic Ad
        // Extract base64 data from cinematicImage
        const matches = cinematicImage.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Use Gemini to optimize the cinematic concept
        // Add explicit Arabic instruction when Arabic is selected
        const languageInstruction = language === 'Arabic' 
          ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, headline, feature, CTA, and text element MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
          : '';

        const systemPrompt = `
      You are a top-tier art director specializing in cinematic advertising visuals.
      Analyze the provided product image and generate a refined ad concept including:
      1. A short, catchy headline for the product.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      2. Three short, vivid features (start each with an emoji).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      3. A short, persuasive CTA.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      4. A creative color palette description (e.g., 'Earthy & Warm', 'Cool Ocean Blues', 'Luxurious Gold & Black').
      5. One creative background object idea (must blend naturally with lighting).
      6. A short style descriptor (e.g., "Luxurious & Cinematic", "Minimalist Studio").
      ${languageInstruction}
      Reply with JSON only.
    `

        const schema = {
          type: "OBJECT",
          properties: {
            headline: { type: "STRING" },
            features: { type: "ARRAY", items: { type: "STRING" } },
            ctaText: { type: "STRING" },
            paletteName: { type: "STRING" },
            bgObject: { type: "STRING" },
            style: { type: "STRING" }
          },
          required: ["headline", "features", "ctaText", "paletteName", "bgObject", "style"]
        }

        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this product image and generate the ad concept." },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product image and generate the ad concept.",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.result) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        const concept = data.result

        // Populate cinematic-specific fields
        setCinematicHeadline(concept.headline || cinematicHeadline)
        setCinematicFeatures(concept.features || cinematicFeatures)
        setCinematicCtaText(concept.ctaText || cinematicCtaText)
        setCinematicPalette(concept.paletteName || cinematicPalette)
        setCinematicBgObject(concept.bgObject || cinematicBgObject)
        setCinematicStyle(concept.style || cinematicStyle)

        playNotificationSound()
        addToast('✨ AI Art Director optimized your cinematic ad concept!', 'success')
        setOptimizing(false)
        return
      }

      if (isBotanicalBeauty) {
        // Use AI Art Director for Botanical Beauty Ad
        // Extract base64 data from botanicalImage
        const matches = botanicalImage.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Use Gemini to optimize the botanical beauty concept
        const systemPrompt = getBotanicalBeautyOptimizationPrompt(language)
        const schema = botanicalBeautyOptimizationSchema

        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this product image and generate the ad concept." },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product image and generate the ad concept.",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const responseData = await response.json()
        if (responseData.success && responseData.result) {
          const data = responseData.result
          setBotanicalBrandName(data.brandName || botanicalBrandName)
          setBotanicalHeadline(data.headline || botanicalHeadline)
          setBotanicalFeatures(data.features || botanicalFeatures)
          setBotanicalCtaText(data.ctaText || botanicalCtaText)
          setBotanicalPaletteName(data.paletteName || botanicalPaletteName)
          setBotanicalBgObject(data.bgObject || botanicalBgObject)
          setBotanicalStyle(data.style || botanicalStyle)
        } else {
          throw new Error(responseData.error || 'Edge function returned an error')
        }

        playNotificationSound()
        addToast('✨ AI Art Director optimized your botanical beauty ad concept!', 'success')
        setOptimizing(false)
        return
      }

      if (isLifestyleModel) {
        // Use AI Art Director for Lifestyle Model Ad
        const imageToUse = lifestyleImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          setOptimizing(false)
          return
        }

        // Extract base64 data from image
        const matches = imageToUse.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Add explicit Arabic instruction when Arabic is selected
        const languageInstruction = language === 'Arabic' 
          ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT FOR IMAGE TEXT ONLY: 
      - **headline**: MUST be in Arabic (العربية) - this text will appear in the image
      - **description**: MUST be in Arabic (العربية) - this text will appear in the image
      - **ctaText**: MUST be in Arabic (العربية) - this text will appear in the image
      - **brandName**: Copy the brand name EXACTLY as it appears in the product image. If no brand name is visible, generate one in English. DO NOT translate brand names.
      - **ALL OTHER FIELDS** (environmentContext, style, modelDescription, bgObject, paletteName): MUST be in ENGLISH only. These are internal settings and should never be in Arabic.
      Write the Arabic text naturally as if it's your native language.`
          : '';

        const systemPrompt = `
      You are a versatile, world-class art director for commercial advertising. 
      Analyze the provided product image and determine the **optimal physical environment** for an ad campaign.
      
      **Do not default to nature or studio unless the product specifically calls for it.**
      
      **CRITICAL - ETHNICITY DIVERSITY**: When describing the model, you MUST vary ethnicity. DO NOT default to Asian. Randomly select from Caucasian, Hispanic, African-American, Middle Eastern, Mixed heritage, and occasionally Asian. Prioritize non-Asian ethnicities in your examples and selections.

      1. **Analyze the Product**: Is it a rugged outdoor item? A luxury perfume? A tech gadget? A beverage?
      2. **Select a Setting**: Choose a setting that fits the product archetype. Examples:
         - *Luxury/Nightlife*: Rooftop bar, dimly lit restaurant, penthouse, velvet textures.
         - *Urban/Street*: Concrete warehouse, graffiti wall, city street, neon lights.
         - *Active/Outdoor*: Cycling path, forest trail, gym, running track.
         - *Domestic*: Cozy living room, kitchen counter, bedside table.
         - *Fresh/Natural*: Garden, sunlight, water (only if it fits the product).

      Output JSON with the following fields:
      1.  **headline**: A concise, impactful headline matching the vibe. Must be product-focused (e.g., "THE ALL NEW FORMULA", "POWERFUL PROCESSOR", "UNLEASH YOUR VOICE").${language === 'Arabic' ? ' MUST be in Arabic - this text appears in the image.' : ''}
      2.  **description**: A small, compelling product description (1-2 sentences) that highlights key features or benefits. NOT three-word phrases like "RESILIENCE. INNOVATION. CONFIDENCE." - instead use natural sentences like "144 LANGUAGES. ENDLESS ADVENTURES" or "Experience the all-new formula with enhanced ingredients".${language === 'Arabic' ? ' MUST be in Arabic - this text appears in the image.' : ''}
      3.  **brandName**: Look closely at the product image for any text, logos, or labels to identify the ACTUAL BRAND NAME. If a brand name is visible, use it exactly as shown. Only if NO text/logo is visible, generate a creative brand name in English. DO NOT translate brand names - copy them exactly as they appear.
      4.  **ctaText**: A strong call to action (e.g., "Shop Now", "Learn More", "Get Started", "Buy Now").${language === 'Arabic' ? ' MUST be in Arabic - this text appears in the image.' : ''}
      5.  **paletteName**: **AI must intelligently choose a color palette** that best suits the product, selected environment, and brand identity. Provide a descriptive color palette name AND include two hex color codes in this format: "Palette Name (Primary: #HEXCODE, Accent: #HEXCODE)". Examples: 
         - "Neon Blue and Concrete Grey (Primary: #3B82F6, Accent: #64748B)"
         - "Warm Amber and Mahogany (Primary: #F59E0B, Accent: #92400E)"
         - "Vibrant Greens and Earth Tones (Primary: #10B981, Accent: #059669)"
         - "Soft Pastels and Cream (Primary: #F3F4F6, Accent: #FCD34D)"
         Always include the hex codes in parentheses so the app can extract them. Consider the product type, environment context, and mood when selecting colors. The palette should enhance product visibility and create visual harmony. MUST be in English.
      6.  **bgObject**: A description of the **surrounding environment elements** and props (e.g., 'a blurred background of a busy cafe with a wooden table surface', 'a textured concrete floor with harsh shadows', 'a sunny park bench'). MUST be in English.
      7.  **style**: A concise style descriptor (e.g., "Gritty Urban Industrial", "High-End Luxury Noir", "Sun-drenched Active Lifestyle"). MUST be in English.
      8.  **environmentContext**: The specific location type (e.g., "Warehouse", "Restaurant", "Forest", "Bedroom"). MUST be in English.
      9.  **modelDescription**: **CRITICAL - RANDOMIZE ETHNICITY**: You MUST vary the ethnicity across different generations. DO NOT default to Asian, DO NOT default to any single ethnicity. Randomly select from the list below for each generation:
         - **Age**: young adult, middle-aged, or senior depending on the product
         - **Gender**: male, female, or non-binary - choose based on product target audience
         - **Ethnicity & Appearance**: **RANDOMLY SELECT** one of these for each generation (do NOT always choose the same one):
           * Caucasian/European person (blonde, brunette, redhead, various skin tones) - USE THIS OFTEN
           * Hispanic/Latino person (Mexican, South American, etc.) - USE THIS OFTEN
           * African/Black person (various skin tones and hair textures) - USE THIS OFTEN
           * Middle Eastern person - USE THIS
           * Mixed heritage person - USE THIS
           * Asian person (East Asian, South Asian, Southeast Asian) - USE THIS BUT NOT EXCLUSIVELY
         - **Hair Color**: Vary hair colors - blonde, brunette, black, red, auburn, etc.
         - **Skin Tone**: Include light, medium, tan, olive, and dark skin tones - VARY WIDELY
         - **Clothing**: Appropriate for the product and setting (business casual, activewear, casual, formal, etc.)
         **IMPORTANT**: Examples to use (prioritize non-Asian): "blonde Caucasian woman in business casual", "Hispanic man with dark hair in modern streetwear", "African-American professional in elegant attire", "light-skinned brunette Caucasian in casual wear", "Middle Eastern person in business attire", "mixed-heritage individual in activewear". Only occasionally use "Asian person" - do NOT default to it. The model should match the product's target audience and represent diverse beauty with NO ETHNIC BIAS. MUST be in English.
      ${languageInstruction}
      Reply with JSON only.
    `

        const schema = {
          type: "OBJECT",
          properties: {
            headline: { type: "STRING" },
            description: { type: "STRING" },
            brandName: { type: "STRING" },
            ctaText: { type: "STRING" },
            paletteName: { type: "STRING" },
            bgObject: { type: "STRING" },
            style: { type: "STRING" },
            environmentContext: { type: "STRING" },
            modelDescription: { type: "STRING" }
          },
          required: ["headline", "description", "brandName", "ctaText", "paletteName", "bgObject", "style", "environmentContext", "modelDescription"]
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product and generate a diverse ad concept (consider Urban, Luxury, Outdoor, or Industrial settings).",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.result) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        const concept = data.result

        // Populate lifestyle-specific fields
        if (concept.environmentContext) setLifestyleEnvironmentContext(concept.environmentContext)
        if (concept.style) setLifestyleStyle(concept.style)
        if (concept.modelDescription) setLifestyleModelDescription(concept.modelDescription)
        if (concept.bgObject) setLifestyleBgObject(concept.bgObject)
        if (concept.brandName) setLifestyleBrandName(concept.brandName)
        if (concept.headline) setLifestyleHeadline(concept.headline)
        if (concept.description) setLifestyleDescription(concept.description)
        if (concept.ctaText) setLifestyleCtaText(concept.ctaText)
        if (concept.paletteName) setLifestylePaletteName(concept.paletteName)
        
        // Extract hex color codes from paletteName and update color states
        if (concept.paletteName) {
          // Expected format: "Palette Name (Primary: #HEXCODE, Accent: #HEXCODE)"
          const paletteMatch = concept.paletteName.match(/Primary:\s*(#[0-9A-Fa-f]{6}),\s*Accent:\s*(#[0-9A-Fa-f]{6})/i)
          if (paletteMatch) {
            const extractedPrimary = paletteMatch[1]
            const extractedAccent = paletteMatch[2]
            setPrimaryColor(extractedPrimary)
            setAccentColor(extractedAccent)
          } else {
            // Fallback: try to find any hex codes in the string
            const hexCodes = concept.paletteName.match(/#[0-9A-Fa-f]{6}/gi)
            if (hexCodes && hexCodes.length >= 2) {
              setPrimaryColor(hexCodes[0])
              setAccentColor(hexCodes[1])
            } else if (hexCodes && hexCodes.length === 1) {
              setPrimaryColor(hexCodes[0])
            }
          }
        }

        playNotificationSound()
        addToast('✨ AI Art Director optimized your lifestyle model ad concept!', 'success')
        setOptimizing(false)
        return
      }

      if (isEcommerceAd) {
        // Use AI Art Director for E-Commerce Ad
        const imageToUse = ecommerceImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          setOptimizing(false)
          return
        }

        // Extract base64 data from image
        const matches = imageToUse.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Add explicit Arabic instruction when Arabic is selected
        const languageInstruction = language === 'Arabic' 
          ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, headline, tagline, body text, CTA, and text element MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
          : '';

        const systemPrompt = `
      You are a top-tier e-commerce advertising specialist.
      Analyze the provided product image and generate a refined e-commerce ad concept including:
      1. A compelling title text for the product (main headline).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      2. A short, catchy tagline text.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      3. A paragraph of body text describing the product benefits.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      4. A persuasive CTA button text.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      5. A CTA button color (e.g., purple, blue, green, orange, red).
      6. Two human pose descriptions showing the product in use:
         - Pose 1: person using the product in a natural setting
         - Pose 2: person demonstrating product benefits from a different angle
      7. Background gradient colors (e.g., "beige to cream", "light blue to white", "soft pink to white").
      ${languageInstruction}
      Reply with JSON only.
    `

        const schema = {
          type: "OBJECT",
          properties: {
            titleText: { type: "STRING" },
            taglineText: { type: "STRING" },
            bodyText: { type: "STRING" },
            ctaText: { type: "STRING" },
            ctaButtonColor: { type: "STRING" },
            humanPose1: { type: "STRING" },
            humanPose2: { type: "STRING" },
            backgroundColors: { type: "STRING" }
          },
          required: ["titleText", "taglineText", "bodyText", "ctaText", "ctaButtonColor", "humanPose1", "humanPose2", "backgroundColors"]
        }

        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this product image and generate the e-commerce ad concept." },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product image and generate the e-commerce ad concept.",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.result) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        const concept = data.result

        // Populate e-commerce-specific fields
        setEcommerceTitleText(concept.titleText || ecommerceTitleText)
        setEcommerceTaglineText(concept.taglineText || ecommerceTaglineText)
        setEcommerceBodyText(concept.bodyText || ecommerceBodyText)
        setEcommerceCtaText(concept.ctaText || ecommerceCtaText)
        setEcommerceCtaButtonColor(concept.ctaButtonColor || ecommerceCtaButtonColor)
        setEcommerceHumanPose1(concept.humanPose1 || ecommerceHumanPose1)
        setEcommerceHumanPose2(concept.humanPose2 || ecommerceHumanPose2)
        setEcommerceBackgroundColors(concept.backgroundColors || ecommerceBackgroundColors)

        playNotificationSound()
        addToast('✨ AI Art Director optimized your e-commerce ad concept!', 'success')
        setOptimizing(false)
        return
      }

      if (isChristmasAd) {
        // Use AI Art Director for Christmas Ad
        const imageToUse = christmasImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          setOptimizing(false)
          return
        }

        // Extract base64 data from image
        const matches = imageToUse.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Add explicit Arabic instruction when Arabic is selected
        const languageInstruction = language === 'Arabic' 
          ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, brand logo, title, descriptive text, website URL, slogan, discount details, and discount code MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
          : '';

        const systemPrompt = `
      You are a top-tier holiday advertising specialist specializing in festive Christmas campaigns.
      Analyze the provided product image and generate a refined Christmas ad concept including:
      1. Brand logo text (large, prominent).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      2. A festive title text.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      3. Descriptive text about the product or offer.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      4. Product worn by model description (e.g., "a baby in baggy green Christmas gift-patterned sweatpants and a cream sweater", or product on model description).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      5. Website URL.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      6. A catchy slogan.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      7. Discount details (e.g., "50% OFF", "Buy 2 Get 1 Free").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      8. Discount code (e.g., "CHRISTMAS2024", "HOLIDAY50").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      ${languageInstruction}
      Reply with JSON only.
    `

        const schema = {
          type: "OBJECT",
          properties: {
            brandLogoText: { type: "STRING" },
            titleText: { type: "STRING" },
            descriptiveText: { type: "STRING" },
            productWornByModel: { type: "STRING" },
            websiteUrl: { type: "STRING" },
            slogan: { type: "STRING" },
            discountDetails: { type: "STRING" },
            discountCode: { type: "STRING" }
          },
          required: ["brandLogoText", "titleText", "descriptiveText", "productWornByModel", "websiteUrl", "slogan", "discountDetails", "discountCode"]
        }

        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this product image and generate the Christmas ad concept." },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product image and generate the Christmas ad concept.",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.result) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        const concept = data.result

        // Populate Christmas-specific fields
        setChristmasBrandLogoText(concept.brandLogoText || christmasBrandLogoText)
        setChristmasTitleText(concept.titleText || christmasTitleText)
        setChristmasDescriptiveText(concept.descriptiveText || christmasDescriptiveText)
        setChristmasProductWornByModel(concept.productWornByModel || christmasProductWornByModel)
        setChristmasWebsiteUrl(concept.websiteUrl || christmasWebsiteUrl)
        setChristmasSlogan(concept.slogan || christmasSlogan)
        setChristmasDiscountDetails(concept.discountDetails || christmasDiscountDetails)
        setChristmasDiscountCode(concept.discountCode || christmasDiscountCode)

        playNotificationSound()
        addToast('✨ AI Art Director optimized your Christmas ad concept!', 'success')
        setOptimizing(false)
        return
      }

      if (isHightechAd) {
        // Use AI Art Director for High-Tech Ad
        const imageToUse = hightechImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          setOptimizing(false)
          return
        }

        // Extract base64 data from image
        const matches = imageToUse.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Add explicit Arabic instruction when Arabic is selected
        const languageInstruction = language === 'Arabic' 
          ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, brand logo, headline, description, product details, and feature text MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
          : '';

        const systemPrompt = `
      You are a top-tier tech product advertising specialist specializing in high-tech, sleek product campaigns.
      Analyze the provided product image and generate a refined high-tech ad concept including:
      1. Brand logo or brand name.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      2. A compelling main offer headline in green and white (e.g., "PAY ₹20, GET ₹100!").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      3. Product description text.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      4. Product name and details description (e.g., "a white power bank with a digital display showing '99%' and '22.5W Super fast charge', with attached cables").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      5. Three feature texts for callout boxes:
         - Feature 1 (left side): Short, impactful feature description.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
         - Feature 2 (left side): Short, impactful feature description.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
         - Feature 3 (right side): Short, impactful feature description.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      ${languageInstruction}
      Reply with JSON only.
    `

        const schema = {
          type: "OBJECT",
          properties: {
            brandLogo: { type: "STRING" },
            brandName: { type: "STRING" },
            mainOfferHeadline: { type: "STRING" },
            productDescription: { type: "STRING" },
            productNameAndDetails: { type: "STRING" },
            feature1Text: { type: "STRING" },
            feature2Text: { type: "STRING" },
            feature3Text: { type: "STRING" }
          },
          required: ["brandLogo", "brandName", "mainOfferHeadline", "productDescription", "productNameAndDetails", "feature1Text", "feature2Text", "feature3Text"]
        }

        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this product image and generate the high-tech ad concept." },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product image and generate the high-tech ad concept.",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.result) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        const concept = data.result

        // Populate high-tech-specific fields
        setHightechBrandLogo(concept.brandLogo || hightechBrandLogo)
        setHightechBrandName(concept.brandName || hightechBrandName)
        setHightechMainOfferHeadline(concept.mainOfferHeadline || hightechMainOfferHeadline)
        setHightechProductDescription(concept.productDescription || hightechProductDescription)
        setHightechProductNameAndDetails(concept.productNameAndDetails || hightechProductNameAndDetails)
        setHightechFeature1Text(concept.feature1Text || hightechFeature1Text)
        setHightechFeature2Text(concept.feature2Text || hightechFeature2Text)
        setHightechFeature3Text(concept.feature3Text || hightechFeature3Text)

        playNotificationSound()
        addToast('✨ AI Art Director optimized your high-tech ad concept!', 'success')
        setOptimizing(false)
        return
      }

      if (isCollageAd) {
        // Use AI Art Director for Collage Ad
        const imageToUse = collageImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          setOptimizing(false)
          return
        }

        // Extract base64 data from image
        const matches = imageToUse.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Add explicit Arabic instruction when Arabic is selected
        const languageInstruction = language === 'Arabic' 
          ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, brand name, product names, headline, and author credit MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
          : '';

        const systemPrompt = `
      You are a top-tier beauty product advertising specialist specializing in editorial, collage-style social media campaigns.
      Analyze the provided product image and generate a refined four-panel collage ad concept including:
      1. Product name 1 (first product).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      2. Product name 2 (second product).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      3. Brand name.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      4. Brand name on label (as it appears on product label).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      5. Surface type for top-left panel (e.g., "marble", "stone", "wood").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      6. Liquid color 1 (first product's liquid color, e.g., "amber", "clear", "golden").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      7. Liquid color 2 (second product's liquid color).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      8. Nail polish color (for hands in panels, e.g., "nude", "pink", "red").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      9. Top-right panel background (e.g., "tiled", "textured", "marble").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      10. Bottom-left panel background (e.g., "marble", "stone", "wood").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      11. Hair color (for woman in bottom-right panel, e.g., "blonde", "brunette", "black").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      12. Clothing/robe color (e.g., "white", "cream", "beige").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      13. Main headline text (for overlay).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      14. Author credit text (e.g., "PAR SOPHIE").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      ${languageInstruction}
      Reply with JSON only.
    `

        const schema = {
          type: "OBJECT",
          properties: {
            productName1: { type: "STRING" },
            productName2: { type: "STRING" },
            brandName: { type: "STRING" },
            brandNameOnLabel: { type: "STRING" },
            surfaceType: { type: "STRING" },
            liquidColor1: { type: "STRING" },
            liquidColor2: { type: "STRING" },
            nailPolishColor: { type: "STRING" },
            topRightBackground: { type: "STRING" },
            bottomLeftBackground: { type: "STRING" },
            hairColor: { type: "STRING" },
            clothingColor: { type: "STRING" },
            mainHeadlineText: { type: "STRING" },
            authorCreditText: { type: "STRING" }
          },
          required: ["productName1", "productName2", "brandName", "brandNameOnLabel", "surfaceType", "liquidColor1", "liquidColor2", "nailPolishColor", "topRightBackground", "bottomLeftBackground", "hairColor", "clothingColor", "mainHeadlineText", "authorCreditText"]
        }

        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this product image and generate the four-panel collage ad concept." },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product image and generate the four-panel collage ad concept.",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.result) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        const concept = data.result

        // Populate collage-specific fields
        setCollageProductName1(concept.productName1 || collageProductName1)
        setCollageProductName2(concept.productName2 || collageProductName2)
        setCollageBrandName(concept.brandName || collageBrandName)
        setCollageBrandNameOnLabel(concept.brandNameOnLabel || collageBrandNameOnLabel)
        setCollageSurfaceType(concept.surfaceType || collageSurfaceType)
        setCollageLiquidColor1(concept.liquidColor1 || collageLiquidColor1)
        setCollageLiquidColor2(concept.liquidColor2 || collageLiquidColor2)
        setCollageNailPolishColor(concept.nailPolishColor || collageNailPolishColor)
        setCollageTopRightBackground(concept.topRightBackground || collageTopRightBackground)
        setCollageBottomLeftBackground(concept.bottomLeftBackground || collageBottomLeftBackground)
        setCollageHairColor(concept.hairColor || collageHairColor)
        setCollageClothingColor(concept.clothingColor || collageClothingColor)
        setCollageMainHeadlineText(concept.mainHeadlineText || collageMainHeadlineText)
        setCollageAuthorCreditText(concept.authorCreditText || collageAuthorCreditText)

        playNotificationSound()
        addToast('✨ AI Art Director optimized your collage ad concept!', 'success')
        setOptimizing(false)
        return
      }

      if (isPhotorealisticAd) {
        // Use AI Art Director for Photorealistic Ad
        const imageToUse = photorealisticImage || productImage
        if (!imageToUse) {
          addToast('Please upload a product image first', 'error')
          setOptimizing(false)
          return
        }

        // Extract base64 data from image
        const matches = imageToUse.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Add explicit Arabic instruction when Arabic is selected
        const languageInstruction = language === 'Arabic' 
          ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL text content in Arabic (العربية). Every word, sentence, headline, body text, product name, brand logo, flavor, ingredients, and callout text MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
          : '';

        const systemPrompt = `
      You are a top-tier product advertising specialist specializing in photorealistic, dynamic product campaigns.
      Analyze the provided product image and generate a refined photorealistic ad concept including:
      1. Background setting (e.g., "modern kitchen", "bathroom counter", "clean white surface").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      2. Headline color (e.g., "pink", "blue", "green", "orange").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      3. Main headline text (large, bold).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      4. Body text (product description).${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      5. Product name.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      6. Brand logo text.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      7. Flavor or variant.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      8. Product ingredients or forms (e.g., "gummies", "capsules", "fruit slices") that will float around the bottle.${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      9. Callout color (e.g., "pink", "blue", "green").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      10. Callout text 1 (left side, e.g., "60 GUMMIES DAILY DOSE").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      11. Callout text 2 (right side, e.g., "IXI BEAUTY GLOW BITES HEALTHY SNACK").${language === 'Arabic' ? ' (MUST be in Arabic)' : ''}
      ${languageInstruction}
      Reply with JSON only.
    `

        const schema = {
          type: "OBJECT",
          properties: {
            backgroundSetting: { type: "STRING" },
            headlineColor: { type: "STRING" },
            mainHeadlineText: { type: "STRING" },
            bodyText: { type: "STRING" },
            productName: { type: "STRING" },
            brandLogo: { type: "STRING" },
            flavorOrVariant: { type: "STRING" },
            productIngredientsOrForms: { type: "STRING" },
            calloutColor: { type: "STRING" },
            calloutText1: { type: "STRING" },
            calloutText2: { type: "STRING" }
          },
          required: ["backgroundSetting", "headlineColor", "mainHeadlineText", "bodyText", "productName", "brandLogo", "flavorOrVariant", "productIngredientsOrForms", "calloutColor", "calloutText1", "calloutText2"]
        }

        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this product image and generate the photorealistic ad concept." },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        }

        // Call Edge Function instead of direct API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Authentication required')
        }

        const edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            prompt: "Analyze this product image and generate the photorealistic ad concept.",
            mimeType: mimeType,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            responseSchema: schema
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Edge function request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.result) {
          throw new Error(data.error || 'Edge function returned an error')
        }

        const concept = data.result

        // Populate photorealistic-specific fields
        setPhotorealisticBackgroundSetting(concept.backgroundSetting || photorealisticBackgroundSetting)
        setPhotorealisticHeadlineColor(concept.headlineColor || photorealisticHeadlineColor)
        setPhotorealisticMainHeadlineText(concept.mainHeadlineText || photorealisticMainHeadlineText)
        setPhotorealisticBodyText(concept.bodyText || photorealisticBodyText)
        setPhotorealisticProductName(concept.productName || photorealisticProductName)
        setPhotorealisticBrandLogo(concept.brandLogo || photorealisticBrandLogo)
        setPhotorealisticFlavorOrVariant(concept.flavorOrVariant || photorealisticFlavorOrVariant)
        setPhotorealisticProductIngredientsOrForms(concept.productIngredientsOrForms || photorealisticProductIngredientsOrForms)
        setPhotorealisticCalloutColor(concept.calloutColor || photorealisticCalloutColor)
        setPhotorealisticCalloutText1(concept.calloutText1 || photorealisticCalloutText1)
        setPhotorealisticCalloutText2(concept.calloutText2 || photorealisticCalloutText2)

        playNotificationSound()
        addToast('✨ AI Art Director optimized your photorealistic ad concept!', 'success')
        setOptimizing(false)
        return
      }

      // Determine which template is selected using selectedTemplateName
      const isProfessionalProduct = selectedTemplateName === 'Professional Product Photography'
      const isDoveStyle = selectedTemplateName === 'Multi-Variation Ad Grid (Dove Style)'

      let optimizePrompt = ''
      
      if (isDoveStyle) {
        // For Dove style, send the full template and ask DeepSeek to fill in the placeholders
        optimizePrompt = `create a nice ad`
      } else {
        // For other templates, use the simple JSON approach
        optimizePrompt = `create a nice ad`
      }

      const result = await DeepSeekService.generateJSON(optimizePrompt)

      if (!result.success || !result.content) {
        throw new Error(result.error || 'Failed to get response')
      }
      
      if (isProfessionalProduct) {
        // For Professional Product template, parse JSON
        let jsonText = result.content.trim()

        if (jsonText.includes('```')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        }

        const firstBrace = jsonText.indexOf('{')
        const lastBrace = jsonText.lastIndexOf('}')

        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error('No valid JSON found in response')
        }

        jsonText = jsonText.substring(firstBrace, lastBrace + 1)
        const recommendations = JSON.parse(jsonText)

        if (recommendations.primaryColor) setPrimaryColor(recommendations.primaryColor)
        if (recommendations.accentColor) setAccentColor(recommendations.accentColor)
        if (recommendations.headlineTone) setHeadlineTone(recommendations.headlineTone)
        if (recommendations.subheadTone) setSubheadTone(recommendations.subheadTone)
        if (recommendations.orientation) setOrientation(recommendations.orientation)
        if (recommendations.moodStyle) setMoodStyle(recommendations.moodStyle)
        if (recommendations.feelStyle) setFeelStyle(recommendations.feelStyle)
        
        playNotificationSound()
        addToast('✨ Settings optimized for Professional Product template!', 'success')
      } else if (isDoveStyle) {
        // For Dove style, store the complete filled prompt
        const filledPrompt = result.content.trim()
        setOptimizedDescription(filledPrompt)
        playNotificationSound()
        addToast('✨ Full prompt generated and optimized for Dove style!', 'success')
      }
    } catch (error) {
      console.error('Smart optimize error:', error)
      addToast(`Failed to optimize settings: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setOptimizing(false)
    }
  }

  const buildPrompt = (): string => {
    let aspectRatio = '1:1'
    if (orientation === 'vertical') aspectRatio = '2:3'
    else if (orientation === 'horizontal') aspectRatio = '3:2'

    // If optimizedDescription exists from Smart Optimize, use it
    if (optimizedDescription) {
      return optimizedDescription
    }

    // Determine which template is being used
    const isDoveStyle = selectedTemplateName === 'Multi-Variation Ad Grid (Dove Style)' || layoutStyle === 'grid'
    const isLifestyleModel = selectedTemplateName === 'Lifestyle Model Ad (Human-Centric)' || brandKeywords.includes('adventure') || brandKeywords.includes('resilience')
    const isBotanicalBeauty = selectedTemplateName === 'Botanical Beauty Ad (High-End Studio)' || layoutStyle === 'botanical'
    const isEcommerceAd = selectedTemplateName === 'E-Commerce Product Ad (Professional Layout)' || layoutStyle === 'ecommerce'
    const isChristmasAd = selectedTemplateName === 'Christmas Festive Ad (Holiday Campaign)' || layoutStyle === 'christmas'
    const isHightechAd = selectedTemplateName === 'High-Tech Product Ad (Sleek & Modern)' || layoutStyle === 'hightech'
    const isCollageAd = selectedTemplateName === 'Four-Panel Collage Ad (Beauty Products)' || layoutStyle === 'collage'
    const isPhotorealisticAd = selectedTemplateName === 'Photorealistic Product Ad (Bursting Bottle)' || layoutStyle === 'photorealistic'
    const isProfessionalProduct = selectedTemplateName === 'Professional Product Photography'

    // Use appropriate prompt builder based on template
    if (isPhotorealisticAd) {
      return buildPhotorealisticAdPrompt({
        backgroundSetting: photorealisticBackgroundSetting,
        headlineColor: photorealisticHeadlineColor,
        mainHeadlineText: photorealisticMainHeadlineText,
        bodyText: photorealisticBodyText,
        productName: photorealisticProductName,
        brandLogo: photorealisticBrandLogo,
        flavorOrVariant: photorealisticFlavorOrVariant,
        productIngredientsOrForms: photorealisticProductIngredientsOrForms,
        calloutColor: photorealisticCalloutColor,
        calloutText1: photorealisticCalloutText1,
        calloutText2: photorealisticCalloutText2,
        aspectRatio: photorealisticRatio,
        language
      })
    }

    if (isEcommerceAd) {
      return buildEcommerceAdPrompt({
        productName: productName || 'Product',
        productDescription: productDescription || '',
        brandLogo: ecommerceBrandLogo,
        titleText: ecommerceTitleText,
        taglineText: ecommerceTaglineText,
        bodyText: ecommerceBodyText,
        ctaText: ecommerceCtaText,
        ctaButtonColor: ecommerceCtaButtonColor,
        humanPose1: ecommerceHumanPose1,
        humanPose2: ecommerceHumanPose2,
        backgroundColors: ecommerceBackgroundColors,
        aspectRatio: ecommerceRatio,
        language
      })
    }

    if (isBotanicalBeauty) {
      return buildBotanicalBeautyPrompt({
        productName,
        productDescription,
        primaryColor,
        accentColor,
        orientation,
        aspectRatio: botanicalRatio,
        brandName: botanicalBrandName,
        headline: botanicalHeadline,
        features: botanicalFeatures,
        ctaText: botanicalCtaText,
        paletteName: botanicalPaletteName,
        bgObject: botanicalBgObject,
        style: botanicalStyle
      })
    }

    if (isDoveStyle) {
      return buildDoveStylePrompt({
        productName,
        productDescription,
        primaryColor,
        accentColor,
        orientation,
        aspectRatio,
        backgroundType,
        lightingStyle,
        moodStyle,
        brandKeywords,
        decoratingItems
      })
    }

    if (isLifestyleModel) {
      return buildLifestyleModelPrompt({
        productName,
        productDescription,
        primaryColor,
        accentColor,
        orientation,
        aspectRatio,
        lightingStyle,
        moodStyle,
        feelStyle,
        brandKeywords,
        modelDescription,
        environmentType,
        interactionType,
        decoratingItems,
        ctaText
      })
    }

    // Professional Product Photography (default fallback)
    if (isProfessionalProduct || !selectedTemplateName) {
      return buildProfessionalProductPrompt({
        productName,
        productDescription,
        primaryColor,
        accentColor,
        orientation,
        aspectRatio,
        compositionType,
        lightingStyle,
        depthStyle,
        moodStyle,
        feelStyle,
        artStyle,
        visualEffects
      })
    }

    // Fallback to Professional Product Photography if no template matches
    return buildProfessionalProductPrompt({
      productName,
      productDescription,
      primaryColor,
      accentColor,
      orientation,
      aspectRatio,
      compositionType,
      lightingStyle,
      depthStyle,
      moodStyle,
      feelStyle,
      artStyle,
      visualEffects
    })
  }

  const handleGeneratePosters = async () => {
    // Prevent multiple simultaneous calls
    if (generating) {
      console.log('Already generating, ignoring duplicate call')
      return
    }

    // Check if Cinematic Ad template is selected
    const isCinematicAd = selectedTemplateName === 'Cinematic Product Ad (AI-Powered)'
    const isBotanicalBeauty = selectedTemplateName === 'Botanical Beauty Ad (High-End Studio)'
    const isLifestyleModel = selectedTemplateName === 'Lifestyle Model Ad (Human-Centric)'
    const isEcommerceAd = selectedTemplateName === 'E-Commerce Product Ad (Professional Layout)'
    const isChristmasAd = selectedTemplateName === 'Christmas Festive Ad (Holiday Campaign)'
    const isHightechAd = selectedTemplateName === 'High-Tech Product Ad (Sleek & Modern)'
    const isCollageAd = selectedTemplateName === 'Four-Panel Collage Ad (Beauty Products)'
    const isPhotorealisticAd = selectedTemplateName === 'Photorealistic Product Ad (Bursting Bottle)'

    if (isCollageAd) {
      // Collage Ad template validation
      const imageToUse = collageImage || productImage
      if (!imageToUse) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!collageMainHeadlineText.trim() || !collageBrandName.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or fill in Brand Name and Main Headline Text manually', 'error')
        return
      }
    } else if (isHightechAd) {
      // High-Tech Ad template validation
      const imageToUse = hightechImage || productImage
      if (!imageToUse) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!hightechMainOfferHeadline.trim() || !hightechBrandName.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or fill in Brand Name and Main Offer Headline manually', 'error')
        return
      }
    } else if (isChristmasAd) {
      // Christmas Ad template validation
      const imageToUse = christmasImage || productImage
      if (!imageToUse) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!christmasTitleText.trim() || !christmasBrandLogoText.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or fill in Brand Logo and Title Text manually', 'error')
        return
      }
    } else if (isEcommerceAd) {
      // E-Commerce Ad template validation
      const imageToUse = ecommerceImage || productImage
      if (!imageToUse) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!ecommerceTitleText.trim() || !ecommerceBodyText.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or fill in Title and Body Text manually', 'error')
        return
      }
    } else if (isCinematicAd) {
      // Cinematic template validation
      if (!cinematicImage) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!cinematicHeadline.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or enter a headline manually', 'error')
        return
      }
    } else if (isBotanicalBeauty) {
      // Botanical Beauty template validation
      if (!botanicalImage) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!botanicalHeadline.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or enter a headline manually', 'error')
        return
      }
    } else if (isLifestyleModel) {
      // Lifestyle Model Ad template validation
      const imageToUse = lifestyleImage || productImage
      if (!imageToUse) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!lifestyleHeadline.trim() || !lifestyleModelDescription.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or fill in Headline and Model Description manually', 'error')
        return
      }
    } else if (isPhotorealisticAd) {
      // Photorealistic Ad template validation
      const imageToUse = photorealisticImage || productImage
      if (!imageToUse) {
        addToast('Please upload a product image', 'error')
        return
      }
      if (!photorealisticMainHeadlineText.trim() || !photorealisticProductName.trim()) {
        addToast('Please use Smart Optimize to generate settings first, or fill in Product Name and Main Headline Text manually', 'error')
        return
      }
    } else {
      // Other templates validation
      if (!productImage) {
        addToast('Please upload an Image', 'error')
        return
      }
    }

    if (!canGenerate('poster')) {
      addToast('Insufficient credits. Please purchase more to continue.', 'error')
      setShowCreditModal(true)
      return
    }

    setGenerating(true)

    // Add loading placeholders immediately
    // ALL templates now generate only 1 image, so only add 1 loading placeholder
    const baseTimestamp = Date.now()
    const loadingPlaceholder = {
      id: `loading-${baseTimestamp}-${Math.random().toString(36).slice(2, 11)}`,
      prompt: '',
      imageUrl: '', // Empty = shows loading spinner
      isLoading: true
    }
    // Add only 1 loading placeholder at the front, keep all existing images
    setGeneratedPosters(prev => [loadingPlaceholder, ...prev.filter(p => !p.isLoading)])

    try {
      if (isCinematicAd) {
        // Cinematic Image Generator - AI-Powered
        if (!cinematicImage) {
          throw new Error('Please upload a product image for cinematic generation')
        }

        // Build the image generation prompt directly using existing values (no re-optimization)
        const buildImagePrompt = (config: {
          headline: string
          features: string[]
          ctaText: string
          paletteName: string
          bgObject: string
          style: string
          headlinePos: string
          featuresPos: string
          ctaPos: string
        }) => {
          return `
Generate a cinematic, ultra-premium product advertisement using the provided product photo.

Product Integration:
- Place the product as the hero subject.
- Blend seamlessly with its environment using realistic reflections, natural soft shadows, filmic lighting, and shallow depth of field.
- Incorporate soft diffused lighting, specular highlights, soft shadows, low-key lighting, high-key lighting.
- Include highly reflective surfaces, clear product reflections, and mirror-like reflections when appropriate.
- Ensure the product sits naturally on a surface with subtle contact shadow.
- Optionally use thematic props, earthy elements, natural materials, pure or delicate objects to complement the product.

Composition & Framing:
- Maintain visual contrast and strong central framing.
- Use symmetrical composition for balance and elegance.
- Apply shallow depth of field with blurred background and natural bokeh for cinematic focus.

Lighting & Shadows:
- Use diffused high-key studio light or moody rim lighting depending on the product tone.
- Apply soft contrast, gentle highlights, and natural texture realism.
- Capture accurate reflections and subtle rim glow for visual richness.

Headline:
- Add "${config.headline}" at ${config.headlinePos}.
- This is the main title: it must be **large, prominent, and visually striking**.
- Typography should be elegant, balanced, and perfectly integrated.
- Ensure contrast and placement don't overpower the product.

Feature Highlights:
- Display ${config.features.join(', ')} at ${config.featuresPos} using minimalist design, clean icons, and perfect spacing.

Background:
- Create a ${config.style} scene with ${config.bgObject} subtly integrated in the background.
- Ensure all background elements share consistent lighting, color temperature, and shadow depth with the product.

Color Grading:
- Apply a unified ${config.paletteName} filmic palette.
- Achieve perfect color harmony, consistent hue, and soft cinematic grading.

CTA Button:
- Add "${config.ctaText}" at ${config.ctaPos}, styled luxuriously with subtle glow, matte finish, or glass-like depth.
- Keep it balanced and visually integrated into the layout.

Final Look:
- Ultra high resolution with realistic shadows, filmic textures, smooth tonal gradients.
- Incorporate fine lighting control, cinematic bokeh, and coherent color grading.
- Feel: premium, emotional, cohesive — like a luxury magazine or perfume campaign.
`;
        };

        const config = {
          headline: cinematicHeadline,
          features: cinematicFeatures,
          ctaText: cinematicCtaText,
          paletteName: cinematicPalette,
          bgObject: cinematicBgObject,
          style: cinematicStyle,
          headlinePos: cinematicHeadlinePos,
          featuresPos: cinematicFeaturesPos,
          ctaPos: cinematicCtaPos
        };

        // Build image generation prompt from existing form values - NO OPTIMIZATION
        const imagePrompt = buildImagePrompt(config)

        // Generate images directly - NO PROMPT REGENERATION
        // Generate only 1 image
        const imageResult = await GeminiImageService.generateImages({
          prompt: imagePrompt,
          quantity: 1,
          referenceImage: cinematicImage
        })

        if (!imageResult.success || !imageResult.images) {
          throw new Error(imageResult.error || 'Failed to generate cinematic images')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        const newPosters = [] as typeof generatedPosters

        for (let i = 0; i < imageResult.images.length; i++) {
          const base64DataUrl = imageResult.images[i]

          console.log(`🎬 [Cinematic Poster ${i + 1}] Generated successfully`)

          // Show image immediately in UI before upload
          const tempPoster = {
            id: `cinematic-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: `Cinematic Ad: ${cinematicHeadline}`,
            imageUrl: base64DataUrl,
            dimensions: cinematicRatio === '1:1' ? '1024x1024' : cinematicRatio === '2:3' ? '768x1152' : '1152x768',
            created_at: new Date().toISOString()
          }

          // Remove loading placeholders and add temp poster
          setGeneratedPosters(prev => {
            const withoutLoading = prev.filter(p => !p.isLoading)
            return [tempPoster, ...withoutLoading]
          })

          // Upload image to Supabase Storage
          const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

          if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
            // Store metadata in database
            const dbRecord = {
              user_id: user.id,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              prompt: `Cinematic Ad: ${cinematicHeadline}`,
              settings_json: {
                template: 'cinematic-ad',
                cinematicHeadline: cinematicHeadline,
                cinematicFeatures: cinematicFeatures,
                cinematicCtaText: cinematicCtaText,
                cinematicPalette: cinematicPalette,
                cinematicBgObject: cinematicBgObject,
                cinematicStyle: cinematicStyle,
                cinematicRatio
              }
            }

            const { data: dbData, error: dbError } = await supabase
              .from('posters_uploads')
              .insert(dbRecord)
              .select()

            if (!dbError && dbData) {
              // Update poster with storage URL
              const finalPoster = {
                ...tempPoster,
                dbId: dbData[0]?.id,
                imageUrl: uploadResult.publicUrl
              }

              newPosters.push(finalPoster)

              // Update the temp poster with storage URL
              setGeneratedPosters(prev =>
                prev.map(p => p.id === tempPoster.id ? finalPoster : p)
              )
            }
          }
        }

        setGeneratedPosters(prev => {
          const withoutLoading = prev.filter(p => !p.isLoading)
          return [...newPosters, ...withoutLoading]
        })

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`🎬 Generated cinematic poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      if (isBotanicalBeauty) {
        // Botanical Beauty Image Generator - AI-Powered
        if (!botanicalImage) {
          throw new Error('Please upload a product image for botanical beauty generation')
        }

        // Extract base64 data from botanicalImage
        const matches = botanicalImage.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Build the image generation prompt using the botanical beauty prompt builder
        const optimizedPrompt = buildBotanicalBeautyPrompt({
          productName: botanicalBrandName,
          productDescription: '',
          primaryColor,
          accentColor,
          orientation,
          aspectRatio: orientation === 'square' ? '1:1' : orientation === 'vertical' ? '2:3' : '3:2',
          brandName: botanicalBrandName,
          headline: botanicalHeadline,
          features: botanicalFeatures,
          ctaText: botanicalCtaText,
          paletteName: botanicalPaletteName,
          bgObject: botanicalBgObject,
          style: botanicalStyle
        })

        // Generate only 1 image
        const imageResult = await GeminiImageService.generateImages({
          prompt: optimizedPrompt,
          quantity: 1,
          referenceImage: botanicalImage
        })

        if (!imageResult.success || !imageResult.images) {
          throw new Error(imageResult.error || 'Failed to generate botanical beauty images')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        const newPosters = [] as typeof generatedPosters

        for (let i = 0; i < imageResult.images.length; i++) {
          const base64DataUrl = imageResult.images[i]

          console.log(`🌿 [Botanical Beauty Poster ${i + 1}] Generated successfully`)

          // Show image immediately in UI before upload
          const tempPoster = {
            id: `botanical-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: `Botanical Beauty Ad: ${botanicalHeadline}`,
            imageUrl: base64DataUrl,
            dimensions: orientation === 'square' ? '1024x1024' : orientation === 'vertical' ? '768x1152' : '1152x768',
            created_at: new Date().toISOString()
          }

          // Remove loading placeholders and add temp poster
          setGeneratedPosters(prev => {
            const withoutLoading = prev.filter(p => !p.isLoading)
            return [tempPoster, ...withoutLoading]
          })

          // Upload image to Supabase Storage
          const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

          if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
            // Store metadata in database
            const dbRecord = {
              user_id: user.id,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              prompt: `Botanical Beauty Ad: ${botanicalHeadline}`,
              settings_json: {
                template: 'botanical-beauty',
                botanicalBrandName,
                botanicalHeadline,
                botanicalFeatures,
                botanicalCtaText,
                botanicalPaletteName,
                botanicalBgObject,
                botanicalStyle,
                orientation
              }
            }

            const { data: dbData, error: dbError } = await supabase
              .from('posters_uploads')
              .insert(dbRecord)
              .select()

            if (!dbError && dbData) {
              // Update poster with storage URL
              const finalPoster = {
                ...tempPoster,
                dbId: dbData[0]?.id,
                imageUrl: uploadResult.publicUrl
              }

              newPosters.push(finalPoster)

              // Update the temp poster with storage URL
              setGeneratedPosters(prev =>
                prev.map(p => p.id === tempPoster.id ? finalPoster : p)
              )
            }
          }
        }

        setGeneratedPosters(prev => {
          const withoutLoading = prev.filter(p => !p.isLoading)
          return [...newPosters, ...withoutLoading]
        })

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`🌿 Generated botanical beauty poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      if (isLifestyleModel) {
        // Lifestyle Model Ad Image Generator - AI-Powered
        // Generate images directly using existing form values (NO RE-OPTIMIZATION)
        const imageToUse = lifestyleImage || productImage
        if (!imageToUse) {
          throw new Error('Please upload a product image for lifestyle model generation')
        }

        // Process image to target ratio if needed
        let processedBase64 = imageToUse
        if (lifestyleRawFile) {
          const processed = await processImageRatio(lifestyleRawFile, lifestyleRatio)
          processedBase64 = processed.dataUrl
        }

        // Extract base64 data from processed image
        const matches = processedBase64.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid product image format')
        }
        const mimeType = matches[1]
        const base64Data = matches[2]

        // Generate images directly using existing form values - NO PROMPT REGENERATION
        // Generate only ONE image (LifestyleModelService generates one image per call)
        if (!user) {
          throw new Error('User not authenticated')
        }

        console.log('🎯 [Lifestyle Model] Generating ONLY 1 image...')
        const imageResult = await LifestyleModelService.generateImage(
          {
            headline: lifestyleHeadline,
            description: lifestyleDescription,
            brandName: lifestyleBrandName,
            ctaText: lifestyleCtaText,
            paletteName: lifestylePaletteName,
            bgObject: lifestyleBgObject,
            style: lifestyleStyle,
            environmentContext: lifestyleEnvironmentContext,
            modelDescription: lifestyleModelDescription
          },
          base64Data,
          mimeType,
          lifestyleCtaText,
          lifestylePaletteName,
          language,
          lifestyleRatio
        )

        if (!imageResult.success || !imageResult.images || imageResult.images.length === 0) {
          throw new Error(imageResult.error || 'Failed to generate lifestyle model image')
        }

        // CRITICAL: Only use the FIRST image, ignore any others
        const base64DataUrl = imageResult.images[0]
        console.log(`👤 [Lifestyle Model Poster] Generated 1 image successfully. Total images in response: ${imageResult.images.length}`)
        
        // If somehow multiple images were returned, log a warning but only use the first one
        if (imageResult.images.length > 1) {
          console.warn(`⚠️ [Lifestyle Model] WARNING: API returned ${imageResult.images.length} images, but we're only using the first one!`)
        }

        // Determine dimensions based on ratio
        const dimensions = lifestyleRatio === '1:1' ? '1024x1024' : 
                          lifestyleRatio === '16:9' ? '1152x648' :
                          lifestyleRatio === '9:16' ? '648x1152' :
                          '1024x1280' // 4:5

        // Generate unique ID with timestamp and random string to avoid duplicates
        const uniqueId = `lifestyle-${Date.now()}-${Math.random().toString(36).slice(2, 11)}-${performance.now()}`

        // Show image immediately in UI before upload - replace the loading placeholder
        const tempPoster = {
          id: uniqueId,
          prompt: `Lifestyle Model Ad: ${lifestyleHeadline}`,
          imageUrl: base64DataUrl,
          dimensions,
          created_at: new Date().toISOString()
        }

        // Replace the loading placeholder with the actual image
        setGeneratedPosters(prev => {
          // Remove loading placeholders and add the new poster
          const withoutLoading = prev.filter(p => !p.isLoading)
          // Check if poster with this ID already exists to avoid duplicates
          const exists = withoutLoading.some(p => p.id === uniqueId)
          if (exists) {
            return withoutLoading
          }
          return [tempPoster, ...withoutLoading]
        })

        // Upload image to Supabase Storage
        const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

        if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
          // Store metadata in database
          const dbRecord = {
            user_id: user.id,
            storage_path: uploadResult.storagePath,
            image_url: uploadResult.publicUrl,
            prompt: `Lifestyle Model Ad: ${lifestyleHeadline}`,
            settings_json: {
              template: 'lifestyle-model-ad',
              lifestyleEnvironmentContext,
              lifestyleStyle,
              lifestyleModelDescription,
              lifestyleBgObject,
              lifestyleBrandName,
              lifestyleHeadline,
              lifestyleDescription,
              lifestyleCtaText,
              lifestylePaletteName,
              lifestyleRatio,
              primaryColor,
              accentColor,
              language
            }
          }

          const { data: dbData, error: dbError } = await supabase
            .from('posters_uploads')
            .insert(dbRecord)
            .select()

          if (!dbError && dbData) {
            // Update poster with storage URL
            const finalPoster = {
              ...tempPoster,
              dbId: dbData[0]?.id,
              imageUrl: uploadResult.publicUrl
            }

            // Update the temp poster with storage URL (only if it exists)
            setGeneratedPosters(prev =>
              prev.map(p => p.id === uniqueId ? finalPoster : p)
            )
          }
        }

        // Remove loading placeholders (posters are already added/updated above)
        setGeneratedPosters(prev => {
          return prev.filter(p => !p.isLoading)
        })

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`👤 Generated lifestyle model poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      if (isEcommerceAd) {
        // E-Commerce Ad Image Generator
        const imageToUse = ecommerceImage || productImage
        if (!imageToUse) {
          throw new Error('Please upload a product image for e-commerce generation')
        }

        // Build the image generation prompt using the e-commerce prompt builder
        const optimizedPrompt = buildEcommerceAdPrompt({
          productName: productName || 'Product',
          productDescription: productDescription || '',
          brandLogo: ecommerceBrandLogo,
          titleText: ecommerceTitleText,
          taglineText: ecommerceTaglineText,
          bodyText: ecommerceBodyText,
          ctaText: ecommerceCtaText,
          ctaButtonColor: ecommerceCtaButtonColor,
          humanPose1: ecommerceHumanPose1,
          humanPose2: ecommerceHumanPose2,
          backgroundColors: ecommerceBackgroundColors,
          aspectRatio: ecommerceRatio,
          language
        })

        // Generate only 1 image
        const imageResult = await GeminiImageService.generateImages({
          prompt: optimizedPrompt,
          quantity: 1,
          referenceImage: imageToUse
        })

        if (!imageResult.success || !imageResult.images) {
          throw new Error(imageResult.error || 'Failed to generate e-commerce images')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        const newPosters = [] as typeof generatedPosters

        for (let i = 0; i < imageResult.images.length; i++) {
          const base64DataUrl = imageResult.images[i]

          console.log(`🛒 [E-Commerce Poster ${i + 1}] Generated successfully`)

          // Determine dimensions based on ratio
          const dimensions = ecommerceRatio === '1:1' ? '1024x1024' : 
                            ecommerceRatio === '16:9' ? '1152x648' :
                            ecommerceRatio === '9:16' ? '648x1152' :
                            '1024x1280' // 4:5

          // Show image immediately in UI before upload
          const tempPoster = {
            id: `ecommerce-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: `E-Commerce Ad: ${ecommerceTitleText}`,
            imageUrl: base64DataUrl,
            dimensions,
            created_at: new Date().toISOString()
          }

          // Remove loading placeholders and add temp poster
          setGeneratedPosters(prev => {
            const withoutLoading = prev.filter(p => !p.isLoading)
            return [tempPoster, ...withoutLoading]
          })

          // Upload image to Supabase Storage
          const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

          if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
            // Store metadata in database
            const dbRecord = {
              user_id: user.id,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              prompt: `E-Commerce Ad: ${ecommerceTitleText}`,
              settings_json: {
                template: 'ecommerce-ad',
                ecommerceBrandLogo,
                ecommerceTitleText,
                ecommerceTaglineText,
                ecommerceBodyText,
                ecommerceCtaText,
                ecommerceCtaButtonColor,
                ecommerceHumanPose1,
                ecommerceHumanPose2,
                ecommerceBackgroundColors,
                productName,
                productDescription,
                ecommerceRatio,
                language
              }
            }

            const { data: dbData, error: dbError } = await supabase
              .from('posters_uploads')
              .insert(dbRecord)
              .select()

            if (!dbError && dbData) {
              // Update poster with storage URL
              const finalPoster = {
                ...tempPoster,
                dbId: dbData[0]?.id,
                imageUrl: uploadResult.publicUrl
              }

              newPosters.push(finalPoster)

              // Update the temp poster with storage URL
              setGeneratedPosters(prev =>
                prev.map(p => p.id === tempPoster.id ? finalPoster : p)
              )
            }
          }
        }

        setGeneratedPosters(prev => {
          const withoutLoading = prev.filter(p => !p.isLoading)
          return [...newPosters, ...withoutLoading]
        })

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`🛒 Generated e-commerce poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      if (isChristmasAd) {
        // Christmas Ad Image Generator
        const imageToUse = christmasImage || productImage
        if (!imageToUse) {
          throw new Error('Please upload a product image for Christmas generation')
        }

        // Build the image generation prompt using the Christmas prompt builder
        const optimizedPrompt = buildChristmasAdPrompt({
          brandLogoText: christmasBrandLogoText,
          titleText: christmasTitleText,
          descriptiveText: christmasDescriptiveText,
          productWornByModel: christmasProductWornByModel,
          websiteUrl: christmasWebsiteUrl,
          slogan: christmasSlogan,
          discountDetails: christmasDiscountDetails,
          discountCode: christmasDiscountCode,
          aspectRatio: christmasRatio,
          language
        })

        // Generate only 1 image
        const imageResult = await GeminiImageService.generateImages({
          prompt: optimizedPrompt,
          quantity: 1,
          referenceImage: imageToUse
        })

        if (!imageResult.success || !imageResult.images) {
          throw new Error(imageResult.error || 'Failed to generate Christmas images')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        const newPosters = [] as typeof generatedPosters

        for (let i = 0; i < imageResult.images.length; i++) {
          const base64DataUrl = imageResult.images[i]

          console.log(`🎄 [Christmas Poster ${i + 1}] Generated successfully`)

          // Determine dimensions based on ratio
          const dimensions = christmasRatio === '1:1' ? '1024x1024' : 
                            christmasRatio === '16:9' ? '1152x648' :
                            christmasRatio === '9:16' ? '648x1152' :
                            '1024x1280' // 4:5

          // Show image immediately in UI before upload
          const tempPoster = {
            id: `christmas-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: `Christmas Ad: ${christmasTitleText}`,
            imageUrl: base64DataUrl,
            dimensions,
            created_at: new Date().toISOString()
          }

          // Remove loading placeholders and add temp poster
          setGeneratedPosters(prev => {
            const withoutLoading = prev.filter(p => !p.isLoading)
            return [tempPoster, ...withoutLoading]
          })

          // Upload image to Supabase Storage
          const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

          if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
            // Store metadata in database
            const dbRecord = {
              user_id: user.id,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              prompt: `Christmas Ad: ${christmasTitleText}`,
              settings_json: {
                template: 'christmas-ad',
                christmasBrandLogoText,
                christmasTitleText,
                christmasDescriptiveText,
                christmasProductWornByModel,
                christmasWebsiteUrl,
                christmasSlogan,
                christmasDiscountDetails,
                christmasDiscountCode,
                christmasRatio,
                language
              }
            }

            const { data: dbData, error: dbError } = await supabase
              .from('posters_uploads')
              .insert(dbRecord)
              .select()

            if (!dbError && dbData) {
              // Update poster with storage URL
              const finalPoster = {
                ...tempPoster,
                dbId: dbData[0]?.id,
                imageUrl: uploadResult.publicUrl
              }

              newPosters.push(finalPoster)

              // Update the temp poster with storage URL
              setGeneratedPosters(prev =>
                prev.map(p => p.id === tempPoster.id ? finalPoster : p)
              )
            }
          }
        }

        setGeneratedPosters(prev => {
          const withoutLoading = prev.filter(p => !p.isLoading)
          return [...newPosters, ...withoutLoading]
        })

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`🎄 Generated Christmas poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      if (isHightechAd) {
        // High-Tech Ad Image Generator
        const imageToUse = hightechImage || productImage
        if (!imageToUse) {
          throw new Error('Please upload a product image for high-tech generation')
        }

        // Build the image generation prompt using the high-tech prompt builder
        const optimizedPrompt = buildHightechAdPrompt({
          brandLogo: hightechBrandLogo,
          brandName: hightechBrandName,
          mainOfferHeadline: hightechMainOfferHeadline,
          productDescription: hightechProductDescription,
          productNameAndDetails: hightechProductNameAndDetails,
          feature1Text: hightechFeature1Text,
          feature2Text: hightechFeature2Text,
          feature3Text: hightechFeature3Text,
          aspectRatio: hightechRatio,
          language
        })

        // Generate only 1 image
        const imageResult = await GeminiImageService.generateImages({
          prompt: optimizedPrompt,
          quantity: 1,
          referenceImage: imageToUse
        })

        if (!imageResult.success || !imageResult.images) {
          throw new Error(imageResult.error || 'Failed to generate high-tech images')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        const newPosters = [] as typeof generatedPosters

        for (let i = 0; i < imageResult.images.length; i++) {
          const base64DataUrl = imageResult.images[i]

          console.log(`⚡ [High-Tech Poster ${i + 1}] Generated successfully`)

          // Determine dimensions based on ratio
          const dimensions = hightechRatio === '1:1' ? '1024x1024' : 
                            hightechRatio === '16:9' ? '1152x648' :
                            hightechRatio === '9:16' ? '648x1152' :
                            '1024x1280' // 4:5

          // Show image immediately in UI before upload
          const tempPoster = {
            id: `hightech-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: `High-Tech Ad: ${hightechMainOfferHeadline}`,
            imageUrl: base64DataUrl,
            dimensions,
            created_at: new Date().toISOString()
          }

          // Remove loading placeholders and add temp poster
          setGeneratedPosters(prev => {
            const withoutLoading = prev.filter(p => !p.isLoading)
            return [tempPoster, ...withoutLoading]
          })

          // Upload image to Supabase Storage
          const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

          if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
            // Store metadata in database
            const dbRecord = {
              user_id: user.id,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              prompt: `High-Tech Ad: ${hightechMainOfferHeadline}`,
              settings_json: {
                template: 'hightech-ad',
                hightechBrandLogo,
                hightechBrandName,
                hightechMainOfferHeadline,
                hightechProductDescription,
                hightechProductNameAndDetails,
                hightechFeature1Text,
                hightechFeature2Text,
                hightechFeature3Text,
                hightechRatio,
                language
              }
            }

            const { data: dbData, error: dbError } = await supabase
              .from('posters_uploads')
              .insert(dbRecord)
              .select()

            if (!dbError && dbData) {
              // Update poster with storage URL
              const finalPoster = {
                ...tempPoster,
                dbId: dbData[0]?.id,
                imageUrl: uploadResult.publicUrl
              }

              newPosters.push(finalPoster)

              // Update the temp poster with storage URL
              setGeneratedPosters(prev =>
                prev.map(p => p.id === tempPoster.id ? finalPoster : p)
              )
            }
          }
        }

        setGeneratedPosters(prev => {
          const withoutLoading = prev.filter(p => !p.isLoading)
          return [...newPosters, ...withoutLoading]
        })

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`⚡ Generated high-tech poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      if (isCollageAd) {
        // Collage Ad Image Generator
        const imageToUse = collageImage || productImage
        if (!imageToUse) {
          throw new Error('Please upload a product image for collage generation')
        }

        // Build the image generation prompt using the collage prompt builder
        const optimizedPrompt = buildCollageAdPrompt({
          productName1: collageProductName1,
          productName2: collageProductName2,
          brandName: collageBrandName,
          brandNameOnLabel: collageBrandNameOnLabel,
          surfaceType: collageSurfaceType,
          liquidColor1: collageLiquidColor1,
          liquidColor2: collageLiquidColor2,
          nailPolishColor: collageNailPolishColor,
          topRightBackground: collageTopRightBackground,
          bottomLeftBackground: collageBottomLeftBackground,
          hairColor: collageHairColor,
          clothingColor: collageClothingColor,
          mainHeadlineText: collageMainHeadlineText,
          authorCreditText: collageAuthorCreditText,
          aspectRatio: collageRatio,
          language
        })

        // Generate only 1 image
        const imageResult = await GeminiImageService.generateImages({
          prompt: optimizedPrompt,
          quantity: 1,
          referenceImage: imageToUse
        })

        if (!imageResult.success || !imageResult.images) {
          throw new Error(imageResult.error || 'Failed to generate collage images')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        const newPosters = [] as typeof generatedPosters

        for (let i = 0; i < imageResult.images.length; i++) {
          const base64DataUrl = imageResult.images[i]

          console.log(`🎨 [Collage Poster ${i + 1}] Generated successfully`)

          // Determine dimensions based on ratio
          const dimensions = collageRatio === '1:1' ? '1024x1024' : 
                            collageRatio === '16:9' ? '1152x648' :
                            collageRatio === '9:16' ? '648x1152' :
                            '1024x1280' // 4:5

          // Show image immediately in UI before upload
          const tempPoster = {
            id: `collage-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: `Collage Ad: ${collageMainHeadlineText}`,
            imageUrl: base64DataUrl,
            dimensions,
            created_at: new Date().toISOString()
          }

          // Remove loading placeholders and add temp poster
          setGeneratedPosters(prev => {
            const withoutLoading = prev.filter(p => !p.isLoading)
            return [tempPoster, ...withoutLoading]
          })

          // Upload image to Supabase Storage
          const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

          if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
            // Store metadata in database
            const dbRecord = {
              user_id: user.id,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              prompt: `Collage Ad: ${collageMainHeadlineText}`,
              settings_json: {
                template: 'collage-ad',
                collageProductName1,
                collageProductName2,
                collageBrandName,
                collageBrandNameOnLabel,
                collageSurfaceType,
                collageLiquidColor1,
                collageLiquidColor2,
                collageNailPolishColor,
                collageTopRightBackground,
                collageBottomLeftBackground,
                collageHairColor,
                collageClothingColor,
                collageMainHeadlineText,
                collageAuthorCreditText,
                collageRatio,
                language
              }
            }

            const { data: dbData, error: dbError } = await supabase
              .from('posters_uploads')
              .insert(dbRecord)
              .select()

            if (!dbError && dbData) {
              // Update poster with storage URL
              const finalPoster = {
                ...tempPoster,
                dbId: dbData[0]?.id,
                imageUrl: uploadResult.publicUrl
              }

              // Update the temp poster with storage URL (already shown, just update the URL)
              setGeneratedPosters(prev =>
                prev.map(p => p.id === tempPoster.id ? finalPoster : p)
              )
            }
          }
        }

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`🎨 Generated collage poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      if (isPhotorealisticAd) {
        // Photorealistic Ad Image Generator
        const imageToUse = photorealisticImage || productImage
        if (!imageToUse) {
          throw new Error('Please upload a product image for photorealistic generation')
        }

        // Build the image generation prompt using the photorealistic prompt builder
        const optimizedPrompt = buildPhotorealisticAdPrompt({
          backgroundSetting: photorealisticBackgroundSetting,
          headlineColor: photorealisticHeadlineColor,
          mainHeadlineText: photorealisticMainHeadlineText,
          bodyText: photorealisticBodyText,
          productName: photorealisticProductName,
          brandLogo: photorealisticBrandLogo,
          flavorOrVariant: photorealisticFlavorOrVariant,
          productIngredientsOrForms: photorealisticProductIngredientsOrForms,
          calloutColor: photorealisticCalloutColor,
          calloutText1: photorealisticCalloutText1,
          calloutText2: photorealisticCalloutText2,
          aspectRatio: photorealisticRatio,
          language
        })

        // Generate only 1 image
        const imageResult = await GeminiImageService.generateImages({
          prompt: optimizedPrompt,
          quantity: 1,
          referenceImage: imageToUse
        })

        if (!imageResult.success || !imageResult.images) {
          throw new Error(imageResult.error || 'Failed to generate photorealistic images')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        const newPosters = [] as typeof generatedPosters

        for (let i = 0; i < imageResult.images.length; i++) {
          const base64DataUrl = imageResult.images[i]

          console.log(`📸 [Photorealistic Poster ${i + 1}] Generated successfully`)

          // Determine dimensions based on ratio
          const dimensions = photorealisticRatio === '1:1' ? '1024x1024' : 
                            photorealisticRatio === '16:9' ? '1152x648' :
                            photorealisticRatio === '9:16' ? '648x1152' :
                            '1024x1280' // 4:5

          // Show image immediately in UI before upload
          const tempPoster = {
            id: `photorealistic-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: `Photorealistic Ad: ${photorealisticMainHeadlineText}`,
            imageUrl: base64DataUrl,
            dimensions,
            created_at: new Date().toISOString()
          }

          // Remove loading placeholders and add temp poster
          setGeneratedPosters(prev => {
            const withoutLoading = prev.filter(p => !p.isLoading)
            return [tempPoster, ...withoutLoading]
          })

          // Upload image to Supabase Storage
          const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)

          if (uploadResult.success && uploadResult.storagePath && uploadResult.publicUrl) {
            // Store metadata in database
            const dbRecord = {
              user_id: user.id,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              prompt: `Photorealistic Ad: ${photorealisticMainHeadlineText}`,
              settings_json: {
                template: 'photorealistic-ad',
                photorealisticBackgroundSetting,
                photorealisticHeadlineColor,
                photorealisticMainHeadlineText,
                photorealisticBodyText,
                photorealisticProductName,
                photorealisticBrandLogo,
                photorealisticFlavorOrVariant,
                photorealisticProductIngredientsOrForms,
                photorealisticCalloutColor,
                photorealisticCalloutText1,
                photorealisticCalloutText2,
                photorealisticRatio,
                language
              }
            }

            const { data: dbData, error: dbError } = await supabase
              .from('posters_uploads')
              .insert(dbRecord)
              .select()

            if (!dbError && dbData) {
              // Update poster with storage URL
              const finalPoster = {
                ...tempPoster,
                dbId: dbData[0]?.id,
                imageUrl: uploadResult.publicUrl
              }

              // Update the temp poster with storage URL (already shown, just update the URL)
              setGeneratedPosters(prev =>
                prev.map(p => p.id === tempPoster.id ? finalPoster : p)
              )
            }
          }
        }

        // Decrement usage (only 1 image generated)
        await incrementUsage('poster', 1)

        addToast(`📸 Generated photorealistic poster successfully!`, 'success')
        postersInitializedRef.current = true
        
        // Close settings after generation
        if (isMobile) {
          setShowMobileSettings(false)
        }
        
        setGenerating(false)
        return
      }

      // Original template logic
      const fullPrompt = buildPrompt()

      let width = 1024, height = 1024
      if (orientation === 'vertical') {
        width = 768
        height = 1344
      } else if (orientation === 'horizontal') {
        width = 1344
        height = 768
      }

      // Generate only 1 image
      const result = await GeminiImageService.generateImages({
        prompt: fullPrompt,
        quantity: 1,
        referenceImage: productImage || undefined
      })

      if (!result.success || !result.images) {
        throw new Error(result.error || 'Failed to generate images')
      }

      if (!user) {
        throw new Error('User not authenticated')
      }

      const newPosters = [] as typeof generatedPosters

      for (let i = 0; i < result.images.length; i++) {
        const base64DataUrl = result.images[i]
        
        console.log(`📸 [Poster ${i + 1}] Base64 data URL first 100 chars:`, base64DataUrl.substring(0, 100))

        // Show image immediately in UI before upload
        const tempPoster = {
          id: `poster-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
          prompt: fullPrompt,
          imageUrl: base64DataUrl, // Show base64 immediately
          dimensions: `${width}x${height}`,
          created_at: new Date().toISOString()
        }
        
        // Remove loading placeholders and add temp poster
        setGeneratedPosters(prev => {
          const withoutLoading = prev.filter(p => !p.isLoading)
          return [tempPoster, ...withoutLoading]
        })

        // Upload image to Supabase Storage
        const uploadResult = await StorageService.uploadPosterImage(base64DataUrl, user.id)
        
        if (!uploadResult.success || !uploadResult.storagePath || !uploadResult.publicUrl) {
          console.error('Failed to upload image to storage:', uploadResult.error)
          console.warn('Image shown in UI but not uploaded to storage')
          continue // Show image but skip database save
        }

        // Store metadata in database with storage path
        const dbRecord = {
          user_id: user.id,
          storage_path: uploadResult.storagePath,
          image_url: uploadResult.publicUrl,
          prompt: fullPrompt,
          settings_json: {
            primaryColor, accentColor, language, headlineTone, subheadTone, ctaText, layoutStyle, fontStyle, orientation, lightingStyle, backgroundType, compositionType, moodStyle, artStyle, depthStyle, visualEffects, feelStyle, logoPosition, graphicElements, brandKeywords, decoratingItems
          }
        }

        const { data: dbData, error: dbError } = await supabase
          .from('posters_uploads')
          .insert(dbRecord)
          .select()

        if (dbError) {
          console.error('Failed to save to database:', dbError)
          console.warn('Image uploaded but not saved to database')
        }

        // Update poster with storage URL
        const finalPoster = {
          ...tempPoster,
          dbId: dbData?.[0]?.id,
          imageUrl: uploadResult.publicUrl
        }
        
        newPosters.push(finalPoster)
        
        // Update the temp poster with storage URL
        setGeneratedPosters(prev => 
          prev.map(p => p.id === tempPoster.id ? finalPoster : p)
        )
      }

      // Decrement usage (only 1 image generated)
      await incrementUsage('poster', 1)
      
      addToast(`Generated poster successfully!`, 'success')
      postersInitializedRef.current = true
      
      // Close settings after generation
      if (isMobile) {
        setShowMobileSettings(false)
      }
    } catch (error) {
      console.error('Failed to generate posters:', error)
      addToast(`Failed to generate posters: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      
      // Remove loading placeholders on error
      setGeneratedPosters(prev => prev.filter(p => !p.isLoading))
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPoster = async (posterUrl: string, index: number) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(posterUrl)
      const blob = await response.blob()
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `poster-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Failed to download poster:', error)
      addToast('Failed to download poster', 'error')
    }
  }

  const handleCopyPublicLink = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      setLinkCopied(true)
      setTimeout(() => {
        setLinkCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      addToast('Failed to copy link', 'error')
    }
  }

  // Auto-load history on component mount only - never reload on template selection
  useEffect(() => {
    // ULTRA STRICT: Check refs FIRST - if loadHistory has been called, NEVER call it again
    if (loadHistoryCalledRef.current) {
      return
    }
    if (postersInitializedRef.current) {
      return
    }
    
    // Only load on initial mount if ALL conditions are met
    if (
      user && 
      !historyLoaded && 
      generatedPosters.length === 0
    ) {
      loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Only depend on user - everything else is checked inside

  const loadHistory = async (loadMore = false) => {
    // Prevent concurrent calls
    if (loadingHistory) {
      return
    }

    // ULTIMATE GUARD: If this is NOT a "Load More" action, and we've already loaded history, DO NOTHING
    // This prevents ANY reloads when navigating between templates and settings
    if (!loadMore) {
      // If any of these are true, we've already loaded, so do nothing
      if (loadHistoryCalledRef.current) {
      return
      }
      if (postersInitializedRef.current) {
        return
      }
      if (historyLoaded) {
        return
      }
      if (generatedPosters.length > 0) {
        return
      }
    }

    if (!user) {
      return
    }

    // Mark that loadHistory has been called (for non-loadMore calls) - DO THIS FIRST
    if (!loadMore) {
      loadHistoryCalledRef.current = true
    }

    setLoadingHistory(true)
    try {
      const page = loadMore ? historyPage + 1 : 0
      const offset = page * HISTORY_PAGE_SIZE

      // First, check total count to determine if there are more pages
      const { count: totalCount } = await supabase
        .from('posters_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { data, error } = await supabase
        .from('posters_uploads')
        .select('id, storage_path, image_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + HISTORY_PAGE_SIZE - 1)

      if (error) {
        throw error
      }

      const historyPosters = (data || []).map((item: { id: string; storage_path?: string; image_url: string; created_at: string }) => {
          // Prefer storage_path over image_url (for new records)
          const imageUrl = item.storage_path 
            ? StorageService.getPublicUrl(item.storage_path)
            : item.image_url // Fallback to old base64 for legacy records
          
          return {
            id: `history-${item.id}`,
            dbId: item.id,
            prompt: '',
            imageUrl: imageUrl,
            created_at: item.created_at
          }
        })

        if (loadMore) {
          // Append to existing posters, but filter out any duplicates
          setGeneratedPosters(prev => {
            const existingIds = new Set(prev.map(p => p.id))
            const newPosters = historyPosters.filter(p => !existingIds.has(p.id))
          console.log(`📚 [Load More] Adding ${newPosters.length} new posters to existing ${prev.length}`)
            return [...prev, ...newPosters]
          })
        } else {
          // Only set on first load - preserve any existing posters from current session
          setGeneratedPosters(prev => {
            // Never replace existing posters - if we have any, keep them
            if (prev.length > 0) {
              return prev
            }
            // First load with no existing posters - set history posters
            return historyPosters
          })
        }

        setHistoryPage(page)
      // Set hasMoreHistory based on whether there are more posters beyond current page
      const returnedCount = (data || []).length
      const nextPageStart = (page + 1) * HISTORY_PAGE_SIZE
      const hasMore = totalCount ? nextPageStart < totalCount : returnedCount === HISTORY_PAGE_SIZE
      setHasMoreHistory(hasMore)
      console.log(`📚 [Load History] Page ${page}, Loaded ${returnedCount} posters, Total: ${totalCount}, Next page starts at ${nextPageStart}, hasMoreHistory: ${hasMore}`)
        setHistoryLoaded(true)
        setShowHistory(true)
        postersInitializedRef.current = true
    } catch (err) {
      console.error('Failed to load history:', err)
      addToast('Failed to load history', 'error')
    } finally {
      setLoadingHistory(false)
    }
  }

  // Show loading spinner while checking subscription status
  if (subscriptionLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="md" className="mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check subscription access - only show premium gate after loading is complete
  if (!hasAccess) {
    return <PosterPremiumGate />
  }

  return (
    <>
      <style>{`
        .poster-grid-responsive {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        @media (min-width: 1200px) {
          .poster-grid-responsive {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1500px) {
          .poster-grid-responsive {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    <div 
      className="w-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100" 
      style={{ 
        height: isMobile ? 'calc(100vh - 64px)' : '100vh', 
        maxHeight: isMobile ? 'calc(100vh - 64px)' : '100vh',
        position: isMobile ? 'fixed' : 'relative',
        top: isMobile ? '64px' : 'auto',
        left: isMobile ? '0' : 'auto',
        right: isMobile ? '0' : 'auto',
        bottom: isMobile ? '0' : 'auto'
      }}
    >
      {/* Header */}
      <div className="px-4 md:px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg p-1.5 bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
            <ImageIcon size={18} className="text-white" />
            </div>
            <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Poster Generator</h1>
          </div>
        </div>
        {/* Mobile Settings Button */}
        {templateSelected && (
          <button
            onClick={() => setShowMobileSettings(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open settings"
          >
            <Settings size={20} className="text-slate-600" />
          </button>
        )}
      </div>

      {/* Content area */}
      <div 
        className="flex flex-1 overflow-hidden relative" 
        style={{ 
          height: isMobile ? 'calc(100vh - 64px - 60px)' : 'calc(100vh - 60px)', 
          maxHeight: isMobile ? 'calc(100vh - 64px - 60px)' : 'calc(100vh - 60px)', 
          minHeight: 0
        }}
      >
        {/* Mobile Settings Overlay */}
        {showMobileSettings && (
          <div
            className="fixed inset-0 bg-black/50 z-[90] md:hidden transition-opacity duration-300"
            onClick={() => setShowMobileSettings(false)}
          />
        )}

        {/* Left Panel - Results (Always Visible) */}
        <div className={`flex-1 min-w-0 flex flex-col bg-white h-full overflow-hidden ${(templateSelected || !isMobile) ? 'border-r-0 md:border-r border-slate-200' : ''}`}>
          <div className={`flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 min-h-0 ${generatedPosters.length > 0 ? 'pb-24 md:pb-6' : ''}`}>
            {!templateSelected && (!showTemplateChooser || !isMobile) ? (
              <div className={`flex flex-col ${generatedPosters.length === 0 ? 'items-center justify-center h-full text-center' : 'w-full'}`}>
                {generatedPosters.length === 0 ? (
                  <>
                    <ImageIcon className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No posters yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">
                      {isMobile ? 'Click the button below to start generating posters' : 'Select a template from the sidebar to start generating posters'}
                    </p>
                    {isMobile && (
                    <button
                        onClick={() => {
                          setShowMobileSettings(true)
                          setSidebarView('templates') // Show templates view when opening
                        }}
                      className="px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700"
                    >
                      <Sparkles size={18} />
                      Generate Posters
                </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">Generated Posters</h2>
                        {generating && (
                          <TextShimmer className="text-sm text-slate-700" duration={1.5}>
                            Generating...
                          </TextShimmer>
                        )}
                      </div>
                      <span className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-medium">{generatedPosters.filter(p => !p.isLoading).length} poster{generatedPosters.filter(p => !p.isLoading).length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="poster-grid-responsive">
                      {generatedPosters.filter(p => !p.isLoading).map((poster, index) => (
                        <div
                          key={poster.id}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                          onClick={() => setEnlargedImage(poster.imageUrl)}
                        >
                          <div className="aspect-square relative">
                            {poster.imageUrl ? (
                              <>
                              <img
                                src={poster.imageUrl}
                                alt={`Poster ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              </>
                            ) : (
                              <AuroraBackground className="w-full h-full rounded-xl">
                                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                  <Sparkles className="w-8 h-8 text-white mb-2 animate-pulse" />
                                  <p className="text-sm font-medium text-white">Generating...</p>
                                </div>
              </AuroraBackground>
            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Posters Button */}
                    {hasMoreHistory && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => loadHistory(true)}
                          disabled={loadingHistory}
                          className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingHistory ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Load More Posters
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {generatedPosters.length > 0 && (
                      <div className="md:hidden fixed bottom-0 left-0 right-0 px-4 pb-4 pt-4 bg-white border-t border-slate-200 shadow-lg z-40">
              <button
                          onClick={() => {
                            setTemplateSelected(false)
                            setSelectedTemplateName('')
                            setShowMobileSettings(true)
                          }}
                          className="w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700"
                        >
                          <Sparkles size={18} />
                          Generate More Posters
                        </button>
                      </div>
                    )}
                  </div>
                  )}
              </div>
            ) : generatedPosters.length === 0 && !generating ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ImageIcon className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No posters yet</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Fill in the settings and click Generate to create your posters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">Generated Posters</h2>
                    {generating && (
                      <TextShimmer className="text-sm text-slate-700" duration={1.5}>
                        Generating...
                      </TextShimmer>
                    )}
                  </div>
                  <span className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-medium">{generatedPosters.filter(p => !p.isLoading).length} poster{generatedPosters.filter(p => !p.isLoading).length !== 1 ? 's' : ''}</span>
            </div>

                <div className="poster-grid-responsive">
                  {generatedPosters.filter(p => !p.isLoading).map((poster, index) => (
                    <div
                      key={poster.id}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                      onClick={() => setEnlargedImage(poster.imageUrl)}
                    >
                      <div className="aspect-square relative">
                        {poster.imageUrl ? (
                          <>
                          <img
                            src={poster.imageUrl}
                            alt={`Poster ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          </>
                        ) : (
                          <AuroraBackground className="w-full h-full rounded-xl">
                            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                              <Sparkles className="w-8 h-8 text-white mb-2 animate-pulse" />
                              <p className="text-sm font-medium text-white">Generating...</p>
                            </div>
                          </AuroraBackground>
                      )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Posters Button */}
                {hasMoreHistory && (
                  <div className="flex justify-center mt-6 mb-24 md:mb-6">
                    <button
                      onClick={() => loadHistory(true)}
                      disabled={loadingHistory}
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingHistory ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Load More Posters
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Mobile Sticky Button - Show when template is selected and there are posters */}
                {generatedPosters.length > 0 && (
                  <div className="md:hidden fixed bottom-0 left-0 right-0 px-4 pb-4 pt-4 bg-white border-t border-slate-200 shadow-lg z-40">
                    <button
                      onClick={() => {
                        setShowMobileSettings(true)
                        setSidebarView('templates') // Just show templates view, keep template selected
                      }}
                      className="w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700"
                    >
                      <Sparkles size={18} />
                      Generate More Posters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Settings Sidebar */}
            {(!isMobile || showMobileSettings) && (
          <div 
            className={`flex-shrink-0 flex flex-col bg-white border-l border-slate-200 relative overflow-hidden shadow-lg transition-transform duration-300 ease-in-out ${
              isMobile && showMobileSettings
                ? 'fixed right-0 top-0 h-full w-full z-[100]' 
                : isMobile
                ? 'hidden'
                : 'relative z-auto'
            }`}
            style={isMobile ? {} : { width: '480px' }}
          >
          {/* Mobile Close Button with Breadcrumbs */}
          {(showMobileSettings || templateSelected) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 md:hidden">
              <nav aria-label="breadcrumb" className="flex-1">
                <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
                  <li className="inline-flex items-center gap-1.5">
                    {sidebarView === 'settings' ? (
                      <button
                        onClick={() => {
                          setSidebarView('templates') // Just change view, don't reset template selection
                        }}
                        className="transition-colors hover:text-slate-900 cursor-pointer"
                      >
                        Templates
                      </button>
                    ) : (
                      <span className="font-normal text-slate-900">Templates</span>
                    )}
                  </li>
                  {sidebarView === 'settings' && (
                    <>
                      <li role="presentation" aria-hidden="true" className="[&>svg]:w-3.5 [&>svg]:h-3.5">
                        <ChevronRight size={14} />
                      </li>
                      <li className="inline-flex items-center">
                        <span className="font-normal text-slate-900" aria-current="page">Settings</span>
                      </li>
                    </>
                  )}
                </ol>
              </nav>
                <button
                onClick={() => setShowMobileSettings(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors ml-2"
                aria-label="Close settings"
                >
                <X size={20} className="text-slate-600" />
                </button>
                  </div>
          )}
          {/* Sidebar Header with Breadcrumbs (Desktop) */}
          <div className="hidden md:flex flex-shrink-0 px-4 md:px-6 py-4 border-b border-slate-200">
            <nav aria-label="breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
                  <li className="inline-flex items-center gap-1.5">
                    {sidebarView === 'settings' ? (
                      <button
                        onClick={() => {
                          setSidebarView('templates') // Just change view, don't reset template selection
                        }}
                        className="transition-colors hover:text-slate-900 cursor-pointer"
                      >
                        Templates
                      </button>
                    ) : (
                      <span className="font-normal text-slate-900">Templates</span>
                    )}
                  </li>
                  {sidebarView === 'settings' && (
                  <>
                    <li role="presentation" aria-hidden="true" className="[&>svg]:w-3.5 [&>svg]:h-3.5">
                      <ChevronRight size={14} />
                    </li>
                    <li className="inline-flex items-center">
                      <span className="font-normal text-slate-900" aria-current="page">Settings</span>
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>
          {/* Settings Content - Unified Templates and Settings View */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
            {/* Template Selection View */}
            {sidebarView === 'templates' && (
              <div className="flex flex-col w-full space-y-4">
                <div className="grid grid-cols-1 gap-3 w-full">
                  {templates
                    .filter(template => 
                      template.id !== 'professional-product' && 
                      template.id !== 'dove-style-grid'
                    )
                    .map(template => (
                    <div
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="cursor-pointer border border-slate-200 rounded-xl overflow-hidden hover:border-orange-400 hover:shadow-md transition-all bg-white flex"
                    >
                      <div className="flex-shrink-0 w-24 h-24">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-center">
                        <h3 className="font-semibold text-sm text-slate-900">{template.name}</h3>
                        <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Settings View - Only show if template is selected */}
            {sidebarView === 'settings' && templateSelected && (
              <div className="space-y-6">
                    {/* Conditional Settings: Cinematic vs Standard */}
                    {selectedTemplateName === 'Cinematic Product Ad (AI-Powered)' ? (
                      // Cinematic Ad Settings
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-orange-800 font-medium">
                            💡 Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect ad concept. The AI has full creative freedom to compose and place elements naturally.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!cinematicImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCinematicImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={cinematicImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setCinematicImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => setCinematicRatio(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  cinematicRatio === key
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Headline *</label>
                          <input
                            type="text"
                            value={cinematicHeadline}
                            onChange={(e) => setCinematicHeadline(e.target.value)}
                            placeholder="e.g., Pure Luxury for Your Skin"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Features (3)</label>
                          {cinematicFeatures.map((feature, idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...cinematicFeatures]
                                newFeatures[idx] = e.target.value
                                setCinematicFeatures(newFeatures)
                              }}
                              placeholder={`e.g., ✨ ${idx === 0 ? 'Hydrates instantly' : idx === 1 ? 'Natural glow' : 'Dermatologist tested'}`}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          ))}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">CTA Text</label>
                          <input
                            type="text"
                            value={cinematicCtaText}
                            onChange={(e) => setCinematicCtaText(e.target.value)}
                            placeholder="e.g., Shop Now"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Color Palette</label>
                          <input
                            type="text"
                            value={cinematicPalette}
                            onChange={(e) => setCinematicPalette(e.target.value)}
                            placeholder="e.g., Warm & Luxurious"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Background Object</label>
                          <input
                            type="text"
                            value={cinematicBgObject}
                            onChange={(e) => setCinematicBgObject(e.target.value)}
                            placeholder="e.g., floating particles"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Style</label>
                          <input
                            type="text"
                            value={cinematicStyle}
                            onChange={(e) => setCinematicStyle(e.target.value)}
                            placeholder="e.g., Luxurious & Cinematic"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'Botanical Beauty Ad (High-End Studio)' ? (
                      // Botanical Beauty Ad Settings
                      <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-emerald-800 font-medium">
                            🌿 Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect botanical beauty ad concept. The AI will arrange fresh botanicals intimately around your product.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!botanicalImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBotanicalImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={botanicalImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setBotanicalImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => setBotanicalRatio(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  botanicalRatio === key
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Name *</label>
                          <input
                            type="text"
                            value={botanicalBrandName}
                            onChange={(e) => setBotanicalBrandName(e.target.value)}
                            placeholder="e.g., Aura Botanicals"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Headline *</label>
                          <input
                            type="text"
                            value={botanicalHeadline}
                            onChange={(e) => setBotanicalHeadline(e.target.value)}
                            placeholder="e.g., Instinct. Bottled."
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Features (1-2 powerful phrases)</label>
                          {botanicalFeatures.map((feature, idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...botanicalFeatures]
                                newFeatures[idx] = e.target.value
                                setBotanicalFeatures(newFeatures)
                              }}
                              placeholder={`e.g., ${idx === 0 ? 'Pheromonal Signature, Infused with Desert Quandong Extract' : 'The Ultimate Confidence Amplifier'}`}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          ))}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">CTA Text</label>
                          <input
                            type="text"
                            value={botanicalCtaText}
                            onChange={(e) => setBotanicalCtaText(e.target.value)}
                            placeholder="e.g., Discover Your Aura"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Color Palette</label>
                          <input
                            type="text"
                            value={botanicalPaletteName}
                            onChange={(e) => setBotanicalPaletteName(e.target.value)}
                            placeholder="e.g., Earthy Greens, Deep Black, Gold accents, and Clean White background"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Botanical Arrangement</label>
                          <textarea
                            value={botanicalBgObject}
                            onChange={(e) => setBotanicalBgObject(e.target.value)}
                            placeholder="e.g., a bed of vibrant green moss, whole small limes, and carefully sliced limes"
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Overall Style</label>
                          <input
                            type="text"
                            value={botanicalStyle}
                            onChange={(e) => setBotanicalStyle(e.target.value)}
                            placeholder="e.g., clean, high-key studio, natural, sophisticated"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'Lifestyle Model Ad (Human-Centric)' ? (
                      // Lifestyle Model Ad Settings
                      <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-indigo-800 font-medium">
                            👤 Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect lifestyle model ad concept. The AI will create a realistic scene with a model using your product.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!lifestyleImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLifestyleImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={lifestyleImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => {
                                  setLifestyleImage('')
                                  setLifestyleRawFile(null)
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => handleLifestyleRatioChange(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  lifestyleRatio === key
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Environment Context</label>
                          <input
                            type="text"
                            value={lifestyleEnvironmentContext}
                            onChange={(e) => setLifestyleEnvironmentContext(e.target.value)}
                            placeholder="e.g., Luxury Penthouse Apartment"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aesthetic Style</label>
                          <input
                            type="text"
                            value={lifestyleStyle}
                            onChange={(e) => setLifestyleStyle(e.target.value)}
                            placeholder="e.g., Cinematic High-Fashion"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Model Description *</label>
                          <textarea
                            value={lifestyleModelDescription}
                            onChange={(e) => setLifestyleModelDescription(e.target.value)}
                            placeholder="e.g., sophisticated Hispanic woman in her 30s wearing a silk evening gown"
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                          <p className="text-xs text-slate-500">Be specific with ethnicity, age, gender, and clothing</p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Background Object</label>
                          <textarea
                            value={lifestyleBgObject}
                            onChange={(e) => setLifestyleBgObject(e.target.value)}
                            placeholder="e.g., panoramic window view of a city skyline at night"
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Name</label>
                          <input
                            type="text"
                            value={lifestyleBrandName}
                            onChange={(e) => setLifestyleBrandName(e.target.value)}
                            placeholder="e.g., LUMIÈRE"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Headline</label>
                          <input
                            type="text"
                            value={lifestyleHeadline}
                            onChange={(e) => setLifestyleHeadline(e.target.value)}
                            placeholder="e.g., RADIANCE REDEFINED"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Description</label>
                          <textarea
                            value={lifestyleDescription}
                            onChange={(e) => setLifestyleDescription(e.target.value)}
                            placeholder="e.g., Experience the ultimate in luxury skincare with our new night repair serum."
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">CTA Text</label>
                          <input
                            type="text"
                            value={lifestyleCtaText}
                            onChange={(e) => setLifestyleCtaText(e.target.value)}
                            placeholder="e.g., SHOP NOW"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Color Palette Name</label>
                          <input
                            type="text"
                            value={lifestylePaletteName}
                            onChange={(e) => setLifestylePaletteName(e.target.value)}
                            placeholder="e.g., Midnight Gold"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'E-Commerce Product Ad (Professional Layout)' ? (
                      // E-Commerce Product Ad Settings
                      <div className="space-y-4">
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-teal-800 font-medium">
                            🛒 Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect e-commerce ad concept with text, CTA, and product usage photos.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!ecommerceImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEcommerceImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={ecommerceImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setEcommerceImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => setEcommerceRatio(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  ecommerceRatio === key
                                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Name</label>
                          <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g., Premium Wireless Headphones"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Description</label>
                          <textarea
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder="Brief description of the product"
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Logo Name</label>
                          <input
                            type="text"
                            value={ecommerceBrandLogo}
                            onChange={(e) => setEcommerceBrandLogo(e.target.value)}
                            placeholder="e.g., YourBrand"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Title Text *</label>
                          <input
                            type="text"
                            value={ecommerceTitleText}
                            onChange={(e) => setEcommerceTitleText(e.target.value)}
                            placeholder="e.g., Transform Your Daily Routine"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Tagline Text</label>
                          <input
                            type="text"
                            value={ecommerceTaglineText}
                            onChange={(e) => setEcommerceTaglineText(e.target.value)}
                            placeholder="e.g., Experience the difference"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Body Text *</label>
                          <textarea
                            value={ecommerceBodyText}
                            onChange={(e) => setEcommerceBodyText(e.target.value)}
                            placeholder="Describe the product benefits and features"
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">CTA Text</label>
                          <input
                            type="text"
                            value={ecommerceCtaText}
                            onChange={(e) => setEcommerceCtaText(e.target.value)}
                            placeholder="e.g., Shop Now"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">CTA Button Color</label>
                          <select
                            value={ecommerceCtaButtonColor}
                            onChange={(e) => setEcommerceCtaButtonColor(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            <option value="purple">Purple</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="orange">Orange</option>
                            <option value="red">Red</option>
                            <option value="pink">Pink</option>
                            <option value="teal">Teal</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Human Pose 1 (Top Frame)</label>
                          <textarea
                            value={ecommerceHumanPose1}
                            onChange={(e) => setEcommerceHumanPose1(e.target.value)}
                            placeholder="e.g., person using the product in a natural setting"
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Human Pose 2 (Bottom Frame)</label>
                          <textarea
                            value={ecommerceHumanPose2}
                            onChange={(e) => setEcommerceHumanPose2(e.target.value)}
                            placeholder="e.g., person demonstrating product benefits"
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Background Gradient Colors</label>
                          <input
                            type="text"
                            value={ecommerceBackgroundColors}
                            onChange={(e) => setEcommerceBackgroundColors(e.target.value)}
                            placeholder="e.g., beige to cream, light blue to white"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'Christmas Festive Ad (Holiday Campaign)' ? (
                      // Christmas Festive Ad Settings
                      <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-red-800 font-medium">
                            🎄 Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect festive Christmas ad concept with holiday elements and discount banner.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!christmasImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleChristmasImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={christmasImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setChristmasImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => setChristmasRatio(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  christmasRatio === key
                                    ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Logo Text *</label>
                          <input
                            type="text"
                            value={christmasBrandLogoText}
                            onChange={(e) => setChristmasBrandLogoText(e.target.value)}
                            placeholder="e.g., YourBrand"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Title Text *</label>
                          <input
                            type="text"
                            value={christmasTitleText}
                            onChange={(e) => setChristmasTitleText(e.target.value)}
                            placeholder="e.g., Celebrate the Holidays"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Descriptive Text</label>
                          <textarea
                            value={christmasDescriptiveText}
                            onChange={(e) => setChristmasDescriptiveText(e.target.value)}
                            placeholder="e.g., Spread joy with our festive collection"
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Worn By Model</label>
                          <textarea
                            value={christmasProductWornByModel}
                            onChange={(e) => setChristmasProductWornByModel(e.target.value)}
                            placeholder="e.g., a baby in baggy green Christmas gift-patterned sweatpants and a cream sweater"
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                          <p className="text-xs text-slate-500">Describe the product being worn or used by a model</p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Website URL</label>
                          <input
                            type="text"
                            value={christmasWebsiteUrl}
                            onChange={(e) => setChristmasWebsiteUrl(e.target.value)}
                            placeholder="e.g., www.yourbrand.com"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Slogan</label>
                          <input
                            type="text"
                            value={christmasSlogan}
                            onChange={(e) => setChristmasSlogan(e.target.value)}
                            placeholder="e.g., Making Holidays Special"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Discount Details</label>
                          <input
                            type="text"
                            value={christmasDiscountDetails}
                            onChange={(e) => setChristmasDiscountDetails(e.target.value)}
                            placeholder="e.g., 50% OFF"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Discount Code</label>
                          <input
                            type="text"
                            value={christmasDiscountCode}
                            onChange={(e) => setChristmasDiscountCode(e.target.value)}
                            placeholder="e.g., CHRISTMAS2024"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'High-Tech Product Ad (Sleek & Modern)' ? (
                      // High-Tech Product Ad Settings
                      <div className="space-y-4">
                        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-cyan-800 font-medium">
                            ⚡ Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect high-tech ad concept with feature callouts and sleek design.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!hightechImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleHightechImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={hightechImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setHightechImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => setHightechRatio(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  hightechRatio === key
                                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Logo</label>
                          <input
                            type="text"
                            value={hightechBrandLogo}
                            onChange={(e) => setHightechBrandLogo(e.target.value)}
                            placeholder="e.g., YourBrand Logo"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Name *</label>
                          <input
                            type="text"
                            value={hightechBrandName}
                            onChange={(e) => setHightechBrandName(e.target.value)}
                            placeholder="e.g., TechBrand"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Main Offer Headline *</label>
                          <input
                            type="text"
                            value={hightechMainOfferHeadline}
                            onChange={(e) => setHightechMainOfferHeadline(e.target.value)}
                            placeholder="e.g., PAY ₹20, GET ₹100!"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Description</label>
                          <textarea
                            value={hightechProductDescription}
                            onChange={(e) => setHightechProductDescription(e.target.value)}
                            placeholder="e.g., 10000mAh Slim & Compact Powerbank with In-Built Lightning & Type-C Cables"
                            rows={2}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Name and Details</label>
                          <textarea
                            value={hightechProductNameAndDetails}
                            onChange={(e) => setHightechProductNameAndDetails(e.target.value)}
                            placeholder="e.g., a white power bank with a digital display showing '99%' and '22.5W Super fast charge', with attached cables"
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                          <p className="text-xs text-slate-500">Describe the product appearance and key visual details</p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Feature 1 Text (Left Side)</label>
                          <input
                            type="text"
                            value={hightechFeature1Text}
                            onChange={(e) => setHightechFeature1Text(e.target.value)}
                            placeholder="e.g., 22.5W Fast Charge"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Feature 2 Text (Left Side)</label>
                          <input
                            type="text"
                            value={hightechFeature2Text}
                            onChange={(e) => setHightechFeature2Text(e.target.value)}
                            placeholder="e.g., In-Built Cables"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Feature 3 Text (Right Side)</label>
                          <input
                            type="text"
                            value={hightechFeature3Text}
                            onChange={(e) => setHightechFeature3Text(e.target.value)}
                            placeholder="e.g., Digital Display"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'Four-Panel Collage Ad (Beauty Products)' ? (
                      // Four-Panel Collage Ad Settings
                      <div className="space-y-4">
                        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-pink-800 font-medium">
                            🎨 Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect four-panel collage ad concept with beauty products and editorial style.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!collageImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCollageImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={collageImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setCollageImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => setCollageRatio(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  collageRatio === key
                                    ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Product Name 1 *</label>
                            <input
                              type="text"
                              value={collageProductName1}
                              onChange={(e) => setCollageProductName1(e.target.value)}
                              placeholder="e.g., Vitamin C Serum"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Product Name 2 *</label>
                            <input
                              type="text"
                              value={collageProductName2}
                              onChange={(e) => setCollageProductName2(e.target.value)}
                              placeholder="e.g., Hyaluronic Acid"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Brand Name *</label>
                            <input
                              type="text"
                              value={collageBrandName}
                              onChange={(e) => setCollageBrandName(e.target.value)}
                              placeholder="e.g., BeautyBrand"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Brand Name on Label</label>
                            <input
                              type="text"
                              value={collageBrandNameOnLabel}
                              onChange={(e) => setCollageBrandNameOnLabel(e.target.value)}
                              placeholder="e.g., BEAUTYBRAND"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Surface Type</label>
                            <select
                              value={collageSurfaceType}
                              onChange={(e) => setCollageSurfaceType(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              <option value="marble">Marble</option>
                              <option value="stone">Stone</option>
                              <option value="wood">Wood</option>
                              <option value="granite">Granite</option>
                              <option value="concrete">Concrete</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Nail Polish Color</label>
                            <input
                              type="text"
                              value={collageNailPolishColor}
                              onChange={(e) => setCollageNailPolishColor(e.target.value)}
                              placeholder="e.g., nude, pink, red"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Liquid Color 1</label>
                            <input
                              type="text"
                              value={collageLiquidColor1}
                              onChange={(e) => setCollageLiquidColor1(e.target.value)}
                              placeholder="e.g., amber, clear, golden"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Liquid Color 2</label>
                            <input
                              type="text"
                              value={collageLiquidColor2}
                              onChange={(e) => setCollageLiquidColor2(e.target.value)}
                              placeholder="e.g., clear, amber, golden"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Top-Right Background</label>
                            <select
                              value={collageTopRightBackground}
                              onChange={(e) => setCollageTopRightBackground(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              <option value="tiled">Tiled</option>
                              <option value="textured">Textured</option>
                              <option value="marble">Marble</option>
                              <option value="stone">Stone</option>
                              <option value="plain">Plain</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Bottom-Left Background</label>
                            <select
                              value={collageBottomLeftBackground}
                              onChange={(e) => setCollageBottomLeftBackground(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              <option value="marble">Marble</option>
                              <option value="stone">Stone</option>
                              <option value="wood">Wood</option>
                              <option value="tiled">Tiled</option>
                              <option value="plain">Plain</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Hair Color</label>
                            <input
                              type="text"
                              value={collageHairColor}
                              onChange={(e) => setCollageHairColor(e.target.value)}
                              placeholder="e.g., blonde, brunette, black"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Clothing/Robe Color</label>
                            <input
                              type="text"
                              value={collageClothingColor}
                              onChange={(e) => setCollageClothingColor(e.target.value)}
                              placeholder="e.g., white, cream, beige"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Main Headline Text *</label>
                          <input
                            type="text"
                            value={collageMainHeadlineText}
                            onChange={(e) => setCollageMainHeadlineText(e.target.value)}
                            placeholder="e.g., Transform Your Skin"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Author Credit Text</label>
                          <input
                            type="text"
                            value={collageAuthorCreditText}
                            onChange={(e) => setCollageAuthorCreditText(e.target.value)}
                            placeholder="e.g., PAR SOPHIE"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'Photorealistic Product Ad (Bursting Bottle)' ? (
                      // Photorealistic Product Ad Settings
                      <div className="space-y-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-purple-800 font-medium">
                            📸 Upload your product image, then use "Smart Optimize All Settings" to auto-generate the perfect photorealistic ad concept with a bursting bottle and floating ingredients.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!photorealisticImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotorealisticImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={photorealisticImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setPhotorealisticImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Aspect Ratio</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(lifestyleRatios).map(([key, { label }]) => (
                              <button
                                key={key}
                                onClick={() => setPhotorealisticRatio(key)}
                                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  photorealisticRatio === key
                                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {label} ({key})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Background Setting *</label>
                          <input
                            type="text"
                            value={photorealisticBackgroundSetting}
                            onChange={(e) => setPhotorealisticBackgroundSetting(e.target.value)}
                            placeholder="e.g., modern kitchen, bathroom counter"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Headline Color *</label>
                          <select
                            value={photorealisticHeadlineColor}
                            onChange={(e) => setPhotorealisticHeadlineColor(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            <option value="pink">Pink</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="orange">Orange</option>
                            <option value="purple">Purple</option>
                            <option value="red">Red</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Main Headline Text *</label>
                          <input
                            type="text"
                            value={photorealisticMainHeadlineText}
                            onChange={(e) => setPhotorealisticMainHeadlineText(e.target.value)}
                            placeholder="e.g., Boost Your Energy Naturally"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Body Text *</label>
                          <textarea
                            value={photorealisticBodyText}
                            onChange={(e) => setPhotorealisticBodyText(e.target.value)}
                            placeholder="e.g., Experience the power of natural ingredients"
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Name *</label>
                          <input
                            type="text"
                            value={photorealisticProductName}
                            onChange={(e) => setPhotorealisticProductName(e.target.value)}
                            placeholder="e.g., Energy Gummies"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Logo Text *</label>
                          <input
                            type="text"
                            value={photorealisticBrandLogo}
                            onChange={(e) => setPhotorealisticBrandLogo(e.target.value)}
                            placeholder="e.g., Your Brand Name"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Flavor or Variant *</label>
                          <input
                            type="text"
                            value={photorealisticFlavorOrVariant}
                            onChange={(e) => setPhotorealisticFlavorOrVariant(e.target.value)}
                            placeholder="e.g., Mixed Berry, Original"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Ingredients or Forms *</label>
                          <input
                            type="text"
                            value={photorealisticProductIngredientsOrForms}
                            onChange={(e) => setPhotorealisticProductIngredientsOrForms(e.target.value)}
                            placeholder="e.g., gummies, capsules, fruit slices"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                          <p className="text-xs text-slate-500">These will float around the bottle</p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Callout Color *</label>
                          <select
                            value={photorealisticCalloutColor}
                            onChange={(e) => setPhotorealisticCalloutColor(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            <option value="pink">Pink</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="orange">Orange</option>
                            <option value="purple">Purple</option>
                            <option value="red">Red</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Callout Text 1 (Left Side) *</label>
                          <input
                            type="text"
                            value={photorealisticCalloutText1}
                            onChange={(e) => setPhotorealisticCalloutText1(e.target.value)}
                            placeholder="e.g., 60 GUMMIES DAILY DOSE"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Callout Text 2 (Right Side) *</label>
                          <input
                            type="text"
                            value={photorealisticCalloutText2}
                            onChange={(e) => setPhotorealisticCalloutText2(e.target.value)}
                            placeholder="e.g., IXI BEAUTY GLOW BITES HEALTHY SNACK"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : selectedTemplateName === 'Professional Product Photography' ? (
                      // Professional Product Photography Settings
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-blue-800 font-medium">
                            📸 Upload an image. Use "Smart Optimize All Settings" to auto-generate the perfect professional product photography concept.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!productImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={productImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setProductImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Target Audience</label>
                            <input
                              type="text"
                              value={targetAudience}
                              onChange={(e) => setTargetAudience(e.target.value)}
                              placeholder="e.g., young professionals"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Language</label>
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Primary Color</label>
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-full h-11 border border-slate-200 rounded-xl cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Accent Color</label>
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-full h-11 border border-slate-200 rounded-xl cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Orientation</label>
                          <div className="flex gap-2">
                            {orientations.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setOrientation(opt)}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  orientation === opt
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {opt === 'square' && <Square size={14} className="inline mr-1" />}
                                {opt === 'vertical' && <Maximize2 size={14} className="inline mr-1" />}
                                {opt === 'horizontal' && <Maximize size={14} className="inline mr-1" />}
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Lighting Style</label>
                          <select
                            value={lightingStyle}
                            onChange={(e) => setLightingStyle(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {lightingStyles.map(style => (
                              <option key={style} value={style}>{style}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Composition Type</label>
                          <select
                            value={compositionType}
                            onChange={(e) => setCompositionType(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {compositionTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Art Style</label>
                          <select
                            value={artStyle}
                            onChange={(e) => setArtStyle(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {artStyles.map(style => (
                              <option key={style} value={style}>{style}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Feel Style</label>
                          <select
                            value={feelStyle}
                            onChange={(e) => setFeelStyle(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {feelStyles.map(style => (
                              <option key={style} value={style}>{style}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Visual Effects</label>
                          <div className="flex flex-wrap gap-2">
                            {visualEffectOptions.map(effect => (
                              <button
                                key={effect}
                                onClick={() => {
                                  if (visualEffects.includes(effect)) {
                                    setVisualEffects(visualEffects.filter(e => e !== effect))
                                  } else {
                                    setVisualEffects([...visualEffects, effect])
                                  }
                                }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                  visualEffects.includes(effect)
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {effect}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : selectedTemplateName === 'Multi-Variation Ad Grid (Dove Style)' ? (
                      // Multi-Variation Ad Grid (Dove Style) Settings
                      <div className="space-y-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
                          <p className="text-xs text-purple-800 font-medium">
                            🎨 Upload an image. Use "Smart Optimize All Settings" to auto-generate multiple ad variations with randomized styles.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!productImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={productImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setProductImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Target Audience</label>
                            <input
                              type="text"
                              value={targetAudience}
                              onChange={(e) => setTargetAudience(e.target.value)}
                              placeholder="e.g., young professionals"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Language</label>
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Primary Color</label>
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-full h-11 border border-slate-200 rounded-xl cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Accent Color</label>
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-full h-11 border border-slate-200 rounded-xl cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Orientation</label>
                          <div className="flex gap-2">
                            {orientations.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setOrientation(opt)}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  orientation === opt
                                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {opt === 'square' && <Square size={14} className="inline mr-1" />}
                                {opt === 'vertical' && <Maximize2 size={14} className="inline mr-1" />}
                                {opt === 'horizontal' && <Maximize size={14} className="inline mr-1" />}
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Background Type</label>
                          <select
                            value={backgroundType}
                            onChange={(e) => setBackgroundType(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {backgroundTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Lighting Style</label>
                          <select
                            value={lightingStyle}
                            onChange={(e) => setLightingStyle(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {lightingStyles.map(style => (
                              <option key={style} value={style}>{style}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Mood Style</label>
                          <div className="flex flex-wrap gap-2">
                            {moodOptions.map(mood => (
                              <button
                                key={mood}
                                onClick={() => {
                                  if (moodStyle.includes(mood)) {
                                    setMoodStyle(moodStyle.filter(m => m !== mood))
                                  } else {
                                    setMoodStyle([...moodStyle, mood])
                                  }
                                }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                  moodStyle.includes(mood)
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {mood}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Keywords</label>
                          <input
                            type="text"
                            value={brandKeywords}
                            onChange={(e) => setBrandKeywords(e.target.value)}
                            placeholder="e.g., trustworthy, authentic, real"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Decorating Items</label>
                          <input
                            type="text"
                            value={decoratingItems}
                            onChange={(e) => setDecoratingItems(e.target.value)}
                            placeholder="e.g., natural ingredients"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      // Fallback to old tabbed interface for any other templates
                      <div>
                        {/* Tab Navigation */}
                        <div className="flex gap-1 border-b border-slate-200">
                          {[
                            { id: 'quick-start', label: 'Quick Start', icon: <Zap size={14} /> },
                            { id: 'brand-text', label: 'Brand', icon: <Type size={14} /> },
                            { id: 'visuals', label: 'Visuals', icon: <Palette size={14} /> },
                            { id: 'advanced', label: 'Advanced', icon: <Settings size={14} /> }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveSection(tab.id as any)}
                              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all relative ${
                                activeSection === tab.id
                                  ? 'text-slate-900'
                                  : 'border-transparent text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {tab.icon}
                              {tab.label}
                              {activeSection === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></span>
                              )}
                            </button>
                          ))}
                        </div>

                    {/* Quick Start Tab */}
                    {activeSection === 'quick-start' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Name *</label>
                          <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g., LunaGlow Skin Serum"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Description *</label>
                          <textarea
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder="Brief product description for AI"
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Product Image *</label>
                          {!productImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all bg-slate-50">
                              <ImageIcon size={32} className="text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500">Click to upload or drag and drop</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative">
                              <img src={productImage} alt="Product" className="w-full h-32 object-cover rounded-xl" />
                              <button
                                onClick={() => setProductImage('')}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Target Audience</label>
                            <input
                              type="text"
                              value={targetAudience}
                              onChange={(e) => setTargetAudience(e.target.value)}
                              placeholder="e.g., young professionals"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Language</label>
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Brand & Text Tab */}
                    {activeSection === 'brand-text' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Brand Style</label>
                          <input
                            type="text"
                            value={brandStyle}
                            onChange={(e) => setBrandStyle(e.target.value)}
                            placeholder="e.g., luxury minimalism"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Primary Color</label>
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-full h-11 border border-slate-200 rounded-xl cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Accent Color</label>
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-full h-11 border border-slate-200 rounded-xl cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Call-to-Action (CTA)</label>
                          <input
                            type="text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            placeholder="e.g., Shop Now"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Visuals Tab */}
                    {activeSection === 'visuals' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Orientation</label>
                          <div className="flex gap-2">
                            {orientations.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setOrientation(opt)}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm ${
                                  orientation === opt
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
                                }`}
                              >
                                {opt === 'square' && <Square size={14} className="inline mr-1" />}
                                {opt === 'vertical' && <Maximize2 size={14} className="inline mr-1" />}
                                {opt === 'horizontal' && <Maximize size={14} className="inline mr-1" />}
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Lighting Style</label>
                          <select
                            value={lightingStyle}
                            onChange={(e) => setLightingStyle(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {lightingStyles.map(style => (
                              <option key={style} value={style}>{style}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-900">Background Type</label>
                          <select
                            value={backgroundType}
                            onChange={(e) => setBackgroundType(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            {backgroundTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Art Style</label>
                            <select
                              value={artStyle}
                              onChange={(e) => setArtStyle(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {artStyles.map(style => (
                                <option key={style} value={style}>{style}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Feel Style</label>
                            <select
                              value={feelStyle}
                              onChange={(e) => setFeelStyle(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {feelStyles.map(style => (
                                <option key={style} value={style}>{style}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Advanced Tab */}
                    {activeSection === 'advanced' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Composition Type</label>
                            <select
                              value={compositionType}
                              onChange={(e) => setCompositionType(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {compositionTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Depth Style</label>
                            <select
                              value={depthStyle}
                              onChange={(e) => setDepthStyle(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {depthStyles.map(style => (
                                <option key={style} value={style}>{style}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Logo Position</label>
                            <select
                              value={logoPosition}
                              onChange={(e) => setLogoPosition(e.target.value)}
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            >
                              {logoPositions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-900">Brand Keywords</label>
                            <input
                              type="text"
                              value={brandKeywords}
                              onChange={(e) => setBrandKeywords(e.target.value)}
                              placeholder="e.g., luxury, eco-friendly"
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Generation Controls - Only show in settings view, not templates view */}
            {templateSelected && sidebarView === 'settings' && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleSmartOptimize}
                  disabled={optimizing}
                  className="w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 size={18} />
                  {optimizing ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      Optimizing...
                    </>
                  ) : (
                    'Smart Optimize All Settings'
                  )}
                </button>

                <button
                  onClick={handleGeneratePosters}
                  disabled={generating}
                  className="w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                >
                  {generating ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Posters
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
      {/* Enlarged Image Modal */}
      {enlargedImage && (() => {
        const posterIndex = generatedPosters.findIndex(p => p.imageUrl === enlargedImage)
        return (
          <div
            onClick={() => {
              setEnlargedImage(null)
              setLinkCopied(false)
            }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          >
            <button
              onClick={() => {
                setEnlargedImage(null)
                setLinkCopied(false)
              }}
              className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-white/10 z-10"
            >
              <LucideX size={32} />
            </button>
            
            <div className="relative flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <img
                src={enlargedImage}
                alt="Enlarged poster"
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-slate-200"
              />
              
              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (posterIndex !== -1) {
                      handleDownloadPoster(enlargedImage, posterIndex)
                    }
                  }}
                  className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download size={18} />
                  Download
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyPublicLink(enlargedImage)
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all ${
                    linkCopied
                      ? 'bg-green-500 text-white animate-pulse'
                      : 'bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check size={18} />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy Public Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Credit Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        featureType="poster"
        onPurchaseComplete={() => refreshUsage()}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
    </>
  )
}

export default PosterGeneratorRestyledV2
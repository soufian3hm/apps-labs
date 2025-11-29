/**
 * VoiceoverGeneratorPagePolaris - Logic Documentation
 * 
 * This document contains the complete business logic for the Voiceover Generator page.
 * All UI/styling has been removed. Use this as a reference for building the UI.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useUsageTracking } from '../hooks/useUsageTracking'
import { supabase } from '../lib/supabase'
import { generateScript, generateSpeech } from '../services/geminiService'
import { StorageService } from '../services/storageService'
import { playAudio, encodeWAV } from '../utils/audio'
import { FormData, ToneStyle, Accent, ScriptLanguage, CustomFormState } from '../types'
import {
  SCRIPT_LANGUAGES,
  TONE_STYLES,
  ARABIC_ACCENT_OPTIONS,
  ENGLISH_ACCENT_OPTIONS,
  FRENCH_ACCENT_OPTIONS,
  SPANISH_ACCENT_OPTIONS,
  ALL_ACCENT_OPTIONS,
  VOICE_OPTIONS
} from '../constants'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type VoiceoverHistory = {
  id: string
  user_id: string
  storage_path: string
  script: string
  voice_name: string
  accent: string | null
  tone_style: string | null
  language: string | null
  settings_json: any
  created_at: string
}

type MainTab = 'ai-script' | 'custom-script' | 'history'
type PreviewPanelView = 'preview' | 'history'
type SidebarView = 'templates' | 'settings'

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * SUBSCRIPTION & ACCESS CONTROL
 */
const { hasAccess, loading: subscriptionLoading } = useSubscription()
const { canGenerate, incrementUsage, refreshUsage } = useUsageTracking()
const [showCreditModal, setShowCreditModal] = useState(false)

/**
 * MOBILE & RESPONSIVE STATE
 */
const [isMobile, setIsMobile] = useState(false)
const [showMobileSettings, setShowMobileSettings] = useState(false)

/**
 * NAVIGATION STATE
 */
const navigate = useNavigate()

/**
 * MAIN TAB STATE
 * Controls which main feature is active:
 * - 'ai-script': AI Script Generator (generates script + voiceover)
 * - 'custom-script': Custom Script TTS (converts user script to voiceover)
 * - 'history': View past voiceovers
 */
const [selectedMainTab, setSelectedMainTab] = useState<MainTab>('ai-script')

/**
 * PREVIEW PANEL VIEW STATE
 * Controls what's shown in the preview panel:
 * - 'preview': Shows generated script/audio
 * - 'history': Shows voiceover history list
 */
const [previewPanelView, setPreviewPanelView] = useState<PreviewPanelView>('preview')

/**
 * SIDEBAR VIEW STATE
 * Controls sidebar navigation:
 * - 'templates': Shows template selection (AI Script vs Custom Script)
 * - 'settings': Shows form for selected template
 */
const [sidebarView, setSidebarView] = useState<SidebarView>('templates')
const [tabSelected, setTabSelected] = useState(false)

// ============================================================================
// AI SCRIPT GENERATOR STATE
// ============================================================================

/**
 * Form data for AI Script Generator
 */
const [formData, setFormData] = useState<FormData>({
  scriptLanguage: 'english',
  productName: '',
  targetAudience: '',
  productFunction: '',
  keyBenefits: '',
  toneStyle: 'Energetic',
  accent: 'United States (English)',
  optionalCta: ''
})

const [voice, setVoice] = useState<string>('Kore')
const [duration, setDuration] = useState<'30' | '45' | '60'>('45')
const [generatedScript, setGeneratedScript] = useState<string>('')
const [analyzingImage, setAnalyzingImage] = useState(false)
const [previewingVoice, setPreviewingVoice] = useState<string | null>(null)
const [audioData, setAudioData] = useState<string>('') // Base64 audio data
const [audioUrl, setAudioUrl] = useState<string>('') // Blob URL for playback
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string>('')
const [accentOptions, setAccentOptions] = useState(ENGLISH_ACCENT_OPTIONS)
const [includeFreeDelivery, setIncludeFreeDelivery] = useState(true)
const [isPlaying, setIsPlaying] = useState(false)

// Audio refs for AI Script Generator
const previewAudioRef = useRef<HTMLAudioElement | null>(null)
const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
const audioBlobRef = useRef<Blob | null>(null)

// ============================================================================
// CUSTOM SCRIPT TTS STATE
// ============================================================================

const [customScript, setCustomScript] = useState<string>('')
const [customFormState, setCustomFormState] = useState<CustomFormState>({
  toneStyle: 'Energetic',
  accent: 'United States (English)',
  scriptLanguage: 'english'
})
const [customVoice, setCustomVoice] = useState<string>('Kore')
const [isCustomLoading, setIsCustomLoading] = useState(false)
const [customError, setCustomError] = useState<string>('')
const [customAudioData, setCustomAudioData] = useState<string>('')
const [customAudioUrl, setCustomAudioUrl] = useState<string>('')
const [isCustomPlaying, setIsCustomPlaying] = useState(false)

// Audio refs for Custom Script TTS
const customAudioPlayerRef = useRef<HTMLAudioElement | null>(null)
const customAudioBlobRef = useRef<Blob | null>(null)

// ============================================================================
// SHARED STATE
// ============================================================================

const [copied, setCopied] = useState(false)
const [copiedItemId, setCopiedItemId] = useState<string | null>(null)

// ============================================================================
// VOICEOVER HISTORY STATE
// ============================================================================

const [voiceoverHistory, setVoiceoverHistory] = useState<VoiceoverHistory[]>([])
const [loadingVoiceoverHistory, setLoadingVoiceoverHistory] = useState(false)
const [playingVoiceoverHistoryId, setPlayingVoiceoverHistoryId] = useState<string | null>(null)
const historyAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
const errorHandledMap = useRef<Map<string, boolean>>(new Map())

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Dialect samples for voice preview
 * Maps accent names to sample text in that language/dialect
 */
const DIALECT_SAMPLES: { [key: string]: string } = {
  'Classical Arabic': 'هذا هو الصوت الذي ستسمعه عند اختياري.',
  'Algerian': 'هذا هو الصوت اللي راح تسمعو كي تخيرني.',
  'Moroccan': 'هذا هو الصوت اللي غاتسمع فاش تختارني.',
  'Tunisian': 'هذا الصوت اللي باش تسمعو كيف تختارني.',
  'Libyan': 'هذا الصوت اللي حتسمعه لما تختارني.',
  'Egyptian': 'ده الصوت اللي هتسمعه لما تختارني.',
  'Saudi': 'هذا الصوت اللي بتسمعه لما تختارني.',
  'UAE': 'هذا الصوت اللي بتسمعه يوم تختارني.',
  'Kuwaiti': 'هذا الصوت اللي راح تسمعه لا اخترتني.',
  'Iraqi': 'هذا الصوت اللي راح تسمعه من تختارني.',
  'United States (English)': 'This is the voice you will hear when you select me.',
  'United Kingdom (English)': 'This is the voice you will hear when you select me.',
  'Australia (English)': 'This is the voice you will hear when you select me.',
  'France (French)': 'Voici la voix que vous entendrez si vous me choisissez.',
  'Canada (French)': 'Voici la voix que vous entendrez si vous me choisissez.',
  'Spain (Spanish)': 'Esta es la voz que escucharás cuando me selecciones.',
  'Mexico (Spanish)': 'Esta es la voz que escucharás cuando me selecciones.'
}

// ============================================================================
// EFFECTS
// ============================================================================

/**
 * EFFECT 1: Check URL for /credits path and open credit modal
 */
useEffect(() => {
  if (location.pathname === '/voiceover-generator/credits') {
    setShowCreditModal(true)
  }
}, [location.pathname])

/**
 * EFFECT 2: Mobile detection
 * Updates isMobile state when window is resized
 */
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])

/**
 * EFFECT 3: Prevent body scroll when component is mounted
 * Locks body scroll to prevent page scrolling while modal/page is open
 */
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

/**
 * EFFECT 4: Update accent options when script language changes (AI Script)
 * When language changes, updates available accent options and resets accent if invalid
 */
useEffect(() => {
  if (formData.scriptLanguage === 'arabic') {
    setAccentOptions(ARABIC_ACCENT_OPTIONS)
    if (!ARABIC_ACCENT_OPTIONS.find(opt => opt.value === formData.accent)) {
      setFormData(prev => ({ ...prev, accent: 'Classical Arabic' }))
    }
  } else if (formData.scriptLanguage === 'french') {
    setAccentOptions(FRENCH_ACCENT_OPTIONS)
    if (!FRENCH_ACCENT_OPTIONS.find(opt => opt.value === formData.accent)) {
      setFormData(prev => ({ ...prev, accent: 'France (French)' }))
    }
  } else if (formData.scriptLanguage === 'spanish') {
    setAccentOptions(SPANISH_ACCENT_OPTIONS)
    if (!SPANISH_ACCENT_OPTIONS.find(opt => opt.value === formData.accent)) {
      setFormData(prev => ({ ...prev, accent: 'Spain (Spanish)' }))
    }
  } else {
    setAccentOptions(ENGLISH_ACCENT_OPTIONS)
    if (!ENGLISH_ACCENT_OPTIONS.find(opt => opt.value === formData.accent)) {
      setFormData(prev => ({ ...prev, accent: 'United States (English)' }))
    }
  }
}, [formData.scriptLanguage])

/**
 * EFFECT 5: Load history when history tab is selected
 */
useEffect(() => {
  if (selectedMainTab === 'history') {
    loadVoiceoverHistory()
  }
}, [selectedMainTab])

/**
 * EFFECT 6: Cleanup audio refs on unmount
 * Revokes blob URLs to prevent memory leaks
 */
useEffect(() => {
  return () => {
    Object.values(historyAudioRefs.current).forEach(audio => {
      if (audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src)
      }
    })
    if (previewAudioRef.current && previewAudioRef.current.src.startsWith('blob:')) {
      URL.revokeObjectURL(previewAudioRef.current.src)
    }
  }
}, [])

/**
 * EFFECT 7: Convert audioData to blob URL when it changes (AI Script)
 * Converts base64 audio data to WAV blob and creates URL for playback
 * Also uploads to storage in background
 */
useEffect(() => {
  if (audioData) {
    // Validate it's not JSON
    if (audioData.trim().startsWith('{') || audioData.trim().startsWith('[')) {
      console.error('Received JSON instead of audio data')
      setError('Invalid audio data received')
      return
    }

    try {
      const decodedData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      
      // Check if already WAV format
      const isAlreadyWAV = decodedData.length >= 12 &&
        String.fromCharCode(decodedData[0], decodedData[1], decodedData[2], decodedData[3]) === 'RIFF' &&
        String.fromCharCode(decodedData[8], decodedData[9], decodedData[10], decodedData[11]) === 'WAVE'

      let wavData: Uint8Array
      if (isAlreadyWAV) {
        wavData = decodedData
      } else {
        wavData = encodeWAV(decodedData, 24000, 1)
      }

      if (wavData.length < 44) {
        throw new Error('WAV file too small')
      }

      const blob = new Blob([wavData as BlobPart], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      audioBlobRef.current = blob
      setAudioUrl(url)
      setIsPlaying(false)

      // Upload to storage in background
      uploadAudioBlob(blob, generatedScript, voice, formData).catch(err => {
        console.error('Background upload failed:', err)
      })

      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Failed to create audio blob:', err)
      setError('Failed to process audio data')
    }
  }
}, [audioData, generatedScript, voice])

/**
 * EFFECT 8: Update audio element when audioUrl changes (AI Script)
 */
useEffect(() => {
  if (audioUrl && audioPlayerRef.current) {
    audioPlayerRef.current.src = audioUrl
    audioPlayerRef.current.load()
  }
}, [audioUrl])

/**
 * EFFECT 9: Convert customAudioData to blob URL when it changes (Custom Script)
 * Same logic as EFFECT 7 but for custom script audio
 */
useEffect(() => {
  if (customAudioData) {
    if (customAudioData.trim().startsWith('{') || customAudioData.trim().startsWith('[')) {
      console.error('Received JSON instead of audio data')
      setCustomError('Invalid audio data received')
      return
    }

    try {
      const decodedData = Uint8Array.from(atob(customAudioData), c => c.charCodeAt(0))
      const isAlreadyWAV = decodedData.length >= 12 &&
        String.fromCharCode(decodedData[0], decodedData[1], decodedData[2], decodedData[3]) === 'RIFF' &&
        String.fromCharCode(decodedData[8], decodedData[9], decodedData[10], decodedData[11]) === 'WAVE'

      let wavData: Uint8Array
      if (isAlreadyWAV) {
        wavData = decodedData
      } else {
        wavData = encodeWAV(decodedData, 24000, 1)
      }

      const blob = new Blob([wavData as BlobPart], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      customAudioBlobRef.current = blob
      setCustomAudioUrl(url)
      setIsCustomPlaying(false)

      // Upload to storage in background
      uploadAudioBlob(blob, customScript, customVoice, customFormState).catch(err => {
        console.error('Background upload failed:', err)
      })

      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Failed to create custom audio blob:', err)
      setCustomError('Failed to process audio data')
    }
  }
}, [customAudioData, customScript, customVoice])

/**
 * EFFECT 10: Update custom audio element when customAudioUrl changes
 */
useEffect(() => {
  if (customAudioUrl && customAudioPlayerRef.current) {
    customAudioPlayerRef.current.src = customAudioUrl
    customAudioPlayerRef.current.load()
  }
}, [customAudioUrl])

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * FUNCTION: loadVoiceoverHistory
 * Loads voiceover history from database for current user
 * Fetches last 50 voiceovers ordered by creation date (newest first)
 */
const loadVoiceoverHistory = async () => {
  setLoadingVoiceoverHistory(true)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('voiceover_uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    setVoiceoverHistory(data || [])
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    setLoadingVoiceoverHistory(false)
  }
}

/**
 * FUNCTION: analyzeImage
 * Analyzes uploaded product image and auto-fills form fields
 * Uses Gemini API via Supabase Edge Function
 * 
 * @param file - Image file to analyze
 * 
 * Process:
 * 1. Converts image to base64
 * 2. Calls edge function with analysis prompt
 * 3. Extracts productName, targetAudience, productFunction, keyBenefits
 * 4. Updates formData with extracted values
 */
const analyzeImage = async (file: File) => {
  setAnalyzingImage(true)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required')
    }

    // Convert to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const prompt = `Analyze this product image and extract the following information in strict JSON format:
{
    "productName": "Name of the product",
    "targetAudience": "Likely target audience",
    "productFunction": "What does it do?",
    "keyBenefits": "Main benefits or selling points"
}`

    // Call Supabase Edge Function
    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-image-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        prompt: prompt,
        mimeType: 'image/jpeg'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Image analysis failed')
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Image analysis failed')
    }

    const result = data.result

    // Helper to ensure string value
    const ensureString = (value: any, fallback: string = ''): string => {
      if (typeof value === 'string') return value
      if (Array.isArray(value)) return value.join(', ')
      if (value && typeof value === 'object') return JSON.stringify(value)
      return fallback
    }

    // Update form fields
    setFormData(prev => ({
      ...prev,
      productName: ensureString(result.productName, prev.productName),
      targetAudience: ensureString(result.targetAudience, prev.targetAudience),
      productFunction: ensureString(result.productFunction, prev.productFunction),
      keyBenefits: ensureString(result.keyBenefits, prev.keyBenefits)
    }))
  } catch (error) {
    console.error('Image analysis failed:', error)
    alert('Could not analyze image. Please fill fields manually.')
  } finally {
    setAnalyzingImage(false)
  }
}

/**
 * FUNCTION: previewVoice
 * Previews a voice with sample text based on selected accent
 * 
 * @param prefix - 'ai' for AI Script Generator, 'custom' for Custom Script TTS
 * 
 * Process:
 * 1. Gets voice name and accent from appropriate state
 * 2. Gets sample text for accent from DIALECT_SAMPLES
 * 3. Adds energetic style instruction (in appropriate language)
 * 4. Calls TTS API via edge function
 * 5. Converts response to WAV and plays preview
 */
const previewVoice = async (prefix: 'ai' | 'custom') => {
  const voiceName = prefix === 'ai' ? voice : customVoice
  const accent = prefix === 'ai' ? formData.accent : customFormState.accent
  const baseSampleText = DIALECT_SAMPLES[accent] || 'This is my voice.'

  // Determine if Arabic accent
  const isArabic = accent.includes('Arabic') || accent.includes('Algerian') || accent.includes('Moroccan') ||
    accent.includes('Tunisian') || accent.includes('Libyan') || accent.includes('Egyptian') ||
    accent.includes('Saudi') || accent.includes('Iraqi') || accent.includes('Kuwaiti') || accent.includes('UAE')

  // Add style instruction
  const styleInstruction = isArabic
    ? 'صوت حماسي، سريع قليلاً. '
    : 'Speak with an energetic, slightly fast pace. '

  const sampleText = styleInstruction + baseSampleText

  setPreviewingVoice(prefix === 'ai' ? 'ai' : 'custom')

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required')
    }

    // Call TTS edge function
    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/gemini-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        text: sampleText,
        voiceName: voiceName
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'TTS preview failed')
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'TTS preview failed')
    }

    // Convert to WAV and play
    const base64Audio = data.audioBase64
    const decodedData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))
    const wavData = encodeWAV(decodedData, 24000, 1)
    const blob = new Blob([wavData as BlobPart], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio()
    }

    previewAudioRef.current.src = url
    previewAudioRef.current.onended = () => {
      setPreviewingVoice(null)
      URL.revokeObjectURL(url)
    }
    previewAudioRef.current.onerror = () => {
      setPreviewingVoice(null)
      URL.revokeObjectURL(url)
    }

    await previewAudioRef.current.play()
  } catch (error) {
    console.error('Preview failed', error)
    alert('Could not preview voice.')
    setPreviewingVoice(null)
  }
}

/**
 * FUNCTION: durationToScriptLength
 * Converts duration selection to API script length parameter
 * 
 * @param dur - '30' | '45' | '60'
 * @returns 'short' | 'normal' | 'long'
 */
const durationToScriptLength = (dur: '30' | '45' | '60'): 'short' | 'normal' | 'long' => {
  if (dur === '30') return 'short'
  if (dur === '60') return 'long'
  return 'normal'
}

/**
 * FUNCTION: cleanScript
 * Removes markdown formatting from generated script
 * 
 * @param script - Script text with markdown
 * @returns Cleaned script text
 */
const cleanScript = (script: string): string => {
  return script.replace(/\*\*[^*]+\*\*:?\s*/g, '').trim()
}

/**
 * FUNCTION: uploadAudioBlob
 * Uploads audio blob to storage and saves metadata to database
 * 
 * @param blob - Audio blob to upload
 * @param script - Script text
 * @param voiceName - Voice name used
 * @param settings - Form settings object
 * 
 * Process:
 * 1. Gets current user
 * 2. Uploads blob to storage via StorageService
 * 3. Inserts record into voiceover_uploads table
 * 4. Refreshes history if on history tab
 */
const uploadAudioBlob = async (
  blob: Blob,
  script: string,
  voiceName: string,
  settings: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('No user found, skipping upload')
      return
    }

    const uploadResult = await StorageService.uploadVoiceoverBlob(blob, user.id, 'wav')

    if (uploadResult.success && uploadResult.storagePath) {
      await supabase.from('voiceover_uploads').insert({
        user_id: user.id,
        storage_path: uploadResult.storagePath,
        script: script,
        voice_name: voiceName,
        accent: settings.accent || formData.accent,
        tone_style: settings.toneStyle || formData.toneStyle,
        language: settings.scriptLanguage || formData.scriptLanguage || 'custom',
        settings_json: settings
      })
      
      // Refresh history if on history tab
      if (selectedMainTab === 'history') {
        loadVoiceoverHistory()
      }
    } else {
      console.error('Failed to upload voiceover blob:', uploadResult.error)
    }
  } catch (saveErr) {
    console.error('Failed to save voiceover blob:', saveErr)
  }
}

/**
 * FUNCTION: togglePlayPause
 * Toggles audio playback for AI Script Generator audio
 */
const togglePlayPause = useCallback(() => {
  const audio = audioPlayerRef.current
  if (!audio || !audioUrl) return

  if (isPlaying) {
    audio.pause()
  } else {
    audio.play().catch(err => {
      console.error('Play error:', err)
      setError('Failed to play audio')
    })
  }
}, [isPlaying, audioUrl])

/**
 * FUNCTION: toggleCustomPlayPause
 * Toggles audio playback for Custom Script TTS audio
 */
const toggleCustomPlayPause = useCallback(() => {
  const audio = customAudioPlayerRef.current
  if (!audio || !customAudioUrl) return

  if (isCustomPlaying) {
    audio.pause()
  } else {
    audio.play().catch(err => {
      console.error('Play error:', err)
      setCustomError('Failed to play audio')
    })
  }
}, [isCustomPlaying, customAudioUrl])

/**
 * FUNCTION: downloadAudio
 * Downloads audio file from base64 data
 * 
 * @param base64Audio - Base64 encoded audio data
 * @param filename - Filename for download
 */
const downloadAudio = useCallback((base64Audio: string, filename: string) => {
  if (base64Audio.trim().startsWith('{') || base64Audio.trim().startsWith('[')) {
    alert('Cannot download: Invalid audio data')
    return
  }

  try {
    const pcmData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))
    const wavData = encodeWAV(pcmData, 24000, 1)
    const blob = new Blob([wavData as BlobPart], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download audio:', err)
    alert('Failed to download audio file')
  }
}, [])

/**
 * FUNCTION: handleSubmit
 * Handles AI Script Generator form submission
 * 
 * Process:
 * 1. Checks if user can generate (credit check)
 * 2. Validates required fields (productName, targetAudience, productFunction, keyBenefits)
 * 3. Calls generateScript API
 * 4. Calls generateSpeech API with generated script
 * 5. Updates state with script and audio data
 * 6. Increments usage counter
 */
const handleSubmit = async () => {
  // Credit check
  if (!canGenerate('voiceover')) {
    setShowCreditModal(true)
    return
  }

  // Validation
  if (!formData.productName.trim()) {
    setError('Product Name is required')
    return
  }
  if (!formData.targetAudience.trim()) {
    setError('Target Audience is required')
    return
  }
  if (!formData.productFunction.trim()) {
    setError('Product Function is required')
    return
  }
  const keyBenefitsStr = typeof formData.keyBenefits === 'string'
    ? formData.keyBenefits
    : String(formData.keyBenefits || '')
  if (!keyBenefitsStr.trim()) {
    setError('Key Benefits is required')
    return
  }

  setIsLoading(true)
  setError('')
  setGeneratedScript('')
  setAudioData('')

  try {
    // Generate script
    const script = await generateScript({
      scriptLanguage: formData.scriptLanguage,
      productName: formData.productName.trim(),
      targetAudience: formData.targetAudience.trim(),
      productFunction: formData.productFunction.trim(),
      keyBenefits: (typeof formData.keyBenefits === 'string' ? formData.keyBenefits : String(formData.keyBenefits || '')).trim(),
      toneStyle: formData.toneStyle,
      accent: formData.accent,
      optionalCta: formData.optionalCta.trim(),
      includeFreeDelivery: includeFreeDelivery,
      scriptLength: durationToScriptLength(duration)
    })

    setGeneratedScript(script)

    // Generate speech
    const audio = await generateSpeech({
      script,
      toneStyle: formData.toneStyle,
      voice,
      accent: formData.accent
    })

    setAudioData(audio)
    await incrementUsage('voiceover')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
  } finally {
    setIsLoading(false)
  }
}

/**
 * FUNCTION: handleCustomSubmit
 * Handles Custom Script TTS form submission
 * 
 * Process:
 * 1. Validates custom script is not empty
 * 2. Checks if user can generate (credit check)
 * 3. Calls generateSpeech API with custom script
 * 4. Updates state with audio data
 * 5. Increments usage counter
 */
const handleCustomSubmit = async () => {
  if (!customScript.trim()) {
    setCustomError('Please enter a script')
    return
  }

  if (!canGenerate('voiceover')) {
    setShowCreditModal(true)
    return
  }

  setIsCustomLoading(true)
  setCustomError('')
  setCustomAudioData('')

  try {
    const audio = await generateSpeech({
      script: customScript,
      toneStyle: customFormState.toneStyle,
      voice: customVoice,
      accent: customFormState.accent
    })

    setCustomAudioData(audio)
    await incrementUsage('voiceover')
  } catch (err) {
    setCustomError(err instanceof Error ? err.message : 'Unknown error')
  } finally {
    setIsCustomLoading(false)
  }
}

/**
 * FUNCTION: copyToClipboard
 * Copies text to clipboard and shows feedback
 * 
 * @param text - Text to copy
 */
const copyToClipboard = useCallback((text: string) => {
  navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}, [])

/**
 * FUNCTION: resetForms
 * Resets all form data to initial state
 */
const resetForms = () => {
  setFormData({
    scriptLanguage: 'english',
    productName: '',
    targetAudience: '',
    productFunction: '',
    keyBenefits: '',
    toneStyle: 'Energetic',
    accent: 'United States (English)',
    optionalCta: ''
  })
  setCustomScript('')
  setGeneratedScript('')
  setAudioData('')
  setCustomAudioData('')
}

/**
 * FUNCTION: playHistoryItem
 * Plays audio from voiceover history
 * 
 * @param item - VoiceoverHistory item to play
 * 
 * Process:
 * 1. Stops any currently playing audio
 * 2. Checks if audio is already loaded in cache
 * 3. If not cached, fetches from storage
 * 4. Validates WAV format
 * 5. Creates blob URL and plays audio
 * 6. Handles errors and cleanup
 */
const playHistoryItem = async (item: VoiceoverHistory) => {
  // Stop other audio
  Object.entries(historyAudioRefs.current).forEach(([id, audio]) => {
    if (id !== item.id) {
      audio.pause()
      audio.currentTime = 0
    }
  })

  // Check if already loaded
  const existingAudio = historyAudioRefs.current[item.id]
  if (existingAudio && existingAudio.src) {
    if (playingVoiceoverHistoryId === item.id) {
      existingAudio.pause()
      setPlayingVoiceoverHistoryId(null)
      return
    } else {
      try {
        if (existingAudio.ended) {
          existingAudio.currentTime = 0
        }
        await existingAudio.play()
        setPlayingVoiceoverHistoryId(item.id)
        return
      } catch (err) {
        console.error('Failed to play cached audio:', err)
      }
    }
  }

  // Fetch from storage
  const audioUrl = StorageService.getVoiceoverUrl(item.storage_path)
  errorHandledMap.current.set(item.id, false)

  try {
    const response = await fetch(audioUrl)
    if (!response.ok) {
      throw new Error(`Audio file not accessible: ${response.status}`)
    }

    const blob = await response.blob()
    if (blob.size === 0) {
      throw new Error('Audio file is empty')
    }

    const arrayBuffer = await blob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Validate WAV format
    const isWAV = uint8Array.length >= 12 &&
      String.fromCharCode(uint8Array[0], uint8Array[1], uint8Array[2], uint8Array[3]) === 'RIFF' &&
      String.fromCharCode(uint8Array[8], uint8Array[9], uint8Array[10], uint8Array[11]) === 'WAVE'

    if (!isWAV) {
      throw new Error('Audio file does not contain valid WAV header')
    }

    const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' })
    const blobUrl = URL.createObjectURL(audioBlob)

    // Create audio element if doesn't exist
    if (!historyAudioRefs.current[item.id]) {
      historyAudioRefs.current[item.id] = new Audio()

      historyAudioRefs.current[item.id].onended = () => {
        setPlayingVoiceoverHistoryId(null)
      }

      historyAudioRefs.current[item.id].onpause = () => {
        setPlayingVoiceoverHistoryId(null)
      }

      historyAudioRefs.current[item.id].onplay = () => {
        setPlayingVoiceoverHistoryId(item.id)
      }

      historyAudioRefs.current[item.id].onerror = (e) => {
        if (errorHandledMap.current.get(item.id)) {
          return
        }
        errorHandledMap.current.set(item.id, true)
        console.error('Audio playback error:', e)
        setPlayingVoiceoverHistoryId(null)
        const audio = historyAudioRefs.current[item.id]
        if (audio && audio.src && audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src)
        }
      }
    }

    const audio = historyAudioRefs.current[item.id]
    
    // Cleanup old blob URL
    if (audio.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src)
    }

    audio.src = blobUrl

    // Wait for audio to load
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Audio loading timeout'))
      }, 10000)

      const onCanPlay = () => {
        clearTimeout(timeout)
        audio.removeEventListener('canplay', onCanPlay)
        audio.removeEventListener('error', onError)
        resolve()
      }

      const onError = (e: Event) => {
        clearTimeout(timeout)
        audio.removeEventListener('canplay', onCanPlay)
        audio.removeEventListener('error', onError)
        reject(new Error('Audio failed to load'))
      }

      audio.addEventListener('canplay', onCanPlay, { once: true })
      audio.addEventListener('error', onError, { once: true })
      audio.load()
    })

    await audio.play()
    setPlayingVoiceoverHistoryId(item.id)
  } catch (err) {
    console.error('Failed to play history audio:', err)
    setPlayingVoiceoverHistoryId(null)
    if (!errorHandledMap.current.get(item.id)) {
      errorHandledMap.current.set(item.id, true)
      alert(`Failed to play audio: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }
}

/**
 * FUNCTION: downloadHistoryAudio
 * Downloads audio file from history
 * 
 * @param item - VoiceoverHistory item to download
 */
const downloadHistoryAudio = async (item: VoiceoverHistory) => {
  try {
    const audioUrl = StorageService.getVoiceoverUrl(item.storage_path)
    const response = await fetch(audioUrl)
    const blob = await response.blob()

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voiceover-${item.id}-${Date.now()}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download audio:', err)
    alert('Failed to download audio file')
  }
}

/**
 * FUNCTION: copyHistoryScript
 * Copies script from history item to clipboard
 * 
 * @param item - VoiceoverHistory item
 */
const copyHistoryScript = (item: VoiceoverHistory) => {
  if (item.script) {
    navigator.clipboard.writeText(item.script)
    setCopiedItemId(item.id)
    setTimeout(() => setCopiedItemId(null), 2000)
  }
}

// ============================================================================
// COMPUTED VALUES / DERIVED STATE
// ============================================================================

/**
 * Determines if there is output to show in preview panel
 * For AI Script: requires both generatedScript and audioData
 * For Custom Script: requires customAudioData
 */
const hasOutput = (selectedMainTab === 'ai-script' && generatedScript && audioData) ||
  (selectedMainTab === 'custom-script' && customAudioData)

// ============================================================================
// ACCESS CONTROL / GUARDS
// ============================================================================

/**
 * GUARD 1: Show loading spinner while checking subscription
 * 
 * Implementation note: In the actual component, this would be:
 * if (subscriptionLoading) {
 *   return <LoadingSpinner />
 * }
 */
// if (subscriptionLoading) {
//   // Show loading state
//   return
// }

/**
 * GUARD 2: Show premium gate if user doesn't have access
 * 
 * Implementation note: In the actual component, this would be:
 * if (!hasAccess) {
 *   return <VoiceoverPremiumGate />
 * }
 */
// if (!hasAccess) {
//   // Show VoiceoverPremiumGate component
//   return
// }

// ============================================================================
// EVENT HANDLERS / USER INTERACTIONS
// ============================================================================

/**
 * HANDLER: Select AI Script Generator template
 * - Sets selectedMainTab to 'ai-script'
 * - Sets tabSelected to true
 * - Changes sidebarView to 'settings'
 */
const handleSelectAIScript = () => {
  setSelectedMainTab('ai-script')
  setTabSelected(true)
  setSidebarView('settings')
}

/**
 * HANDLER: Select Custom Script TTS template
 * - Sets selectedMainTab to 'custom-script'
 * - Sets tabSelected to true
 * - Changes sidebarView to 'settings'
 */
const handleSelectCustomScript = () => {
  setSelectedMainTab('custom-script')
  setTabSelected(true)
  setSidebarView('settings')
}

/**
 * HANDLER: Toggle preview panel view
 * - Switches between 'preview' and 'history'
 * - Loads history if switching to history view
 */
const handleTogglePreviewPanelView = () => {
  if (previewPanelView === 'preview') {
    setPreviewPanelView('history')
    loadVoiceoverHistory()
  } else {
    setPreviewPanelView('preview')
  }
}

/**
 * HANDLER: Navigate back to templates
 * - Sets sidebarView to 'templates'
 */
const handleBackToTemplates = () => {
  setSidebarView('templates')
}

/**
 * HANDLER: Close mobile settings
 * - Sets showMobileSettings to false
 */
const handleCloseMobileSettings = () => {
  setShowMobileSettings(false)
}

/**
 * HANDLER: Open mobile settings
 * - Sets showMobileSettings to true
 */
const handleOpenMobileSettings = () => {
  setShowMobileSettings(true)
}

/**
 * HANDLER: Close credit modal
 * - Sets showCreditModal to false
 */
const handleCloseCreditModal = () => {
  setShowCreditModal(false)
}

/**
 * HANDLER: Credit purchase complete
 * - Refreshes usage tracking
 */
const handleCreditPurchaseComplete = () => {
  refreshUsage()
}

// ============================================================================
// DATA FLOW SUMMARY
// ============================================================================

/**
 * AI SCRIPT GENERATOR FLOW:
 * 
 * 1. User fills form (productName, targetAudience, productFunction, keyBenefits, etc.)
 * 2. Optional: User uploads image → analyzeImage() → auto-fills form
 * 3. User clicks "Generate Script & Voice-over"
 * 4. handleSubmit() validates → calls generateScript() → calls generateSpeech()
 * 5. generatedScript state updated → audioData state updated
 * 6. audioData effect converts to blob → audioUrl created → audioPlayerRef updated
 * 7. Background: uploadAudioBlob() saves to storage and database
 * 8. User can play, download, or copy script
 */

/**
 * CUSTOM SCRIPT TTS FLOW:
 * 
 * 1. User enters custom script text
 * 2. User selects language, accent, tone, voice
 * 3. User clicks "Generate Voice-over"
 * 4. handleCustomSubmit() validates → calls generateSpeech()
 * 5. customAudioData state updated
 * 6. customAudioData effect converts to blob → customAudioUrl created
 * 7. Background: uploadAudioBlob() saves to storage and database
 * 8. User can play or download
 */

/**
 * HISTORY FLOW:
 * 
 * 1. User selects 'history' tab or switches preview panel to history
 * 2. loadVoiceoverHistory() fetches from database
 * 3. voiceoverHistory state updated with list
 * 4. User can play, download, or copy script from any item
 * 5. playHistoryItem() fetches from storage, validates, and plays
 */

/**
 * VOICE PREVIEW FLOW:
 * 
 * 1. User clicks preview button next to voice selector
 * 2. previewVoice() gets sample text for accent
 * 3. Calls TTS API with sample text
 * 4. Converts to WAV and plays via previewAudioRef
 */

// ============================================================================
// NOTES FOR DESIGNER
// ============================================================================

/**
 * UI STRUCTURE REQUIREMENTS:
 * 
 * 1. HEADER
 *    - Title: "Voiceover Generator"
 *    - Mobile: Settings button (only when tabSelected is true)
 * 
 * 2. MAIN LAYOUT (Desktop: side-by-side, Mobile: stacked/overlay)
 *    - LEFT PANEL: Preview & Output
 *      - Header with toggle button (Preview ↔ History)
 *      - Preview View: Shows generated script + audio player
 *      - History View: List of past voiceovers
 *    - RIGHT PANEL: Settings Sidebar
 *      - Breadcrumb navigation (Voiceover → AI Script Generator / Custom Script TTS)
 *      - Template Selection View: Two cards (AI Script Generator, Custom Script TTS)
 *      - Settings View: Form for selected template
 * 
 * 3. MOBILE BEHAVIOR:
 *    - Settings sidebar overlays on top when showMobileSettings is true
 *    - Preview panel overlays on top when showMobileSettings is true
 *    - Backdrop overlay when mobile settings are open
 * 
 * 4. STATES TO HANDLE:
 *    - Loading states: isLoading, isCustomLoading, analyzingImage, loadingVoiceoverHistory
 *    - Error states: error, customError
 *    - Empty states: No output, no history
 *    - Playing states: isPlaying, isCustomPlaying, playingVoiceoverHistoryId
 *    - Preview states: previewingVoice
 *    - Copy feedback: copied, copiedItemId
 * 
 * 5. FORM FIELDS (AI Script Generator):
 *    - Image upload (analyzeImage)
 *    - Script Language (dropdown)
 *    - Dialect/Accent (dropdown, depends on language)
 *    - Product Name (text input)
 *    - Target Audience (text input)
 *    - Product Function (textarea)
 *    - Key Benefits (textarea)
 *    - Tone Style (dropdown)
 *    - Voice (dropdown + preview button)
 *    - Duration (radio: 30/45/60 sec)
 *    - Optional CTA (text input)
 *    - Include free delivery (checkbox)
 *    - Generate button
 * 
 * 6. FORM FIELDS (Custom Script TTS):
 *    - Custom Script (textarea)
 *    - Script Language (dropdown)
 *    - Dialect/Accent (dropdown, depends on language)
 *    - Tone Style (dropdown)
 *    - Voice (dropdown + preview button)
 *    - Generate button
 * 
 * 7. PREVIEW PANEL CONTENT:
 *    - Generated Script (AI only, with copy button)
 *    - Audio Player (with download button)
 * 
 * 8. HISTORY ITEM DISPLAY:
 *    - Script preview (truncated)
 *    - Voice name badge
 *    - Accent badge
 *    - Date
 *    - Copy button
 *    - Download button
 *    - Play/Pause button
 * 
 * 9. MODALS:
 *    - CreditPurchaseModal (when showCreditModal is true)
 * 
 * 10. ACCESS CONTROL:
 *     - Show loading spinner if subscriptionLoading
 *     - Show VoiceoverPremiumGate if !hasAccess
 */


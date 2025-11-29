// Voiceover Generator Page with New UI Design
// Updated to match new HTML design with tabs, left form column, right preview column
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useUsageTracking } from '../hooks/useUsageTracking'
import { SubscriptionGuard } from './SubscriptionGuard'
import VoiceoverPremiumGate from './VoiceoverPremiumGate'
import CreditPurchaseModal from './CreditPurchaseModal'
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
import { Mic, Download, RefreshCcw, Copy, Check, Music2, Play, Pause, X, Zap, Settings, History as HistoryIcon, ChevronRight } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

const VoiceoverGeneratorPagePolaris: React.FC = () => {
  const navigate = useNavigate()
  const { hasAccess, loading: subscriptionLoading } = useSubscription()
  const { canGenerate, incrementUsage, refreshUsage } = useUsageTracking()
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSettings, setShowMobileSettings] = useState(false)

  // Check if URL contains /credits and open modal
  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (location.pathname === '/voiceover-generator/credits') {
      setShowCreditModal(true)
    }
    // eslint-disable-next-line no-restricted-globals
  }, [location.pathname])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Main tab state (AI Generator vs Custom Script vs History)
  const [selectedMainTab, setSelectedMainTab] = useState<'ai-script' | 'custom-script' | 'history'>('ai-script')
  // Preview panel view state (preview vs history)
  const [previewPanelView, setPreviewPanelView] = useState<'preview' | 'history'>('preview')
  // Unified view state - purely for UI navigation, doesn't trigger any data loading
  const [sidebarView, setSidebarView] = useState<'templates' | 'settings'>('templates')
  const [tabSelected, setTabSelected] = useState(false)

  // AI Script Generator state
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
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const [audioData, setAudioData] = useState<string>('')
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [accentOptions, setAccentOptions] = useState(ENGLISH_ACCENT_OPTIONS)
  const [includeFreeDelivery, setIncludeFreeDelivery] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const audioBlobRef = useRef<Blob | null>(null)

  // Custom Script TTS state
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
  const customAudioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const customAudioBlobRef = useRef<Blob | null>(null)

  // Shared state
  const [copied, setCopied] = useState(false)
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null)

  // Voiceover history state
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
  const [voiceoverHistory, setVoiceoverHistory] = useState<VoiceoverHistory[]>([])
  const [loadingVoiceoverHistory, setLoadingVoiceoverHistory] = useState(false)
  const [playingVoiceoverHistoryId, setPlayingVoiceoverHistoryId] = useState<string | null>(null)
  const historyAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const errorHandledMap = useRef<Map<string, boolean>>(new Map())

  // Dialect samples for voice preview
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

  // Update accent options when script language changes
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

  // Load history when history tab is selected
  useEffect(() => {
    if (selectedMainTab === 'history') {
      loadVoiceoverHistory()
    }
  }, [selectedMainTab])

  // Cleanup audio refs
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

  // Image analysis function (using edge function)
  const analyzeImage = async (file: File) => {
    setAnalyzingImage(true)
    try {
      // Get auth token for edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

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

      // Call Supabase Edge Function instead of direct API
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

      // Helper function to ensure string value
      const ensureString = (value: any, fallback: string = ''): string => {
        if (typeof value === 'string') return value
        if (Array.isArray(value)) return value.join(', ')
        if (value && typeof value === 'object') return JSON.stringify(value)
        return fallback
      }

      // Fill form fields
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

  // Voice preview function
  const previewVoice = async (prefix: 'ai' | 'custom') => {
    const voiceName = prefix === 'ai' ? voice : customVoice
    const accent = prefix === 'ai' ? formData.accent : customFormState.accent
    const baseSampleText = DIALECT_SAMPLES[accent] || 'This is my voice.'

    // Add energetic and slightly fast style instructions for preview
    // Use Arabic instructions for Arabic accents, English for others
    const isArabic = accent.includes('Arabic') || accent.includes('Algerian') || accent.includes('Moroccan') ||
      accent.includes('Tunisian') || accent.includes('Libyan') || accent.includes('Egyptian') ||
      accent.includes('Saudi') || accent.includes('Iraqi') || accent.includes('Kuwaiti') || accent.includes('UAE')

    const styleInstruction = isArabic
      ? 'صوت حماسي، سريع قليلاً. '
      : 'Speak with an energetic, slightly fast pace. '

    const sampleText = styleInstruction + baseSampleText

    setPreviewingVoice(prefix === 'ai' ? 'ai' : 'custom')

    try {
      // Get auth token for edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required')
      }

      // Call Supabase Edge Function instead of direct API
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

  // Convert duration to script length for API
  const durationToScriptLength = (dur: '30' | '45' | '60'): 'short' | 'normal' | 'long' => {
    if (dur === '30') return 'short'
    if (dur === '60') return 'long'
    return 'normal'
  }

  // Remove markdown formatting from script
  const cleanScript = (script: string): string => {
    return script.replace(/\*\*[^*]+\*\*:?\s*/g, '').trim()
  }

  // Upload audio blob directly to storage
  const uploadAudioBlob = async (
    blob: Blob,
    script: string,
    voiceName: string,
    settings: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('⚠️ No user found, skipping upload')
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
        console.log('✅ Voiceover blob saved to storage and database')
        // Refresh history if on history tab
        if (selectedMainTab === 'history') {
          loadVoiceoverHistory()
        }
      } else {
        console.error('❌ Failed to upload voiceover blob:', uploadResult.error)
      }
    } catch (saveErr) {
      console.error('❌ Failed to save voiceover blob:', saveErr)
    }
  }

  // Convert audioData to blob URL when it changes
  useEffect(() => {
    if (audioData) {
      if (audioData.trim().startsWith('{') || audioData.trim().startsWith('[')) {
        console.error('❌ Received JSON instead of audio data')
        setError('Invalid audio data received')
        return
      }

      try {
        const decodedData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
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
        console.error('❌ Failed to create audio blob:', err)
        setError('Failed to process audio data')
      }
    }
  }, [audioData, generatedScript, voice])

  // Update audio element when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.src = audioUrl
      audioPlayerRef.current.load()
    }
  }, [audioUrl])

  // Convert customAudioData to blob URL when it changes
  useEffect(() => {
    if (customAudioData) {
      if (customAudioData.trim().startsWith('{') || customAudioData.trim().startsWith('[')) {
        console.error('❌ Received JSON instead of audio data')
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
        console.error('❌ Failed to create custom audio blob:', err)
        setCustomError('Failed to process audio data')
      }
    }
  }, [customAudioData, customScript, customVoice])

  // Update custom audio element when customAudioUrl changes
  useEffect(() => {
    if (customAudioUrl && customAudioPlayerRef.current) {
      customAudioPlayerRef.current.src = customAudioUrl
      customAudioPlayerRef.current.load()
    }
  }, [customAudioUrl])

  // Toggle audio playback
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

  // Toggle custom audio playback
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

  // Download audio
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
      console.error('❌ Failed to download audio:', err)
      alert('Failed to download audio file')
    }
  }, [])

  // AI Script Generator submission
  const handleSubmit = async () => {
    if (!canGenerate('voiceover')) {
      setShowCreditModal(true)
      return
    }

    // Validate required fields
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
    // Ensure keyBenefits is a string before calling trim
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

  // Custom Script TTS submission
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

  // Copy script to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // Reset forms
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

  // Play history item
  const playHistoryItem = async (item: VoiceoverHistory) => {
    Object.entries(historyAudioRefs.current).forEach(([id, audio]) => {
      if (id !== item.id) {
        audio.pause()
        audio.currentTime = 0
      }
    })

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

    console.log('🎵 Fetching voiceover from storage_path:', item.storage_path)
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

      const isWAV = uint8Array.length >= 12 &&
        String.fromCharCode(uint8Array[0], uint8Array[1], uint8Array[2], uint8Array[3]) === 'RIFF' &&
        String.fromCharCode(uint8Array[8], uint8Array[9], uint8Array[10], uint8Array[11]) === 'WAVE'

      if (!isWAV) {
        throw new Error('Audio file does not contain valid WAV header')
      }

      const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' })
      const blobUrl = URL.createObjectURL(audioBlob)

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
      if (audio.src && audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src)
      }

      audio.src = blobUrl

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

  // Download history audio file
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

  // Copy history script to clipboard
  const copyHistoryScript = (item: VoiceoverHistory) => {
    if (item.script) {
      navigator.clipboard.writeText(item.script)
      setCopiedItemId(item.id)
      setTimeout(() => setCopiedItemId(null), 2000)
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
    return <VoiceoverPremiumGate />
  }

  // Determine if we should show output (has generated content)
  const hasOutput = (selectedMainTab === 'ai-script' && generatedScript && audioData) ||
    (selectedMainTab === 'custom-script' && customAudioData)

  return (
    <>
      <div
        className="w-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100"
        style={{
          height: isMobile ? 'calc(100vh - 64px)' : '100vh',
          maxHeight: isMobile ? 'calc(100vh - 64px)' : '100vh',
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? '64px' : 'auto',
          left: isMobile ? 0 : 'auto',
          right: isMobile ? 0 : 'auto',
          bottom: isMobile ? 0 : 'auto',
          display: 'flex'
        }}
      >
        {/* Header */}
        <div className="px-4 md:px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0 flex items-center justify-between" style={{ height: '60px', minHeight: '60px', maxHeight: '60px', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
              <Mic size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900">Voiceover Generator</h1>
            </div>
          </div>
          {/* Mobile Settings Button */}
          {tabSelected && (
            <button
              onClick={() => setShowMobileSettings(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open settings"
            >
              <Settings size={20} className="text-slate-700" />
            </button>
          )}
        </div>

        {/* Content area with left panel and sidebar */}
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

          {/* Left Panel - Preview & Output */}
          {selectedMainTab !== 'history' && (!isMobile || showMobileSettings) && (
            <div
              className={`flex-1 min-w-0 flex flex-col bg-white border-r-0 md:border-r border-slate-200 relative overflow-hidden shadow-lg transition-transform duration-300 ease-in-out ${isMobile && showMobileSettings
                  ? 'fixed left-0 top-0 h-full w-full z-[100]'
                  : isMobile
                    ? 'hidden'
                    : 'relative z-auto'
                }`}
              style={isMobile ? {} : {}}
            >
              {/* Mobile Close Button */}
              {showMobileSettings && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 md:hidden">
                  <h3 className="text-lg font-bold text-slate-900">{previewPanelView === 'preview' ? 'Preview' : 'History'}</h3>
                  <button
                    onClick={() => setShowMobileSettings(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Close preview"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
              )}

              {/* Desktop Header */}
              <div className="hidden md:flex flex-shrink-0 px-6 py-4 border-b border-slate-200 items-center justify-between">
                <h3 className="font-bold text-slate-900">{previewPanelView === 'preview' ? 'Preview' : 'History'}</h3>
                <button
                  onClick={() => {
                    if (previewPanelView === 'preview') {
                      setPreviewPanelView('history')
                      loadVoiceoverHistory()
                    } else {
                      setPreviewPanelView('preview')
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-900"
                >
                  {previewPanelView === 'preview' ? (
                    <>
                      <HistoryIcon size={16} />
                      History
                    </>
                  ) : (
                    <>
                      <Music2 size={16} />
                      Preview
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 min-h-0">
                <div className="flex flex-col h-full">
                  {/* History View */}
                  {previewPanelView === 'history' && (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Music2 className="w-5 h-5 text-purple-500" />
                          Voiceover History
                        </h2>
                        <button
                          onClick={loadVoiceoverHistory}
                          disabled={loadingVoiceoverHistory}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingVoiceoverHistory ? <LoadingSpinner size="sm" /> : <RefreshCcw size={16} />}
                          Refresh
                        </button>
                      </div>

                      {loadingVoiceoverHistory ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
                              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : voiceoverHistory.length === 0 ? (
                        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                          <div className="text-center">
                            <Music2 className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No voiceover history yet</p>
                            <p className="text-xs text-slate-500 mt-2">Generate your first voiceover to see it here</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {voiceoverHistory.map((item) => (
                            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <p className="text-sm text-slate-900 leading-relaxed">
                                    {item.script?.substring(0, 150) || 'No script'}{item.script && item.script.length > 150 ? '...' : ''}
                                  </p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                                      🎤 {item.voice_name}
                                    </span>
                                    {item.accent && (
                                      <span className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                                        {item.accent}
                                      </span>
                                    )}
                                    <span className="text-xs text-slate-500">
                                      {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => copyHistoryScript(item)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-900"
                                    title="Copy script"
                                  >
                                    {copiedItemId === item.id ? <Check size={16} /> : <Copy size={16} />}
                                  </button>
                                  <button
                                    onClick={() => downloadHistoryAudio(item)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-900"
                                    title="Download audio"
                                  >
                                    <Download size={16} />
                                  </button>
                                  <button
                                    onClick={() => playHistoryItem(item)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                                    title={playingVoiceoverHistoryId === item.id ? 'Pause' : 'Play'}
                                  >
                                    {playingVoiceoverHistoryId === item.id ? (
                                      <>
                                        <Pause size={16} />
                                        <span className="hidden sm:inline">Pause</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play size={16} />
                                        <span className="hidden sm:inline">Play</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview View */}
                  {previewPanelView === 'preview' && (
                    <>
                      {/* Loading State */}
                      {(isLoading || isCustomLoading) && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <LoadingSpinner size="lg" className="mb-4" />
                          <p className="mt-4 text-slate-500 font-medium">Generating magic...</p>
                        </div>
                      )}

                      {/* Empty State */}
                      {!hasOutput && !isLoading && !isCustomLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-slate-50/50">
                            <Music2 className="w-8 h-8 text-slate-400" />
                          </div>
                          <h4 className="text-slate-900 font-semibold text-lg mb-2">
                            {selectedMainTab === 'ai-script' ? 'No script generated yet' : 'No voice-over generated yet'}
                          </h4>
                          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                            {selectedMainTab === 'ai-script'
                              ? <>Fill in the settings on the right and click <span className="font-medium text-slate-700">Generate</span> to create your professional voice-over.</>
                              : <>Enter your script and click <span className="font-medium text-slate-700">Generate</span> to create your voice-over.</>}
                          </p>
                        </div>
                      )}

                      {/* Result State */}
                      {hasOutput && !isLoading && !isCustomLoading && (
                        <div className="flex-1 flex flex-col">
                          {/* Generated Script Text Display (AI only) */}
                          {selectedMainTab === 'ai-script' && generatedScript && (
                            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-64 overflow-y-auto">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Generated Script</h4>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{cleanScript(generatedScript)}</p>
                              <button
                                onClick={() => copyToClipboard(generatedScript)}
                                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-900"
                              >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          )}

                          {/* Audio Player */}
                          <div className="mt-auto bg-gray-900 rounded-2xl p-4 shadow-xl shadow-gray-900/20 text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20"></div>
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Music2 className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-sm">Generated Voiceover</h5>
                                    <p className="text-xs text-gray-400">Symplysis AI Audio</p>
                                  </div>
                                </div>
                                <a
                                  href={selectedMainTab === 'ai-script' ? audioUrl : customAudioUrl}
                                  download={`voiceover-${Date.now()}.wav`}
                                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>

                              {selectedMainTab === 'ai-script' ? (
                                <>
                                  <audio
                                    ref={audioPlayerRef}
                                    src={audioUrl}
                                    controls
                                    className="w-full h-8 opacity-90"
                                    style={{ filter: 'invert(1)' }}
                                    onEnded={() => setIsPlaying(false)}
                                    onPause={() => setIsPlaying(false)}
                                    onPlay={() => setIsPlaying(true)}
                                  />
                                </>
                              ) : (
                                <>
                                  <audio
                                    ref={customAudioPlayerRef}
                                    src={customAudioUrl}
                                    controls
                                    className="w-full h-8 opacity-90"
                                    style={{ filter: 'invert(1)' }}
                                    onEnded={() => setIsCustomPlaying(false)}
                                    onPause={() => setIsCustomPlaying(false)}
                                    onPlay={() => setIsCustomPlaying(true)}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Panel - Settings Sidebar */}
          {(!isMobile || showMobileSettings) && (
            <div className="flex-shrink-0 border-l-0 md:border-l border-slate-200 flex flex-col bg-white overflow-hidden" style={{ height: '100%', maxHeight: '100%', width: '500px', maxWidth: '500px' }}>
              {/* Scrollable Content Area */}
              <div className="flex flex-col flex-1 min-h-0 overflow-y-auto" style={{ height: '100%', maxHeight: '100%' }}>
                {/* Mobile Close Button with Breadcrumbs */}
                {(showMobileSettings || tabSelected) && (
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 md:hidden">
                    <nav aria-label="breadcrumb" className="flex-1">
                      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
                        <li className="inline-flex items-center gap-1.5">
                          {sidebarView === 'settings' ? (
                            <button
                              onClick={() => {
                                setSidebarView('templates')
                              }}
                              className="transition-colors hover:text-slate-900 cursor-pointer"
                            >
                              Voiceover
                            </button>
                          ) : (
                            <span className="font-normal text-slate-900">Voiceover</span>
                          )}
                        </li>
                        {sidebarView === 'settings' && (
                          <>
                            <li role="presentation" aria-hidden="true" className="[&>svg]:w-3.5 [&>svg]:h-3.5">
                              <ChevronRight size={14} />
                            </li>
                            <li className="inline-flex items-center">
                              <span className="font-normal text-slate-900" aria-current="page">
                                {selectedMainTab === 'ai-script' ? 'AI Script Generator' : 'Custom Script TTS'}
                              </span>
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
                              setSidebarView('templates')
                            }}
                            className="transition-colors hover:text-slate-900 cursor-pointer"
                          >
                            Voiceover
                          </button>
                        ) : (
                          <span className="font-normal text-slate-900">Voiceover</span>
                        )}
                      </li>
                      {sidebarView === 'settings' && (
                        <>
                          <li role="presentation" aria-hidden="true" className="[&>svg]:w-3.5 [&>svg]:h-3.5">
                            <ChevronRight size={14} />
                          </li>
                          <li className="inline-flex items-center">
                            <span className="font-normal text-slate-900" aria-current="page">
                              {selectedMainTab === 'ai-script' ? 'AI Script Generator' : 'Custom Script TTS'}
                            </span>
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
                        {/* AI Script Generator Card */}
                        <div
                          onClick={() => {
                            setSelectedMainTab('ai-script')
                            setTabSelected(true)
                            setSidebarView('settings')
                          }}
                          className="cursor-pointer border border-slate-200 rounded-xl overflow-hidden hover:border-purple-400 hover:shadow-md transition-all bg-white flex"
                        >
                          <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Zap className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-center">
                            <h3 className="font-semibold text-sm text-slate-900">AI Script Generator</h3>
                            <p className="text-xs text-slate-600 mt-1">Generate professional voiceover scripts with AI based on product details</p>
                          </div>
                        </div>
                        {/* Custom Script TTS Card */}
                        <div
                          onClick={() => {
                            setSelectedMainTab('custom-script')
                            setTabSelected(true)
                            setSidebarView('settings')
                          }}
                          className="cursor-pointer border border-slate-200 rounded-xl overflow-hidden hover:border-purple-400 hover:shadow-md transition-all bg-white flex"
                        >
                          <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Mic className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-center">
                            <h3 className="font-semibold text-sm text-slate-900">Custom Script TTS</h3>
                            <p className="text-xs text-slate-600 mt-1">Convert your own script into professional voiceover audio</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Settings View - Only show if tab is selected */}
                  {sidebarView === 'settings' && tabSelected && (
                    <>
                      {/* AI SCRIPT GENERATOR FORM */}
                      {selectedMainTab === 'ai-script' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-purple-500" />
                              AI Configuration
                            </h2>
                            <button
                              onClick={resetForms}
                              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                            >
                              Reset all
                            </button>
                          </div>

                          {/* Image Upload Analysis */}
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors relative overflow-hidden group">
                              {!analyzingImage ? (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <svg className="w-6 h-6 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <p className="text-xs text-purple-600 font-medium">Upload product image to auto-fill (Analyze)</p>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-white/90 flex items-center justify-center gap-2">
                                  <LoadingSpinner size="sm" />
                                  <span className="text-xs text-slate-600 font-medium">Analyzing Image...</span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) analyzeImage(file)
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div className="space-y-4">
                            {/* Language & Accent */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Script Language</label>
                                <select
                                  value={formData.scriptLanguage}
                                  onChange={(e) => setFormData({ ...formData, scriptLanguage: e.target.value as ScriptLanguage })}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {SCRIPT_LANGUAGES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Dialect / Accent</label>
                                <select
                                  value={formData.accent}
                                  onChange={(e) => setFormData({ ...formData, accent: e.target.value as Accent })}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {accentOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Product Name</label>
                                <input
                                  type="text"
                                  value={formData.productName}
                                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                  placeholder="e.g. SlimFit Pro"
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Target Audience</label>
                                <input
                                  type="text"
                                  value={formData.targetAudience}
                                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                  placeholder="e.g. Busy professionals"
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="block text-xs font-semibold text-slate-900">Product Function</label>
                              <textarea
                                value={formData.productFunction}
                                onChange={(e) => setFormData({ ...formData, productFunction: e.target.value })}
                                rows={2}
                                placeholder="What does your product do?"
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                              />
                            </div>

                            <div className="space-y-3">
                              <label className="block text-xs font-semibold text-slate-900">Key Benefits</label>
                              <textarea
                                value={formData.keyBenefits}
                                onChange={(e) => setFormData({ ...formData, keyBenefits: e.target.value })}
                                rows={2}
                                placeholder="List the main advantages..."
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                              />
                            </div>

                            <hr className="border-slate-200" />

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Tone Style</label>
                                <select
                                  value={formData.toneStyle}
                                  onChange={(e) => setFormData({ ...formData, toneStyle: e.target.value as ToneStyle })}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {TONE_STYLES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Voice</label>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={voice}
                                    onChange={(e) => setVoice(e.target.value)}
                                    className="flex-1 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                  >
                                    {VOICE_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => previewVoice('ai')}
                                    disabled={previewingVoice === 'ai'}
                                    className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    title="Preview Voice"
                                  >
                                    {previewingVoice === 'ai' ? (
                                      <LoadingSpinner size="sm" className="text-white" />
                                    ) : (
                                      <Play size={20} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-3">
                              <label className="block text-xs font-semibold text-slate-900">Duration</label>
                              <div className="grid grid-cols-3 gap-2">
                                <label className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name="duration"
                                    value="30"
                                    checked={duration === '30'}
                                    onChange={(e) => setDuration(e.target.value as '30' | '45' | '60')}
                                    className="peer sr-only"
                                  />
                                  <div className={`text-center py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${duration === '30'
                                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                                    }`}>
                                    30 Sec
                                  </div>
                                </label>
                                <label className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name="duration"
                                    value="45"
                                    checked={duration === '45'}
                                    onChange={(e) => setDuration(e.target.value as '30' | '45' | '60')}
                                    className="peer sr-only"
                                  />
                                  <div className={`text-center py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${duration === '45'
                                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                                    }`}>
                                    45 Sec
                                  </div>
                                </label>
                                <label className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name="duration"
                                    value="60"
                                    checked={duration === '60'}
                                    onChange={(e) => setDuration(e.target.value as '30' | '45' | '60')}
                                    className="peer sr-only"
                                  />
                                  <div className={`text-center py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${duration === '60'
                                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                                    }`}>
                                    60 Sec
                                  </div>
                                </label>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Optional Call to Action</label>
                                <input
                                  type="text"
                                  value={formData.optionalCta}
                                  onChange={(e) => setFormData({ ...formData, optionalCta: e.target.value })}
                                  placeholder="e.g. Visit our website today"
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                />
                              </div>
                              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                                <div className="flex items-center h-5">
                                  <input
                                    type="checkbox"
                                    checked={includeFreeDelivery}
                                    onChange={(e) => setIncludeFreeDelivery(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500 focus:ring-2"
                                  />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-slate-900 block">Include free delivery message</span>
                                  <span className="text-xs text-slate-500 block">Adds 'Free delivery' or 'Cash on Delivery' to the end (Dialect aware).</span>
                                </div>
                              </label>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-slate-200">
                            <button
                              onClick={handleSubmit}
                              disabled={isLoading || !formData.productName.trim()}
                              className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <>
                                  <LoadingSpinner size="sm" className="text-white" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Mic size={18} />
                                  Generate Script & Voice-over
                                </>
                              )}
                            </button>
                          </div>

                          {error && (
                            <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-red-800">
                              <span className="text-sm font-medium">{error}</span>
                              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                                <X size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CUSTOM SCRIPT TTS FORM */}
                      {selectedMainTab === 'custom-script' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 3a2.5 2.5 0 00-3.536 3.536L12 6.536 17.464 12l3.536-3.536a2.5 2.5 0 00-3.536-3.536z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.536 17.464L12 12 6.536 6.536 3 10.072a2.5 2.5 0 003.536 3.536z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12"></path>
                              </svg>
                              Custom Script TTS
                            </h2>
                            <button
                              onClick={resetForms}
                              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                            >
                              Reset all
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-3">
                              <label className="block text-xs font-semibold text-slate-900">Custom Script</label>
                              <textarea
                                value={customScript}
                                onChange={(e) => setCustomScript(e.target.value)}
                                rows={6}
                                placeholder="Enter your script here..."
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                              />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Script Language</label>
                                <select
                                  value={customFormState.scriptLanguage || 'english'}
                                  onChange={(e) => {
                                    const lang = e.target.value as ScriptLanguage
                                    let newAccent = customFormState.accent

                                    if (lang === 'arabic') {
                                      if (!ARABIC_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'Classical Arabic'
                                      }
                                    } else if (lang === 'french') {
                                      if (!FRENCH_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'France (French)'
                                      }
                                    } else if (lang === 'spanish') {
                                      if (!SPANISH_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'Spain (Spanish)'
                                      }
                                    } else if (lang === 'english') {
                                      if (!ENGLISH_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'United States (English)'
                                      }
                                    }

                                    setCustomFormState({ ...customFormState, scriptLanguage: lang, accent: newAccent })
                                  }}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {SCRIPT_LANGUAGES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Dialect / Accent</label>
                                <select
                                  value={customFormState.accent}
                                  onChange={(e) => setCustomFormState({ ...customFormState, accent: e.target.value as Accent })}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {(() => {
                                    const lang = customFormState.scriptLanguage || 'english'
                                    if (lang === 'arabic') return ARABIC_ACCENT_OPTIONS
                                    if (lang === 'french') return FRENCH_ACCENT_OPTIONS
                                    if (lang === 'spanish') return SPANISH_ACCENT_OPTIONS
                                    return ENGLISH_ACCENT_OPTIONS
                                  })().map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Tone Style</label>
                                <select
                                  value={customFormState.toneStyle}
                                  onChange={(e) => setCustomFormState({ ...customFormState, toneStyle: e.target.value as ToneStyle })}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {TONE_STYLES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Voice</label>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={customVoice}
                                    onChange={(e) => setCustomVoice(e.target.value)}
                                    className="flex-1 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                  >
                                    {VOICE_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => previewVoice('custom')}
                                    disabled={previewingVoice === 'custom'}
                                    className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    title="Preview Voice"
                                  >
                                    {previewingVoice === 'custom' ? (
                                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <Play size={20} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-slate-200">
                            <button
                              onClick={handleCustomSubmit}
                              disabled={isCustomLoading || !customScript.trim()}
                              className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCustomLoading ? (
                                <>
                                  <LoadingSpinner size="sm" className="text-white" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Mic size={18} />
                                  Generate Voice-over
                                </>
                              )}
                            </button>
                          </div>

                          {customError && (
                            <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-red-800">
                              <span className="text-sm font-medium">{customError}</span>
                              <button onClick={() => setCustomError('')} className="text-red-600 hover:text-red-800">
                                <X size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CUSTOM SCRIPT TTS FORM */}
                      {selectedMainTab === 'custom-script' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 3a2.5 2.5 0 00-3.536 3.536L12 6.536 17.464 12l3.536-3.536a2.5 2.5 0 00-3.536-3.536z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.536 17.464L12 12 6.536 6.536 3 10.072a2.5 2.5 0 003.536 3.536z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12"></path>
                              </svg>
                              Custom Script TTS
                            </h2>
                            <button
                              onClick={resetForms}
                              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                            >
                              Reset all
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-3">
                              <label className="block text-xs font-semibold text-slate-900">Custom Script</label>
                              <textarea
                                value={customScript}
                                onChange={(e) => setCustomScript(e.target.value)}
                                rows={6}
                                placeholder="Enter your script here..."
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all resize-none"
                              />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Script Language</label>
                                <select
                                  value={customFormState.scriptLanguage || 'english'}
                                  onChange={(e) => {
                                    const lang = e.target.value as ScriptLanguage
                                    let newAccent = customFormState.accent

                                    if (lang === 'arabic') {
                                      if (!ARABIC_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'Classical Arabic'
                                      }
                                    } else if (lang === 'french') {
                                      if (!FRENCH_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'France (French)'
                                      }
                                    } else if (lang === 'spanish') {
                                      if (!SPANISH_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'Spain (Spanish)'
                                      }
                                    } else if (lang === 'english') {
                                      if (!ENGLISH_ACCENT_OPTIONS.find(opt => opt.value === customFormState.accent)) {
                                        newAccent = 'United States (English)'
                                      }
                                    }

                                    setCustomFormState({ ...customFormState, scriptLanguage: lang, accent: newAccent })
                                  }}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {SCRIPT_LANGUAGES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Dialect / Accent</label>
                                <select
                                  value={customFormState.accent}
                                  onChange={(e) => setCustomFormState({ ...customFormState, accent: e.target.value as Accent })}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {(() => {
                                    const lang = customFormState.scriptLanguage || 'english'
                                    if (lang === 'arabic') return ARABIC_ACCENT_OPTIONS
                                    if (lang === 'french') return FRENCH_ACCENT_OPTIONS
                                    if (lang === 'spanish') return SPANISH_ACCENT_OPTIONS
                                    return ENGLISH_ACCENT_OPTIONS
                                  })().map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Tone Style</label>
                                <select
                                  value={customFormState.toneStyle}
                                  onChange={(e) => setCustomFormState({ ...customFormState, toneStyle: e.target.value as ToneStyle })}
                                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                >
                                  {TONE_STYLES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-900">Voice</label>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={customVoice}
                                    onChange={(e) => setCustomVoice(e.target.value)}
                                    className="flex-1 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-slate-300 transition-all"
                                  >
                                    {VOICE_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => previewVoice('custom')}
                                    disabled={previewingVoice === 'custom'}
                                    className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    title="Preview Voice"
                                  >
                                    {previewingVoice === 'custom' ? (
                                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <Play size={20} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-slate-200">
                            <button
                              onClick={handleCustomSubmit}
                              disabled={isCustomLoading || !customScript.trim()}
                              className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCustomLoading ? (
                                <>
                                  <LoadingSpinner size="sm" className="text-white" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Mic size={18} />
                                  Generate Voice-over
                                </>
                              )}
                            </button>
                          </div>

                          {customError && (
                            <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-red-800">
                              <span className="text-sm font-medium">{customError}</span>
                              <button onClick={() => setCustomError('')} className="text-red-600 hover:text-red-800">
                                <X size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        featureType="voiceover"
        onPurchaseComplete={() => refreshUsage()}
      />
    </>
  )
}

export default VoiceoverGeneratorPagePolaris

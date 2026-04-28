import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CookieService, CookiePreferences, CookieCategory } from '../services/cookieService'

interface CookieConsentContextType {
  hasConsent: boolean
  preferences: CookiePreferences | null
  showBanner: boolean
  showSettings: boolean
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (preferences: Partial<CookiePreferences>) => void
  openSettings: () => void
  closeSettings: () => void
  closeBanner: () => void
  isCategoryAllowed: (category: CookieCategory) => boolean
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return context
}

interface CookieConsentProviderProps {
  children: ReactNode
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ children }) => {
  const [hasConsent, setHasConsent] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    const savedPreferences = CookieService.getPreferences()
    if (savedPreferences) {
      setPreferences(savedPreferences)
      setHasConsent(true)
      setShowBanner(false)
    } else {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    CookieService.acceptAll()
    const prefs = CookieService.getPreferences()
    setPreferences(prefs)
    setHasConsent(true)
    setShowBanner(false)
    setShowSettings(false)
  }

  const rejectAll = () => {
    CookieService.rejectAll()
    const prefs = CookieService.getPreferences()
    setPreferences(prefs)
    setHasConsent(true)
    setShowBanner(false)
    setShowSettings(false)
  }

  const savePreferences = (prefs: Partial<CookiePreferences>) => {
    CookieService.savePreferences(prefs)
    const savedPrefs = CookieService.getPreferences()
    setPreferences(savedPrefs)
    setHasConsent(true)
    setShowBanner(false)
    setShowSettings(false)
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  const closeSettings = () => {
    setShowSettings(false)
  }

  const closeBanner = () => {
    setShowBanner(false)
  }

  const isCategoryAllowed = (category: CookieCategory): boolean => {
    return CookieService.isCategoryAllowed(category)
  }

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsent,
        preferences,
        showBanner,
        showSettings,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        closeSettings,
        closeBanner,
        isCategoryAllowed
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}


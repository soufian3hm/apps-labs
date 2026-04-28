/**
 * Cookie Service - Manages cookie operations and consent
 */

export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'functional'

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp: number
  version: string
}

const COOKIE_CONSENT_KEY = 'cookie_consent_preferences'
const COOKIE_VERSION = '1.0.0'
const CONSENT_EXPIRY_DAYS = 365

/**
 * Cookie Service Class
 */
export class CookieService {
  /**
   * Get user's cookie preferences from localStorage
   */
  static getPreferences(): CookiePreferences | null {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (!stored) return null

      const preferences = JSON.parse(stored) as CookiePreferences
      
      // Check if preferences are expired (older than CONSENT_EXPIRY_DAYS)
      const daysSinceConsent = (Date.now() - preferences.timestamp) / (1000 * 60 * 60 * 24)
      if (daysSinceConsent > CONSENT_EXPIRY_DAYS) {
        this.clearPreferences()
        return null
      }

      return preferences
    } catch (error) {
      console.error('Error reading cookie preferences:', error)
      return null
    }
  }

  /**
   * Save user's cookie preferences to localStorage
   */
  static savePreferences(preferences: Partial<CookiePreferences>): void {
    try {
      const fullPreferences: CookiePreferences = {
        essential: true, // Always true, cannot be disabled
        analytics: preferences.analytics ?? false,
        marketing: preferences.marketing ?? false,
        functional: preferences.functional ?? false,
        timestamp: Date.now(),
        version: COOKIE_VERSION
      }

      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullPreferences))
      
      // Also set a cookie for server-side access
      this.setCookie('cookie_consent', 'true', CONSENT_EXPIRY_DAYS)
    } catch (error) {
      console.error('Error saving cookie preferences:', error)
    }
  }

  /**
   * Check if user has given consent
   */
  static hasConsent(): boolean {
    const preferences = this.getPreferences()
    return preferences !== null
  }

  /**
   * Check if a specific category is allowed
   */
  static isCategoryAllowed(category: CookieCategory): boolean {
    const preferences = this.getPreferences()
    if (!preferences) return false

    // Essential cookies are always allowed
    if (category === 'essential') return true

    return preferences[category] === true
  }

  /**
   * Clear all cookie preferences
   */
  static clearPreferences(): void {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY)
      this.deleteCookie('cookie_consent')
    } catch (error) {
      console.error('Error clearing cookie preferences:', error)
    }
  }

  /**
   * Set a cookie
   */
  static setCookie(name: string, value: string, days: number): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }

  /**
   * Get a cookie value
   */
  static getCookie(name: string): string | null {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  /**
   * Delete a cookie
   */
  static deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }

  /**
   * Delete all cookies except essential ones
   */
  static deleteNonEssentialCookies(): void {
    const preferences = this.getPreferences()
    if (!preferences) return

    // Get all cookies
    const cookies = document.cookie.split(';')
    
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=')
      
      // Don't delete essential cookies
      if (name === 'cookie_consent' || name.startsWith('__')) {
        return
      }

      // Delete cookies based on category
      if (!preferences.analytics && this.isAnalyticsCookie(name)) {
        this.deleteCookie(name)
      }
      if (!preferences.marketing && this.isMarketingCookie(name)) {
        this.deleteCookie(name)
      }
      if (!preferences.functional && this.isFunctionalCookie(name)) {
        this.deleteCookie(name)
      }
    })
  }

  /**
   * Check if a cookie is an analytics cookie
   */
  private static isAnalyticsCookie(name: string): boolean {
    const analyticsPatterns = ['_ga', '_gid', '_gat', 'analytics', 'gtag', 'gtm']
    return analyticsPatterns.some(pattern => name.toLowerCase().includes(pattern))
  }

  /**
   * Check if a cookie is a marketing cookie
   */
  private static isMarketingCookie(name: string): boolean {
    const marketingPatterns = ['_fbp', '_fbc', 'fbpixel', 'ads', 'marketing', 'tracking']
    return marketingPatterns.some(pattern => name.toLowerCase().includes(pattern))
  }

  /**
   * Check if a cookie is a functional cookie
   */
  private static isFunctionalCookie(name: string): boolean {
    const functionalPatterns = ['preferences', 'settings', 'theme', 'language']
    return functionalPatterns.some(pattern => name.toLowerCase().includes(pattern))
  }

  /**
   * Accept all cookies
   */
  static acceptAll(): void {
    this.savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    })
  }

  /**
   * Reject all non-essential cookies
   */
  static rejectAll(): void {
    this.savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    })
    this.deleteNonEssentialCookies()
  }
}


import { useCookieConsent } from '../contexts/CookieConsentContext'
import { CookieCategory } from '../services/cookieService'

/**
 * Hook to check if a specific cookie category is allowed
 * Useful for conditionally enabling analytics, marketing, etc.
 */
export const useCookieCategory = (category: CookieCategory): boolean => {
  const { isCategoryAllowed } = useCookieConsent()
  return isCategoryAllowed(category)
}

/**
 * Hook to check if analytics cookies are allowed
 */
export const useAnalyticsConsent = (): boolean => {
  return useCookieCategory('analytics')
}

/**
 * Hook to check if marketing cookies are allowed
 */
export const useMarketingConsent = (): boolean => {
  return useCookieCategory('marketing')
}

/**
 * Hook to check if functional cookies are allowed
 */
export const useFunctionalConsent = (): boolean => {
  return useCookieCategory('functional')
}


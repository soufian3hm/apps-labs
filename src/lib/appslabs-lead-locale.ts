export type AppslabsLeadLocaleCode = 'AR' | 'EN'

export function normalizeLeadLocaleCode(value: string | null | undefined): AppslabsLeadLocaleCode {
  return value?.trim().toLowerCase() === 'ar' ? 'AR' : 'EN'
}

export function getLeadLanguage(value: string | null | undefined) {
  return normalizeLeadLocaleCode(value) === 'AR' ? 'ar' : 'en'
}

export function isArabicLeadLocale(value: string | null | undefined) {
  return normalizeLeadLocaleCode(value) === 'AR'
}

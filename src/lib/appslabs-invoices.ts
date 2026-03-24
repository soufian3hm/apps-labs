import { normalizeLeadLocaleCode } from '@/lib/appslabs-lead-locale'

export const APPSLABS_INVOICE_STATUSES = ['draft', 'sent', 'paid', 'void'] as const

export type AppslabsInvoiceStatus = (typeof APPSLABS_INVOICE_STATUSES)[number]

export type AppslabsInvoiceLineItem = {
  description: string
  quantity: number
  unit_price: number
}

export type AppslabsInvoiceRecord = {
  id: string
  lead_id: string | null
  invoice_number: string
  title: string
  status: AppslabsInvoiceStatus
  client_name: string
  client_email: string
  client_company: string | null
  client_locale: string | null
  currency_code: string
  issue_date: string
  due_date: string
  line_items: AppslabsInvoiceLineItem[]
  subtotal_amount: number
  total_amount: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export function normalizeInvoiceStatus(value: string | null | undefined): AppslabsInvoiceStatus {
  return APPSLABS_INVOICE_STATUSES.includes(value as AppslabsInvoiceStatus)
    ? (value as AppslabsInvoiceStatus)
    : 'draft'
}

export function normalizeInvoiceLineItems(value: unknown): AppslabsInvoiceLineItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      const description = typeof item?.description === 'string' ? item.description.trim() : ''
      const quantity = Number(item?.quantity)
      const unitPrice = Number(item?.unit_price)

      if (!description) return null
      if (!Number.isFinite(quantity) || quantity <= 0) return null
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return null

      return {
        description,
        quantity: Number(quantity),
        unit_price: Math.round(unitPrice),
      }
    })
    .filter((item): item is AppslabsInvoiceLineItem => Boolean(item))
}

export function calculateInvoiceSubtotal(lineItems: AppslabsInvoiceLineItem[]) {
  return lineItems.reduce((total, item) => total + Math.round(item.quantity * item.unit_price), 0)
}

export function parseMoneyInputToMinorUnits(value: string) {
  const normalized = value.replace(/,/g, '').trim()
  if (!normalized) return 0
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.round(parsed * 100))
}

export function formatMinorUnitsInput(value: number) {
  return (value / 100).toFixed(2)
}

export function formatInvoiceAmount(
  amount: number,
  currencyCode: string,
  localeCode: string | null | undefined
) {
  const locale = normalizeLeadLocaleCode(localeCode) === 'AR' ? 'ar' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: (currencyCode || 'USD').toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

export function formatInvoiceDate(value: string, localeCode: string | null | undefined) {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  const locale = normalizeLeadLocaleCode(localeCode) === 'AR' ? 'ar' : 'en-US'

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function buildInvoiceNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `AL-${stamp}-${suffix}`
}

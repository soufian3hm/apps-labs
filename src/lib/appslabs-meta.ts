import { createHash } from 'crypto'

type CookieStoreLike = {
  get(name: string): { value: string } | undefined
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || ''
}

function normalizePhone(value: string | null | undefined) {
  return value?.replace(/\D/g, '') || ''
}

function normalizeNamePart(value: string | null | undefined) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}]/gu, '') || ''
  )
}

function getNameParts(value: string | null | undefined) {
  const parts = value?.trim().split(/\s+/).filter(Boolean) || []

  return {
    firstName: normalizeNamePart(parts[0]),
    lastName: normalizeNamePart(parts.slice(1).join(' ')),
  }
}

export async function sendMetaLeadEvent({
  pixelId,
  accessToken,
  eventId,
  sourceUrl,
  email,
  phone,
  name,
  externalId,
  projectType,
  budget,
  headers,
  cookies,
}: {
  pixelId: string
  accessToken: string
  eventId: string
  sourceUrl?: string | null
  email?: string | null
  phone?: string | null
  name?: string | null
  externalId?: string | null
  projectType?: string | null
  budget?: string | null
  headers: Headers
  cookies: CookieStoreLike
}) {
  const normalizedEmail = normalizeEmail(email)
  const normalizedPhone = normalizePhone(phone)
  const { firstName, lastName } = getNameParts(name)
  const normalizedExternalId = externalId?.trim() || ''
  const fbp = cookies.get('_fbp')?.value?.trim() || ''
  const fbc = cookies.get('_fbc')?.value?.trim() || ''
  const clientIpAddress = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
  const clientUserAgent = headers.get('user-agent')?.trim() || ''

  const userData: Record<string, string | string[]> = {}

  if (normalizedEmail) userData.em = [hashValue(normalizedEmail)]
  if (normalizedPhone) userData.ph = [hashValue(normalizedPhone)]
  if (firstName) userData.fn = [hashValue(firstName)]
  if (lastName) userData.ln = [hashValue(lastName)]
  if (normalizedExternalId) userData.external_id = [hashValue(normalizedExternalId)]
  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc
  if (clientIpAddress) userData.client_ip_address = clientIpAddress
  if (clientUserAgent) userData.client_user_agent = clientUserAgent

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: sourceUrl || undefined,
        user_data: userData,
        custom_data: {
          currency: 'USD',
          value: 100,
          content_name: projectType || undefined,
          content_category: budget || undefined,
        },
      },
    ],
    access_token: accessToken,
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const metaError = result && typeof result === 'object' ? (result as any).error?.message : null
    throw new Error(metaError ? `Meta CAPI failed: ${metaError}` : 'Meta CAPI failed.')
  }

  return result
}

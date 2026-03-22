export function getSafeTimeZone(value: string | null | undefined) {
  const candidate = value?.trim() || 'UTC'

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date())
    return candidate
  } catch {
    return 'UTC'
  }
}

function getNormalizedLocale(locale: string) {
  return locale === 'ar' ? 'ar' : 'en'
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const offsetValue = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT'
  if (offsetValue === 'GMT' || offsetValue === 'UTC') return 0

  const match = offsetValue.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/)
  if (!match) return 0

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2] || 0)
  const minutes = Number(match[3] || 0)

  return sign * (hours * 60 + minutes)
}

export function zonedDateTimeToUtc(dateValue: string, timeValue: string, timeZone: string) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const [hour, minute] = timeValue.split(':').map(Number)

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return new Date(Number.NaN)
  }

  const normalizedTimeZone = getSafeTimeZone(timeZone)
  const baseUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0)

  let offset = getTimeZoneOffsetMinutes(normalizedTimeZone, new Date(baseUtcMs))
  let actualUtcMs = baseUtcMs - offset * 60 * 1000
  const recalculatedOffset = getTimeZoneOffsetMinutes(normalizedTimeZone, new Date(actualUtcMs))

  if (recalculatedOffset !== offset) {
    offset = recalculatedOffset
    actualUtcMs = baseUtcMs - offset * 60 * 1000
  }

  return new Date(actualUtcMs)
}

export function formatMeetingStrings(date: Date, locale: string, timeZone: string) {
  const normalizedLocale = getNormalizedLocale(locale)
  const normalizedTimeZone = getSafeTimeZone(timeZone)

  const meetingDate = new Intl.DateTimeFormat(normalizedLocale, {
    timeZone: normalizedTimeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)

  const meetingTime = new Intl.DateTimeFormat(normalizedLocale, {
    timeZone: normalizedTimeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  return {
    meetingDate,
    meetingTime,
  }
}

export function formatMeetingDateTime(date: Date, locale: string, timeZone?: string | null) {
  const normalizedLocale = getNormalizedLocale(locale)
  const normalizedTimeZone = timeZone ? getSafeTimeZone(timeZone) : undefined

  return new Intl.DateTimeFormat(normalizedLocale, {
    ...(normalizedTimeZone ? { timeZone: normalizedTimeZone } : {}),
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateTimeLocalValues(date: Date, timeZone: string) {
  const normalizedTimeZone = getSafeTimeZone(timeZone)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: normalizedTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value || '00'

  return {
    date: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
    time: `${getPart('hour')}:${getPart('minute')}`,
  }
}

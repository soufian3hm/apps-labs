export type AppslabsSettings = {
  id?: number
  fb_pixel_id?: string | null
  fb_pixel_token?: string | null
  admin_notification_email: string
  booking_timezone: string
  booking_start_hour: number
  booking_end_hour: number
  booking_slot_minutes: number
  booking_min_notice_minutes: number
  booking_day_window: number
  reminder_lead_minutes: number
  updated_at?: string | null
}

export const DEFAULT_APPSLABS_SETTINGS: AppslabsSettings = {
  id: 1,
  fb_pixel_id: null,
  fb_pixel_token: null,
  admin_notification_email: 'soufian3hm@gmail.com',
  booking_timezone: 'UTC',
  booking_start_hour: 9,
  booking_end_hour: 20,
  booking_slot_minutes: 30,
  booking_min_notice_minutes: 60,
  booking_day_window: 7,
  reminder_lead_minutes: 30,
  updated_at: null,
}

function asBoundedNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.round(parsed)))
}

export function normalizeAppslabsSettings(raw: any): AppslabsSettings {
  return {
    ...DEFAULT_APPSLABS_SETTINGS,
    ...raw,
    admin_notification_email:
      typeof raw?.admin_notification_email === 'string' && raw.admin_notification_email.trim()
        ? raw.admin_notification_email.trim()
        : DEFAULT_APPSLABS_SETTINGS.admin_notification_email,
    booking_timezone:
      typeof raw?.booking_timezone === 'string' && raw.booking_timezone.trim()
        ? raw.booking_timezone.trim()
        : DEFAULT_APPSLABS_SETTINGS.booking_timezone,
    booking_start_hour: asBoundedNumber(raw?.booking_start_hour, DEFAULT_APPSLABS_SETTINGS.booking_start_hour, 0, 23),
    booking_end_hour: asBoundedNumber(raw?.booking_end_hour, DEFAULT_APPSLABS_SETTINGS.booking_end_hour, 0, 23),
    booking_slot_minutes: asBoundedNumber(raw?.booking_slot_minutes, DEFAULT_APPSLABS_SETTINGS.booking_slot_minutes, 15, 180),
    booking_min_notice_minutes: asBoundedNumber(
      raw?.booking_min_notice_minutes,
      DEFAULT_APPSLABS_SETTINGS.booking_min_notice_minutes,
      15,
      1440
    ),
    booking_day_window: asBoundedNumber(raw?.booking_day_window, DEFAULT_APPSLABS_SETTINGS.booking_day_window, 1, 30),
    reminder_lead_minutes: asBoundedNumber(raw?.reminder_lead_minutes, DEFAULT_APPSLABS_SETTINGS.reminder_lead_minutes, 0, 10080),
  }
}

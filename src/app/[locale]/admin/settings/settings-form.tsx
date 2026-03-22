'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { AppslabsSettings } from '@/lib/appslabs-settings'
import { normalizeAppslabsSettings } from '@/lib/appslabs-settings'
import { getAdminCopy } from '@/lib/appslabs-admin-copy'

export default function SettingsForm({
  initialSettings,
  locale,
  copy,
}: {
  initialSettings: AppslabsSettings
  locale: string
  copy: ReturnType<typeof getAdminCopy>
}) {
  const normalized = normalizeAppslabsSettings(initialSettings)
  const [adminNotificationEmail, setAdminNotificationEmail] = useState(normalized.admin_notification_email)
  const [bookingTimezone, setBookingTimezone] = useState(normalized.booking_timezone)
  const [bookingStartHour, setBookingStartHour] = useState(String(normalized.booking_start_hour))
  const [bookingEndHour, setBookingEndHour] = useState(String(normalized.booking_end_hour))
  const [bookingSlotMinutes, setBookingSlotMinutes] = useState(String(normalized.booking_slot_minutes))
  const [bookingMinNoticeMinutes, setBookingMinNoticeMinutes] = useState(String(normalized.booking_min_notice_minutes))
  const [bookingDayWindow, setBookingDayWindow] = useState(String(normalized.booking_day_window))
  const [reminderLeadMinutes, setReminderLeadMinutes] = useState(String(normalized.reminder_lead_minutes))
  const [fbPixelId, setFbPixelId] = useState(normalized.fb_pixel_id || '')
  const [fbPixelToken, setFbPixelToken] = useState(normalized.fb_pixel_token || '')
  const [saving, setSaving] = useState(false)

  const toNumber = (value: string, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('appslabs_settings')
      .upsert({
        id: 1,
        admin_notification_email: adminNotificationEmail.trim() || normalized.admin_notification_email,
        booking_timezone: bookingTimezone.trim() || normalized.booking_timezone,
        booking_start_hour: toNumber(bookingStartHour, normalized.booking_start_hour),
        booking_end_hour: toNumber(bookingEndHour, normalized.booking_end_hour),
        booking_slot_minutes: toNumber(bookingSlotMinutes, normalized.booking_slot_minutes),
        booking_min_notice_minutes: toNumber(bookingMinNoticeMinutes, normalized.booking_min_notice_minutes),
        booking_day_window: toNumber(bookingDayWindow, normalized.booking_day_window),
        reminder_lead_minutes: toNumber(reminderLeadMinutes, normalized.reminder_lead_minutes),
        fb_pixel_id: fbPixelId.trim() || null,
        fb_pixel_token: fbPixelToken.trim() || null,
        updated_at: new Date().toISOString(),
      })

    setSaving(false)

    if (error) {
      alert(copy.pages.settingsError + error.message)
      return
    }

    alert(copy.pages.settingsSaved)
  }

  const inputClasses =
    'w-full rounded-xl border border-edge bg-bg px-4 py-3 text-sm text-fg placeholder-fg-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200'

  return (
    <div className="min-h-screen bg-bg text-fg p-6 lg:p-12">
      <div className="mx-auto max-w-[920px]">
        <div className="mb-10 border-b border-edge pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">{copy.pages.settingsTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm text-fg-muted">{copy.pages.settingsSubtitle}</p>
            </div>
            <Link
              href={`/${locale}/admin`}
              className="rounded-lg border border-edge bg-surface px-4 py-2 text-sm font-medium transition-colors hover:text-accent"
            >
              &larr; {copy.pages.backToPipeline}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <section className="rounded-2xl border border-edge bg-surface p-8 shadow-sm">
            <h2 className="text-xl font-semibold">{copy.settings.bookingTitle}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="adminNotificationEmail">
                  {copy.settings.adminEmail}
                </label>
                <input
                  id="adminNotificationEmail"
                  type="email"
                  value={adminNotificationEmail}
                  onChange={(e) => setAdminNotificationEmail(e.target.value)}
                  placeholder="soufian3hm@gmail.com"
                  className={inputClasses}
                />
                <p className="mt-2 text-xs text-fg-muted">{copy.settings.adminEmailHint}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="bookingTimezone">
                  {copy.settings.bookingTimezone}
                </label>
                <input
                  id="bookingTimezone"
                  type="text"
                  value={bookingTimezone}
                  onChange={(e) => setBookingTimezone(e.target.value)}
                  placeholder="Africa/Lagos"
                  className={inputClasses}
                />
                <p className="mt-2 text-xs text-fg-muted">{copy.settings.bookingTimezoneHint}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="reminderLeadMinutes">
                  {copy.settings.reminderLead}
                </label>
                <input
                  id="reminderLeadMinutes"
                  type="number"
                  min="0"
                  value={reminderLeadMinutes}
                  onChange={(e) => setReminderLeadMinutes(e.target.value)}
                  className={inputClasses}
                />
                <p className="mt-2 text-xs text-fg-muted">{copy.settings.reminderHint}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="bookingStartHour">
                  {copy.settings.bookingStart}
                </label>
                <input
                  id="bookingStartHour"
                  type="number"
                  min="0"
                  max="23"
                  value={bookingStartHour}
                  onChange={(e) => setBookingStartHour(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="bookingEndHour">
                  {copy.settings.bookingEnd}
                </label>
                <input
                  id="bookingEndHour"
                  type="number"
                  min="0"
                  max="23"
                  value={bookingEndHour}
                  onChange={(e) => setBookingEndHour(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="bookingSlotMinutes">
                  {copy.settings.bookingSlot}
                </label>
                <input
                  id="bookingSlotMinutes"
                  type="number"
                  min="15"
                  value={bookingSlotMinutes}
                  onChange={(e) => setBookingSlotMinutes(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="bookingMinNoticeMinutes">
                  {copy.settings.bookingNotice}
                </label>
                <input
                  id="bookingMinNoticeMinutes"
                  type="number"
                  min="15"
                  value={bookingMinNoticeMinutes}
                  onChange={(e) => setBookingMinNoticeMinutes(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="bookingDayWindow">
                  {copy.settings.bookingWindow}
                </label>
                <input
                  id="bookingDayWindow"
                  type="number"
                  min="1"
                  max="30"
                  value={bookingDayWindow}
                  onChange={(e) => setBookingDayWindow(e.target.value)}
                  className={inputClasses}
                />
                <p className="mt-2 text-xs text-fg-muted">{copy.settings.bookingHoursHint}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-edge bg-surface p-8 shadow-sm">
            <h2 className="text-xl font-semibold">{copy.settings.marketingTitle}</h2>

            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="fbPixelId">
                  {copy.settings.pixelId}
                </label>
                <input
                  id="fbPixelId"
                  type="text"
                  value={fbPixelId}
                  onChange={(e) => setFbPixelId(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className={inputClasses}
                />
                <p className="mt-2 text-xs text-fg-muted">{copy.settings.pixelHint}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="fbPixelToken">
                  {copy.settings.pixelToken} <span className="text-fg-tertiary font-normal">({copy.settings.optional})</span>
                </label>
                <input
                  id="fbPixelToken"
                  type="password"
                  value={fbPixelToken}
                  onChange={(e) => setFbPixelToken(e.target.value)}
                  placeholder="EAAB..."
                  className={inputClasses}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? copy.pages.savingSettings : copy.pages.saveSettings}
          </button>
        </form>
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { formatMeetingStrings, getSafeTimeZone } from '@/lib/appslabs-meetings'
import { getLeadLanguage, normalizeLeadLocaleCode } from '@/lib/appslabs-lead-locale'
import { sendMetaLeadEvent } from '@/lib/appslabs-meta'
// We removed Resend in favor of edge function

const MIN_BOOKING_NOTICE_MS = 60 * 60 * 1000;

function buildConfirmationEmail({
  name,
  meetingDate,
  meetingTime,
  localeCode,
}: {
  name: string
  meetingDate: string
  meetingTime: string
  localeCode: 'AR' | 'EN'
}) {
  const locale = getLeadLanguage(localeCode)
  const isArabic = locale === 'ar'

  const dictionary = {
    en: {
      subject: 'Your Strategy Call with Apps Labs is Scheduled',
      title: 'Request Received.',
      greeting: `Hi ${name},`,
      intro: `Thank you for your interest! We have successfully received your project details and scheduled your discovery call for <strong style="color: #1a1a17;">${meetingDate} at ${meetingTime}</strong>.`,
      important: 'Important',
      reminder: 'You will receive the meeting link automatically before the meet by around 30 minutes.',
      footer: 'We look forward to speaking with you soon and mapping out your system.',
      rights: '&copy; 2026 Apps Labs. All rights reserved.',
    },
    ar: {
      subject: 'تم تأكيد مكالمتك مع Apps Labs',
      title: 'تم استلام طلبك.',
      greeting: `مرحباً ${name}،`,
      intro: `شكراً لاهتمامك. لقد استلمنا تفاصيل مشروعك بنجاح وتم تحديد مكالمة الاكتشاف الخاصة بك في <strong style="color: #1a1a17;">${meetingDate} في ${meetingTime}</strong>.`,
      important: 'مهم',
      reminder: 'ستتلقى رابط الاجتماع تلقائياً قبل الموعد بحوالي 30 دقيقة.',
      footer: 'نتطلع للتحدث معك قريباً ووضع تصور واضح للنظام المناسب لك.',
      rights: '&copy; 2026 Apps Labs. جميع الحقوق محفوظة.',
    },
  }[locale]

  return {
    subject: dictionary.subject,
    html: `
<!DOCTYPE html>
<html ${isArabic ? 'dir="rtl"' : ''}>
<head>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #fafaf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf7;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e2dc; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.02); text-align: ${isArabic ? 'right' : 'left'};">
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #f0ede8;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: -0.5px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">Apps Labs</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 28px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">${dictionary.title}</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #42413d; line-height: 1.6;">
                ${dictionary.greeting}<br/><br/>
                ${dictionary.intro}
              </p>
              <div style="background-color: #f5e6d3; border: 1px solid rgba(193, 127, 62, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; color: #c17f3e; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${dictionary.important}</p>
                <p style="margin: 0; color: #a66a2e; font-size: 15px; font-weight: 500; line-height: 1.5;">${dictionary.reminder}</p>
              </div>
              <div style="border-top: 1px solid #f0ede8; padding-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #a3a19c; line-height: 1.6;">
                  ${dictionary.footer}
                </p>
              </div>
            </td>
          </tr>
        </table>
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 32px auto 0; text-align: center;">
          <tr>
            <td>
              <p style="margin: 0; font-size: 13px; color: #a3a19c;">${dictionary.rights}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const supabase = await createClient()
    const { data: settings } = await supabase
      .from('appslabs_settings')
      .select('admin_notification_email, booking_timezone, fb_pixel_id, fb_pixel_token')
      .eq('id', 1)
      .single()

    const meetingTimestamp = new Date(data.meeting_timestamp)

    if (Number.isNaN(meetingTimestamp.getTime())) {
      return NextResponse.json({ error: 'Invalid meeting time selected.' }, { status: 400 })
    }

    if (meetingTimestamp.getTime() < Date.now() + MIN_BOOKING_NOTICE_MS) {
      return NextResponse.json({ error: 'Please choose a meeting time at least one hour from now.' }, { status: 400 })
    }

    const clientLocaleCode = normalizeLeadLocaleCode(typeof data.client_locale === 'string' ? data.client_locale : 'en')
    const clientLocale = getLeadLanguage(clientLocaleCode)
    const meetingTimeZone = getSafeTimeZone(typeof data.meeting_timezone === 'string' ? data.meeting_timezone : 'UTC')
    const adminMeetingTimeZone = getSafeTimeZone(typeof settings?.booking_timezone === 'string' ? settings.booking_timezone : 'UTC')
    const formattedMeeting = formatMeetingStrings(meetingTimestamp, clientLocale, meetingTimeZone)
    const formattedAdminMeeting = formatMeetingStrings(meetingTimestamp, 'en', adminMeetingTimeZone)

    // Insert into database
    const { data: lead, error } = await supabase
      .from('appslabs_leads')
      .insert([
        {
          name: data.name,
          company: data.company,
          email: data.email,
          whatsapp: data.whatsapp,
          budget: data.budget,
          project_type: data.projectType,
          message: data.message,
          meeting_date: formattedMeeting.meetingDate,
          meeting_time: formattedMeeting.meetingTime,
          meeting_timestamp: meetingTimestamp.toISOString(),
          meeting_timezone: meetingTimeZone,
          meeting_status: 'scheduled',
          source_label: typeof data.source_label === 'string' && data.source_label.trim() ? data.source_label.trim() : 'website',
          client_locale: clientLocaleCode,
        }
      ])
      .select()
      .single()

    if (error) throw error

    const confirmationEmail = buildConfirmationEmail({
      name: data.name,
      meetingDate: formattedMeeting.meetingDate,
      meetingTime: formattedMeeting.meetingTime,
      localeCode: clientLocaleCode,
    })

    const metaEventId =
      typeof data.meta_event_id === 'string' && data.meta_event_id.trim()
        ? data.meta_event_id.trim()
        : `appslabs-lead-${lead.id}`

    const tasks = [
      supabase.functions.invoke('appslabs-email-sender', {
        body: {
          to: data.email,
          subject: confirmationEmail.subject,
          html: confirmationEmail.html,
          adminNotificationEmail: settings?.admin_notification_email || undefined,
          adminNotification: {
            name: data.name,
            company: data.company,
            email: data.email,
            whatsapp: data.whatsapp,
            budget: data.budget,
            projectType: data.projectType,
            message: data.message,
            meetingDate: formattedAdminMeeting.meetingDate,
            meetingTime: formattedAdminMeeting.meetingTime,
            meetingTimezone: adminMeetingTimeZone,
            clientMeetingDate: formattedMeeting.meetingDate,
            clientMeetingTime: formattedMeeting.meetingTime,
            clientMeetingTimezone: meetingTimeZone,
          },
        }
      }).then(({ error: emailError }) => {
        if (emailError) {
          console.error('Edge Function Email Delivery failed:', emailError)
        }
      }),
    ]

    const metaPixelId = settings?.fb_pixel_id?.trim()
    const metaAccessToken = settings?.fb_pixel_token?.trim()

    if (metaPixelId && metaAccessToken) {
      tasks.push(
        sendMetaLeadEvent({
          pixelId: metaPixelId,
          accessToken: metaAccessToken,
          eventId: metaEventId,
          sourceUrl: typeof data.source_url === 'string' ? data.source_url : req.headers.get('referer'),
          email: data.email,
          phone: data.whatsapp,
          name: data.name,
          externalId: lead.id,
          projectType: data.projectType,
          budget: data.budget,
          headers: req.headers,
          cookies: req.cookies,
        }).catch((metaError) => {
          console.error('Meta CAPI lead tracking failed:', metaError)
        })
      )
    }

    await Promise.allSettled(tasks)

    return NextResponse.json({ success: true, lead })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

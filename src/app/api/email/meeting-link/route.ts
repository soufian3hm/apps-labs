import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getLeadLanguage, normalizeLeadLocaleCode } from '@/lib/appslabs-lead-locale'

function buildMeetingLinkEmail({
  lead,
  meetingLink,
}: {
  lead: any
  meetingLink: string
}) {
  const localeCode = normalizeLeadLocaleCode(lead.client_locale)
  const locale = getLeadLanguage(localeCode)
  const isArabic = locale === 'ar'

  const dictionary = {
    en: {
      subject: 'Your Apps Labs Meeting Link',
      title: 'Your Meeting Link.',
      greeting: `Hi ${lead.name},`,
      intro: `Your discovery session is scheduled for <strong style="color: #1a1a17;">${lead.meeting_date} at ${lead.meeting_time}</strong>. Use the link below to join the meeting at the scheduled time.`,
      button: 'Join Meeting',
      fallback: 'If the button does not open, copy and paste this link into your browser:',
      footer: 'If you need to reschedule, reply to this email and we will help you adjust the meeting time.',
      rights: '&copy; 2026 Apps Labs. All rights reserved.',
    },
    ar: {
      subject: 'رابط اجتماعك مع Apps Labs',
      title: 'رابط الاجتماع.',
      greeting: `مرحباً ${lead.name}،`,
      intro: `تم تحديد جلستك الاستكشافية في <strong style="color: #1a1a17;">${lead.meeting_date} في ${lead.meeting_time}</strong>. استخدم الرابط التالي للانضمام إلى الاجتماع في الوقت المحدد.`,
      button: 'الانضمام إلى الاجتماع',
      fallback: 'إذا لم يعمل الزر، انسخ هذا الرابط والصقه في المتصفح:',
      footer: 'إذا كنت بحاجة إلى إعادة الجدولة، فقط قم بالرد على هذا البريد وسنساعدك في تعديل موعد الاجتماع.',
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
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center" bgcolor="#c17f3e" style="border-radius: 999px;">
                    <a href="${meetingLink}" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none;">
                      ${dictionary.button}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b685f; line-height: 1.7;">
                ${dictionary.fallback}
              </p>
              <p style="margin: 0 0 32px 0; padding: 16px 18px; background-color: #f7f4ee; border: 1px solid #e5e2dc; border-radius: 12px; font-size: 13px; color: #42413d; line-height: 1.6; word-break: break-all;">
                ${meetingLink}
              </p>
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
    const { leadId, email, meetingLink } = await req.json()
    const normalizedMeetingLink = typeof meetingLink === 'string' ? meetingLink.trim() : ''

    if (!normalizedMeetingLink) {
      throw new Error('Meeting link is required')
    }

    let parsedMeetingUrl: URL
    try {
      parsedMeetingUrl = new URL(normalizedMeetingLink)
    } catch {
      throw new Error('Meeting link must be a valid URL')
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const { data: lead, error } = await supabase
      .from('appslabs_leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (error || !lead) throw new Error('Lead not found')

    const meetingLinkEmail = buildMeetingLinkEmail({
      lead,
      meetingLink: parsedMeetingUrl.toString(),
    })

    const { error: emailError } = await supabase.functions.invoke('appslabs-email-sender', {
      body: {
        to: email,
        subject: meetingLinkEmail.subject,
        html: meetingLinkEmail.html,
      },
    })

    if (emailError) {
      console.error('Failed to send meeting link via edge function:', emailError)
      throw new Error('Failed to send meeting link email')
    }

    await supabase
      .from('appslabs_leads')
      .update({
        status: 'contacted',
        meeting_status: 'link_sent',
        meeting_link: parsedMeetingUrl.toString(),
      })
      .eq('id', leadId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

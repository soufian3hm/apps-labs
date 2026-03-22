import { NextRequest, NextResponse } from 'next/server'
import { formatDistanceToNowStrict } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { createClient } from '@/utils/supabase/server'
import { getLeadLanguage, normalizeLeadLocaleCode } from '@/lib/appslabs-lead-locale'

function buildReminderEmail({
  lead,
  countdownStr,
  meetingStatusLabel,
}: {
  lead: any
  countdownStr: string
  meetingStatusLabel: string
}) {
  const localeCode = normalizeLeadLocaleCode(lead.client_locale)
  const locale = getLeadLanguage(localeCode)
  const isArabic = locale === 'ar'

  const dictionary = {
    en: {
      subject: `Reminder: Strategy Call in ${countdownStr}`,
      title: 'Meeting Reminder.',
      greeting: `Hi ${lead.name},`,
      intro: `This is a reminder that your discovery session with Apps Labs is coming up on <strong style="color: #1a1a17;">${lead.meeting_date} at ${lead.meeting_time}</strong>.`,
      sessionDetails: 'Session Details',
      dateLabel: 'Date',
      timeLabel: 'Time',
      statusBody: 'Keep an eye on your inbox. Your meeting link will be sent separately before the call.',
      footer: 'If you need to reschedule, reply to this email and we will help you arrange a different time.',
      rights: '&copy; 2026 Apps Labs. All rights reserved.',
    },
    ar: {
      subject: `تذكير: مكالمتك مع Apps Labs خلال ${countdownStr}`,
      title: 'تذكير بالاجتماع.',
      greeting: `مرحباً ${lead.name}،`,
      intro: `هذا تذكير بأن جلستك الاستكشافية مع Apps Labs ستكون في <strong style="color: #1a1a17;">${lead.meeting_date} في ${lead.meeting_time}</strong>.`,
      sessionDetails: 'تفاصيل الجلسة',
      dateLabel: 'التاريخ',
      timeLabel: 'الوقت',
      statusBody: 'راقب بريدك الإلكتروني. سيتم إرسال رابط الاجتماع بشكل منفصل قبل المكالمة.',
      footer: 'إذا كنت بحاجة إلى إعادة الجدولة، فقط قم بالرد على هذا البريد وسنساعدك في اختيار وقت آخر.',
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
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td style="padding: 22px 24px; background-color: #f7f4ee; border: 1px solid #e5e2dc; border-radius: 14px;">
                    <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #a66a2e;">
                      ${meetingStatusLabel}
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #1a1a17;">
                      ${countdownStr}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b685f; line-height: 1.6;">
                      ${dictionary.statusBody}
                    </p>
                  </td>
                </tr>
              </table>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td style="padding: 20px 22px; background-color: #fcfbf8; border: 1px solid #ece7de; border-radius: 14px;">
                    <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #8a867d;">
                      ${dictionary.sessionDetails}
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 15px; color: #1a1a17;"><strong>${dictionary.dateLabel}:</strong> ${lead.meeting_date}</p>
                    <p style="margin: 0; font-size: 15px; color: #1a1a17;"><strong>${dictionary.timeLabel}:</strong> ${lead.meeting_time}</p>
                  </td>
                </tr>
              </table>
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
    const { leadId, email } = await req.json()
    const normalizedEmail = typeof email === 'string' ? email.trim() : ''

    if (!leadId) {
      throw new Error('Lead ID is required')
    }

    if (!normalizedEmail) {
      throw new Error('Email is required')
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

    const isArabic = getLeadLanguage(lead.client_locale) === 'ar'
    let countdownStr = isArabic ? 'قريباً' : 'soon'
    let meetingStatusLabel = isArabic ? 'الموعد القادم' : 'Upcoming Session'
    if (lead.meeting_timestamp) {
      const meetDate = new Date(lead.meeting_timestamp)
      if (!Number.isNaN(meetDate.getTime())) {
        if (meetDate > new Date()) {
          countdownStr = formatDistanceToNowStrict(meetDate, {
            locale: isArabic ? ar : enUS,
          })
        } else {
          countdownStr = isArabic ? 'الآن' : 'right now'
          meetingStatusLabel = isArabic ? 'وقت الجلسة' : 'Session Time'
        }
      }
    }

    const reminderEmail = buildReminderEmail({
      lead,
      countdownStr,
      meetingStatusLabel,
    })

    const { error: emailError } = await supabase.functions.invoke('appslabs-email-sender', {
      body: {
        to: normalizedEmail,
        subject: reminderEmail.subject,
        html: reminderEmail.html,
      },
    })

    if (emailError) {
      console.error('Failed to send reminder via edge function:', emailError)
      throw new Error('Failed to send reminder email')
    }

    await supabase
      .from('appslabs_leads')
      .update({
        status: 'contacted',
        meeting_status: 'reminder_sent',
      })
      .eq('id', leadId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

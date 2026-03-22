import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { formatMeetingStrings, getSafeTimeZone, zonedDateTimeToUtc } from '@/lib/appslabs-meetings'
import { getLeadLanguage } from '@/lib/appslabs-lead-locale'

const VALID_MEETING_STATUSES = new Set([
  'scheduled',
  'reminder_sent',
  'link_sent',
  'completed',
  'cancelled',
  'no_show',
])

type LeadRecord = {
  id: string
  name: string
  email: string
  company: string | null
  whatsapp: string
  budget: string
  project_type: string
  message: string
  meeting_date: string
  meeting_time: string
  meeting_timestamp: string
  meeting_timezone?: string | null
  meeting_status?: string | null
  meeting_link?: string | null
  source_label?: string | null
  assignee_email?: string | null
  client_locale?: string | null
  notes?: string | null
  column_id?: string | null
}

function getLeadLocale(value: string | null | undefined) {
  return getLeadLanguage(value)
}

function buildStatusEmailHtml(type: 'rescheduled' | 'cancelled', lead: LeadRecord) {
  const locale = getLeadLocale(lead.client_locale)
  const isArabic = locale === 'ar'

  const dictionary = {
    en: {
      subject: type === 'rescheduled' ? 'Your Apps Labs call has been rescheduled' : 'Your Apps Labs call has been cancelled',
      title: type === 'rescheduled' ? 'Meeting Updated.' : 'Meeting Cancelled.',
      intro:
        type === 'rescheduled'
          ? `Your discovery session with Apps Labs has been moved to <strong style="color: #1a1a17;">${lead.meeting_date} at ${lead.meeting_time}</strong>.`
          : 'Your discovery session with Apps Labs has been cancelled for now.',
      detailLabel: type === 'rescheduled' ? 'New Session Time' : 'Cancelled Session',
      footer:
        type === 'rescheduled'
          ? 'If you need a different time, reply to this email and we will help you adjust it.'
          : 'Reply to this email whenever you are ready to schedule another time.',
    },
    ar: {
      subject: type === 'rescheduled' ? 'تمت إعادة جدولة مكالمتك مع Apps Labs' : 'تم إلغاء مكالمتك مع Apps Labs',
      title: type === 'rescheduled' ? 'تم تحديث الاجتماع.' : 'تم إلغاء الاجتماع.',
      intro:
        type === 'rescheduled'
          ? `تم نقل جلستك الاستكشافية مع Apps Labs إلى <strong style="color: #1a1a17;">${lead.meeting_date} في ${lead.meeting_time}</strong>.`
          : 'تم إلغاء جلستك الاستكشافية مع Apps Labs حالياً.',
      detailLabel: type === 'rescheduled' ? 'الموعد الجديد' : 'الاجتماع الملغى',
      footer:
        type === 'rescheduled'
          ? 'إذا كنت بحاجة إلى وقت مختلف، يمكنك الرد على هذا البريد وسنساعدك في تحديد موعد جديد.'
          : 'يمكنك الرد على هذا البريد في أي وقت عندما تكون جاهزاً لتحديد موعد آخر.',
    },
  }[locale]

  return {
    subject: dictionary.subject,
    html: `
<!DOCTYPE html>
<html ${isArabic ? 'dir="rtl"' : ''}>
<head></head>
<body style="margin: 0; padding: 40px 20px; background-color: #fafaf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf7;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e2dc; overflow: hidden;">
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #f0ede8;">
              <h1 style="margin: 0; font-size: 32px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">Apps Labs</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 28px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">${dictionary.title}</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #42413d; line-height: 1.7;">
                ${isArabic ? `مرحباً ${lead.name}،` : `Hi ${lead.name},`}<br/><br/>
                ${dictionary.intro}
              </p>
              <div style="margin: 0 0 24px 0; border: 1px solid #ece7de; background-color: #fcfbf8; border-radius: 14px; padding: 20px 22px;">
                <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #8a867d;">
                  ${dictionary.detailLabel}
                </p>
                <p style="margin: 0; font-size: 15px; color: #1a1a17;">
                  ${type === 'rescheduled' ? `${lead.meeting_date} | ${lead.meeting_time}` : `${lead.meeting_date} | ${lead.meeting_time}`}
                </p>
              </div>
              <div style="border-top: 1px solid #f0ede8; padding-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #a3a19c; line-height: 1.6;">
                  ${dictionary.footer}
                </p>
              </div>
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      leadId,
      sourceLabel,
      assigneeEmail,
      notes,
      meetingStatus,
      meetingLink,
      columnId,
      notifyClient,
      reschedule,
    } = body

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existingLead, error: existingLeadError } = await supabase
      .from('appslabs_leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (existingLeadError || !existingLead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}

    if (typeof sourceLabel === 'string') {
      updates.source_label = sourceLabel.trim() || 'website'
    }

    if (typeof assigneeEmail === 'string') {
      updates.assignee_email = assigneeEmail.trim() || null
    }

    if (typeof notes === 'string') {
      updates.notes = notes
    }

    if (typeof meetingStatus === 'string') {
      if (!VALID_MEETING_STATUSES.has(meetingStatus)) {
        return NextResponse.json({ error: 'Invalid meeting status.' }, { status: 400 })
      }
      updates.meeting_status = meetingStatus
    }

    if (typeof columnId === 'string') {
      updates.column_id = columnId || null
    }

    if (typeof meetingLink === 'string') {
      const trimmedLink = meetingLink.trim()
      if (!trimmedLink) {
        updates.meeting_link = null
      } else {
        try {
          const parsedLink = new URL(trimmedLink)
          updates.meeting_link = parsedLink.toString()
        } catch {
          return NextResponse.json({ error: 'Meeting link must be a valid URL.' }, { status: 400 })
        }
      }
    }

    if (reschedule) {
      const normalizedTimeZone = getSafeTimeZone(reschedule.meetingTimezone || existingLead.meeting_timezone || 'UTC')
      const meetingDateInput = typeof reschedule.meetingDate === 'string' ? reschedule.meetingDate : ''
      const meetingTimeInput = typeof reschedule.meetingTime === 'string' ? reschedule.meetingTime : ''
      const meetingTimestamp = zonedDateTimeToUtc(meetingDateInput, meetingTimeInput, normalizedTimeZone)

      if (Number.isNaN(meetingTimestamp.getTime())) {
        return NextResponse.json({ error: 'Invalid meeting date or time.' }, { status: 400 })
      }

      const locale = getLeadLocale(existingLead.client_locale)
      const formatted = formatMeetingStrings(meetingTimestamp, locale, normalizedTimeZone)

      updates.meeting_timestamp = meetingTimestamp.toISOString()
      updates.meeting_timezone = normalizedTimeZone
      updates.meeting_date = formatted.meetingDate
      updates.meeting_time = formatted.meetingTime
      updates.meeting_status = 'scheduled'
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No changes submitted.' }, { status: 400 })
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from('appslabs_leads')
      .update(updates)
      .eq('id', leadId)
      .select('*')
      .single()

    if (updateError || !updatedLead) {
      return NextResponse.json({ error: updateError?.message || 'Failed to update lead.' }, { status: 500 })
    }

    const shouldNotify = Boolean(notifyClient)
    const nextLead = updatedLead as LeadRecord

    if (shouldNotify && reschedule) {
      const emailPayload = buildStatusEmailHtml('rescheduled', nextLead)
      const { error: emailError } = await supabase.functions.invoke('appslabs-email-sender', {
        body: {
          to: nextLead.email,
          subject: emailPayload.subject,
          html: emailPayload.html,
        },
      })

      if (emailError) {
        return NextResponse.json({ error: 'Lead updated, but the reschedule email failed to send.' }, { status: 500 })
      }

      await supabase.from('appslabs_email_logs').insert({
        lead_id: leadId,
        email_type: 'rescheduled',
        meta: {
          meeting_timestamp: nextLead.meeting_timestamp,
          meeting_timezone: nextLead.meeting_timezone || 'UTC',
        },
      })
    }

    if (shouldNotify && updates.meeting_status === 'cancelled') {
      const emailPayload = buildStatusEmailHtml('cancelled', nextLead)
      const { error: emailError } = await supabase.functions.invoke('appslabs-email-sender', {
        body: {
          to: nextLead.email,
          subject: emailPayload.subject,
          html: emailPayload.html,
        },
      })

      if (emailError) {
        return NextResponse.json({ error: 'Lead updated, but the cancellation email failed to send.' }, { status: 500 })
      }

      await supabase.from('appslabs_email_logs').insert({
        lead_id: leadId,
        email_type: 'cancelled',
        meta: {
          meeting_timestamp: nextLead.meeting_timestamp,
          meeting_timezone: nextLead.meeting_timezone || 'UTC',
        },
      })
    }

    return NextResponse.json({ success: true, lead: updatedLead })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unexpected admin lead update failure.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { formatDistanceToNowStrict } from 'date-fns'
// Using custom Supabase edge function now

export async function POST(req: NextRequest) {
  try {
    const { leadId, email } = await req.json()
    const supabase = await createClient()

    // 1. Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    // 2. Get lead info
    const { data: lead, error } = await supabase
      .from('appslabs_leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (error || !lead) throw new Error('Lead not found')

    // Generate countdown relative to now
    let countdownStr = 'soon'
    if (lead.meeting_timestamp) {
      const meetDate = new Date(lead.meeting_timestamp)
      if (meetDate > new Date()) {
        countdownStr = formatDistanceToNowStrict(meetDate)
      } else {
        countdownStr = 'right now'
      }
    }

    // 3. Send Reminder Email
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #fafaf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf7;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e2dc; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.02); text-align: left;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #f0ede8;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: -0.5px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">Apps Labs</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 28px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">Meeting Reminder.</h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #42413d; line-height: 1.6;">
                Hi ${lead.name},<br/><br/>
                This is a friendly reminder for our upcoming discovery session scheduled for <strong style="color: #1a1a17;">${lead.meeting_date} at ${lead.meeting_time}</strong>.
              </p>
              
              <!-- Countdown Pill -->
              <div style="background-color: #f5e6d3; border: 1px solid rgba(193, 127, 62, 0.2); border-radius: 999px; padding: 14px 24px; margin-bottom: 32px; display: inline-block;">
                <span style="color: #c17f3e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Starting in 
                </span>
                <span style="color: #a66a2e; font-size: 15px; font-weight: 700; margin-left: 6px;">
                  &#x23F2; ${countdownStr}
                </span>
              </div>

              <p style="margin: 0 0 32px 0; font-size: 16px; color: #42413d; line-height: 1.6;">
                Please check your inbox for the Google Meet link (sent automatically 30 minutes before the call).
              </p>
              
              <div style="border-top: 1px solid #f0ede8; padding-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #a3a19c; line-height: 1.6;">
                  If you need to reschedule, please let us know by replying to this email. See you shortly!
                </p>
              </div>
            </td>
          </tr>

        </table>
        
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 32px auto 0; text-align: center;">
          <tr>
            <td>
              <p style="margin: 0; font-size: 13px; color: #a3a19c;">&copy; 2026 Apps Labs. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Call edge function to deliver reminder email
    const { error: emailError } = await supabase.functions.invoke('appslabs-email-sender', {
      body: {
        to: email,
        subject: `Reminder: Strategy Call in ${countdownStr}`,
        html: emailHtml,
      }
    })

    if (emailError) {
      console.error('Failed to send reminder via edge function:', emailError)
    }

    // 4. Update status tracking if needed (optional)
    await supabase.from('appslabs_leads').update({ status: 'contacted' }).eq('id', leadId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

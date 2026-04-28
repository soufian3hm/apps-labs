import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
// We removed Resend in favor of edge function

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const supabase = await createClient()

    // Parse meeting timestamp
    const dateObj = new Date(data.meeting_raw_date)
    const [hours, minutes] = data.meeting_time.split(':')
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

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
          meeting_date: data.meeting_date_str,
          meeting_time: data.meeting_time,
          meeting_timestamp: dateObj.toISOString(),
        }
      ])
      .select()
      .single()

    if (error) throw error

    // Send confirmation email
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
              <h2 style="margin: 0 0 24px 0; font-size: 28px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">Request Received.</h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #42413d; line-height: 1.6;">
                Hi \${data.name},<br/><br/>
                Thank you for your interest! We have successfully received your project details and scheduled your discovery call for <strong style="color: #1a1a17;">\${data.meeting_date_str} at \${data.meeting_time}</strong>.
              </p>
              
              <div style="background-color: #f5e6d3; border: 1px solid rgba(193, 127, 62, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; color: #c17f3e; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Important</p>
                <p style="margin: 0; color: #a66a2e; font-size: 15px; font-weight: 500; line-height: 1.5;">You will receive the meeting link automatically before the meet by around 30 minutes.</p>
              </div>
              
              <div style="border-top: 1px solid #f0ede8; padding-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #a3a19c; line-height: 1.6;">
                  We look forward to speaking with you soon and mapping out your system.
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

    // Call out to Supabase Edge Function to deliver email manually via SMTP
    const { data: emailData, error: emailError } = await supabase.functions.invoke('appslabs-email-sender', {
      body: {
        to: data.email,
        subject: 'Your Strategy Call with Apps Labs is Scheduled',
        html: emailHtml,
      }
    })

    if (emailError) {
      console.error('Edge Function Email Delivery failed:', emailError)
    }

    return NextResponse.json({ success: true, lead })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

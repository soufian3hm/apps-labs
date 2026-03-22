import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import nodemailer from 'npm:nodemailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'soufian3hm@gmail.com'

type AdminNotification = {
  name?: string
  company?: string
  email?: string
  whatsapp?: string
  budget?: string
  projectType?: string
  message?: string
  meetingDate?: string
  meetingTime?: string
  meetingTimezone?: string
  clientMeetingDate?: string
  clientMeetingTime?: string
  clientMeetingTimezone?: string
}

function buildAdminLeadEmail(notification: AdminNotification) {
  return `
<!DOCTYPE html>
<html>
<head>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #fafaf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafaf7;">
    <tr>
      <td align="center">
        <table width="100%" max-width="640" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e2dc; overflow: hidden; text-align: left;">
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #f0ede8;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #c17f3e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">New Lead Booked</p>
              <h1 style="margin: 0; font-size: 30px; letter-spacing: -0.5px; color: #1a1a17; font-family: Georgia, serif; font-weight: normal;">A new session has been booked.</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #42413d; line-height: 1.6;">
                ${notification.name || 'A visitor'} has submitted a lead and booked a discovery session for <strong style="color: #1a1a17;">${notification.meetingDate || 'Unknown date'} at ${notification.meetingTime || 'Unknown time'}</strong>${notification.meetingTimezone ? ` <span style="color: #8a867d; font-weight: 600;">(${notification.meetingTimezone})</span>` : ''}.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600; width: 180px;">Name</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;">${notification.name || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600;">Company</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;">${notification.company || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600;">Email</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;"><a href="mailto:${notification.email || ''}" style="color: #1a1a17; text-decoration: none;">${notification.email || 'Not provided'}</a></td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600;">WhatsApp</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;">${notification.whatsapp || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600;">Project Type</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;">${notification.projectType || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600;">Budget</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;">${notification.budget || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600;">Meeting</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;">${notification.meetingDate || 'Unknown date'} at ${notification.meetingTime || 'Unknown time'}${notification.meetingTimezone ? ` (${notification.meetingTimezone})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600;">Client Local Time</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; font-size: 15px; color: #1a1a17;">${notification.clientMeetingDate || notification.meetingDate || 'Unknown date'} at ${notification.clientMeetingTime || notification.meetingTime || 'Unknown time'}${notification.clientMeetingTimezone ? ` (${notification.clientMeetingTimezone})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; border-bottom: 1px solid #f0ede8; font-size: 14px; color: #a66a2e; font-weight: 600; vertical-align: top;">Message</td>
                  <td style="padding: 14px 0; border-top: 1px solid #f0ede8; border-bottom: 1px solid #f0ede8; font-size: 15px; color: #1a1a17; line-height: 1.6;">${notification.message || 'Not provided'}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, adminNotification, adminNotificationEmail } = await req.json()

    // Create reusable transporter object using manual SMTP configuration
    // These keys must be set in your Supabase project Vault/Secrets
    const transporter = nodemailer.createTransport({
      host: Deno.env.get('SMTP_HOST') || 'mail.spacemail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: Deno.env.get('SMTP_USER') || 'hello@apps-labs.co',
        pass: Deno.env.get('SMTP_PASS'),
      },
    })

    const primaryInfo = await transporter.sendMail({
      from: '"Apps Labs" <hello@apps-labs.co>', 
      to,
      subject,
      html,
    })

    let adminMessageId: string | null = null

    if (adminNotification) {
      const adminInfo = await transporter.sendMail({
        from: '"Apps Labs" <hello@apps-labs.co>',
        to: adminNotificationEmail || ADMIN_EMAIL,
        subject: `New session booked by ${adminNotification.name || 'New lead'}`,
        html: buildAdminLeadEmail(adminNotification),
      })

      adminMessageId = adminInfo.messageId
    }

    return new Response(JSON.stringify({ success: true, messageId: primaryInfo.messageId, adminMessageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

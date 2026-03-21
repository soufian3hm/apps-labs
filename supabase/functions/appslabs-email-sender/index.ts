import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import nodemailer from 'npm:nodemailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

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

    // Send the email
    const info = await transporter.sendMail({
      from: '"Apps Labs" <hello@apps-labs.co>', 
      to,
      subject,
      html,
    })

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
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

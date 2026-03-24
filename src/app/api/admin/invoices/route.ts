import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  APPSLABS_INVOICE_STATUSES,
  buildInvoiceNumber,
  calculateInvoiceSubtotal,
  normalizeInvoiceLineItems,
  normalizeInvoiceStatus,
} from '@/lib/appslabs-invoices'
import { normalizeLeadLocaleCode } from '@/lib/appslabs-lead-locale'

type LeadRecord = {
  id: string
  name: string
  email: string
  company: string | null
  client_locale?: string | null
}

function isValidDateInput(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { supabase, user }
}

async function getLead(supabase: Awaited<ReturnType<typeof createClient>>, leadId: string | null | undefined) {
  if (!leadId) return null

  const { data } = await supabase
    .from('appslabs_leads')
    .select('id, name, email, company, client_locale')
    .eq('id', leadId)
    .single()

  return (data as LeadRecord | null) || null
}

function buildInvoicePayload(body: any, lead: LeadRecord | null, existingNumber?: string) {
  const lineItems = normalizeInvoiceLineItems(body.lineItems)
  if (lineItems.length === 0) {
    throw new Error('Add at least one invoice line item.')
  }

  const clientName = typeof body.clientName === 'string' && body.clientName.trim()
    ? body.clientName.trim()
    : lead?.name || ''
  const clientEmail = typeof body.clientEmail === 'string' && body.clientEmail.trim()
    ? body.clientEmail.trim()
    : lead?.email || ''
  const clientCompany = typeof body.clientCompany === 'string' && body.clientCompany.trim()
    ? body.clientCompany.trim()
    : lead?.company || null
  const title = typeof body.title === 'string' && body.title.trim()
    ? body.title.trim()
    : 'Project Invoice'
  const status = typeof body.status === 'string' ? normalizeInvoiceStatus(body.status) : 'sent'
  const issueDate = isValidDateInput(body.issueDate) ? body.issueDate : new Date().toISOString().slice(0, 10)
  const dueDate = isValidDateInput(body.dueDate) ? body.dueDate : issueDate
  const currencyCode =
    typeof body.currencyCode === 'string' && body.currencyCode.trim()
      ? body.currencyCode.trim().toUpperCase().slice(0, 3)
      : 'USD'
  const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null
  const subtotal = calculateInvoiceSubtotal(lineItems)

  if (!clientName) throw new Error('Client name is required.')
  if (!clientEmail) throw new Error('Client email is required.')
  if (!currencyCode || currencyCode.length !== 3) throw new Error('Currency code must be a 3-letter code.')
  if (!APPSLABS_INVOICE_STATUSES.includes(status)) throw new Error('Invalid invoice status.')

  return {
    lead_id: lead?.id || null,
    invoice_number:
      typeof body.invoiceNumber === 'string' && body.invoiceNumber.trim()
        ? body.invoiceNumber.trim().toUpperCase()
        : existingNumber || buildInvoiceNumber(),
    title,
    status,
    client_name: clientName,
    client_email: clientEmail,
    client_company: clientCompany,
    client_locale: normalizeLeadLocaleCode(body.clientLocale || lead?.client_locale),
    currency_code: currencyCode,
    issue_date: issueDate,
    due_date: dueDate,
    line_items: lineItems,
    subtotal_amount: subtotal,
    total_amount: subtotal,
    notes,
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if ('error' in admin) return admin.error

    const body = await req.json()
    const lead = await getLead(admin.supabase, typeof body.leadId === 'string' ? body.leadId : null)
    const payload = buildInvoicePayload(body, lead)

    const { data, error } = await admin.supabase
      .from('appslabs_invoices')
      .insert({
        ...payload,
        created_by: admin.user.id,
      })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create invoice.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, invoice: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unexpected invoice creation failure.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if ('error' in admin) return admin.error

    const body = await req.json()
    const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId : ''

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required.' }, { status: 400 })
    }

    const { data: existingInvoice, error: existingError } = await admin.supabase
      .from('appslabs_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (existingError || !existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }

    const nextLeadId =
      typeof body.leadId === 'string'
        ? body.leadId
        : (existingInvoice.lead_id as string | null | undefined)

    const lead = await getLead(admin.supabase, nextLeadId)
    const payload = buildInvoicePayload(body, lead, existingInvoice.invoice_number as string)

    const { data, error } = await admin.supabase
      .from('appslabs_invoices')
      .update(payload)
      .eq('id', invoiceId)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to update invoice.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, invoice: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unexpected invoice update failure.' }, { status: 500 })
  }
}

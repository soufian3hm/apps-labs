'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AppslabsInvoiceRecord,
  formatInvoiceAmount,
  formatInvoiceDate,
  formatMinorUnitsInput,
  normalizeInvoiceLineItems,
  parseMoneyInputToMinorUnits,
} from '@/lib/appslabs-invoices'

type LeadSummary = {
  id: string
  name: string
  email: string
  company: string | null
  project_type: string
  budget: string
  client_locale: string
  created_at: string
}

type InvoiceLineForm = {
  id: string
  description: string
  quantity: string
  unitPrice: string
}

type InvoiceForm = {
  leadId: string
  invoiceNumber: string
  title: string
  status: 'draft' | 'sent' | 'paid' | 'void'
  clientName: string
  clientEmail: string
  clientCompany: string
  clientLocale: 'AR' | 'EN'
  currencyCode: string
  issueDate: string
  dueDate: string
  notes: string
  lineItems: InvoiceLineForm[]
}

const todayString = () => new Date().toISOString().slice(0, 10)

const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function createLineItem(): InvoiceLineForm {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: '1',
    unitPrice: '0.00',
  }
}

function createEmptyForm(): InvoiceForm {
  return {
    leadId: '',
    invoiceNumber: '',
    title: 'Project Invoice',
    status: 'sent',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    clientLocale: 'EN',
    currencyCode: 'USD',
    issueDate: todayString(),
    dueDate: addDays(7),
    notes: '',
    lineItems: [createLineItem()],
  }
}

function buildFormFromInvoice(invoice: AppslabsInvoiceRecord): InvoiceForm {
  const lineItems = normalizeInvoiceLineItems(invoice.line_items)

  return {
    leadId: invoice.lead_id || '',
    invoiceNumber: invoice.invoice_number,
    title: invoice.title,
    status: invoice.status,
    clientName: invoice.client_name,
    clientEmail: invoice.client_email,
    clientCompany: invoice.client_company || '',
    clientLocale: invoice.client_locale === 'AR' ? 'AR' : 'EN',
    currencyCode: invoice.currency_code || 'USD',
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    notes: invoice.notes || '',
    lineItems:
      lineItems.length > 0
        ? lineItems.map((item) => ({
            id: crypto.randomUUID(),
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: formatMinorUnitsInput(item.unit_price),
          }))
        : [createLineItem()],
  }
}

function getStatusClasses(status: AppslabsInvoiceRecord['status']) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'sent':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'void':
      return 'bg-red-100 text-red-600 border-red-200'
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200'
  }
}

export default function InvoicesView({
  locale,
  initialLeads,
  initialInvoices,
}: {
  locale: string
  initialLeads: LeadSummary[]
  initialInvoices: AppslabsInvoiceRecord[]
}) {
  const isArabic = locale === 'ar'
  const copy = isArabic
    ? {
        pageTag: 'الفوترة',
        pageTitle: 'فواتير العملاء',
        pageBody: 'أنشئ فاتورة من لوحة الإدارة ثم شارك رابط /invoice/uuid مباشرة مع العميل لبدء المشروع.',
        newInvoice: 'فاتورة جديدة',
        existingInvoices: 'الفواتير الحالية',
        emptyList: 'لا توجد فواتير بعد.',
        draftNotice: 'رابط الفاتورة يعمل مباشرة بعد الحفظ. اجعل الحالة "ملغاة" فقط إذا أردت إيقاف الصفحة العامة.',
        leadLabel: 'العميل المرتبط',
        invoiceNumber: 'رقم الفاتورة',
        title: 'عنوان الفاتورة',
        status: 'الحالة',
        clientName: 'اسم العميل',
        clientEmail: 'بريد العميل',
        clientCompany: 'الشركة',
        clientLocale: 'لغة العميل',
        currency: 'العملة',
        issueDate: 'تاريخ الإصدار',
        dueDate: 'تاريخ الاستحقاق',
        lineItems: 'البنود',
        description: 'الوصف',
        quantity: 'الكمية',
        addItem: 'إضافة بند',
        remove: 'حذف',
        notes: 'ملاحظات',
        notesPlaceholder: 'أضف أي ملاحظات أو شروط بدء العمل هنا.',
        totals: 'الإجمالي',
        subtotal: 'المجموع',
        publicLink: 'الرابط العام',
        copyLink: 'نسخ الرابط',
        copied: 'تم النسخ',
        openInvoice: 'فتح الفاتورة',
        createInvoice: 'إنشاء الفاتورة',
        saveChanges: 'حفظ التغييرات',
        saving: 'جارٍ الحفظ...',
        selectLead: 'اختر عميلاً',
        english: 'English',
        arabic: 'العربية',
        draft: 'مسودة',
        sent: 'مرسلة',
        paid: 'مدفوعة',
        void: 'ملغاة',
        invoiceReady: 'رابط الفاتورة جاهز للإرسال.',
        createHint: 'اختر عميلاً ثم ابنِ الفاتورة من البنود أدناه.',
      }
    : {
        pageTag: 'Invoicing',
        pageTitle: 'Client Invoices',
        pageBody: 'Create the invoice in admin, then share the `/invoice/uuid` link directly with the client to start the project.',
        newInvoice: 'New Invoice',
        existingInvoices: 'Existing Invoices',
        emptyList: 'No invoices created yet.',
        draftNotice: 'The invoice link works as soon as you save it. Use void only if you want to disable the public page.',
        leadLabel: 'Linked lead',
        invoiceNumber: 'Invoice number',
        title: 'Invoice title',
        status: 'Status',
        clientName: 'Client name',
        clientEmail: 'Client email',
        clientCompany: 'Company',
        clientLocale: 'Client locale',
        currency: 'Currency',
        issueDate: 'Issue date',
        dueDate: 'Due date',
        lineItems: 'Line items',
        description: 'Description',
        quantity: 'Qty',
        addItem: 'Add item',
        remove: 'Remove',
        notes: 'Notes',
        notesPlaceholder: 'Add kickoff notes, terms, or next-step instructions here.',
        totals: 'Totals',
        subtotal: 'Subtotal',
        publicLink: 'Public link',
        copyLink: 'Copy link',
        copied: 'Copied',
        openInvoice: 'Open invoice',
        createInvoice: 'Create invoice',
        saveChanges: 'Save changes',
        saving: 'Saving...',
        selectLead: 'Select a lead',
        english: 'English',
        arabic: 'Arabic',
        draft: 'Draft',
        sent: 'Sent',
        paid: 'Paid',
        void: 'Void',
        invoiceReady: 'The invoice link is ready to send.',
        createHint: 'Pick a lead, then build the invoice with the line items below.',
      }

  const [invoices, setInvoices] = useState<AppslabsInvoiceRecord[]>(initialInvoices)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(initialInvoices[0]?.id || null)
  const [creatingNew, setCreatingNew] = useState(initialInvoices.length === 0)
  const [form, setForm] = useState<InvoiceForm>(
    initialInvoices[0] ? buildFormFromInvoice(initialInvoices[0]) : createEmptyForm()
  )
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId]
  )

  const selectedLead = useMemo(
    () => initialLeads.find((lead) => lead.id === form.leadId) || null,
    [form.leadId, initialLeads]
  )

  useEffect(() => {
    if (creatingNew) return
    if (!selectedInvoice) return
    setForm(buildFormFromInvoice(selectedInvoice))
  }, [creatingNew, selectedInvoice])

  const subtotalAmount = useMemo(
    () =>
      form.lineItems.reduce((total, item) => {
        const quantity = Number(item.quantity)
        const unitPrice = parseMoneyInputToMinorUnits(item.unitPrice)
        if (!Number.isFinite(quantity) || quantity <= 0) return total
        return total + Math.round(quantity * unitPrice)
      }, 0),
    [form.lineItems]
  )

  const publicUrl =
    selectedInvoice && typeof window !== 'undefined'
      ? `${window.location.origin}/invoice/${selectedInvoice.id}`
      : selectedInvoice
        ? `/invoice/${selectedInvoice.id}`
        : ''

  const invoiceCounts = useMemo(
    () => ({
      total: invoices.length,
      sent: invoices.filter((invoice) => invoice.status === 'sent').length,
      paid: invoices.filter((invoice) => invoice.status === 'paid').length,
    }),
    [invoices]
  )

  const handleLeadChange = (leadId: string) => {
    const lead = initialLeads.find((item) => item.id === leadId)

    setForm((current) => ({
      ...current,
      leadId,
      clientName: lead?.name || current.clientName,
      clientEmail: lead?.email || current.clientEmail,
      clientCompany: lead?.company || '',
      clientLocale: lead?.client_locale === 'AR' ? 'AR' : 'EN',
      title:
        lead && (!current.title || current.title === 'Project Invoice')
          ? `${lead.project_type} Project Invoice`
          : current.title,
    }))
  }

  const upsertInvoice = (invoice: AppslabsInvoiceRecord) => {
    setInvoices((current) => {
      const next = current.filter((item) => item.id !== invoice.id)
      return [invoice, ...next].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
    setSelectedInvoiceId(invoice.id)
    setCreatingNew(false)
    setForm(buildFormFromInvoice(invoice))
  }

  const handleCreateNew = () => {
    setCreatingNew(true)
    setSelectedInvoiceId(null)
    setForm(createEmptyForm())
  }

  const handleSave = async () => {
    setSaving(true)
    setCopied(false)

    try {
      const payload = {
        invoiceId: selectedInvoice?.id,
        leadId: form.leadId || null,
        invoiceNumber: form.invoiceNumber,
        title: form.title,
        status: form.status,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientCompany: form.clientCompany,
        clientLocale: form.clientLocale,
        currencyCode: form.currencyCode,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        notes: form.notes,
        lineItems: form.lineItems.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: parseMoneyInputToMinorUnits(item.unitPrice),
        })),
      }

      const response = await fetch('/api/admin/invoices', {
        method: creatingNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to save invoice.')

      upsertInvoice(result.invoice as AppslabsInvoiceRecord)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = async () => {
    if (!selectedInvoice) return

    const value = typeof window !== 'undefined' ? `${window.location.origin}/invoice/${selectedInvoice.id}` : `/invoice/${selectedInvoice.id}`
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="min-h-full space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.06)] lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">{copy.pageTag}</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-fg lg:text-4xl">{copy.pageTitle}</h1>
            <p className="mt-3 text-sm leading-6 text-fg-muted">{copy.pageBody}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-[24px] border border-edge bg-white/90 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">Total</p>
              <p className="mt-2 text-2xl font-black text-fg">{invoiceCounts.total}</p>
            </div>
            <div className="rounded-[24px] border border-edge bg-white/90 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.sent}</p>
              <p className="mt-2 text-2xl font-black text-fg">{invoiceCounts.sent}</p>
            </div>
            <div className="rounded-[24px] border border-edge bg-white/90 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.paid}</p>
              <p className="mt-2 text-2xl font-black text-fg">{invoiceCounts.paid}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[30px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.98))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.05)] lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">{copy.existingInvoices}</p>
              <p className="mt-1 text-sm text-fg-muted">{copy.draftNotice}</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="rounded-2xl bg-fg px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-bg"
            >
              {copy.newInvoice}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {invoices.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-edge bg-bg-alt/30 p-5 text-sm text-fg-muted">
                {copy.emptyList}
              </div>
            ) : (
              invoices.map((invoice) => (
                <button
                  key={invoice.id}
                  onClick={() => {
                    setCreatingNew(false)
                    setSelectedInvoiceId(invoice.id)
                  }}
                  className={`w-full rounded-[24px] border p-4 text-left transition-colors ${
                    selectedInvoiceId === invoice.id && !creatingNew
                      ? 'border-fg bg-fg text-bg'
                      : 'border-edge bg-white/90 text-fg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{invoice.client_name}</p>
                      <p className={`mt-1 truncate text-xs ${selectedInvoiceId === invoice.id && !creatingNew ? 'text-white/70' : 'text-fg-muted'}`}>
                        {invoice.title}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                      selectedInvoiceId === invoice.id && !creatingNew
                        ? 'border-white/15 bg-white/10 text-white'
                        : getStatusClasses(invoice.status)
                    }`}>
                      {copy[invoice.status]}
                    </span>
                  </div>

                  <div className={`mt-4 flex items-center justify-between gap-3 text-[11px] font-semibold ${
                    selectedInvoiceId === invoice.id && !creatingNew ? 'text-white/75' : 'text-fg-tertiary'
                  }`}>
                    <span>{invoice.invoice_number}</span>
                    <span>{formatInvoiceAmount(invoice.total_amount, invoice.currency_code, invoice.client_locale)}</span>
                  </div>
                  <p className={`mt-2 text-[11px] ${selectedInvoiceId === invoice.id && !creatingNew ? 'text-white/60' : 'text-fg-tertiary'}`}>
                    {formatInvoiceDate(invoice.due_date, invoice.client_locale)}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-[30px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,244,238,0.96))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.06)] lg:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
              <div className="rounded-[24px] border border-edge bg-white/90 p-4 lg:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">{copy.pageTag}</p>
                    <h2 className="mt-2 text-2xl font-black text-fg">{creatingNew ? copy.newInvoice : form.invoiceNumber || copy.pageTitle}</h2>
                    <p className="mt-2 text-sm text-fg-muted">{creatingNew ? copy.createHint : copy.invoiceReady}</p>
                  </div>
                  {!creatingNew && selectedInvoice && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="rounded-2xl border border-edge bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-fg"
                      >
                        {copied ? copy.copied : copy.copyLink}
                      </button>
                      <a
                        href={`/invoice/${selectedInvoice.id}`}
                        target="_blank"
                        className="rounded-2xl bg-fg px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-bg"
                      >
                        {copy.openInvoice}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.leadLabel}</label>
                  <select
                    value={form.leadId}
                    onChange={(e) => handleLeadChange(e.target.value)}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  >
                    <option value="">{copy.selectLead}</option>
                    {initialLeads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} {lead.company ? `• ${lead.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.invoiceNumber}</label>
                  <input
                    value={form.invoiceNumber}
                    onChange={(e) => setForm((current) => ({ ...current, invoiceNumber: e.target.value }))}
                    placeholder="AL-20260322-ABCD"
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  />
                </div>

                <div className="rounded-[24px] border border-edge bg-white/90 p-4 md:col-span-2">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.title}</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.clientName}</label>
                  <input
                    value={form.clientName}
                    onChange={(e) => setForm((current) => ({ ...current, clientName: e.target.value }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  />
                </div>
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.clientEmail}</label>
                  <input
                    value={form.clientEmail}
                    onChange={(e) => setForm((current) => ({ ...current, clientEmail: e.target.value }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  />
                </div>
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.clientCompany}</label>
                  <input
                    value={form.clientCompany}
                    onChange={(e) => setForm((current) => ({ ...current, clientCompany: e.target.value }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  />
                </div>
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.clientLocale}</label>
                  <select
                    value={form.clientLocale}
                    onChange={(e) => setForm((current) => ({ ...current, clientLocale: e.target.value === 'AR' ? 'AR' : 'EN' }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  >
                    <option value="EN">{copy.english}</option>
                    <option value="AR">{copy.arabic}</option>
                  </select>
                </div>
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.status}</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as InvoiceForm['status'] }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  >
                    <option value="draft">{copy.draft}</option>
                    <option value="sent">{copy.sent}</option>
                    <option value="paid">{copy.paid}</option>
                    <option value="void">{copy.void}</option>
                  </select>
                </div>
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.currency}</label>
                  <input
                    value={form.currencyCode}
                    onChange={(e) => setForm((current) => ({ ...current, currencyCode: e.target.value.toUpperCase() }))}
                    maxLength={3}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg uppercase"
                  />
                </div>
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.issueDate}</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm((current) => ({ ...current, issueDate: e.target.value }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  />
                </div>
                <div className="rounded-[24px] border border-edge bg-white/90 p-4">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.dueDate}</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((current) => ({ ...current, dueDate: e.target.value }))}
                    className="w-full rounded-2xl border border-edge bg-bg-alt/50 px-4 py-3 text-sm text-fg"
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-edge bg-white/90 p-4 lg:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">{copy.lineItems}</p>
                    {selectedLead && (
                      <p className="mt-1 text-sm text-fg-muted">
                        {selectedLead.project_type} • {selectedLead.budget}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setForm((current) => ({ ...current, lineItems: [...current.lineItems, createLineItem()] }))}
                    className="rounded-2xl border border-edge px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-fg"
                  >
                    {copy.addItem}
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {form.lineItems.map((item, index) => (
                    <div key={item.id} className="rounded-[22px] border border-edge bg-bg-alt/40 p-4">
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_100px_140px_auto]">
                        <input
                          value={item.description}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              lineItems: current.lineItems.map((lineItem) =>
                                lineItem.id === item.id ? { ...lineItem, description: e.target.value } : lineItem
                              ),
                            }))
                          }
                          placeholder={`${copy.description} ${index + 1}`}
                          className="w-full rounded-2xl border border-edge bg-white px-4 py-3 text-sm text-fg"
                        />
                        <input
                          value={item.quantity}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              lineItems: current.lineItems.map((lineItem) =>
                                lineItem.id === item.id ? { ...lineItem, quantity: e.target.value } : lineItem
                              ),
                            }))
                          }
                          placeholder={copy.quantity}
                          className="w-full rounded-2xl border border-edge bg-white px-4 py-3 text-sm text-fg"
                        />
                        <input
                          value={item.unitPrice}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              lineItems: current.lineItems.map((lineItem) =>
                                lineItem.id === item.id ? { ...lineItem, unitPrice: e.target.value } : lineItem
                              ),
                            }))
                          }
                          placeholder="0.00"
                          className="w-full rounded-2xl border border-edge bg-white px-4 py-3 text-sm text-fg"
                        />
                        <button
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              lineItems:
                                current.lineItems.length === 1
                                  ? [createLineItem()]
                                  : current.lineItems.filter((lineItem) => lineItem.id !== item.id),
                            }))
                          }
                          className="rounded-2xl border border-edge bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary"
                        >
                          {copy.remove}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-edge bg-white/90 p-4 lg:p-5">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">{copy.notes}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                  placeholder={copy.notesPlaceholder}
                  className="h-36 w-full resize-none rounded-[22px] border border-edge bg-bg-alt/40 px-4 py-4 text-sm leading-6 text-fg"
                />
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[24px] border border-edge bg-fg p-5 text-bg shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">{copy.totals}</p>
                <p className="mt-3 text-3xl font-black text-white">
                  {formatInvoiceAmount(subtotalAmount, form.currencyCode, form.clientLocale)}
                </p>
                <p className="mt-2 text-sm text-white/70">{copy.subtotal}</p>
              </div>

              <div className="rounded-[24px] border border-edge bg-white/90 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">{copy.publicLink}</p>
                {!selectedInvoice ? (
                  <p className="mt-3 text-sm leading-6 text-fg-muted">{copy.draftNotice}</p>
                ) : (
                  <>
                    <p className="mt-3 break-all text-sm leading-6 text-fg">{publicUrl}</p>
                    <div className="mt-4 grid gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="rounded-2xl border border-edge bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-fg"
                      >
                        {copied ? copy.copied : copy.copyLink}
                      </button>
                      <a
                        href={`/invoice/${selectedInvoice.id}`}
                        target="_blank"
                        className="rounded-2xl bg-fg px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-bg"
                      >
                        {copy.openInvoice}
                      </a>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-[24px] bg-accent px-4 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] disabled:opacity-60"
              >
                {saving ? copy.saving : creatingNew ? copy.createInvoice : copy.saveChanges}
              </button>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}

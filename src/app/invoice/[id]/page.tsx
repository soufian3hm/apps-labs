import { notFound } from 'next/navigation'
import { Amiri, IBM_Plex_Sans_Arabic, Instrument_Serif, Plus_Jakarta_Sans } from 'next/font/google'
import { createClient } from '@/utils/supabase/server'
import {
  formatInvoiceAmount,
  formatInvoiceDate,
  normalizeInvoiceLineItems,
} from '@/lib/appslabs-invoices'
import { normalizeLeadLocaleCode } from '@/lib/appslabs-lead-locale'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
})

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic'],
  display: 'swap',
})

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
})

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase.from('appslabs_invoices').select('*').eq('id', id).single()

  if (!invoice) {
    notFound()
  }

  const localeCode = normalizeLeadLocaleCode(invoice.client_locale)
  const isArabic = localeCode === 'AR'
  const bodyFont = isArabic ? ibmPlexArabic.className : plusJakarta.className
  const displayFont = isArabic ? amiri.className : instrumentSerif.className
  const lineItems = normalizeInvoiceLineItems(invoice.line_items)

  const copy = isArabic
    ? {
        invoice: 'فاتورة',
        issued: 'تاريخ الإصدار',
        due: 'تاريخ الاستحقاق',
        billedTo: 'موجهة إلى',
        lineItems: 'البنود',
        quantity: 'الكمية',
        unitPrice: 'سعر الوحدة',
        total: 'الإجمالي',
        notes: 'ملاحظات',
        support: 'للاستفسار عن هذه الفاتورة تواصل معنا عبر',
        company: 'Apps Labs',
        draft: 'مسودة',
        sent: 'مرسلة',
        paid: 'مدفوعة',
        void: 'ملغاة',
      }
    : {
        invoice: 'Invoice',
        issued: 'Issued',
        due: 'Due',
        billedTo: 'Billed to',
        lineItems: 'Line items',
        quantity: 'Qty',
        unitPrice: 'Unit price',
        total: 'Total',
        notes: 'Notes',
        support: 'For any question about this invoice, contact us at',
        company: 'Apps Labs',
        draft: 'Draft',
        sent: 'Sent',
        paid: 'Paid',
        void: 'Void',
      }

  const statusLabel =
    invoice.status === 'paid'
      ? copy.paid
      : invoice.status === 'sent'
        ? copy.sent
        : invoice.status === 'void'
          ? copy.void
          : copy.draft

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className={`${bodyFont} min-h-screen bg-bg px-4 py-8 text-fg sm:px-6 lg:px-10`}>
      <div className="mx-auto max-w-5xl rounded-[36px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,244,238,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.08)] sm:p-8 lg:p-12">
        <div className="flex flex-col gap-6 border-b border-edge/70 pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={`${instrumentSerif.className} text-xl font-bold tracking-tight text-fg`}>Apps Labs</p>
            <h1 className={`${displayFont} mt-4 text-4xl tracking-tight text-fg sm:text-5xl`}>
              {copy.invoice}
            </h1>
            <p className="mt-3 text-sm text-fg-muted">{invoice.title}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-[24px] border border-edge bg-white/90 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">#{invoice.invoice_number}</p>
              <p className="mt-3 text-sm font-semibold text-fg">{statusLabel}</p>
            </div>
            <div className="rounded-[24px] border border-edge bg-white/90 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.total}</p>
              <p className="mt-3 text-xl font-black text-fg">
                {formatInvoiceAmount(invoice.total_amount, invoice.currency_code, invoice.client_locale)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-5">
            <div className="rounded-[28px] border border-edge bg-white/90 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">{copy.billedTo}</p>
              <h2 className={`${displayFont} mt-3 text-3xl text-fg`}>{invoice.client_name}</h2>
              <p className="mt-2 text-sm text-fg-muted">{invoice.client_email}</p>
              {invoice.client_company && <p className="mt-1 text-sm text-fg-muted">{invoice.client_company}</p>}
            </div>

            <div className="rounded-[28px] border border-edge bg-white/90 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-edge bg-bg-alt/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.issued}</p>
                  <p className="mt-3 text-sm font-semibold text-fg">{formatInvoiceDate(invoice.issue_date, invoice.client_locale)}</p>
                </div>
                <div className="rounded-[22px] border border-edge bg-bg-alt/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.due}</p>
                  <p className="mt-3 text-sm font-semibold text-fg">{formatInvoiceDate(invoice.due_date, invoice.client_locale)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-edge bg-white/90 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">{copy.lineItems}</p>
                  <h3 className={`${displayFont} mt-2 text-2xl text-fg`}>{invoice.title}</h3>
                </div>
              </div>

              <div className="mt-5 hidden overflow-hidden rounded-[24px] border border-edge md:block">
                <table className="w-full">
                  <thead className="bg-bg-alt/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.lineItems}</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.quantity}</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.unitPrice}</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={`${item.description}-${index}`} className="border-t border-edge">
                        <td className="px-4 py-4 text-sm text-fg">{item.description}</td>
                        <td className="px-4 py-4 text-sm text-fg">{item.quantity}</td>
                        <td className="px-4 py-4 text-sm text-fg">
                          {formatInvoiceAmount(item.unit_price, invoice.currency_code, invoice.client_locale)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-fg">
                          {formatInvoiceAmount(Math.round(item.quantity * item.unit_price), invoice.currency_code, invoice.client_locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {lineItems.map((item, index) => (
                  <div key={`${item.description}-${index}`} className="rounded-[24px] border border-edge bg-bg-alt/40 p-4">
                    <p className="text-sm font-semibold text-fg">{item.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.quantity}</p>
                        <p className="mt-1 text-fg">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fg-tertiary">{copy.unitPrice}</p>
                        <p className="mt-1 text-fg">
                          {formatInvoiceAmount(item.unit_price, invoice.currency_code, invoice.client_locale)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-fg">
                      {copy.total}: {formatInvoiceAmount(Math.round(item.quantity * item.unit_price), invoice.currency_code, invoice.client_locale)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {invoice.notes && (
              <div className="rounded-[28px] border border-edge bg-white/90 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">{copy.notes}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-fg-muted">{invoice.notes}</p>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-edge bg-fg p-5 text-bg shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">{copy.total}</p>
              <p className="mt-4 text-4xl font-black text-white">
                {formatInvoiceAmount(invoice.total_amount, invoice.currency_code, invoice.client_locale)}
              </p>
              <p className="mt-3 text-sm text-white/70">#{invoice.invoice_number}</p>
            </div>

            <div className="rounded-[28px] border border-edge bg-white/90 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">{copy.support}</p>
              <a href="mailto:hello@apps-labs.co" className="mt-4 block break-all text-base font-semibold text-accent">
                hello@apps-labs.co
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

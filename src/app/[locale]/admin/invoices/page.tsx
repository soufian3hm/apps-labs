import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LoginForm from '../login-form'
import InvoicesView from './invoices-view'
import { normalizeLeadLocaleCode } from '@/lib/appslabs-lead-locale'

export default async function AdminInvoicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <LoginForm />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect(`/${locale}/admin`)
  }

  const { data: leads } = await supabase
    .from('appslabs_leads')
    .select('id, name, email, company, project_type, budget, client_locale, created_at')
    .order('created_at', { ascending: false })

  const { data: invoices } = await supabase
    .from('appslabs_invoices')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <InvoicesView
      locale={locale}
      initialLeads={(leads || []).map((lead) => ({
        ...lead,
        client_locale: normalizeLeadLocaleCode(lead.client_locale),
      }))}
      initialInvoices={invoices || []}
    />
  )
}

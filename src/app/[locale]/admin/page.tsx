import { createClient } from '@/utils/supabase/server'
import LoginForm from './login-form'
import AdminDashboard from './dashboard'
import { getAdminCopy } from '@/lib/appslabs-admin-copy'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const copy = getAdminCopy(locale)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LoginForm />
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center rounded-2xl bg-surface border border-edge p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-2">{copy.pages.accessDeniedTitle}</h1>
          <p className="text-fg-muted mb-6">{copy.pages.accessDeniedBody}</p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-accent hover:underline text-sm font-medium">{copy.sidebar.signOut}</button>
          </form>
        </div>
      </div>
    )
  }

  // Fetch columns and leads
  const { data: columns } = await supabase
    .from('appslabs_kanban_columns')
    .select('*')
    .order('position', { ascending: true })

  const { data: leads } = await supabase
    .from('appslabs_leads')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: logs } = await supabase
    .from('appslabs_email_logs')
    .select('*')

  const { data: tasks } = await supabase
    .from('appslabs_smart_tasks')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return <AdminDashboard 
    initialLeads={leads || []} 
    initialColumns={columns || []} 
    initialLogs={logs || []} 
    initialTasks={tasks || []}
  />
}

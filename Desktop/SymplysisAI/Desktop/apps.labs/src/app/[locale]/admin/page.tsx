import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './login-form'
import AdminDashboard from './dashboard'

export default async function AdminPage() {
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
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-fg-muted mb-6">Your account does not have administrative privileges.</p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-accent hover:underline text-sm font-medium">Log out</button>
          </form>
        </div>
      </div>
    )
  }

  // User is authenticated and is an admin
  const { data: leads } = await supabase
    .from('appslabs_leads')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminDashboard initialLeads={leads || []} />
}

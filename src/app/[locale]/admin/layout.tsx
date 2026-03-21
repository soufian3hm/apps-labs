import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If not logged in, we let the inner page handle the login form
    // UNLESS we want to force redirect everywhere.
    // Let's keep it flexible so the /admin page can show login-form if no user.
    return <>{children}</>
  }

  // 2. Authorize role = admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    // If authenticated but NOT admin
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
        <div className="text-center rounded-2xl bg-surface border border-edge p-10 max-w-md w-full shadow-2xl">
          <h1 className="text-3xl font-bold font-display text-red-500 mb-4">Access Denied</h1>
          <p className="text-fg-muted mb-8 text-lg">Your account doesn't have the permissions required to enter the command center.</p>
          <form action="/auth/signout" method="post">
            <button 
              type="submit" 
              className="px-8 py-3 rounded-xl bg-accent text-white font-bold text-sm tracking-wide shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Sign out and try another
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin and Authenticated
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar - Desktop Always visible / Fixed */}
      <AdminSidebar user={user} />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 transition-all">
        {children}
      </main>
    </div>
  )
}

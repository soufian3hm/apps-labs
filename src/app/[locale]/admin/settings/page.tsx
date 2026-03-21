import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './settings-form'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/en/admin')

  // 2. Authorize role = admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect('/en/admin')
  }

  // 3. Fetch current settings
  const { data: settings } = await supabase
    .from('appslabs_settings')
    .select('*')
    .eq('id', 1)
    .single()

  return <SettingsForm initialSettings={settings || {}} />
}

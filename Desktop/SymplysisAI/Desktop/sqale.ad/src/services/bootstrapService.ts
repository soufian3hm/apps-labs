import { supabase } from '../lib/supabase'

export class BootstrapService {
  // Generate a pseudo-unique 9-digit company ID
  private static generateCompanyId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString()
  }

  private static async ensureProfile(userId: string, fallbackName?: string, fallbackCompany?: string) {
    // Try to fetch profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    if (profile) return profile

    // Create profile via RPC to bypass RLS
    const user = (await supabase.auth.getUser()).data.user
    const metaName = (user?.user_metadata?.name as string) || fallbackName || (user?.email?.split('@')[0] ?? 'User')
    const companyName = fallbackCompany || 'My Company'

    // Ensure unique company_id (best-effort)
    let companyId = this.generateCompanyId()
    for (let i = 0; i < 5; i++) {
      const { data: existing, error: checkErr } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('company_id', companyId)
        .maybeSingle()
      if (checkErr) break
      if (!existing) break
      companyId = this.generateCompanyId()
    }

    const { data: created, error: createErr } = await supabase.rpc('create_user_profile', {
      p_user_id: userId,
      p_name: metaName,
      p_company_name: companyName,
      p_phone_number: user?.user_metadata?.phone_number || null,
      p_country_code: user?.user_metadata?.country_code || '+1',
      p_company_id: companyId
    })

    if (createErr) throw createErr
    return created
  }

  // Removed: ensureEmailPrefs - email_preferences table deleted
  // Removed: ensureTeamOwner - team_members table deleted

  static async ensureUserInitialized(userId: string): Promise<void> {
    // Ensure profile exists - only essential initialization for early access
    await this.ensureProfile(userId)
    
    // All other initializations removed (wallet, email prefs, team, subscriptions)
    // as those tables have been deleted for early access launch
  }
}

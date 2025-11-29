import { supabase } from '../lib/supabase'

export interface EmailPreferences {
  id: string
  user_id: string
  account_alerts: boolean
  appeals: boolean
  top_ups: boolean
  deposits: boolean
  bm_requests: boolean
  clear_funds: boolean
  account_applications: boolean
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  company_id: string
  user_id: string
  name: string
  email: string
  role: 'COMPANY_OWNER' | 'ADMIN' | 'MEMBER'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  invited_by?: string
  invited_at: string
  joined_at?: string
  created_at: string
  updated_at: string
}

export class SettingsService {
  // Email Preferences
  static async getEmailPreferences(userId: string): Promise<EmailPreferences | null> {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, create default ones
        return this.createDefaultEmailPreferences(userId)
      }
      throw error
    }

    return data
  }

  static async createDefaultEmailPreferences(userId: string): Promise<EmailPreferences> {
    const { data, error } = await supabase
      .from('email_preferences')
      .insert([{
        user_id: userId,
        account_alerts: true,
        appeals: true,
        top_ups: true,
        deposits: true,
        bm_requests: true,
        clear_funds: true,
        account_applications: true
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateEmailPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<EmailPreferences> {
    const { data, error } = await supabase
      .from('email_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Team Members
  static async getTeamMembers(userId: string): Promise<TeamMember[]> {
    // First get the user's company_id from their profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching user profile for team members:', profileError)
      return []
    }

    if (!profile?.company_id) {
      console.log('No company_id found for user, returning empty team members')
      return []
    }

    // Now get team members for this company
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching team members:', error)
      return []
    }
    
    return data || []
  }

  // Get company owner's profile (for displaying company info to team members)
  static async getCompanyOwnerProfile(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase.rpc('get_company_owner_profile', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error fetching company owner profile:', error)
        return null
      }

      // RPC returns an array with prefixed column names, map them back
      const rawProfile = data && data.length > 0 ? data[0] : null
      
      if (!rawProfile) return null

      // Map prefixed columns back to original names
      return {
        id: rawProfile.profile_id,
        user_id: rawProfile.profile_user_id,
        name: rawProfile.profile_name,
        company_name: rawProfile.profile_company_name,
        phone_number: rawProfile.profile_phone_number,
        country_code: rawProfile.profile_country_code,
        company_id: rawProfile.profile_company_id,
        street_address: rawProfile.profile_street_address,
        city: rawProfile.profile_city,
        state_province: rawProfile.profile_state_province,
        postal_code: rawProfile.profile_postal_code,
        country: rawProfile.profile_country,
        tax_number: rawProfile.profile_tax_number,
        telegram_id: rawProfile.profile_telegram_id,
        balance: rawProfile.profile_balance,
        created_at: rawProfile.profile_created_at,
        updated_at: rawProfile.profile_updated_at
      }
    } catch (error) {
      console.error('Error in getCompanyOwnerProfile:', error)
      return null
    }
  }

  static async addTeamMember(teamMember: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert([teamMember])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTeamMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) throw error
  }

  // Deactivate team member (soft delete)
  static async deactivateTeamMember(memberId: string, deactivatedBy: string): Promise<TeamMember> {
    const { data, error } = await supabase
      .rpc('deactivate_team_member', {
        p_team_member_id: memberId,
        p_deactivated_by: deactivatedBy
      })

    if (error) throw error
    return data
  }

  // Permanently remove team member
  static async removeTeamMember(memberId: string, removedBy: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('remove_team_member', {
        p_team_member_id: memberId,
        p_removed_by: removedBy
      })

    if (error) throw error
    return data
  }

  // User Profile Updates
  static async updateUserProfile(userId: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Initialize team member for company owner
  static async initializeCompanyOwner(userId: string, companyId: string, name: string, email: string): Promise<TeamMember> {
    const { data, error } = await supabase
      .rpc('create_initial_team_member', {
        p_user_id: userId,
        p_company_id: companyId,
        p_name: name,
        p_email: email
      })

    if (error) throw error
    return data
  }
}

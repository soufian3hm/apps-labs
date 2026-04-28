import { supabase } from '../lib/supabase'

export interface TeamInvite {
  id: string
  token: string
  company_id: string
  role: string
  created_by: string
  created_by_name: string
  company_name: string
  expires_at: string
  used_by?: string
  used_at?: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  created_at: string
  updated_at: string
}

export interface InviteValidation {
  is_valid: boolean
  invite_id?: string
  company_id?: string
  company_name?: string
  role?: string
  created_by_name?: string
  expires_at?: string
  error_message?: string
}

export interface InviteInfo {
  company_name: string
  role: string
  created_by_name: string
  is_valid: boolean
}

export class InviteService {
  // Generate a new team invite
  static async generateInvite(
    companyId: string,
    role: string,
    createdBy: string,
    createdByName: string,
    companyName: string,
    expiresInDays: number = 7
  ): Promise<TeamInvite> {
    const { data, error } = await supabase.rpc('generate_team_invite', {
      p_company_id: companyId,
      p_role: role,
      p_created_by: createdBy,
      p_created_by_name: createdByName,
      p_company_name: companyName,
      p_expires_in_days: expiresInDays
    })

    if (error) throw error
    return data
  }

  // Validate an invite token
  static async validateInvite(token: string): Promise<InviteValidation> {
    const { data, error } = await supabase.rpc('validate_invite_token', {
      p_token: token
    })

    if (error) throw error
    
    // RPC returns an array with one row
    if (data && data.length > 0) {
      return data[0]
    }
    
    return {
      is_valid: false,
      error_message: 'Invalid invite'
    }
  }

  // Accept an invite (called after signup)
  static async acceptInvite(
    token: string,
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<any> {
    const { data, error } = await supabase.rpc('accept_team_invite', {
      p_token: token,
      p_user_id: userId,
      p_user_name: userName,
      p_user_email: userEmail
    })

    if (error) throw error
    return data
  }

  // Get public invite info (for signup page branding)
  static async getInviteInfo(token: string): Promise<InviteInfo | null> {
    const { data, error } = await supabase.rpc('get_invite_info', {
      p_token: token
    })

    if (error) throw error
    
    if (data && data.length > 0) {
      return data[0]
    }
    
    return null
  }

  // Get all invites for a company
  static async getCompanyInvites(companyId: string): Promise<TeamInvite[]> {
    const { data, error } = await supabase
      .from('team_invites')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Revoke an invite
  static async revokeInvite(inviteId: string): Promise<void> {
    const { error } = await supabase
      .from('team_invites')
      .update({ 
        status: 'REVOKED',
        updated_at: new Date().toISOString()
      })
      .eq('id', inviteId)

    if (error) throw error
  }

  // Delete an invite
  static async deleteInvite(inviteId: string): Promise<void> {
    const { error } = await supabase
      .from('team_invites')
      .delete()
      .eq('id', inviteId)

    if (error) throw error
  }

  // Generate invite link
  static generateInviteLink(token: string): string {
    const baseUrl = window.location.origin
    return `${baseUrl}/invite/${token}`
  }
}

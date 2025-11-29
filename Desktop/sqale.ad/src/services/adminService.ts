import { supabase } from '../lib/supabase'

export interface AdminUser {
  id: string
  user_id: string
  name: string
  email: string
  company_name: string
  subscription_plan: string
  subscription_status: string
  adcopy_count: number
  voiceover_count: number
  landing_page_count: number
  poster_count: number
  last_active: string
  created_at: string
  role: string
  is_banned: boolean
}

export interface DashboardStats {
  activeUsers: number
  monthlyRevenue: number
  aiRequestsToday: number
  serverHealth: 'operational' | 'degraded' | 'down'
}

export interface ActivityLog {
  id: string
  type: 'user_action' | 'subscription' | 'webhook' | 'system'
  message: string
  timestamp: string
  user_name?: string
}

export interface AdminSubscription {
  id: string
  user_id: string
  user_name: string
  user_email: string
  plan_name: string
  status: string
  price: number
  currency: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id: string
  stripe_customer_id: string
  created_at: string
}

export interface UsageAnalytics {
  total_adcopy: number
  total_voiceover: number
  total_landing_page: number
  total_poster: number
  total_usage: number
  active_users: number
  avg_usage_per_user: number
}

export class AdminService {
  // Get all users with emails
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_users_for_admin')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  // Get dashboard stats
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats')

      if (error) throw error
      
      return {
        activeUsers: data?.active_users || 0,
        monthlyRevenue: parseFloat(data?.monthly_revenue || '0'),
        aiRequestsToday: data?.ai_requests_today || 0,
        serverHealth: data?.server_health || 'operational'
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  // Get activity log
  static async getActivityLog(limit: number = 20): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase.rpc('get_admin_activity_log', { p_limit: limit })

      if (error) throw error
      
      return (data || []).map((item: any) => ({
        id: item.id,
        type: item.type as ActivityLog['type'],
        message: item.message,
        timestamp: item.timestamp,
        user_name: item.user_name || undefined
      }))
    } catch (error) {
      console.error('Error fetching activity log:', error)
      throw error
    }
  }

  // Get all subscriptions with user info
  static async getAllSubscriptions(): Promise<AdminSubscription[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_subscriptions_for_admin')

      if (error) throw error
      
      return (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        user_name: item.user_name || 'Unknown',
        user_email: item.user_email || 'N/A',
        plan_name: item.plan_name || 'free',
        status: item.status || 'inactive',
        price: parseFloat(item.price || '0'),
        currency: item.currency || 'USD',
        current_period_start: item.current_period_start || '',
        current_period_end: item.current_period_end || '',
        cancel_at_period_end: item.cancel_at_period_end || false,
        stripe_subscription_id: item.stripe_subscription_id || '',
        stripe_customer_id: item.stripe_customer_id || '',
        created_at: item.created_at || ''
      }))
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      throw error
    }
  }

  // Add credits to user
  static async addUserCredits(
    targetUserId: string,
    credits: {
      adcopy?: number
      voiceover?: number
      landing_page?: number
      poster?: number
    }
  ): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No session found')
      }

      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bmceibdtgypgsfiyumcr.supabase.co'
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-service`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'add_credits',
            targetUserId,
            data: credits
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add credits')
      }
    } catch (error) {
      console.error('Error adding credits:', error)
      throw error
    }
  }

  // Ban/Unban user
  static async banUser(targetUserId: string, ban: boolean = true): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No session found')
      }

      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bmceibdtgypgsfiyumcr.supabase.co'
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-service`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'ban_user',
            targetUserId,
            data: { ban }
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to ban user')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      throw error
    }
  }

  // Get usage analytics
  static async getUsageAnalytics(days: number = 30): Promise<UsageAnalytics> {
    try {
      const { data, error } = await supabase.rpc('get_usage_analytics_for_admin', { p_days: days })

      if (error) throw error
      
      return {
        total_adcopy: data?.total_adcopy || 0,
        total_voiceover: data?.total_voiceover || 0,
        total_landing_page: data?.total_landing_page || 0,
        total_poster: data?.total_poster || 0,
        total_usage: data?.total_usage || 0,
        active_users: data?.active_users || 0,
        avg_usage_per_user: parseFloat(data?.avg_usage_per_user || '0')
      }
    } catch (error) {
      console.error('Error fetching usage analytics:', error)
      throw error
    }
  }

  // Impersonate user
  static async impersonateUser(targetUserId: string): Promise<string> {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No session found')
      }

      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bmceibdtgypgsfiyumcr.supabase.co'
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-service`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'impersonate',
            targetUserId
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to impersonate user')
      }

      const data = await response.json()
      return data.url || ''
    } catch (error) {
      console.error('Error impersonating user:', error)
      throw error
    }
  }
}


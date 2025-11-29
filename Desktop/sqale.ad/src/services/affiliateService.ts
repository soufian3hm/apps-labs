import { supabase } from '../lib/supabase'

export interface AffiliateProfile {
  id: string
  user_id: string
  referral_code: string
  total_clicks: number
  total_signups: number
  total_payout: number
  created_at: string
  updated_at: string
}

export interface AffiliateReferral {
  id: string
  affiliate_id: string
  referred_user_id: string
  signup_date: string
  subscription_status: 'active' | 'cancelled'
  commission: number
  payout_status: 'pending' | 'paid' | 'failed'
  ip_address?: string
  created_at: string
  updated_at: string
}

export interface AffiliatePayout {
  id: string
  affiliate_id: string
  amount: number
  payment_method: 'stripe' | 'paypal' | 'credits'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paid_at?: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateStats {
  totalEarned: number
  pendingPayouts: number
  totalReferrals: number
  conversionRate: number
  dailyClicks: Array<{ date: string; clicks: number }>
  dailySignups: Array<{ date: string; signups: number }>
  dailyEarnings: Array<{ date: string; earnings: number }>
}

export class AffiliateService {
  // Get affiliate profile for user
  static async getAffiliateProfile(userId: string): Promise<AffiliateProfile | null> {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching affiliate profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getAffiliateProfile:', error)
      return null
    }
  }

  // Create affiliate profile
  static async createAffiliateProfile(userId: string): Promise<AffiliateProfile | null> {
    try {
      const { data, error } = await supabase
        .rpc('create_affiliate_profile', { user_uuid: userId })

      if (error) {
        console.error('Error creating affiliate profile:', error)
        return null
      }

      // Fetch the created profile
      return await this.getAffiliateProfile(userId)
    } catch (error) {
      console.error('Error in createAffiliateProfile:', error)
      return null
    }
  }

  // Get affiliate referrals
  static async getAffiliateReferrals(affiliateId: string): Promise<AffiliateReferral[]> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('signup_date', { ascending: false })

      if (error) {
        console.error('Error fetching affiliate referrals:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAffiliateReferrals:', error)
      return []
    }
  }

  // Get affiliate payouts
  static async getAffiliatePayouts(affiliateId: string): Promise<AffiliatePayout[]> {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching affiliate payouts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAffiliatePayouts:', error)
      return []
    }
  }

  // Request payout
  static async requestPayout(affiliateId: string, amount: number, paymentMethod: 'stripe' | 'paypal' | 'credits'): Promise<AffiliatePayout | null> {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .insert({
          affiliate_id: affiliateId,
          amount,
          payment_method: paymentMethod,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error requesting payout:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in requestPayout:', error)
      return null
    }
  }

  // Track referral click
  static async trackReferralClick(referralCode: string, ipAddress?: string): Promise<boolean> {
    try {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      if (!affiliate) {
        return false
      }

      // Update click count
      const { error } = await supabase
        .rpc('increment_affiliate_clicks', { affiliate_uuid: affiliate.id })

      if (error) {
        console.error('Error tracking click:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in trackReferralClick:', error)
      return false
    }
  }

  // Copy affiliate code to clipboard
  static async copyAffiliateCode(code: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(code)
      return true
    } catch (error) {
      console.error('Error copying affiliate code:', error)
      return false
    }
  }
}

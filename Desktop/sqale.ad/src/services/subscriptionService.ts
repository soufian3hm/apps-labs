import { supabase } from '../lib/supabase'

export interface Subscription {
  id: string
  user_id: string
  company_id?: string
  plan_name: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED'
  start_date?: string
  end_date?: string
  price: number
  currency: string
  auto_renew: boolean
  stripe_subscription_id?: string
  stripe_customer_id?: string
  stripe_price_id?: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  trial_end?: string
  created_at: string
  updated_at: string
}

export class SubscriptionService {
  // Get all subscriptions for a user (now company-based)
  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    // First get the user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching user profile for subscriptions:', profileError)
      return []
    }
    if (!profile?.company_id) {
      console.log('No company_id found for user when fetching subscriptions')
      return []
    }

    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get subscription by plan name for a user (now company-based)
  static async getUserSubscriptionByPlan(userId: string, planName: string): Promise<Subscription | null> {
    // First get the user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching user profile for subscription:', profileError)
      return null
    }
    if (!profile?.company_id) {
      console.log('No company_id found for user when fetching subscription')
      return null
    }

    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('plan_name', planName)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  }

  // Create or update subscription
  static async upsertSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    // Ensure company_id is set if not provided
    if (!subscription.company_id && subscription.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', subscription.user_id)
        .single()
      
      if (profile?.company_id) {
        subscription = { ...subscription, company_id: profile.company_id }
      }
    }

    const { data, error } = await supabase
      .from('subscription_history')
      .upsert([subscription], {
        onConflict: 'company_id,plan_name'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update subscription status
  static async updateSubscriptionStatus(userId: string, planName: string, status: Subscription['status']): Promise<Subscription> {
    // Fetch user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) throw profileError
    if (!profile?.company_id) throw new Error('No company_id for user')

    const { data, error } = await supabase
      .from('subscription_history')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', profile.company_id)
      .eq('plan_name', planName)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Activate subscription
  static async activateSubscription(userId: string, planName: string): Promise<Subscription> {
    const now = new Date()
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    // First, check if the subscription exists
    const existingSubscription = await this.getUserSubscriptionByPlan(userId, planName)
    
    if (!existingSubscription) {
      // If subscription doesn't exist, create it first
      const defaultPrices: { [key: string]: number } = {
        'Meta Access': 100.00,
        'Google Access': 100.00,
        'TikTok Access': 100.00,
        'Snapchat Access': 100.00,
        'All Access': 300.00
      }

      const newSubscription = await this.upsertSubscription({
        user_id: userId,
        plan_name: planName,
        status: 'ACTIVE',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        price: defaultPrices[planName] || 100.00,
        currency: 'USD',
        auto_renew: false
      })

      return newSubscription
    }

    // If subscription exists, update it
    const { data, error } = await supabase
      .from('subscription_history')
      .update({
        status: 'ACTIVE',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', existingSubscription.id)
      .select()
      .single()

    if (error) throw error

    return data
  }



  // Deactivate subscription
  static async deactivateSubscription(userId: string, planName: string): Promise<Subscription> {
    // Find existing subscription first
    const existingSubscription = await this.getUserSubscriptionByPlan(userId, planName)
    if (!existingSubscription) throw new Error('Subscription not found')

    const { data, error } = await supabase
      .from('subscription_history')
      .update({
        status: 'INACTIVE',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSubscription.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Initialize default subscriptions for new user
  static async initializeUserSubscriptions(userId: string): Promise<void> {
    const defaultSubscriptions = [
      { plan_name: 'Meta Access', price: 100.00 },
      { plan_name: 'Google Access', price: 100.00 },
      { plan_name: 'TikTok Access', price: 100.00 },
      { plan_name: 'Snapchat Access', price: 100.00 },
      { plan_name: 'All Access', price: 300.00 }
    ]

    // Fetch user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching user profile for subscription initialization:', profileError)
      return
    }
    if (!profile?.company_id) {
      console.log('No company_id found for user, skipping subscription initialization')
      return
    }

    // Check if user already has subscriptions
    const existingSubscriptions = await this.getUserSubscriptions(userId)
    
    if (existingSubscriptions.length > 0) {
      console.log('User already has subscriptions, skipping initialization')
      return
    }

    const subscriptions = defaultSubscriptions.map(sub => ({
      user_id: userId,
      company_id: profile.company_id,
      plan_name: sub.plan_name,
      status: 'INACTIVE' as const,
      price: sub.price,
      currency: 'USD',
      auto_renew: false
    }))

    const { error } = await supabase
      .from('subscription_history')
      .insert(subscriptions)

    if (error) {
      // If it's a unique constraint violation, that's okay - subscriptions already exist
      if (error.code === '23505') {
        console.log('Subscriptions already exist for user, skipping initialization')
        return
      }
      throw error
    }
  }

  // Get subscription status for a specific plan
  static async getSubscriptionStatus(userId: string, planName: string): Promise<'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED'> {
    const subscription = await this.getUserSubscriptionByPlan(userId, planName)
    return subscription?.status || 'INACTIVE'
  }

  // Get subscription with Stripe details
  static async getSubscriptionWithStripeDetails(subscriptionId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  }

  // Get subscription by Stripe subscription ID
  static async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  }

  // Update subscription from Stripe webhook
  static async updateFromStripeWebhook(stripeSubscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    const { error } = await supabase
      .from('subscription_history')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', stripeSubscriptionId)

    if (error) throw error
  }

  // Check if subscription is expired
  static isSubscriptionExpired(subscription: Subscription): boolean {
    if (!subscription.current_period_end) return false
    
    const now = new Date()
    const periodEnd = new Date(subscription.current_period_end)
    
    return now > periodEnd
  }

  // Get days until subscription expires
  static getDaysUntilExpiration(subscription: Subscription): number {
    if (!subscription.current_period_end) return 0
    
    const now = new Date()
    const periodEnd = new Date(subscription.current_period_end)
    const diffTime = periodEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  // Get subscription expiration status
  static getExpirationStatus(subscription: Subscription): 'active' | 'expiring_soon' | 'expired' {
    if (this.isSubscriptionExpired(subscription)) {
      return 'expired'
    }
    
    const daysUntilExpiration = this.getDaysUntilExpiration(subscription)
    
    if (daysUntilExpiration <= 7) {
      return 'expiring_soon'
    }
    
    return 'active'
  }

  // Check if user has access to a specific platform
  static async hasPlatformAccess(userId: string, platform: string): Promise<boolean> {
    try {
      // Fetch user's company_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('Error fetching user profile for platform access:', profileError)
        return false
      }

      if (!profile?.company_id) return false

      const { data: subscriptions, error } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('status', 'ACTIVE')
        .gte('current_period_end', new Date().toISOString())

      if (error) {
        console.error('Error checking platform access:', error)
        return false
      }

      if (!subscriptions || subscriptions.length === 0) {
        return false
      }

      // Check if user has "All Access" plan
      const hasAllAccess = subscriptions.some(sub => sub.plan_name === 'All Access')
      if (hasAllAccess) {
        return true
      }

      // Check if user has specific platform access
      return subscriptions.some(sub => sub.plan_name === `${platform} Access`)
    } catch (error) {
      console.error('Error in hasPlatformAccess:', error)
      return false
    }
  }

  // Get user's subscription status
  static async getUserSubscriptionStatus(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_subscription_status', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error getting subscription status:', error)
        return null
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Error in getUserSubscriptionStatus:', error)
      return null
    }
  }
}

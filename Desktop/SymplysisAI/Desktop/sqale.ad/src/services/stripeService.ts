import { supabase } from '../lib/supabase'
import { STRIPE_PRICE_IDS, PLAN_PRICES } from '../lib/stripe'

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  created: number
}

export interface StripeSubscription {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  items: {
    data: Array<{
      id: string
      price: {
        id: string
        unit_amount: number
        currency: string
        recurring: {
          interval: string
        }
      }
    }>
  }
}

export interface StripePrice {
  id: string
  unit_amount: number
  currency: string
  recurring: {
    interval: string
  }
  product: string
}

export class StripeService {
  // Create Stripe customer
  static async createCustomer(userId: string, email: string, name?: string): Promise<StripeCustomer> {
    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/stripe-create-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        email,
        name
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create Stripe customer')
    }

    return response.json()
  }

  // Create checkout session for subscription
  static async createCheckoutSession(userId: string, planName: string, successUrl: string, cancelUrl: string): Promise<{ sessionId: string }> {
    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/stripe-create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        planName,
        successUrl,
        cancelUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to create checkout session')
    }

    return response.json()
  }

  // Create customer portal session
  static async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/stripe-create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        customerId,
        returnUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to create customer portal session')
    }

    return response.json()
  }

  // Create customer portal session using subscription ID
  static async createCustomerPortalSessionBySubscription(subscriptionId: string, returnUrl: string): Promise<{ url: string }> {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/stripe-create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        subscriptionId,
        returnUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to create customer portal session')
    }

    return response.json()
  }

  // Get subscription details
  static async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const response = await fetch(`/api/stripe/subscription/${subscriptionId}`)

    if (!response.ok) {
      throw new Error('Failed to get subscription details')
    }

    return response.json()
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        cancelAtPeriodEnd
      })
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch('/api/stripe/reactivate-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to reactivate subscription')
    }
  }

  // Update subscription in database
  static async updateSubscriptionFromStripe(stripeSubscription: StripeSubscription, planName: string): Promise<void> {
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscription.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const subscriptionData = {
      stripe_subscription_id: stripeSubscription.id,
      stripe_customer_id: stripeSubscription.customer,
      stripe_price_id: stripeSubscription.items.data[0]?.price.id,
      status: stripeSubscription.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'CANCELLED',
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      price: stripeSubscription.items.data[0]?.price.unit_amount ? stripeSubscription.items.data[0].price.unit_amount / 100 : PLAN_PRICES[planName as keyof typeof PLAN_PRICES],
      currency: stripeSubscription.items.data[0]?.price.currency?.toUpperCase() || 'USD',
      auto_renew: !stripeSubscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    }

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id)

      if (updateError) throw updateError
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert([{
          ...subscriptionData,
          plan_name: planName,
          user_id: await this.getUserIdFromCustomerId(stripeSubscription.customer)
        }])

      if (insertError) throw insertError
    }
  }

  // Get user ID from Stripe customer ID
  private static async getUserIdFromCustomerId(customerId: string): Promise<string> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (error) {
      throw new Error(`No user found for customer ID: ${customerId}`)
    }

    return data.user_id
  }

  // Handle webhook events
  static async handleWebhookEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private static async handleSubscriptionUpdated(subscription: StripeSubscription): Promise<void> {
    // Get plan name from price ID
    const planName = this.getPlanNameFromPriceId(subscription.items.data[0]?.price.id)
    if (!planName) {
      console.error('Could not determine plan name from price ID')
      return
    }

    await this.updateSubscriptionFromStripe(subscription, planName)
  }

  private static async handleSubscriptionDeleted(subscription: StripeSubscription): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription status:', error)
    }
  }

  private static async handlePaymentSucceeded(invoice: any): Promise<void> {
    if (invoice.subscription) {
      const subscription = await this.getSubscription(invoice.subscription)
      await this.handleSubscriptionUpdated(subscription)
    }
  }

  private static async handlePaymentFailed(invoice: any): Promise<void> {
    if (invoice.subscription) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'INACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription)

      if (error) {
        console.error('Error updating subscription status:', error)
      }
    }
  }

  private static getPlanNameFromPriceId(priceId: string): string | null {
    for (const [planName, id] of Object.entries(STRIPE_PRICE_IDS)) {
      if (id === priceId) {
        return planName
      }
    }
    return null
  }

  // Check and update expired subscriptions
  static async checkExpiredSubscriptions(): Promise<void> {
    const { error } = await supabase.rpc('check_subscription_expiration')
    
    if (error) {
      console.error('Error checking expired subscriptions:', error)
    }
  }

  // Create setup intent for adding payment methods
  static async createSetupIntent(customerId: string): Promise<{ clientSecret: string; setupIntentId: string }> {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-setup-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        customerId
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to create setup intent')
    }

    return response.json()
  }
}

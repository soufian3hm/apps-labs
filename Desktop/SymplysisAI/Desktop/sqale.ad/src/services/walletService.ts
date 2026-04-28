import { supabase } from '../lib/supabase'
import { WalletBalance, SavedCard, CryptoWallet, Transaction, WalletSummary, WalletData } from '../types/wallet'

export class WalletService {
  // Get customer ID from user's subscriptions
  static async getCustomerIdFromSubscriptions(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id, stripe_subscription_id, stripe_price_id')
        .eq('user_id', userId)
        .not('stripe_customer_id', 'is', null)
        .limit(1)

      if (error) throw error
      
      if (data && data.length > 0 && data[0].stripe_customer_id) {
        return data[0].stripe_customer_id
      }

      return null
    } catch (error) {
      console.error('Error fetching customer ID from subscriptions:', error)
      return null
    }
  }

  // Get all subscription data for a user (including Stripe IDs)
  static async getAllUserSubscriptionData(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error fetching subscriptions:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching all subscription data:', error)
      return []
    }
  }

  // Get credit card details using customer ID
  static async getCreditCardsByCustomerId(customerId: string): Promise<SavedCard[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bmceibdtgypgsfiyumcr.supabase.co'
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-saved-cards-by-customer?customerId=${customerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit cards by customer ID')
      }
      
      const data = await response.json()
      
      // Transform Stripe payment methods to SavedCard format
      return data.cards.map((card: any) => ({
        id: card.id,
        user_id: '', // Will be set by caller
        card_type: card.brand,
        last_four_digits: card.last4,
        expiry_month: card.expMonth,
        expiry_year: card.expYear,
        cardholder_name: 'Card Holder', // Stripe doesn't provide cardholder name
        is_default: card.isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || []
    } catch (error) {
      console.error('Error fetching credit cards by customer ID:', error)
      return []
    }
  }

  // Get credit card details using subscription ID
  static async getCreditCardsBySubscriptionId(subscriptionId: string): Promise<SavedCard[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bmceibdtgypgsfiyumcr.supabase.co'
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-saved-cards-by-subscription?subscriptionId=${subscriptionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit cards by subscription ID')
      }
      
      const data = await response.json()
      
      // Transform Stripe payment methods to SavedCard format
      return data.cards.map((card: any) => ({
        id: card.id,
        user_id: '', // Will be set by caller
        card_type: card.brand,
        last_four_digits: card.last4,
        expiry_month: card.expMonth,
        expiry_year: card.expYear,
        cardholder_name: 'Card Holder',
        is_default: card.isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || []
    } catch (error) {
      console.error('Error fetching credit cards by subscription ID:', error)
      return []
    }
  }

  // Get credit card details using price ID
  static async getCreditCardsByPriceId(priceId: string): Promise<SavedCard[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bmceibdtgypgsfiyumcr.supabase.co'
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-saved-cards-by-price?priceId=${priceId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit cards by price ID')
      }
      
      const data = await response.json()
      
      // Transform Stripe payment methods to SavedCard format
      return data.cards.map((card: any) => ({
        id: card.id,
        user_id: '', // Will be set by caller
        card_type: card.brand,
        last_four_digits: card.last4,
        expiry_month: card.expMonth,
        expiry_year: card.expYear,
        cardholder_name: 'Card Holder',
        is_default: card.isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || []
    } catch (error) {
      console.error('Error fetching credit cards by price ID:', error)
      return []
    }
  }

  // Enhanced function to get credit cards using any available Stripe ID
  static async getCreditCardsByAnyStripeId(userId: string): Promise<SavedCard[]> {
    try {
      // First, get all subscription data for the user
      const subscriptions = await this.getAllUserSubscriptionData(userId)
      
      if (!subscriptions || subscriptions.length === 0) {
        console.log('No subscriptions found for user')
        return []
      }

      // Try to find a subscription with Stripe customer ID first
      const subscriptionWithCustomerId = subscriptions.find(sub => sub.stripe_customer_id)
      if (subscriptionWithCustomerId) {
        const cards = await this.getCreditCardsByCustomerId(subscriptionWithCustomerId.stripe_customer_id)
        return cards.map(card => ({ ...card, user_id: userId }))
      }

      // Try subscription ID
      const subscriptionWithSubId = subscriptions.find(sub => sub.stripe_subscription_id)
      if (subscriptionWithSubId) {
        const cards = await this.getCreditCardsBySubscriptionId(subscriptionWithSubId.stripe_subscription_id)
        return cards.map(card => ({ ...card, user_id: userId }))
      }

      // Try price ID
      const subscriptionWithPriceId = subscriptions.find(sub => sub.stripe_price_id)
      if (subscriptionWithPriceId) {
        const cards = await this.getCreditCardsByPriceId(subscriptionWithPriceId.stripe_price_id)
        return cards.map(card => ({ ...card, user_id: userId }))
      }

      console.log('No Stripe IDs found in user subscriptions')
      return []
    } catch (error) {
      console.error('Error getting credit cards by any Stripe ID:', error)
      return []
    }
  }

  // Sync Stripe cards to database
  static async syncStripeCards(userId: string): Promise<void> {
    try {
      // Get user's subscription data to find Stripe IDs
      const subscriptions = await this.getAllUserSubscriptionData(userId)
      
      if (!subscriptions || subscriptions.length === 0) {
        return
      }

      // Find ALL subscriptions with Stripe customer IDs
      const subscriptionsWithCustomerId = subscriptions.filter(sub => sub.stripe_customer_id)
      
      // Sync cards from ALL subscriptions with customer IDs
      for (const subscription of subscriptionsWithCustomerId) {
        try {
          await this.syncStripeCardsByCustomerId(userId, subscription.stripe_customer_id)
        } catch (error) {
          console.error(`Failed to sync cards from subscription ${subscription.plan_name}:`, error)
          // Continue with other subscriptions even if one fails
        }
      }

      // If no customer IDs found, try subscription IDs
      if (subscriptionsWithCustomerId.length === 0) {
        const subscriptionsWithSubId = subscriptions.filter(sub => sub.stripe_subscription_id)
        
        for (const subscription of subscriptionsWithSubId) {
          try {
            await this.syncStripeCardsBySubscriptionId(userId, subscription.stripe_subscription_id)
          } catch (error) {
            console.error(`Failed to sync cards from subscription ${subscription.plan_name}:`, error)
            // Continue with other subscriptions even if one fails
          }
        }
      }


    } catch (error) {
      console.error('Error syncing Stripe cards:', error)
      // Don't throw error, just log it so wallet data still loads
    }
  }



  // Sync Stripe cards by customer ID
  static async syncStripeCardsByCustomerId(userId: string, customerId: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/sync-stripe-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ customerId })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Edge function error response:', errorText)
        throw new Error(`Failed to sync Stripe cards: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Stripe cards sync completed successfully')
    } catch (error) {
      console.error('Error syncing Stripe cards by customer ID:', error)
      throw error
    }
  }

  // Sync Stripe cards by subscription ID
  static async syncStripeCardsBySubscriptionId(userId: string, subscriptionId: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/sync-stripe-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ subscriptionId })
      })

      if (!response.ok) {
        throw new Error(`Failed to sync Stripe cards: ${response.status}`)
      }

      const result = await response.json()
      console.log('Stripe cards sync result:', result)
    } catch (error) {
      console.error('Error syncing Stripe cards by subscription ID:', error)
      throw error
    }
  }

  // Get all wallet data for a user
  static async getWalletData(userId: string): Promise<WalletData> {
    try {
      // First sync Stripe cards to ensure we have the latest data
      await this.syncStripeCards(userId)

      // Fetch all data in parallel
      const [balancesResult, cardsResult, cryptoResult, transactionsResult, summaryResult] = await Promise.all([
        this.getWalletBalances(userId),
        this.getSavedCards(userId),
        this.getCryptoWallets(userId),
        this.getTransactions(userId),
        this.getWalletSummary(userId)
      ])

      return {
        balances: balancesResult,
        savedCards: cardsResult,
        cryptoWallets: cryptoResult,
        transactions: transactionsResult,
        summary: summaryResult
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      throw error
    }
  }

  // Get wallet balances from user_profiles (company owner's balance)
  static async getWalletBalances(userId: string): Promise<WalletBalance[]> {
    try {
      // Use SQL to get company owner's balance directly
      const { data, error } = await supabase.rpc('get_company_owner_balance', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error fetching company balance:', error)
        return [{
          id: userId,
          user_id: userId,
          currency: 'USD',
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      }

      // data is an array with one row
      const balanceData = data && data.length > 0 ? data[0] : null
      
      return [{
        id: balanceData?.user_id || userId,
        user_id: balanceData?.user_id || userId,
        currency: 'USD',
        balance: balanceData?.balance || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]
    } catch (error) {
      console.error('Error in getWalletBalances:', error)
      return [{
        id: userId,
        user_id: userId,
        currency: 'USD',
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]
    }
  }

  // Get saved cards from database (now company-based)
  static async getSavedCards(userId: string): Promise<SavedCard[]> {
    try {
      console.log('Fetching saved cards for user:', userId)
      
      // First get the user's company_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('Error fetching user profile for saved cards:', profileError)
        return []
      }
      if (!profile?.company_id) {
        return []
      }
      
      const { data, error } = await supabase
        .from('saved_cards')
        .select(`
          *,
          subscriptions!left(
            id,
            plan_name,
            status,
            stripe_subscription_id,
            stripe_customer_id
          )
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error fetching saved cards:', error)
        throw error
      }

      // Transform the data to include subscription info
      const transformedCards = (data || []).map(card => ({
        ...card,
        subscription_name: card.subscriptions?.plan_name || 'Unknown',
        subscription_status: card.subscriptions?.status || 'Unknown'
      }))

      console.log('Fetched cards from database:', transformedCards)
      return transformedCards
    } catch (error) {
      console.error('Error fetching saved cards from database:', error)
      return []
    }
  }

  // Get crypto wallets
  static async getCryptoWallets(userId: string): Promise<CryptoWallet[]> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get transactions (now company-based)
  static async getTransactions(userId: string, filter?: string): Promise<Transaction[]> {
    // First get the user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching user profile for transactions:', profileError)
      return []
    }
    if (!profile?.company_id) {
      return []
    }

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    if (filter && filter !== 'all') {
      query = query.eq('transaction_type', filter.toUpperCase())
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }



  // Manual sync with specific customer ID
  static async manualSyncWithCustomerId(userId: string, customerId: string): Promise<void> {
    console.log('=== MANUAL SYNC WITH CUSTOMER ID ===')
    console.log('User ID:', userId)
    console.log('Customer ID:', customerId)
    
    try {
      await this.syncStripeCardsByCustomerId(userId, customerId)
      console.log('Manual sync completed successfully')
    } catch (error) {
      console.error('Manual sync failed:', error)
      throw error
    }
  }

  // Add a new saved card
  static async addSavedCard(cardData: Omit<SavedCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<SavedCard> {
    const { data, error } = await supabase
      .from('saved_cards')
      .insert([cardData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update a saved card
  static async updateSavedCard(cardId: string, updates: Partial<SavedCard>): Promise<SavedCard> {
    const { data, error } = await supabase
      .from('saved_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete a saved card from Stripe
  static async deleteSavedCard(cardId: string): Promise<void> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not authenticated')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bmceibdtgypgsfiyumcr.supabase.co'
      const response = await fetch(
        `${supabaseUrl}/functions/v1/remove-saved-card`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            paymentMethodId: cardId
          })
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to remove saved card')
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to remove card')
      }
    } catch (error) {
      console.error('Error removing saved card:', error)
      throw error
    }
  }

  // Add a new crypto wallet
  static async addCryptoWallet(walletData: Omit<CryptoWallet, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CryptoWallet> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .insert([walletData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update a crypto wallet
  static async updateCryptoWallet(walletId: string, updates: Partial<CryptoWallet>): Promise<CryptoWallet> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .update(updates)
      .eq('id', walletId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete a crypto wallet
  static async deleteCryptoWallet(walletId: string): Promise<void> {
    const { error } = await supabase
      .from('crypto_wallets')
      .delete()
      .eq('id', walletId)

    if (error) throw error
  }

  // Add a new transaction
  static async addTransaction(transactionData: {
    transaction_type: Transaction['transaction_type']
    amount: number
    currency: string
    source: string
    ad_account_id?: string
    invoice_id?: string
    description?: string
  }): Promise<Transaction> {
    const { data, error } = await supabase
      .rpc('add_transaction_and_update_balance', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_transaction_type: transactionData.transaction_type,
        p_amount: transactionData.amount,
        p_currency: transactionData.currency,
        p_source: transactionData.source,
        p_ad_account_id: transactionData.ad_account_id,
        p_invoice_id: transactionData.invoice_id,
        p_description: transactionData.description
      })

    if (error) throw error
    return data
  }

  // Initialize wallet balances for a new user
  static async initializeWalletBalances(userId: string): Promise<void> {
    const { error } = await supabase
      .rpc('initialize_wallet_balances', { p_user_id: userId })

    if (error) throw error
  }

  // Get wallet summary using database queries (company-based)
  static async getWalletSummary(userId: string): Promise<WalletSummary> {
    // Get user's company_id first
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile for summary:', profileError)
      return {
        monthlyIncoming: 0,
        monthlyOutgoing: 0,
        lifetimeIncoming: 0,
        lifetimeOutgoing: 0
      }
    }
    if (!profile?.company_id) {
      return {
        monthlyIncoming: 0,
        monthlyOutgoing: 0,
        lifetimeIncoming: 0,
        lifetimeOutgoing: 0
      }
    }

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get monthly incoming (net amount after fees) - company-based
    const { data: monthlyIncomingData, error: monthlyIncomingError } = await supabase
      .from('transactions')
      .select('net_amount, amount')
      .eq('company_id', profile.company_id)
      .eq('transaction_type', 'INCOMING')
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString())

    if (monthlyIncomingError) throw monthlyIncomingError

    const monthlyIncoming = (monthlyIncomingData || []).reduce((sum, t) => 
      sum + (t.net_amount || t.amount || 0), 0
    )

    // Get monthly outgoing - company-based
    const { data: monthlyOutgoingData, error: monthlyOutgoingError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('company_id', profile.company_id)
      .eq('transaction_type', 'OUTGOING')
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString())

    if (monthlyOutgoingError) throw monthlyOutgoingError

    const monthlyOutgoing = (monthlyOutgoingData || []).reduce((sum, t) => 
      sum + (t.amount || 0), 0
    )

    // Get lifetime incoming (net amount after fees) - company-based
    const { data: lifetimeIncomingData, error: lifetimeIncomingError } = await supabase
      .from('transactions')
      .select('net_amount, amount')
      .eq('company_id', profile.company_id)
      .eq('transaction_type', 'INCOMING')

    if (lifetimeIncomingError) throw lifetimeIncomingError

    const lifetimeIncoming = (lifetimeIncomingData || []).reduce((sum, t) => 
      sum + (t.net_amount || t.amount || 0), 0
    )

    // Get lifetime outgoing - company-based
    const { data: lifetimeOutgoingData, error: lifetimeOutgoingError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('company_id', profile.company_id)
      .eq('transaction_type', 'OUTGOING')

    if (lifetimeOutgoingError) throw lifetimeOutgoingError

    const lifetimeOutgoing = (lifetimeOutgoingData || []).reduce((sum, t) => 
      sum + (t.amount || 0), 0
    )

    return {
      monthlyIncoming,
      monthlyOutgoing,
      lifetimeIncoming,
      lifetimeOutgoing
    }
  }
}

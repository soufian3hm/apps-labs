import { supabase } from '../lib/supabase'
import { TelegramService, TelegramNotificationData } from './telegramService'

export interface AdAccountCreationData {
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat'
  accountName: string
  accountId: string
  accountType: 'page_limited' | 'standard'
  initialTopUp: number
  currency?: string
  businessManagerIds?: string[]
  domains?: string[]
  timezone?: string
  facebookPages?: Array<{ name: string; url: string }>
  additionalNotes?: string
}

export interface AdAccount {
  id: string
  user_id: string
  platform: string
  account_name: string
  account_id: string
  status: string
  currency: string
  balance: number
  business_manager_ids: string[]
  domains: string[]
  initial_top_up: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface AdAccountApplication {
  id: string
  user_id: string
  platform: string
  request_id: string
  ad_account_names: string[]
  account_ids: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  currency: string
  initial_top_up: number
  requested_by: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface AdAccountHistory {
  id: string
  user_id: string
  platform: string
  request_id_short?: string
  action: string
  account_name?: string
  account_id?: string
  message: string
  created_at: string
}

export interface AdAccountDomain {
  id: string
  ad_account_id: string
  domain: string
  status: 'ACTIVE' | 'DISABLED' | 'PENDING'
  created_at: string
}

export interface AdAccountBusinessManager {
  id: string
  ad_account_id: string
  business_manager_id: string
  business_manager_name?: string
  status: 'ACTIVE' | 'DISABLED' | 'PENDING'
  created_at: string
}

export interface AdAccountTransaction {
  id: string
  ad_account_id: string
  transaction_type: 'TOP_UP' | 'CLEAR_FUNDS' | 'BALANCE_FETCH'
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  reference_id?: string
  created_at: string
}

export class AdAccountService {
  // Create ad account with balance deduction and transaction recording
  static async createAdAccount(data: AdAccountCreationData): Promise<AdAccount> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user's profile to get company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, balance')
      .eq('user_id', user.id)
      .single()

    if (profileError) throw new Error('Failed to fetch user profile')
    if (!profile.company_id) throw new Error('User does not belong to a company')

    // Calculate fee based on account type
    const feeRate = data.accountType === 'standard' ? 0.06 : 0.03 // 6% for standard, 3% for page limited
    const fee = data.initialTopUp * feeRate
    const netAmount = data.initialTopUp - fee

    if (profile.balance < data.initialTopUp) throw new Error('Insufficient balance')

    // Start transaction
    const { data: adAccount, error: adAccountError } = await supabase
      .from('ad_accounts')
      .insert([{
        user_id: user.id,
        company_id: profile.company_id,
        platform: data.platform,
        account_name: data.accountName,
        account_id: data.accountId,
        status: 'PENDING',
        currency: data.currency || 'USD',
        balance: netAmount,
        business_manager_ids: data.businessManagerIds || [],
        domains: data.domains || [],
        initial_top_up: data.initialTopUp,
        is_visible: true
      }])
      .select()
      .single()

    if (adAccountError) throw adAccountError

    // Deduct balance from user profile
    const { error: balanceError } = await supabase
      .from('user_profiles')
      .update({ balance: profile.balance - data.initialTopUp })
      .eq('user_id', user.id)

    if (balanceError) throw new Error('Failed to update user balance')

    // Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        company_id: profile.company_id,
        transaction_type: 'OUTGOING',
        amount: data.initialTopUp,
        currency: data.currency || 'USD',
        source: 'Ad Account Creation',
        ad_account_id: adAccount.id,
        description: `Ad Account Application ${data.platform.toUpperCase()}: ${data.accountName}`,
        status: 'completed',
        fee: fee,
        net_amount: netAmount
      }])

    if (transactionError) throw new Error('Failed to record transaction')

    // Add to ad account applications
    const { error: applicationError } = await supabase
      .from('ad_account_applications')
      .insert([{
        user_id: user.id,
        company_id: profile.company_id,
        platform: data.platform,
        request_id: `req_${Date.now()}`,
        ad_account_names: [data.accountName],
        account_ids: [data.accountId],
        status: 'PENDING',
        currency: data.currency || 'USD',
        initial_top_up: data.initialTopUp,
        requested_by: user.email || 'Unknown'
      }])

    if (applicationError) throw new Error('Failed to create application record')

    // Add to ad account history
    const { error: historyError } = await supabase
      .from('ad_account_history')
      .insert([{
        user_id: user.id,
        company_id: profile.company_id,
        platform: data.platform,
        action: 'APPLICATION_SUBMITTED',
        account_name: data.accountName,
        account_id: data.accountId,
        message: `Ad account application submitted for ${data.accountName}`
      }])

    if (historyError) throw new Error('Failed to create history record')

    // Add to ad account transactions
    const { error: adAccountTransactionError } = await supabase
      .from('ad_account_transactions')
      .insert([{
        ad_account_id: adAccount.id,
        transaction_type: 'TOP_UP',
        amount: netAmount,
        currency: data.currency || 'USD',
        status: 'COMPLETED',
        reference_id: `topup_${Date.now()}`
      }])

    if (adAccountTransactionError) throw new Error('Failed to create ad account transaction')

    // Send Telegram notification
    try {
      const notificationData: TelegramNotificationData = {
        platform: data.platform,
        accountName: data.accountName,
        accountId: data.accountId,
        accountType: data.accountType,
        timezone: data.timezone || 'UTC',
        businessManagerIds: data.businessManagerIds || [],
        domains: data.domains || [],
        initialTopUp: data.initialTopUp,
        currency: data.currency || 'USD',
        userEmail: user.email || 'Unknown',
        userName: user.user_metadata?.name || user.user_metadata?.full_name || undefined,
        facebookPages: data.facebookPages,
        additionalNotes: data.additionalNotes
      }

      await TelegramService.sendAdAccountCreationNotification(notificationData)
    } catch (error) {
      console.error('Failed to send Telegram notification:', error)
      // Don't throw error here to avoid breaking the main flow
    }

    return adAccount
  }

  // Get all ad accounts for a user by platform (now company-based)
  static async getUserAdAccounts(userId: string, platform?: string): Promise<AdAccount[]> {
    // First get the user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile?.company_id) {
      console.error('Error fetching user profile for ad accounts:', profileError)
      return []
    }

    let query = supabase
      .from('ad_accounts')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  // Get ad accounts by platform
  static async getAdAccountsByPlatform(userId: string, platform: string): Promise<AdAccount[]> {
    const { data, error } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }



  // Get ad account applications (all platforms)
  static async getAdAccountApplications(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ad_account_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get ad account history (all platforms)
  static async getAdAccountHistory(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ad_account_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get ad account by ID
  static async getAdAccountById(accountId: string): Promise<AdAccount | null> {
    const { data, error } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  // Update ad account
  static async updateAdAccount(accountId: string, updates: Partial<AdAccount>): Promise<AdAccount> {
    const { data, error } = await supabase
      .from('ad_accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete ad account
  static async deleteAdAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('ad_accounts')
      .delete()
      .eq('id', accountId)

    if (error) throw error
  }

  // Get applications for a user by platform
  static async getUserApplications(userId: string, platform?: string): Promise<AdAccountApplication[]> {
    let query = supabase
      .from('ad_account_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  // Create new application
  static async createApplication(application: Omit<AdAccountApplication, 'id' | 'created_at' | 'updated_at'>): Promise<AdAccountApplication> {
    const { data, error } = await supabase
      .from('ad_account_applications')
      .insert([application])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update application status
  static async updateApplicationStatus(applicationId: string, status: AdAccountApplication['status'], rejectionReason?: string): Promise<AdAccountApplication> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'APPROVED') {
      updates.approved_at = new Date().toISOString()
    } else if (status === 'REJECTED') {
      updates.rejected_at = new Date().toISOString()
      if (rejectionReason) {
        updates.rejection_reason = rejectionReason
      }
    }

    const { data, error } = await supabase
      .from('ad_account_applications')
      .update(updates)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get history for a user by platform
  static async getUserHistory(userId: string, platform?: string): Promise<AdAccountHistory[]> {
    let query = supabase
      .from('ad_account_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  // Add history entry
  static async addHistoryEntry(history: Omit<AdAccountHistory, 'id' | 'created_at'>): Promise<AdAccountHistory> {
    const { data, error } = await supabase
      .from('ad_account_history')
      .insert([history])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get domains for an ad account
  static async getAdAccountDomains(adAccountId: string): Promise<AdAccountDomain[]> {
    const { data, error } = await supabase
      .from('ad_account_domains')
      .select('*')
      .eq('ad_account_id', adAccountId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Add domain to ad account
  static async addDomain(domain: Omit<AdAccountDomain, 'id' | 'created_at'>): Promise<AdAccountDomain> {
    const { data, error } = await supabase
      .from('ad_account_domains')
      .insert([domain])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get business managers for an ad account
  static async getAdAccountBusinessManagers(adAccountId: string): Promise<AdAccountBusinessManager[]> {
    const { data, error } = await supabase
      .from('ad_account_business_managers')
      .select('*')
      .eq('ad_account_id', adAccountId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Add business manager to ad account
  static async addBusinessManager(businessManager: Omit<AdAccountBusinessManager, 'id' | 'created_at'>): Promise<AdAccountBusinessManager> {
    const { data, error } = await supabase
      .from('ad_account_business_managers')
      .insert([businessManager])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get transactions for an ad account
  static async getAdAccountTransactions(adAccountId: string): Promise<AdAccountTransaction[]> {
    const { data, error } = await supabase
      .from('ad_account_transactions')
      .select('*')
      .eq('ad_account_id', adAccountId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Add transaction
  static async addTransaction(transaction: Omit<AdAccountTransaction, 'id' | 'created_at'>): Promise<AdAccountTransaction> {
    const { data, error } = await supabase
      .from('ad_account_transactions')
      .insert([transaction])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Generate request ID
  static generateRequestId(platform: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const platformPrefix = platform.toUpperCase()
    return `${platformPrefix}-APL-${timestamp}${random}`.toUpperCase()
  }

  // Generate short request ID for history
  static generateShortRequestId(platform: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    const platformPrefix = platform.toUpperCase()
    return `${platformPrefix}-SHA-${timestamp}${random}`.toUpperCase()
  }

  // Get platform display name
  static getPlatformDisplayName(platform: string): string {
    const platformNames: { [key: string]: string } = {
      'meta': 'Meta',
      'google': 'Google',
      'tiktok': 'TikTok',
      'snapchat': 'Snapchat'
    }
    return platformNames[platform] || platform
  }

  // Get platform branding
  static getPlatformBranding(platform: string): { title: string; subtitle: string; logo: string } {
    const branding: { [key: string]: { title: string; subtitle: string; logo: string } } = {
      'meta': {
        title: 'Agency Ad Accounts For Meta',
        subtitle: 'Manage your incoming and outgoing transactions with Symplysis.',
        logo: 'meta'
      },
      'google': {
        title: 'Agency Ad Accounts For Google',
        subtitle: 'Manage your incoming and outgoing transactions with Symplysis.',
        logo: 'google'
      },
      'tiktok': {
        title: 'Agency Ad Accounts For TikTok',
        subtitle: 'Manage your incoming and outgoing transactions with Symplysis.',
        logo: 'tiktok'
      },
      'snapchat': {
        title: 'Agency Ad Accounts For Snapchat',
        subtitle: 'Manage your incoming and outgoing transactions with Symplysis.',
        logo: 'snapchat'
      }
    }
    return branding[platform] || branding['meta']
  }
}

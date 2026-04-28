export interface WalletBalance {
  id: string
  user_id: string
  currency: 'USD' | 'EUR' | 'GBP'
  balance: number
  created_at: string
  updated_at: string
}

export interface SavedCard {
  id: string
  user_id: string
  card_type?: string
  last_four_digits?: string
  expiry_month?: number
  expiry_year?: number
  cardholder_name: string
  stripe_payment_method_id?: string
  country?: string
  is_default: boolean
  subscription_id?: string
  subscription_name?: string
  subscription_status?: string
  subscriptions?: {
    id: string
    plan_name: string
    status: string
    stripe_subscription_id: string
    stripe_customer_id: string
  }
  created_at: string
  updated_at: string
}

export interface CryptoWallet {
  id: string
  user_id: string
  crypto_type: string
  wallet_address: string
  wallet_name?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  transaction_type: 'INCOMING' | 'OUTGOING' | 'CONVERTED' | 'PENDING' | 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'refund'
  amount: number
  fee?: number
  net_amount?: number
  currency: string
  source?: string
  ad_account_id?: string
  created_by?: string
  invoice_id?: string
  description?: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  stripe_payment_intent_id?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface WalletSummary {
  monthlyIncoming: number
  monthlyOutgoing: number
  lifetimeIncoming: number
  lifetimeOutgoing: number
}

export interface WalletData {
  balances: WalletBalance[]
  savedCards: SavedCard[]
  cryptoWallets: CryptoWallet[]
  transactions: Transaction[]
  summary: WalletSummary
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useUserProfile } from './UserProfileContext'

export type SubscriptionPlan = 'free' | 'starter' | 'premium' | 'enterprise'
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled'
export type BillingPeriod = 'monthly' | 'yearly'

export interface Subscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  billingPeriod?: BillingPeriod
  endDate?: string
  isActive: boolean
}

interface SubscriptionContextType {
  subscription: Subscription | null
  loading: boolean
  hasAccess: boolean
  checkAccess: () => Promise<boolean>
  updateSubscription: (plan: SubscriptionPlan, status: SubscriptionStatus, endDate?: string) => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

interface SubscriptionProviderProps {
  children: ReactNode
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useUserProfile()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAccess = async (): Promise<boolean> => {
    if (!user || !profile) {
      return false
    }

    try {
      // Use cached profile data instead of querying database
      const plan = (profile.subscription_plan || 'free') as SubscriptionPlan
      const status = (profile.subscription_status || 'inactive') as SubscriptionStatus
      const endDate = profile.subscription_end_date

      // Check if subscription is valid
      let isActive = false
      if (plan === 'enterprise') {
        // Enterprise has custom terms, check with support
        isActive = status === 'active'
      } else if (plan !== 'free') {
        if (status === 'active' && endDate) {
          const expirationDate = new Date(endDate)
          isActive = expirationDate > new Date()
        }
      }

      // Get billing period from profile (defaults to monthly for backwards compatibility)
      const billingPeriod = (profile.billing_period || 'monthly') as BillingPeriod

      setSubscription({
        plan,
        status: isActive ? 'active' : 'expired',
        billingPeriod,
        endDate,
        isActive,
      })

      return isActive
    } catch (error) {
      console.error('Error checking subscription access:', error)
      return false
    }
  }

  const updateSubscription = async (
    plan: SubscriptionPlan,
    status: SubscriptionStatus,
    endDate?: string
  ) => {
    if (!user) return

    try {
      // Use shared profile update
      await updateProfile({
        subscription_plan: plan,
        subscription_status: status,
        subscription_end_date: endDate || undefined,
      })

      // Subscription will auto-update via useEffect
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }

  // Update subscription when profile changes
  useEffect(() => {
    if (profileLoading) {
      setLoading(true)
      return
    }

    if (user && profile) {
      checkAccess()
      setLoading(false)
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user, profile, profileLoading])

  const hasAccess = subscription?.isActive || false

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        hasAccess,
        checkAccess,
        updateSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

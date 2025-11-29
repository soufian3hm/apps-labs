import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

// Complete user profile with all fields
export interface UserProfileData {
  // Basic profile
  id: string
  user_id: string
  name: string
  company_name: string
  phone_number: string
  country_code: string
  company_id: string
  created_at: string
  updated_at: string
  
  // Subscription fields
  subscription_plan: 'free' | 'starter' | 'premium' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'expired' | 'cancelled'
  billing_period?: 'monthly' | 'yearly'
  subscription_end_date?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  
  // Usage tracking
  adcopy_count: number
  voiceover_count: number
  landing_page_count: number
  poster_count: number
  
  // Bonus credits
  adcopy_bonus_credits: number
  voiceover_bonus_credits: number
  landing_page_bonus_credits: number
  poster_bonus_credits: number
  
  // Other fields
  usage_reset_date?: string
  street_address?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  tax_number?: string
  telegram_id?: string
  
  // Role field
  role?: 'user' | 'admin'
}

interface UserProfileContextType {
  profile: UserProfileData | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfileData>) => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export const useUserProfile = () => {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}

interface UserProfileProviderProps {
  children: ReactNode
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = async (isInitialLoad: boolean = true) => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      // Only set loading to true on initial load, not on refresh
      if (isInitialLoad) {
        setLoading(true)
      }
      setError(null)

      // Single query to fetch ALL profile data
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setProfile(data as UserProfileData)
    } catch (err) {
      console.error('❌ [UserProfileContext] Error loading profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      }
    }
  }

  const refreshProfile = async () => {
    // Don't set loading state when refreshing - just update the data silently
    await loadProfile(false)
  }

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    if (!user || !profile) {
      throw new Error('No user or profile available')
    }

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        throw updateError
      }

      // Optimistically update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)

      // Refresh to ensure consistency
      await loadProfile()
    } catch (err) {
      console.error('❌ [UserProfileContext] Error updating profile:', err)
      throw err
    }
  }

  // Load profile when user changes
  useEffect(() => {
    loadProfile()
  }, [user?.id])

  const value: UserProfileContextType = {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

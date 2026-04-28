import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useUserProfile } from '../contexts/UserProfileContext'

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    })
    if (error) {
      console.error('Failed to send email:', error)
    }
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export type GenerationType = 'adcopy' | 'voiceover' | 'landing_page' | 'poster'

interface UsageLimits {
  adcopy: number
  voiceover: number
  landing_page: number
  poster: number
}

interface UsageData {
  adcopy_count: number
  voiceover_count: number
  landing_page_count: number
  poster_count: number
  adcopy_bonus_credits: number
  voiceover_bonus_credits: number
  landing_page_bonus_credits: number
  poster_bonus_credits: number
  usage_reset_date: string
}

const PLAN_LIMITS: Record<string, UsageLimits> = {
  free: {
    adcopy: 0,
    voiceover: 0,
    landing_page: 0,
    poster: 0,
  },
  starter: {
    adcopy: 200,
    voiceover: 50,
    landing_page: 20,
    poster: 30,
  },
  premium: {
    adcopy: 500,
    voiceover: 200,
    landing_page: 50,
    poster: 80,
  },
  enterprise: {
    adcopy: 999999,
    voiceover: 999999,
    landing_page: 999999,
    poster: 999999,
  },
}

export const useUsageTracking = () => {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const { profile, loading: profileLoading, refreshProfile } = useUserProfile()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const plan = subscription?.plan || 'free'
  const billingPeriod = subscription?.billingPeriod || 'monthly'
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
  
  // Yearly plans use the same monthly limits as monthly plans
  // The only difference is billing frequency (yearly vs monthly)
  // Both yearly and monthly plans reset usage each month on subscription anniversary

  // Use profile data directly instead of fetching again
  useEffect(() => {
    if (profileLoading) {
      setLoading(true)
      return
    }

    if (profile) {
      setUsage({
        adcopy_count: profile.adcopy_count,
        voiceover_count: profile.voiceover_count,
        landing_page_count: profile.landing_page_count,
        poster_count: profile.poster_count,
        adcopy_bonus_credits: profile.adcopy_bonus_credits,
        voiceover_bonus_credits: profile.voiceover_bonus_credits,
        landing_page_bonus_credits: profile.landing_page_bonus_credits,
        poster_bonus_credits: profile.poster_bonus_credits,
        usage_reset_date: profile.usage_reset_date || ''
      })
    } else {
      setUsage(null)
    }
    
    setLoading(false)
  }, [profile, profileLoading])

  const canGenerate = (type: GenerationType): boolean => {
    // Must have usage data loaded
    if (!usage) return false
    
    // Free plan - no access
    if (plan === 'free') return false
    
    // Unlimited plans - can always generate
    if (plan === 'enterprise') return true

    // Premium and Starter plans - check if user has credits OR bonus credits available
    // Both yearly and monthly plans use the same monthly limits
    // Both reset usage each month on subscription anniversary
    const currentCount = usage[`${type}_count` as keyof UsageData] as number || 0
    const bonusCredits = usage[`${type}_bonus_credits` as keyof UsageData] as number || 0
    const limit = limits[type]
    
    // Can generate if: within monthly limit OR has bonus credits
    const withinMonthlyLimit = currentCount < limit
    const hasBonusCredits = bonusCredits > 0
    
    return withinMonthlyLimit || hasBonusCredits
  }

  const sendUsageWarningEmail = async (type: GenerationType, currentCount: number, limit: number) => {
    try {
      // Only send once per day to avoid spam
      const lastWarningKey = `usage_warning_${type}_sent`
      const lastWarningSent = localStorage.getItem(lastWarningKey)
      const today = new Date().toDateString()

      if (lastWarningSent === today) return // Already sent today

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, name')
        .eq('user_id', user?.id)
        .single()

      if (!profile?.email) return

      const typeDisplay = type === 'adcopy' ? 'Ad Copy' :
                         type === 'landing_page' ? 'Landing Page' :
                         type === 'voiceover' ? 'Voiceover' : 'Poster'

      const usagePercentage = Math.round((currentCount / limit) * 100)
      const remaining = limit - currentCount

      const warningHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Usage Warning ⚠️</h2>
          <p>Hi ${profile.name || 'there'},</p>
          <p>You're approaching your monthly limit for <strong>${typeDisplay}</strong> generation.</p>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <strong>Current Usage:</strong> ${currentCount} / ${limit} (${usagePercentage}%)<br>
            <strong>Remaining:</strong> ${remaining} generations
          </div>

          <p>Don't worry! You can:</p>
          <ul>
            <li>Upgrade your plan for higher limits</li>
            <li>Purchase bonus credits</li>
            <li>Wait for monthly reset</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/settings/plans"
               style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Upgrade Plan
            </a>
            <a href="${window.location.origin}/ad-copy-generator/credits"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Buy Credits
            </a>
          </div>

          <p>Best,<br>The Symplysis Team</p>
        </div>
      `

      await sendEmail(profile.email, `You're close to your monthly ${typeDisplay} limit`, warningHtml)

      // Mark as sent today
      localStorage.setItem(lastWarningKey, today)
    } catch (error) {
      console.error('Error sending usage warning email:', error)
    }
  }

  const getRemainingCount = (type: GenerationType): number => {
    if (!usage) return 0
    
    if (plan === 'enterprise') return 999999
    if (plan === 'free') return 0

    const currentCount = usage[`${type}_count` as keyof UsageData] as number
    const bonusCredits = usage[`${type}_bonus_credits` as keyof UsageData] as number || 0
    const limit = limits[type]
    
    // Total available = (monthly limit - usage) + bonus credits
    // Both yearly and monthly plans use the same monthly limits
    // Both reset usage each month on subscription anniversary
    const monthlyRemaining = Math.max(0, limit - currentCount)
    return monthlyRemaining + bonusCredits
  }

  const getBonusCredits = (type: GenerationType): number => {
    if (!usage) return 0
    return usage[`${type}_bonus_credits` as keyof UsageData] as number || 0
  }

  const getMonthlyUsed = (type: GenerationType): number => {
    if (!usage) return 0
    const currentCount = usage[`${type}_count` as keyof UsageData] as number
    const limit = limits[type]
    // Return only the monthly usage (capped at limit)
    return Math.min(currentCount, limit)
  }

  const getCurrentCount = (type: GenerationType): number => {
    if (!usage) return 0
    return usage[`${type}_count` as keyof UsageData] as number
  }

  const getLimit = (type: GenerationType): number => {
    return limits[type]
  }

  const incrementUsage = async (type: GenerationType, count: number = 1): Promise<boolean> => {
    if (!user || !usage) return false

    // Check if user can generate
    if (!canGenerate(type)) {
      return false
    }

    const usageColumnName = `${type}_count`

    try {
      const currentUsage = usage[usageColumnName as keyof UsageData] as number
      const newUsage = currentUsage + count

      // Only increment usage count, NEVER touch bonus credits
      // Bonus credits are added separately via purchases and never consumed
      const { error } = await supabase
        .from('user_profiles')
        .update({ [usageColumnName]: newUsage })
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh profile data (which will update usage)
      await refreshProfile()
      return true
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  }

  const getTotalUsed = (): number => {
    if (!usage) return 0
    return (
      usage.adcopy_count +
      usage.voiceover_count +
      usage.landing_page_count +
      usage.poster_count
    )
  }

  const getTotalLimit = (): number => {
    return limits.adcopy + limits.voiceover + limits.landing_page + limits.poster
  }

  return {
    usage,
    limits,
    loading,
    canGenerate,
    getRemainingCount,
    getCurrentCount,
    getLimit,
    incrementUsage,
    getTotalUsed,
    getTotalLimit,
    getBonusCredits,
    getMonthlyUsed,
    refreshUsage: refreshProfile,
  }
}

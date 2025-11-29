import { supabase } from '../lib/supabase'

export type FeatureName = 'ugc_videos' | 'email_maker' | 'researcher'

export interface FeatureNotification {
  id: string
  user_id: string
  feature_name: FeatureName
  email: string | null
  created_at: string
  notified_at: string | null
}

/**
 * Subscribe to feature notifications
 */
export async function subscribeToFeature(
  featureName: FeatureName,
  email?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get user email if not provided
    let userEmail = email
    if (!userEmail) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', user.id)
        .single()
      
      userEmail = profile?.email || user.email || null
    }

    // Insert or update notification subscription
    const { error } = await supabase
      .from('feature_notifications')
      .upsert({
        user_id: user.id,
        feature_name: featureName,
        email: userEmail,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,feature_name'
      })

    if (error) {
      console.error('Error subscribing to feature:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error subscribing to feature:', error)
    return { success: false, error: error.message || 'Failed to subscribe' }
  }
}

/**
 * Check if user is subscribed to a feature
 */
export async function isSubscribedToFeature(
  featureName: FeatureName
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    const { data, error } = await supabase
      .from('feature_notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('feature_name', featureName)
      .single()

    if (error || !data) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}

/**
 * Unsubscribe from feature notifications
 */
export async function unsubscribeFromFeature(
  featureName: FeatureName
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('feature_notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('feature_name', featureName)

    if (error) {
      console.error('Error unsubscribing from feature:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error unsubscribing from feature:', error)
    return { success: false, error: error.message || 'Failed to unsubscribe' }
  }
}


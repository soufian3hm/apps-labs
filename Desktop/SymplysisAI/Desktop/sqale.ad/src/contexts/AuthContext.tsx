import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { BootstrapService } from '../services/bootstrapService'

interface UserProfile {
  id: string
  user_id: string
  name: string
  company_name: string
  phone_number: string
  country_code: string
  company_id: string
  street_address?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  tax_number?: string
  telegram_id?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null // Deprecated: Use UserProfileContext instead
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, profileData: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'company_id'>> & { name: string }) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void> // Deprecated: Use UserProfileContext.updateProfile instead
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // NOTE: Profile fetching now handled by UserProfileContext
  // This provides better separation of concerns and caching

  useEffect(() => {
    let mounted = true
    let isInitialized = false

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (isInitialized) {
        return
      }
      isInitialized = true

      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          
          if (initialSession?.user) {
            // Profile will be loaded by UserProfileContext
          } else {
            setProfile(null)
          }
          
          // Always set loading to false after session check
          setLoading(false)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('❌ [AuthContext] Error during initialization:', error)
        if (mounted) {
          setLoading(false)
          setIsInitialized(true)
        }
      }
    }

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && !isInitialized) {
        setLoading(false)
        setIsInitialized(true)
      }
    }, 5000) // 5 second timeout

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          // Only update if the session actually changed
          const currentUserId = user?.id
          const newUserId = session?.user?.id
          
          if (currentUserId !== newUserId) {
            setSession(session)
            setUser(session?.user ?? null)
            
            if (session?.user) {
              // Profile will be loaded by UserProfileContext
              // Bootstrap if needed
              BootstrapService.ensureUserInitialized(session.user.id).catch(() => {})
            } else {
              setProfile(null)
            }
          }
          
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, []) // ✅ Run once on mount - auth state changes handled by onAuthStateChange

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, profileData: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'company_id'>> & { name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: profileData.name,
          company_name: profileData.company_name,
          phone_number: profileData.phone_number
        }
      },
    })

    if (error) throw error

    // If user is created successfully, create their profile
    if (data.user) {
      try {
        // Wait longer for the user to be fully committed to the database
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generate a unique company ID
        const generateCompanyId = () => {
          return Math.floor(100000000 + Math.random() * 900000000).toString()
        }

        let companyId = generateCompanyId()
        let attempts = 0
        const maxAttempts = 10

        // Try to find a unique company ID
        while (attempts < maxAttempts) {
          try {
            const { data: existingProfile, error: checkError } = await supabase
              .from('user_profiles')
              .select('company_id')
              .eq('company_id', companyId)
              .maybeSingle()

            if (checkError) {
              break // If we can't check, just use the generated ID
            }

            if (!existingProfile) {
              break // Company ID is unique
            }
          } catch (err) {
            break // If there's an error, just use the generated ID
          }

          companyId = generateCompanyId()
          attempts++
        }

        // Create the profile using the database function that bypasses RLS
        const { data: profileResult, error: profileError } = await supabase
          .rpc('create_user_profile', {
            p_user_id: data.user.id,
            p_name: profileData.name,
            p_company_name: profileData.company_name || '',
            p_phone_number: profileData.phone_number || '',
            p_country_code: profileData.country_code || '+1',
            p_company_id: companyId
          })

        if (profileError) {
          // If it's a duplicate user profile or foreign key constraint error, user likely already exists
          if (profileError.code === '23505' || profileError.code === '23503' || profileError.message.includes('violates foreign key')) {
            // Check if it's a duplicate company_id error, try again with a new ID
            if (profileError.message.includes('company_id')) {
              companyId = generateCompanyId()

              const { data: retryResult, error: retryError } = await supabase
                .rpc('create_user_profile', {
                  p_user_id: data.user.id,
                  p_name: profileData.name,
                  p_company_name: profileData.company_name || '',
                  p_phone_number: profileData.phone_number || '',
                  p_country_code: profileData.country_code || '+1',
                  p_company_id: companyId
                })

              if (retryError) {
                // If retry also fails, check if it's because user already exists
                if (retryError.code === '23505' || retryError.code === '23503' || retryError.message.includes('violates foreign key')) {
                  const conflictError = new Error('User already exists. Please proceed to login.')
                  ;(conflictError as any).code = 'USER_EXISTS'
                  throw conflictError
                }
                throw retryError
              }
            } else {
              // Foreign key or other conflict - user likely already exists
              const conflictError = new Error('User already exists. Please proceed to login.')
              ;(conflictError as any).code = 'USER_EXISTS'
              throw conflictError
            }
          } else {
            throw profileError
          }
        }

        // Profile will be loaded by UserProfileContext after successful signup
        // Set basic profile data if available
        if (profileResult) {
          setProfile(profileResult)
        }

        // Removed: Wallet, team member, and subscription initialization
        // These features are disabled for early access launch
      } catch (error) {
        throw error
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  // DEPRECATED: Use UserProfileContext.updateProfile instead
  // Kept for backward compatibility
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) throw error

    // Note: UserProfileContext will auto-refresh via its own subscription
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


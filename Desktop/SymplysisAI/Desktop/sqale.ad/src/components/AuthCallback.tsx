import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from './ui/LoadingSpinner'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | undefined

    const handleAuthCallback = async () => {
      try {
        // Listen for auth state changes (handles hash fragment)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return

          if (event === 'SIGNED_IN' && session) {
            console.log('Authentication successful')
            navigate('/dashboard', { replace: true })
          } else if (event === 'SIGNED_OUT') {
            navigate('/login', { replace: true })
          }
        })

        unsubscribe = subscription.unsubscribe

        // Also check if session already exists
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Authentication failed. Please try again.')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        if (session && mounted) {
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        setError('An unexpected error occurred. Please try again.')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleAuthCallback()

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in...</p>
      </div>
    </div>
  )
}

export default AuthCallback

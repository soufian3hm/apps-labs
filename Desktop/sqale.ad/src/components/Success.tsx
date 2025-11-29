import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

const Success: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const verifyPaymentAndUpdateSubscription = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        
        if (!sessionId) {
          setError('No session ID found')
          setVerifying(false)
          return
        }

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          setError('Authentication failed')
          setVerifying(false)
          return
        }

        // Call edge function to verify the payment and get session details
        const { data: sessionData } = await supabase.auth.getSession()
        const response = await fetch(
          'https://bmceibdtgypgsfiyumcr.supabase.co/functions/v1/stripe-verify-session',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionData.session?.access_token}`,
            },
            body: JSON.stringify({ sessionId }),
          }
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.error || 'Payment verification failed')
          setVerifying(false)
          return
        }

        // Update user subscription in database
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            subscription_plan: data.plan,
            subscription_status: 'active',
            subscription_end_date: data.subscriptionEndDate,
            stripe_customer_id: data.customerId,
            stripe_subscription_id: data.subscriptionId,
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Failed to update subscription:', updateError)
          setError('Failed to activate subscription')
          setVerifying(false)
          return
        }

        // Success!
        setVerifying(false)

        // Redirect to settings/plans after 3 seconds
        setTimeout(() => {
          navigate('/settings/plans?success=true')
        }, 3000)

      } catch (err) {
        console.error('Error verifying payment:', err)
        setError('An unexpected error occurred')
        setVerifying(false)
      }
    }

    verifyPaymentAndUpdateSubscription()
  }, [searchParams, navigate])

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <LoadingSpinner size="lg" className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your subscription...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/settings/plans')}
            className="w-full inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 h-11 px-6 shadow-lg hover:shadow-xl transition-all"
          >
            Return to Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-2">
          Your subscription has been activated successfully.
        </p>
        <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  )
}

export default Success

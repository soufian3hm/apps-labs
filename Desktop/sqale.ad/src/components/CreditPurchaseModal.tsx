import React, { useState } from 'react'
import { Zap, X, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { GenerationType } from '../hooks/useUsageTracking'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  featureType: GenerationType
  onPurchaseComplete: () => void
}

// Credit pricing configuration
const CREDIT_PRICING = {
  adcopy: {
    name: 'Ad Copy',
    creditsPerDollar: 20, // 200 credits for $10
    minimumDollars: 5,
    minimumCredits: 100,
  },
  landing_page: {
    name: 'Landing Page',
    creditsPerDollar: 1, // 10 credits for $10
    minimumDollars: 5,
    minimumCredits: 5,
  },
  voiceover: {
    name: 'Voiceover',
    creditsPerDollar: 2.5, // 25 credits for $10
    minimumDollars: 5,
    minimumCredits: 12.5,
  },
  poster: {
    name: 'Poster',
    creditsPerDollar: 2, // 20 credits for $10
    minimumDollars: 5,
    minimumCredits: 10,
  },
}

const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
  featureType,
  onPurchaseComplete,
}) => {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [amount, setAmount] = useState(CREDIT_PRICING[featureType].minimumDollars)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pricing = CREDIT_PRICING[featureType]
  const credits = Math.floor(amount * pricing.creditsPerDollar)

  const handlePurchase = async () => {
    if (!user) {
      setError('Please log in to purchase credits')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Get user's Stripe customer ID
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profileData?.stripe_customer_id) {
        setError('No payment method found. Please add a payment method in billing settings.')
        setIsProcessing(false)
        return
      }

      // Create payment intent for credit purchase
      const { data: session } = await supabase.auth.getSession()
      const response = await fetch(
        'https://bmceibdtgypgsfiyumcr.supabase.co/functions/v1/purchase-credits',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            customerId: profileData.stripe_customer_id,
            featureType: featureType,
            credits: credits,
            amount: amount * 100, // Convert to cents
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Payment failed')
        setIsProcessing(false)
        return
      }

      // Success! Reset state and call callbacks
      setIsProcessing(false)
      setIsExpanded(false)
      setError(null)
      onPurchaseComplete()
      // Don't call onClose here - let the parent component handle it
    } catch (err) {
      console.error('Error purchasing credits:', err)
      setError('An unexpected error occurred')
      setIsProcessing(false)
    }
  }
  
  const handleClose = () => {
    // Reset modal state when closing
    setIsExpanded(false)
    setIsProcessing(false)
    setError(null)
    setAmount(pricing.minimumDollars)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <h2 className="text-xl font-bold text-slate-900">
            {!isExpanded ? 'Out of Credits' : 'Purchase Credits'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} className="text-slate-500 hover:text-slate-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isExpanded ? (
            // Initial State
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Zap size={32} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900">
                  {pricing.name} Credits Exhausted
                </h3>
                <p className="text-sm text-slate-600">
                  You've used all your {pricing.name.toLowerCase()} credits for this month.
                </p>
                <p className="text-xs text-slate-500">
                  Purchase additional credits to continue generating
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-4">
                  Starting from ${pricing.minimumDollars}
                </p>
              </div>
            </div>
          ) : (
            // Expanded State
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <X size={16} className="text-red-600" />
                  </button>
                </div>
              )}

              {/* Credit Display */}
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-slate-600">Select amount</p>
                <div className="py-6">
                  <div className="text-5xl font-bold text-slate-900 mb-2">{credits}</div>
                  <p className="text-base text-slate-600 mb-4">{pricing.name} credits</p>
                  <div className="text-3xl font-semibold text-slate-900">
                    ${amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Custom Range Slider */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">Amount</label>
                <div className="relative">
                  <input
                    type="range"
                    min={pricing.minimumDollars}
                    max={100}
                    step={5}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((amount - pricing.minimumDollars) / (100 - pricing.minimumDollars)) * 100}%, #e2e8f0 ${((amount - pricing.minimumDollars) / (100 - pricing.minimumDollars)) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <style>{`
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #3b82f6;
                      cursor: pointer;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    .slider::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #3b82f6;
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                  `}</style>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>${pricing.minimumDollars}</span>
                  <span>$100</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4"></div>

              {/* Pricing Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Credits</span>
                  <span className="text-sm font-semibold text-slate-900">{credits}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Price per credit</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ${(amount / credits).toFixed(2)}
                  </span>
                </div>
                
                <div className="border-t border-slate-200 pt-4"></div>
                
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Note */}
              <div className="pt-4">
                <p className="text-xs text-slate-500 text-center">
                  🔒 Secure payment via Stripe
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700"
            >
              <Zap size={18} />
              Buy Credits
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Secure Payment
                </>
              )}
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 rounded-xl font-medium text-sm transition-all bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md text-slate-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreditPurchaseModal

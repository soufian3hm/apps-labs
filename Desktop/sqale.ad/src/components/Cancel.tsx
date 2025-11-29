import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, ChevronLeft, Home } from 'lucide-react'

const Cancel: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/settings/plans')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
            <XCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-2">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          You can try again whenever you're ready, or explore our free features.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/settings/plans')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 h-11 px-6 shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronLeft size={18} />
            View Plans Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all h-11 px-6 text-slate-900"
          >
            <Home size={18} />
            Go to Dashboard
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Redirecting to plans in 5 seconds...
        </p>
      </div>
    </div>
  )
}

export default Cancel

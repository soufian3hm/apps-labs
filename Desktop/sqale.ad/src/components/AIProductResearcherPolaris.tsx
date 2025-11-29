import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check } from 'lucide-react'
import { subscribeToFeature, isSubscribedToFeature } from '../services/featureNotificationService'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from './ui/Toast'

const ProductResearcherPolaris: React.FC = () => {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const subscribed = await isSubscribedToFeature('researcher')
    setIsSubscribed(subscribed)
  }

  const handleNotifyMe = async () => {
    if (isSubscribed) return
    
    setIsLoading(true)
    const result = await subscribeToFeature('researcher')
    setIsLoading(false)
    
    if (result.success) {
      setIsSubscribed(true)
      addToast('You will be notified when Product Researcher drops!', 'success')
    } else {
      addToast(result.error || 'Failed to subscribe', 'error')
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F3F4F6] overflow-hidden relative">
      {/* Mesh Gradient Background - Teal/Cyan Theme */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(20, 184, 166, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(45, 212, 191, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(34, 211, 238, 0.15) 0px, transparent 50%)
          `,
          filter: 'blur(40px)',
          animation: 'pulseMesh 10s ease-in-out infinite alternate'
        }}
      />

      <style>{`
        @keyframes pulseMesh {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Main Modal Container */}
      <div className="relative w-full max-w-6xl h-[650px] mx-4 md:mx-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-teal-500/10 ring-1 ring-white/60 border border-white overflow-hidden flex flex-col lg:flex-row z-10">
        
        {/* Left Side: The "Pitch" (40%) */}
        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-white/40 relative overflow-hidden group">
          {/* Decoration Circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              🚀 Coming Soon
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-950 mb-4 leading-[1.1]">
              Product <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Researcher</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              Intelligent product research and market analysis. Discover winning products and make data-driven decisions with precision.
            </p>
            
            <div className="mt-4 text-sm text-teal-600/80 font-medium">
              Stay tuned for updates!
            </div>
          </div>

          <div className="relative z-10 mt-8 lg:mt-0">
            {/* Launch Info Badge */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white ring-1 ring-gray-200/70 mb-6 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Launch</p>
                <p className="text-xl font-bold text-gray-900">Q1 2026</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            <button
              onClick={handleNotifyMe}
              disabled={isSubscribed || isLoading}
              className={`w-full group relative flex items-center justify-center gap-3 ${
                isSubscribed 
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 cursor-default' 
                  : 'bg-gray-950 hover:bg-gray-900'
              } text-white rounded-2xl px-6 py-4 font-semibold text-lg transition-all duration-300 shadow-lg shadow-gray-950/20 hover:shadow-xl hover:shadow-gray-950/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>You'll be notified!</span>
                </>
              ) : (
                <>
                  <span>{isLoading ? 'Subscribing...' : 'Notify Me'}</span>
                  <Bell className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" />
                </>
              )}
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
              <span>{isSubscribed ? 'You will be notified when it drops' : 'Be the first to know when it launches'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: The Bento Grid (60%) */}
        <div className="lg:w-3/5 bg-gradient-to-br from-gray-50 to-white p-6 lg:p-10 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
            
            {/* Item 1: AI Product Discovery (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">AI Product Discovery</h3>
                  <p className="text-sm text-gray-500 mt-1">Find winning products before they go viral.</p>
                </div>
                <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-800">Smart Filtering & Scoring</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Trend Analysis</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Demand Forecasting</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Opportunity Score</span>
                </div>
              </div>
            </div>

            {/* Item 2: Market Trends */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 w-fit mb-4 relative z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 relative z-10">Market Trends</h3>
              <p className="text-sm text-gray-500 mt-1 relative z-10">Real-time market analysis.</p>
            </div>

            {/* Item 3: Profit Calculator (Dark Card) */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-900 p-6 text-white transition-all hover:shadow-xl hover:scale-[1.02]">
              {/* Abstract Mesh inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-600 opacity-20"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-lg">Profit Calc</h3>
                  <p className="text-sm text-teal-100 mt-1">Calculate margins instantly</p>
                </div>
                {/* Bar visual */}
                <div className="mt-4 flex items-end gap-1 h-8">
                  <div className="w-2 bg-teal-500/50 h-3 rounded-sm"></div>
                  <div className="w-2 bg-teal-500/50 h-5 rounded-sm"></div>
                  <div className="w-2 bg-teal-500/50 h-4 rounded-sm"></div>
                  <div className="w-2 bg-teal-400 h-full rounded-sm shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                </div>
              </div>
            </div>

            {/* Item 4: Competitor & Supplier (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10 flex items-center gap-6">
              <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-600 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">360° Research</h3>
                <p className="text-sm text-gray-500 mt-1">Deep competitor insights and supplier verification tracking.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default ProductResearcherPolaris

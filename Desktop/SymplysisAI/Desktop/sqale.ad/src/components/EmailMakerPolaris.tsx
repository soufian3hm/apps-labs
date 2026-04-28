import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check } from 'lucide-react'
import { subscribeToFeature, isSubscribedToFeature } from '../services/featureNotificationService'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from './ui/Toast'

const EmailMakerPolaris: React.FC = () => {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const subscribed = await isSubscribedToFeature('email_maker')
    setIsSubscribed(subscribed)
  }

  const handleNotifyMe = async () => {
    if (isSubscribed) return
    
    setIsLoading(true)
    const result = await subscribeToFeature('email_maker')
    setIsLoading(false)
    
    if (result.success) {
      setIsSubscribed(true)
      addToast('You will be notified when Email Maker drops!', 'success')
    } else {
      addToast(result.error || 'Failed to subscribe', 'error')
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F3F4F6] overflow-hidden relative">
      {/* Mesh Gradient Background - Sky/Indigo Theme */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(129, 140, 248, 0.15) 0px, transparent 50%)
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
      <div className="relative w-full max-w-6xl h-[650px] mx-4 md:mx-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-sky-500/10 ring-1 ring-white/60 border border-white overflow-hidden flex flex-col lg:flex-row z-10">
        
        {/* Left Side: The "Pitch" (40%) */}
        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-white/40 relative overflow-hidden group">
          {/* Decoration Circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              🚀 Coming Soon
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-950 mb-4 leading-[1.1]">
              Email <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Maker</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              AI-powered email campaign generator. Design stunning, high-converting emails effortlessly that drive real results.
            </p>
            
            <div className="mt-4 text-sm text-sky-600/80 font-medium">
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
              <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
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
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 cursor-default' 
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
            
            {/* Item 1: AI Copy & Templates (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">AI Copy & Templates</h3>
                  <p className="text-sm text-gray-500 mt-1">Draft high-converting subject lines instantly.</p>
                </div>
                <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                  </div>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-800">Beautiful, Responsive Designs</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Subject Lines</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Body Copy</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">HTML Templates</span>
                </div>
              </div>
            </div>

            {/* Item 2: Analytics */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="bg-sky-50 p-3 rounded-2xl text-sky-600 w-fit mb-4 relative z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 relative z-10">Performance</h3>
              <p className="text-sm text-gray-500 mt-1 relative z-10">Deep analytics & automated optimization.</p>
            </div>

            {/* Item 3: Smart Personalization (Dark Card) */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-900 p-6 text-white transition-all hover:shadow-xl hover:scale-[1.02]">
              {/* Abstract Mesh inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-indigo-600 opacity-20"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-lg">Smart Data</h3>
                  <p className="text-sm text-sky-100 mt-1">A/B Testing & Variables</p>
                </div>
                {/* Toggle switch visual */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-4 w-8 rounded-full bg-sky-400/30 flex items-center px-0.5">
                    <div className="h-3 w-3 bg-white rounded-full shadow-sm"></div>
                  </div>
                  <div className="h-4 w-8 rounded-full bg-indigo-500 flex items-center px-0.5 justify-end">
                    <div className="h-3 w-3 bg-white rounded-full shadow-sm"></div>
                  </div>
              </div>
            </div>
          </div>

            {/* Item 4: Global Scheduling (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10 flex items-center gap-6">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-500 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Global Reach</h3>
                <p className="text-sm text-gray-500 mt-1">Multi-language support with automated timezone scheduling.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default EmailMakerPolaris

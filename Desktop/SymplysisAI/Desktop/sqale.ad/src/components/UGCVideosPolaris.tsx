import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check } from 'lucide-react'
import { subscribeToFeature, isSubscribedToFeature } from '../services/featureNotificationService'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from './ui/Toast'

const UGCVideosPolaris: React.FC = () => {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const subscribed = await isSubscribedToFeature('ugc_videos')
    setIsSubscribed(subscribed)
  }

  const handleNotifyMe = async () => {
    if (isSubscribed) return
    
    setIsLoading(true)
    const result = await subscribeToFeature('ugc_videos')
    setIsLoading(false)
    
    if (result.success) {
      setIsSubscribed(true)
      addToast('You will be notified when UGC Videos drops!', 'success')
    } else {
      addToast(result.error || 'Failed to subscribe', 'error')
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F3F4F6] overflow-hidden relative">
      {/* Mesh Gradient Background - Pink/Rose Theme */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(244, 63, 94, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(251, 113, 133, 0.15) 0px, transparent 50%)
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
      <div className="relative w-full max-w-6xl h-[650px] mx-4 md:mx-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-pink-500/10 ring-1 ring-white/60 border border-white overflow-hidden flex flex-col lg:flex-row z-10">
        
        {/* Left Side: The "Pitch" (40%) */}
        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-white/40 relative overflow-hidden group">
          {/* Decoration Circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              🚀 Coming Soon
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-950 mb-4 leading-[1.1]">
              UGC <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">Videos</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              AI-powered user-generated content video creation. We're building an amazing tool to revolutionize how creators produce engaging content.
            </p>
            
            <div className="mt-4 text-sm text-pink-600/80 font-medium">
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
              <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
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
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 cursor-default' 
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
            
            {/* Item 1: AI Core (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">AI Video Generation</h3>
                  <p className="text-sm text-gray-500 mt-1">From Script to Video in seconds</p>
                </div>
                <div className="p-2 bg-pink-50 rounded-xl text-pink-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
                  </div>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-800">Includes AI Scripts & Pro Templates</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Script Gen</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Templates</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">Stock Library</span>
                </div>
              </div>
            </div>

            {/* Item 2: Smart Effects */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="bg-pink-50 p-3 rounded-2xl text-pink-600 w-fit mb-4 relative z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 relative z-10">Smart Effects</h3>
              <p className="text-sm text-gray-500 mt-1 relative z-10">Auto-captions & trending VFX.</p>
            </div>

            {/* Item 3: Audio Suite (Dark Card) */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-900 p-6 text-white transition-all hover:shadow-xl hover:scale-[1.02]">
              {/* Abstract Mesh inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-600 opacity-20"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-lg">Audio Studio</h3>
                  <p className="text-sm text-pink-100 mt-1">BGM & Voiceovers</p>
                </div>
                {/* Sound wave visual */}
                <div className="mt-4 flex items-end gap-1 h-6">
                  <div className="w-1 bg-pink-400 rounded-full h-3 animate-pulse"></div>
                  <div className="w-1 bg-pink-400 rounded-full h-5 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 bg-pink-400 rounded-full h-4 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 bg-pink-400 rounded-full h-6 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1 bg-pink-400 rounded-full h-2 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>

            {/* Item 4: Production Suite (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10 flex items-center gap-6">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-500 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Production Suite</h3>
                <p className="text-sm text-gray-500 mt-1">Real-time editing, preview, and multi-platform export.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default UGCVideosPolaris

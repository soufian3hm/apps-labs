import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Zap, ArrowRight, Layers, ImageIcon, Sparkles } from 'lucide-react'

const PosterPremiumGate: React.FC = () => {
  const navigate = useNavigate()
  const { subscription } = useSubscription()

  const currentPlan = subscription?.plan || 'free'

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F3F4F6] overflow-hidden relative">
      {/* Mesh Gradient Background - Orange/Amber theme */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(251, 146, 60, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(239, 68, 68, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(252, 211, 77, 0.15) 0px, transparent 50%)
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
      <div className="relative w-full max-w-6xl h-[650px] mx-4 md:mx-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-orange-500/10 ring-1 ring-white/60 border border-white overflow-hidden flex flex-col lg:flex-row z-10">
        
        {/* Left Side: The "Pitch" (40%) */}
        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-white/40 relative overflow-hidden group">
          {/* Decoration Circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Premium Feature
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-950 mb-4 leading-[1.1]">
              Unlock <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">Poster</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              Create stunning visuals instantly. Access our AI product analyzer, multiple template styles, and high-resolution exports.
            </p>
          </div>

          <div className="relative z-10 mt-8 lg:mt-0">
            {/* Current Plan Badge */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white ring-1 ring-gray-200/70 mb-6 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Plan</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{currentPlan === 'free' ? 'Free Tier' : currentPlan}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>

            <button
              onClick={() => navigate('/settings/plans')}
              className="w-full group relative flex items-center justify-center gap-3 bg-gray-950 hover:bg-gray-900 text-white rounded-2xl px-6 py-4 font-semibold text-lg transition-all duration-300 shadow-lg shadow-gray-950/20 hover:shadow-xl hover:shadow-gray-950/30 hover:-translate-y-0.5"
            >
              <span>View Plans & Subscribe</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
              <span>7-day free trial</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Secure payment by Stripe</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Right Side: The Bento Grid (60%) */}
        <div className="lg:w-3/5 bg-gradient-to-br from-gray-50 to-white p-6 lg:p-10 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
            
            {/* Item 1: Allowance (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Monthly Allowance</h3>
                  <p className="text-sm text-gray-500 mt-1">Credits refresh every 30 days</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tighter text-gray-900">50</span>
                <span className="text-lg font-medium text-gray-500">posters/mo</span>
              </div>
              {/* Visual Progress Bar */}
              <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Item 2: Multiple Templates */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-50 rounded-full blur-2xl"></div>
              <div className="bg-orange-50 p-3 rounded-2xl text-orange-600 w-fit mb-4 relative z-10">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 relative z-10">Multiple Templates</h3>
              <p className="text-sm text-gray-500 mt-1 relative z-10">Professional layouts for every campaign type.</p>
            </div>

            {/* Item 3: AI Product Analyzer (Dark Card) */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-900 p-6 text-white transition-all hover:shadow-xl hover:scale-[1.02]">
              {/* Abstract Mesh inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 opacity-20"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">Product Analyzer</h3>
                  <p className="text-sm text-orange-100 mt-1">Auto-fill from product</p>
                </div>
                {/* Animated elements */}
                <div className="mt-4 flex gap-2">
                  <div className="h-1.5 w-8 rounded-full bg-orange-400/60 animate-pulse"></div>
                  <div className="h-1.5 w-5 rounded-full bg-orange-400/40 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-1.5 w-3 rounded-full bg-orange-400/80 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>

            {/* Item 4: High Resolution Generation */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 w-fit mb-4">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900">High Res Gen</h3>
              <p className="text-sm text-gray-500 mt-1">Crystal clear 4K exports.</p>
            </div>

            {/* Item 5: No Expiry Link */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="bg-red-50 p-3 rounded-2xl text-red-500 w-fit mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Permanent Links</h3>
              <p className="text-sm text-gray-500 mt-1">No expiry on your shared image links.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default PosterPremiumGate


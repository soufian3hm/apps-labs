import React from 'react'
import { TrendingUp, Users, CreditCard, Target } from 'lucide-react'

const AffiliatePolaris: React.FC = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F3F4F6] overflow-hidden relative">
      {/* Mesh Gradient Background - Neutral/Gray Theme */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(100, 116, 139, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(71, 85, 105, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(51, 65, 85, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(100, 116, 139, 0.08) 0px, transparent 50%)
          `,
          filter: 'blur(40px)',
          animation: 'pulseMesh 10s ease-in-out infinite alternate'
        }}
      />

      <style>{`
        @keyframes pulseMesh {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.05); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Main Modal Container */}
      <div className="relative w-full max-w-6xl h-[650px] mx-4 md:mx-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-500/10 ring-1 ring-white/60 border border-white overflow-hidden flex flex-col lg:flex-row z-10">
        
        {/* Left Side: The "Pitch" (40%) */}
        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-white/40 relative overflow-hidden group">
          {/* Decoration Circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
              </span>
              🚀 Coming Soon
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-950 mb-4 leading-[1.1]">
              Affiliate <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">Program</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              Share Symplysis and earn recurring commissions. Build your passive income stream with our affiliate program.
            </p>
            
            <div className="mt-4 text-sm text-slate-600/80 font-medium">
              We're building something amazing!
            </div>
          </div>

          <div className="relative z-10 mt-8 lg:mt-0">
          </div>
              </div>

        {/* Right Side: The Bento Grid (60%) */}
        <div className="lg:w-3/5 bg-gradient-to-br from-gray-50 to-white p-6 lg:p-10 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
            
            {/* Item 1: Commission Structure (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Your Commission Structure</h3>
                  <p className="text-sm text-gray-500 mt-1">Earn recurring revenue from every referral you bring.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Target className="w-5 h-5 text-slate-600" />
          </div>
            <div>
                      <p className="text-sm font-semibold text-gray-900">30% Recurring Commission</p>
                      <p className="text-xs text-gray-500">For 12 months on every subscription</p>
                          </div>
                        </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">$10 Credit Alternative</p>
                      <p className="text-xs text-gray-500">Or get $10 credit in your favorite tool</p>
              </div>
            </div>
          </div>
              </div>
            </div>

            {/* Item 2: Tracking & Analytics */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10">
              <div className="bg-slate-50 p-3 rounded-2xl text-slate-600 w-fit mb-4 relative z-10">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 relative z-10">Real-Time Tracking</h3>
              <p className="text-sm text-gray-500 mt-1 relative z-10">Monitor clicks, conversions, and earnings in real-time.</p>
            </div>

            {/* Item 3: Referral Tools (Dark Card) */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-900 p-6 text-white transition-all hover:shadow-xl hover:scale-[1.02]">
              {/* Abstract Mesh inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 opacity-20"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                    <Users className="w-6 h-6" />
            </div>
                  <h3 className="font-semibold text-white text-lg">Referral Tools</h3>
                  <p className="text-sm text-slate-300 mt-1">Custom links, banners & marketing assets</p>
                </div>
                {/* Visual indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                  </div>
                </div>
              </div>

            {/* Item 4: Payout System (Span 2) */}
            <div className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-gray-900/10 flex items-center gap-6">
              <div className="bg-slate-50 p-3 rounded-2xl text-slate-500 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Flexible Payouts</h3>
                <p className="text-sm text-gray-500 mt-1">Multiple payment methods with automated monthly payouts.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AffiliatePolaris

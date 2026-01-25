'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  LineChart,
  Globe,
  Layers,
  MessageCircle,
  Smartphone,
  LayoutTemplate,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Play
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] bg-gradient-to-br from-orange-100/40 via-amber-50/40 to-transparent rounded-full blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-gradient-to-bl from-blue-50/30 via-purple-50/30 to-transparent rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-t from-orange-50/30 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/40 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
            <Logo className="h-12" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="h-10 px-6 text-base font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">

        {/* Hero Section */}
        <section className="max-w-[1400px] mx-auto text-center mb-40">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-semibold mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            Beast Mode Engine v2.0 Live
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Create High-Converting<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 animate-gradient-x">Product Pages in Minutes</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The unfair advantage for serious dropshippers.
            Instant loading. Native <span className="text-slate-900 font-bold border-b-2 border-orange-200">TikTok & Telegram</span> integration.
            Scale to <span className="text-slate-900 font-bold border-b-2 border-orange-200">multi-store</span> empire status.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 mb-24">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-xl font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-1 transition-all">
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <div className="text-sm text-slate-400 font-medium px-4">
              No credit card required. <br /> 14-day free beast mode.
            </div>
          </div>

          {/* Interactive Visual Abstract */}
          <div className="relative max-w-5xl mx-auto h-[400px] md:h-[500px] perspective-1000">
            {/* Central Product Card Mockup */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[300px] md:w-[380px] bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 p-6 z-20 animate-in zoom-in-50 duration-1000 delay-300">
              <div className="w-full aspect-square rounded-2xl bg-slate-100 mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">👟</span>
                </div>
                {/* Flash Sale Badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  Flash Sale -50%
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                <div className="h-8 w-1/2 bg-slate-900 rounded-lg" />
                <Button className="w-full bg-black text-white rounded-xl mt-2 font-bold hover:scale-105 transition-transform">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Floating Notification: Telegram */}
            <div className="absolute top-[10%] left-[5%] md:left-[0%] z-30 animate-in slide-in-from-left-20 duration-1000 delay-500">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 flex items-center gap-4 w-[280px] hover:scale-105 transition-transform cursor-default">
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center text-white shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Order</p>
                  <p className="text-sm font-bold text-slate-900">Paid: $129.00 USD</p>
                </div>
              </div>
            </div>

            {/* Floating Notification: TikTok */}
            <div className="absolute bottom-[20%] right-[5%] md:right-[0%] z-30 animate-in slide-in-from-right-20 duration-1000 delay-700">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 flex items-center gap-4 w-[260px] hover:scale-105 transition-transform cursor-default">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.53-1.15v8.2c-.01 3.03-1.25 5.92-3.4 8.05-2.14 2.14-5.04 3.38-8.08 3.38-5.83-.07-10.53-4.83-10.53-10.65C4.68 6.55 9.49 1.8 15.34 1.8v4.2C11.83 5.93 9 8.78 9 12.28c0 3.5 2.83 6.35 6.34 6.35 3.03-.02 5.56-2.26 6.07-5.22.06-.37.09-.75.09-1.13V4.31c-.93.35-1.92.52-2.92.52-.33 0-.66-.02-.99-.07V.02h-.06z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pixel Event</p>
                  <p className="text-sm font-bold text-slate-900">Purchase Completed</p>
                </div>
              </div>
            </div>

            {/* Floating Speed Badge */}
            <div className="absolute top-[30%] -right-10 md:right-20 z-10 animate-pulse hidden md:block">
              <div className="bg-green-100 p-2 pr-4 rounded-full flex items-center gap-2 border border-green-200 transform rotate-12">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">99</div>
                <span className="text-green-700 font-bold text-sm">Performance</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grids */}
        <section id="features" className="max-w-7xl mx-auto mb-32">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Designed to <span className="text-orange-600">Print Money</span></h2>
            <p className="text-lg text-slate-500">Every pixel is engineered for conversion. This isn't just a builder; it's a high-performance sales machine.</p>
          </div>

          {/* Beast Mode Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">

            {/* Customizable Form - Wide */}
            <div className="lg:col-span-2 group relative overflow-hidden bg-slate-50 border border-slate-100 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                    <LayoutTemplate className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Fully Customizable Forms</h3>
                  <p className="text-slate-500">Drag fields, add logic, remove friction.</p>
                </div>
                {/* Mock Form Elements */}
                <div className="grid grid-cols-2 gap-3 opacity-60 group-hover:opacity-100 transition-opacity transform group-hover:-translate-y-2 duration-500">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-400">Name</div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-400">Phone + Verification</div>
                  <div className="col-span-2 bg-orange-600 p-3 rounded-lg text-white text-center text-xs font-bold">Submit Order</div>
                </div>
              </div>
            </div>

            {/* Speed - Tall */}
            <div className="row-span-1 lg:row-span-1 group relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 text-white hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 blur-[80px] rounded-full" />
              <div className="relative z-10">
                <Zap className="w-10 h-10 text-orange-400 mb-6" />
                <div className="text-5xl font-black mb-2 flex items-baseline gap-2">
                  0.4s <span className="text-lg font-medium text-slate-400">load</span>
                </div>
                <p className="text-slate-300 font-medium">Lightning Fast Products Pages. Google core vitals optimized automatically.</p>
              </div>
            </div>

            {/* Telegram & TikTok - Standard */}
            <div className="group relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                  {/* Simple TikTok-ish icon using text/svg */}
                  <span className="text-white font-bold text-xl">♪</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Social Synced</h3>
              <p className="text-slate-500">Instant Telegram alerts & TikTok Pixel server-side API.</p>
            </div>

            {/* Multi-Store - Standard */}
            <div className="group relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-12">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Multi-Store</h3>
              <p className="text-slate-500">Run 10+ brands from one dashboard. Switch instantly.</p>
            </div>

            {/* Currencies - Standard */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2rem] p-8 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-12">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Global Ready</h3>
              <p className="text-orange-50 font-medium">100+ Currencies supported. Auto-detect & convert.</p>
            </div>

          </div>

        </section>

        {/* Call to action */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950" />
            {/* Decorative */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full" />

            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
                Ready to Go <span className="text-orange-500">Beast Mode?</span>
              </h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                Stop playing with amateur tools. Build your empire on the engine designed for 8-figure scalers.
              </p>
              <Link href="/signup">
                <Button className="h-20 px-16 text-2xl font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-2xl hover:scale-105 transition-all">
                  Start Building Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-100 bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">GEM</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Login</a>
          </div>
          <p className="text-slate-400 text-sm">© 2026 GEM Inc. Beast Mode Enabled.</p>
        </div>
      </footer>
    </div>
  );
}

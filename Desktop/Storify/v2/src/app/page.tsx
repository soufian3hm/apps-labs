'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, LineChart } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GEM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Launch Your Products with Stunning Landing Pages</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Create High-Converting
            <span className="block gradient-text">Product Pages in Minutes</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Build beautiful, responsive landing pages for your products. Capture leads,
            sync with Google Sheets, and customize every detail with our intuitive platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/30 hover-lift">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/p/promax-wireless-earbuds">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover-lift">
                View Demo Product
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to Sell
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            From beautiful themes to powerful lead capture, we've got you covered.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Lightning Fast',
                description: 'Pages optimized for speed and mobile-first experience. Your products load instantly.',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Built-in Lead Forms',
                description: 'Universal lead capture system with customizable fields and instant Google Sheets sync.',
              },
              {
                icon: <LineChart className="w-6 h-6" />,
                title: 'Theme Per Product',
                description: 'Each product gets its own unique theme. Colors, fonts, layouts — all customizable.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover-lift">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl animated-gradient">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Ready to Launch Your Products?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Join thousands of entrepreneurs using Global E-Marketing to create stunning product pages.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800 shadow-lg">
                Create Your First Page
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">GEM</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Global E-Marketing. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

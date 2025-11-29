import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Zap, Palette, Mic, FileText, ArrowRight } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.6 } },
}

export function ValuePropsSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 via-purple-50 to-white">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-16">
          <motion.div variants={item} className="text-center space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">One Platform. Everything You Need.</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Stop juggling 10 tools. Symplysis is your complete AI marketing studio—no experience required.</p>
          </motion.div>
          <motion.div variants={container} className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'All-in-One Platform', desc: 'Ad copy, landing pages, voiceovers, posters' },
              { title: 'Multi-Language', desc: '40+ languages instantly' },
              { title: 'Multi-Network Ready', desc: 'Meta, TikTok, Google, LinkedIn, Twitter & more' },
              { title: 'Enterprise-Grade', desc: 'Security & reliability built for serious teams' },
            ].map((p, i) => (
              <motion.div key={i} variants={item} className="p-8 rounded-xl bg-white border border-gray-200 hover:border-blue-200 transition-colors">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-600">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const features = [
    { icon: FileText, title: 'AI Ad Copy Generator', desc: 'High-converting ads. 40+ languages. Multi-network optimization.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop' },
    { icon: Zap, title: 'Landing Page Generator', desc: 'HTML pages from scratch. Scrape competitors. Ready-to-deploy code.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop' },
    { icon: Mic, title: 'AI Voiceover Studio', desc: '30+ voices. 100+ languages. Broadcast-quality WAV files.', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop' },
    { icon: Palette, title: 'AI Poster Generator', desc: 'Professional posters in seconds. Brand-consistent designs. High-res export.', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop' },
  ]

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-20">
          <motion.div variants={item} className="text-center space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">🎯 Core Features</h2>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div key={i} variants={item} className="space-y-6">
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 aspect-video border border-gray-200">
                    <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{f.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600">{f.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  const steps = [
    { number: '01', title: 'Drop your URL', desc: 'AI scrapes your site and learns your style in minutes', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop' },
    { number: '02', title: 'Swipe ideas', desc: 'Get fresh, on-brand content ideas daily across all formats', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop' },
    { number: '03', title: 'Edit & customize', desc: 'Tweak anything with our intuitive editor. Zero design skills needed', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop' },
    { number: '04', title: 'Download & publish', desc: 'Launch 10x more content, 75% faster. Export everything ready-to-use', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop' },
  ]

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-20">
          <motion.div variants={item} className="text-center space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">💪 How It Works</h2>
          </motion.div>
          <motion.div variants={container} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={item} className="space-y-4">
                <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">{s.number}</div>
                  <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="text-gray-600">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function WhoIsItForSection() {
  const audiences = [
    'Solo Creators - Professional content without the professional budget',
    'Small Businesses - Look enterprise without the enterprise costs',
    'Performance Marketers - Scale ad testing 10x faster',
    'Agencies - Deliver client campaigns in hours, not weeks',
    'E-commerce Sellers - Generate endless product campaigns',
    'Startups - Launch marketing that competes with the big players',
    'Freelancers - Deliver more work, faster, better margins',
  ]

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-pink-50 via-rose-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-12">
          <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold text-gray-900 text-center">🎯 Who It's For</motion.h2>
          <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
            {audiences.map((a, i) => (
              <motion.div key={i} variants={item} className="p-6 rounded-xl bg-white border border-gray-200 hover:border-rose-200 transition-colors">
                <p className="text-lg text-gray-800">{a}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function SocialProofSection() {
  const testimonials = [
    'From URL to full campaign in under 10 minutes. This is insane.',
    'Finally, AI that gets my voice. Not generic template garbage.',
    'We 5x\'d our ad output without hiring anyone. ROI is ridiculous.',
  ]

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-12">
          <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold text-gray-900 text-center">🔥 Social Proof</motion.h2>
          <motion.div variants={container} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((q, i) => (
              <motion.div key={i} variants={item} className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <p className="text-lg text-gray-800">"{q}"</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function StatsSection() {
  const stats = [
    { label: '40+ Languages', value: 'Go global' },
    { label: '30+ AI Voices', value: 'Every accent' },
    { label: '100+ Language Support', value: 'Voiceovers' },
    { label: '4 Core Tools', value: 'Complete suite' },
  ]

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50 via-amber-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-12">
          <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold text-gray-900 text-center">📊 The Numbers</motion.h2>
          <motion.div variants={container} className="grid md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} variants={item} className="p-8 rounded-xl bg-white border border-gray-200 text-center">
                <div className="text-3xl font-bold text-blue-600">{s.label}</div>
                <p className="text-gray-600 mt-2">{s.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function PricingTeaser() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">💎 Pricing Teaser</h2>
        <p className="text-2xl text-gray-600">Free to Start. Scale When Ready.</p>
        <p className="text-lg text-gray-600">Start creating with our free tier. Upgrade when you're ready to go full throttle.</p>
        <a href="/pricing">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            View Pricing Plans →
          </Button>
        </a>
      </div>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="relative w-full py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
          <h2 className="text-5xl sm:text-6xl font-bold text-white">🚀 Ready to 10x Your Marketing Output?</h2>
          <p className="text-xl text-blue-100">Join thousands creating high-converting campaigns in minutes, not months.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
                Get Started
              </Button>
            </a>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-6 text-lg">
              Book a Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function TrustElements() {
  const elements = [
    '🔒 Enterprise-grade security',
    '⚡ Lightning-fast AI generation',
    '🌍 Global support (40+ languages)',
    '🎯 Multi-network optimization',
    '📱 Works on all devices',
  ]

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-5 gap-6 text-center">
          {elements.map((el, i) => (
            <div key={i} className="text-gray-700">
              {el}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

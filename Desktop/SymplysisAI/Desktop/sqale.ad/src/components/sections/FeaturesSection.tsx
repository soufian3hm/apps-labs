'use client'

import { motion } from 'framer-motion'
import { Zap, Palette, Mic, FileText } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.2, duration: 0.6 },
  },
}

const features = [
  {
    icon: FileText,
    title: 'AI Ad Copy Generator',
    description: 'High-converting ads for Meta, TikTok, Google, LinkedIn & more. 40+ languages. Multi-network optimization built-in.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
  },
  {
    icon: Zap,
    title: 'Landing Page Generator',
    description: 'Complete HTML landing pages from scratch. Scrape & rewrite competitor pages. Download ready-to-deploy code.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    icon: Mic,
    title: 'AI Voiceover Studio',
    description: '30+ professional AI voices. 100+ languages. Download broadcast-quality WAV files. Perfect for video ads.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop',
  },
  {
    icon: Palette,
    title: 'AI Poster Generator',
    description: 'Professional marketing posters in seconds. Brand-consistent designs. Export high-res images. Social media ready.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
  },
]

export function FeaturesSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-20"
        >
          {/* Header */}
          <motion.div variants={item} className="text-center space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">
              🎯 Core Features
            </h2>
          </motion.div>

          {/* Features Grid */}
          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="space-y-6"
                >
                  {/* Image */}
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 aspect-video border border-gray-200">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-lg text-gray-600">
                      {feature.description}
                    </p>
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

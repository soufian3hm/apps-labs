import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      bounce: 0.25,
      duration: 0.8,
    },
  },
}

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          {/* Main Headline */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900"
          >
            Create Pro Marketing Content in Minutes, Not Days
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you're a solopreneur, creator, or enterprise team—generate ad copies, landing pages, voiceovers, and posters that actually convert. AI-powered. Dead simple.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <a href="/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl"
              >
                Get Started
              </Button>
            </a>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-xl border-gray-300 hover:bg-gray-50"
            >
              See It In Action
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Full-width Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.25, duration: 1, delay: 0.6 }}
        className="w-full px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white aspect-video">
            <img
              src="https://auth.symplysis.com/storage/v1/object/public/Logos/Screenshot.png"
              alt="Dashboard preview"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}

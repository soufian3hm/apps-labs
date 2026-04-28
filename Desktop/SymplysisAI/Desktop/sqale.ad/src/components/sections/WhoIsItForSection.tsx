'use client'

import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.6 } },
}

const audiences = [
  'Solo Creators - Professional content without the professional budget',
  'Small Businesses - Look enterprise without the enterprise costs',
  'Performance Marketers - Scale ad testing 10x faster',
  'Agencies - Deliver client campaigns in hours, not weeks',
  'E-commerce Sellers - Generate endless product campaigns',
  'Startups - Launch marketing that competes with the big players',
  'Freelancers - Deliver more work, faster, better margins',
]

export function WhoIsItForSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-pink-50 via-rose-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-12">
          <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold text-gray-900 text-center">
            🎯 Who It's For
          </motion.h2>
          
          <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
            {audiences.map((audience, idx) => (
              <motion.div key={idx} variants={item} className="p-6 rounded-xl bg-white border border-gray-200 hover:border-rose-200 transition-colors">
                <p className="text-lg text-gray-800">{audience}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
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

export function ValuePropsSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 via-purple-50 to-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-16"
        >
          {/* Section Title */}
          <motion.div variants={item} className="text-center space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">
              One Platform. Everything You Need.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop juggling 10 tools and paying for designers, copywriters, and voice actors. Symplysis is your complete AI marketing studio—no experience required.
            </p>
          </motion.div>

          {/* Value Props Grid */}
          <motion.div
            variants={container}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                title: 'All-in-One Platform',
                description: 'Ad copy, landing pages, voiceovers, and posters in one place',
              },
              {
                title: 'Multi-Language',
                description: '40+ languages instantly. Go global without the headache',
              },
              {
                title: 'Multi-Network Ready',
                description: 'Optimized for Meta, TikTok, Google, LinkedIn, Twitter & more',
              },
              {
                title: 'Enterprise-Grade',
                description: 'Security, reliability, and support built for serious teams',
              },
            ].map((prop, i) => (
              <motion.div
                key={i}
                variants={item}
                className="p-8 rounded-xl bg-white border border-gray-200 hover:border-blue-200 transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {prop.title}
                </h3>
                <p className="text-gray-600">{prop.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

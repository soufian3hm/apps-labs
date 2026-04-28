'use client'

import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
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

const steps = [
  {
    number: '01',
    title: 'Drop your URL',
    description: 'AI scrapes your site and learns your style in minutes',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
  },
  {
    number: '02',
    title: 'Swipe ideas',
    description: 'Get fresh, on-brand content ideas daily across all formats',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
  },
  {
    number: '03',
    title: 'Edit & customize',
    description: 'Tweak anything with our intuitive editor. Zero design skills needed',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
  },
  {
    number: '04',
    title: 'Download & publish',
    description: 'Launch 10x more content, 75% faster. Export everything ready-to-use',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-cyan-50 to-blue-50">
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
              💪 How It Works
            </h2>
          </motion.div>

          {/* Steps Grid */}
          <motion.div
            variants={container}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step, idx) => (
              <motion.div key={idx} variants={item} className="space-y-4">
                {/* Image */}
                <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

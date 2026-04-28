import React from 'react'
import { Header } from '../landing/Header'
import { Footer } from '../landing/Footer'
import { Button } from 'components/ui/button'
import { motion } from 'framer-motion'
import { Palette, Image, Download, Sparkles, CheckCircle, ArrowRight, Layers, Maximize } from 'lucide-react'

const PostersPage: React.FC = () => {
  const benefits = [
    { icon: Sparkles, title: 'AI-Powered Design', desc: 'Professional layouts generated in seconds, no design skills needed' },
    { icon: Palette, title: 'Brand Consistent', desc: 'Maintain your brand colors, fonts, and style across all designs' },
    { icon: Maximize, title: 'High-Res Export', desc: 'Download print-ready files in PNG, JPG, or PDF formats' },
    { icon: Layers, title: 'Infinite Variations', desc: 'Generate dozens of unique designs to find the perfect one' },
  ]

  const features = [
    'Custom dimensions for any use case (social, print, web)',
    'Smart text placement and readability optimization',
    'Automatic color palette generation from your brand',
    'Built-in stock photos and graphics library',
    'Editable templates with drag-and-drop',
    'Export in multiple formats (PNG, JPG, PDF, SVG)',
    'Print-ready CMYK color mode',
    'Transparent background support',
  ]

  const posterTypes = [
    { type: 'Social Media', desc: 'Instagram, Facebook, LinkedIn posts', icon: '📱' },
    { type: 'Event Posters', desc: 'Concerts, conferences, workshops', icon: '🎪' },
    { type: 'Product Promos', desc: 'Sales, launches, special offers', icon: '🛍️' },
    { type: 'Infographics', desc: 'Data visualizations, educational content', icon: '📊' },
  ]

  const useCases = [
    { title: 'Marketing Campaigns', desc: 'Create eye-catching promo materials in minutes', icon: '📢' },
    { title: 'Social Content', desc: 'Daily posts, stories, and announcements', icon: '💬' },
    { title: 'Print Materials', desc: 'Flyers, brochures, and physical posters', icon: '🖨️' },
    { title: 'Event Promotion', desc: 'Professional posters for any event', icon: '🎉' },
  ]

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-gray-50 pt-20">
        
        {/* Hero Section */}
        <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-orange-50 opacity-50" />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-2xl mb-4">
                <Image className="w-12 h-12 text-pink-600" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                AI Poster Generator
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
                Professional posters in seconds. Brand-consistent designs. High-res export. No design skills required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <a href="/login">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg">
                    Start Creating Posters <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50 px-8 py-6 text-lg">
                    See Examples
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Design Like a Pro, Instantly</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  No Photoshop. No Canva subscriptions. Just describe your idea and get stunning posters.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all"
                  >
                    <benefit.icon className="w-10 h-10 text-pink-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Poster Types Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-pink-50 to-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Any Type of Poster</h2>
                <p className="text-xl text-gray-600">From social media to print, we've got you covered</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {posterTypes.map((poster, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">{poster.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{poster.type}</h3>
                    <p className="text-gray-600">{poster.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Create Posters in 3 Steps</h2>
                <p className="text-xl text-gray-600">From idea to high-res poster in minutes</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: '01', title: 'Describe Your Vision', desc: 'Tell us the purpose, style, and key message of your poster' },
                  { step: '02', title: 'AI Generates Designs', desc: 'Get multiple design variations to choose from' },
                  { step: '03', title: 'Customize & Export', desc: 'Fine-tune colors, text, layout, and download high-res files' },
                ].map((step, idx) => (
                  <motion.div key={idx} variants={item} className="relative">
                    <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-8 border border-pink-200 h-full">
                      <div className="text-5xl font-bold text-pink-600 mb-4">{step.step}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>
                    {idx < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-8 h-8 text-pink-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features List Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Powerful Design Features</h2>
                <p className="text-xl text-gray-600">Professional tools without the complexity</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <CheckCircle className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Perfect For</h2>
                <p className="text-xl text-gray-600">Marketers, creators, and businesses of all sizes</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {useCases.map((useCase, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">{useCase.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                    <p className="text-gray-600">{useCase.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Export Formats Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8 text-center"
            >
              <Download className="w-16 h-16 text-pink-400 mx-auto" />
              <h2 className="text-4xl sm:text-5xl font-bold">High-Resolution Export</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Download your posters in any format you need, optimized for digital or print.
              </p>
              <div className="grid md:grid-cols-4 gap-6 pt-8">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-3xl font-bold text-pink-400 mb-2">PNG</div>
                  <p className="text-gray-300">Web & Social</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-3xl font-bold text-pink-400 mb-2">JPG</div>
                  <p className="text-gray-300">Universal</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-3xl font-bold text-pink-400 mb-2">PDF</div>
                  <p className="text-gray-300">Print-Ready</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-3xl font-bold text-pink-400 mb-2">SVG</div>
                  <p className="text-gray-300">Scalable</p>
                </div>
              </div>
              <p className="text-gray-300 pt-4">
                All exports support up to 8K resolution (7680x4320) for crystal-clear quality
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Create Your First Poster Today</h2>
              <p className="text-xl text-pink-100">
                Join thousands of marketers and creators designing with AI
              </p>
              <a href="/early-access">
                <Button className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  )
}

export default PostersPage

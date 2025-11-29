import React from 'react'
import { Header } from '../landing/Header'
import { Footer } from '../landing/Footer'
import { Button } from 'components/ui/button'
import { motion } from 'framer-motion'
import { FileText, Globe, Target, Zap, CheckCircle, ArrowRight, TrendingUp, Users } from 'lucide-react'

const AdCopyPage: React.FC = () => {
  const benefits = [
    { icon: Globe, title: '40+ Languages', desc: 'Create ads in any language, reach global audiences effortlessly' },
    { icon: Target, title: 'Multi-Network Ready', desc: 'Optimized for Meta, TikTok, Google, LinkedIn, Twitter & more' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Generate high-converting ad copy in seconds, not hours' },
    { icon: TrendingUp, title: 'Conversion-Focused', desc: 'AI trained on billions of successful ads for maximum ROI' },
  ]

  const features = [
    'Multiple ad format support (carousel, single image, video, stories)',
    'A/B testing copy variations automatically generated',
    'Platform-specific character limits and best practices',
    'Tone and style customization (professional, casual, urgent)',
    'Competitor ad analysis and inspiration',
    'Emoji integration for higher engagement',
    'Call-to-action optimization',
    'Brand voice consistency across campaigns',
  ]

  const useCases = [
    { title: 'E-commerce', desc: 'Product launches, seasonal sales, and promotional campaigns', icon: '🛍️' },
    { title: 'SaaS', desc: 'Free trial sign-ups, feature announcements, webinar promotions', icon: '💻' },
    { title: 'Agencies', desc: 'Multi-client campaigns, rapid testing, scaled content production', icon: '🏢' },
    { title: 'Creators', desc: 'Course launches, sponsorships, community building campaigns', icon: '✨' },
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 pt-20">
        
        {/* Hero Section */}
        <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 opacity-50" />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                AI Ad Copy Generator
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
                High-converting ads in 40+ languages. Multi-network optimization. 10x faster than writing manually.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <a href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                    Start Creating Ads <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
                    See How It Works
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
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Why Choose Our Ad Copy Generator?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Stop wasting hours on copywriting. Let AI create persuasive, platform-optimized ads instantly.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <benefit.icon className="w-10 h-10 text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">How It Works</h2>
                <p className="text-xl text-gray-600">Create professional ad copy in 3 simple steps</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: '01', title: 'Input Your Details', desc: 'Tell us about your product, target audience, and campaign goals' },
                  { step: '02', title: 'AI Generates Options', desc: 'Get multiple ad variations optimized for your chosen platforms' },
                  { step: '03', title: 'Customize & Launch', desc: 'Fine-tune the copy, export, and launch your campaigns' },
                ].map((step, idx) => (
                  <motion.div key={idx} variants={item} className="relative">
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 transition-all h-full">
                      <div className="text-5xl font-bold text-blue-600 mb-4">{step.step}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>
                    {idx < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-8 h-8 text-blue-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features List Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Powerful Features</h2>
                <p className="text-xl text-gray-600">Everything you need to create winning ad campaigns</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Perfect For Every Business</h2>
                <p className="text-xl text-gray-600">No matter your industry, create ads that convert</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {useCases.map((useCase, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
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

        {/* CTA Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Ready to 10x Your Ad Creation?</h2>
              <p className="text-xl text-blue-100">
                Join thousands of marketers creating high-converting ads with AI
              </p>
              <a href="/early-access">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
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

export default AdCopyPage

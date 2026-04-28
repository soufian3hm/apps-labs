import React from 'react'
import { Header } from '../landing/Header'
import { Footer } from '../landing/Footer'
import { Button } from 'components/ui/button'
import { motion } from 'framer-motion'
import { Zap, Code, Eye, Rocket, CheckCircle, ArrowRight, Layout, Smartphone } from 'lucide-react'

const LandingPagesPage: React.FC = () => {
  const benefits = [
    { icon: Code, title: 'Clean HTML/CSS', desc: 'Production-ready code that you can deploy anywhere instantly' },
    { icon: Eye, title: 'Competitor Analysis', desc: 'Scrape and analyze competitor landing pages for inspiration' },
    { icon: Layout, title: 'Conversion-Optimized', desc: 'Layouts designed based on proven conversion principles' },
    { icon: Smartphone, title: 'Fully Responsive', desc: 'Perfect on desktop, tablet, and mobile—automatically' },
  ]

  const features = [
    'Generate pages from scratch with AI prompts',
    'Scrape competitor pages and recreate with your branding',
    'Mobile-first responsive design',
    'SEO-optimized HTML structure',
    'Custom color schemes and typography',
    'Built-in forms and CTAs',
    'Fast loading times and clean code',
    'Export ready-to-deploy files (HTML, CSS, JS)',
  ]

  const useCases = [
    { title: 'Product Launches', desc: 'Create stunning launch pages in minutes, not days', icon: '🚀' },
    { title: 'Lead Generation', desc: 'Build high-converting opt-in pages with embedded forms', icon: '📧' },
    { title: 'Event Pages', desc: 'Webinar registrations, workshops, and conference landing pages', icon: '📅' },
    { title: 'A/B Testing', desc: 'Generate multiple variations to test what converts best', icon: '🧪' },
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 pt-20">
        
        {/* Hero Section */}
        <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 opacity-50" />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-4">
                <Layout className="w-12 h-12 text-purple-600" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Landing Page Generator
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
                HTML pages from scratch. Scrape competitors. Ready-to-deploy code. Build landing pages 10x faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <a href="/early-access">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                    Start Building Pages <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg">
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
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Why Our Landing Page Generator?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  No coding required. No templates. Just describe what you need and get production-ready code.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    <benefit.icon className="w-10 h-10 text-purple-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Two Powerful Ways to Build</h2>
                <p className="text-xl text-gray-600">Create from scratch or learn from competitors</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <motion.div variants={item} className="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Build from Scratch</h3>
                  <ol className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="font-bold text-purple-600 mr-3">1.</span>
                      <span>Describe your product, audience, and goals</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-purple-600 mr-3">2.</span>
                      <span>AI generates a custom landing page design</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-purple-600 mr-3">3.</span>
                      <span>Customize colors, text, and layout</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-purple-600 mr-3">4.</span>
                      <span>Export HTML/CSS and deploy anywhere</span>
                    </li>
                  </ol>
                </motion.div>

                <motion.div variants={item} className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Scrape & Recreate</h3>
                  <ol className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="font-bold text-blue-600 mr-3">1.</span>
                      <span>Paste a competitor's landing page URL</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-blue-600 mr-3">2.</span>
                      <span>AI analyzes structure, layout, and copy</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-blue-600 mr-3">3.</span>
                      <span>Recreates with your branding and content</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-blue-600 mr-3">4.</span>
                      <span>Get production-ready code instantly</span>
                    </li>
                  </ol>
                </motion.div>
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
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Everything You Need</h2>
                <p className="text-xl text-gray-600">Professional landing pages without the dev team</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Popular Use Cases</h2>
                <p className="text-xl text-gray-600">Perfect for any marketing campaign</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {useCases.map((useCase, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
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

        {/* Code Example Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold">Clean, Production-Ready Code</h2>
                <p className="text-xl text-gray-300">
                  No bloat. No frameworks. Just semantic HTML and efficient CSS.
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Landing Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <section class="hero">
    <h1>Transform Your Business</h1>
    <p>The complete solution for modern teams</p>
    <button class="cta">Get Started Free</button>
  </section>
</body>
</html>`}
                </pre>
              </div>
              <p className="text-center text-gray-300">
                ✅ SEO-optimized &nbsp; • &nbsp; ✅ Accessible &nbsp; • &nbsp; ✅ Lightning fast
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Build Your First Landing Page in Minutes</h2>
              <p className="text-xl text-purple-100">
                No coding required. No design skills needed. Just ideas.
              </p>
              <a href="/login">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                  Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
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

export default LandingPagesPage

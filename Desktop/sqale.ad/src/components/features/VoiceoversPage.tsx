import React from 'react'
import { Header } from '../landing/Header'
import { Footer } from '../landing/Footer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Mic, Globe, Volume2, Download, CheckCircle, ArrowRight, Headphones, Sparkles } from 'lucide-react'

const VoiceoversPage: React.FC = () => {
  const benefits = [
    { icon: Mic, title: '30+ AI Voices', desc: 'Professional voice actors in multiple accents and styles' },
    { icon: Globe, title: '100+ Languages', desc: 'Create voiceovers in any language for global reach' },
    { icon: Volume2, title: 'Broadcast Quality', desc: 'Studio-grade WAV files ready for any platform' },
    { icon: Download, title: 'Instant Export', desc: 'Download high-quality audio files immediately' },
  ]

  const features = [
    'Multiple voice styles (professional, casual, energetic, calm)',
    'Adjustable speed, pitch, and emphasis',
    'Natural-sounding pronunciation',
    'Background music and sound effects (coming soon)',
    'SSML support for advanced control',
    'Batch generation for multiple scripts',
    'Export in WAV, MP3, or OGG formats',
    'Commercial usage rights included',
  ]

  const voiceTypes = [
    { type: 'Professional', desc: 'Corporate videos, presentations, training', icon: '💼' },
    { type: 'Casual', desc: 'Social media, vlogs, informal content', icon: '😊' },
    { type: 'Energetic', desc: 'Ads, promos, high-energy content', icon: '⚡' },
    { type: 'Narrative', desc: 'Documentaries, storytelling, audiobooks', icon: '📖' },
  ]

  const useCases = [
    { title: 'YouTube Videos', desc: 'Narration for tutorials, reviews, and explainers', icon: '🎥' },
    { title: 'Ads & Promos', desc: 'Radio spots, video ads, promotional content', icon: '📢' },
    { title: 'E-Learning', desc: 'Course content, training materials, educational videos', icon: '🎓' },
    { title: 'Podcasts', desc: 'Intros, outros, and automated content segments', icon: '🎙️' },
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 pt-20">
        
        {/* Hero Section */}
        <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-teal-50 to-blue-50 opacity-50" />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-2xl mb-4">
                <Headphones className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                AI Voiceover Studio
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
                30+ voices. 100+ languages. Broadcast-quality WAV files. Create professional voiceovers in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <a href="/login">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                    Start Creating Voiceovers <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg">
                    Hear Samples
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
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Studio-Quality Voiceovers, Instantly</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  No recording equipment. No voice actors. Just type your script and get broadcast-ready audio.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
                  >
                    <benefit.icon className="w-10 h-10 text-green-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Voice Types Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Choose Your Voice Style</h2>
                <p className="text-xl text-gray-600">The perfect voice for every type of content</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {voiceTypes.map((voice, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">{voice.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{voice.type}</h3>
                    <p className="text-gray-600">{voice.desc}</p>
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
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">How It Works</h2>
                <p className="text-xl text-gray-600">Professional voiceovers in 3 simple steps</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: '01', title: 'Write Your Script', desc: 'Type or paste your script, up to 10,000 characters' },
                  { step: '02', title: 'Choose Voice & Settings', desc: 'Select voice, language, speed, and tone' },
                  { step: '03', title: 'Generate & Download', desc: 'Get broadcast-quality audio in seconds' },
                ].map((step, idx) => (
                  <motion.div key={idx} variants={item} className="relative">
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-200 h-full">
                      <div className="text-5xl font-bold text-green-600 mb-4">{step.step}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>
                    {idx < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-8 h-8 text-green-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features List Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50 to-white">
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
                <p className="text-xl text-gray-600">Everything you need for professional audio content</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
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
                <p className="text-xl text-gray-600">Content creators, marketers, and businesses</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {useCases.map((useCase, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
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

        {/* Audio Quality Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8 text-center"
            >
              <Sparkles className="w-16 h-16 text-green-400 mx-auto" />
              <h2 className="text-4xl sm:text-5xl font-bold">Broadcast-Quality Audio</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our AI voices are trained on thousands of hours of professional recordings, ensuring natural intonation, perfect pronunciation, and studio-grade quality.
              </p>
              <div className="grid md:grid-cols-3 gap-8 pt-8">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">48kHz</div>
                  <p className="text-gray-300">Sample Rate</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">24-bit</div>
                  <p className="text-gray-300">Audio Depth</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">WAV</div>
                  <p className="text-gray-300">Lossless Format</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-teal-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Ready to Create Your First Voiceover?</h2>
              <p className="text-xl text-green-100">
                Join thousands of creators using AI voiceovers for their content
              </p>
              <a href="/early-access">
                <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
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

export default VoiceoversPage

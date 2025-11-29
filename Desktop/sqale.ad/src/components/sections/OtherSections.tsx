'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.6 } },
}

export function SocialProofSection() {
  const { language } = useLanguage()
  
  const testimonials = {
    en: [
      'From URL to full campaign in under 10 minutes. This is insane.',
      'Finally, AI that gets my voice. Not generic template garbage.',
      'We 5x\'d our ad output without hiring anyone. ROI is ridiculous.',
    ],
    ar: [
      'من الرابط إلى حملة كاملة في أقل من 10 دقائق. هذا جنون.',
      'أخيرًا، ذكاء اصطناعي يفهم أسلوبي. وليس قوالب عامة تافهة.',
      'ضاعفنا إنتاج إعلاناتنا 5 مرات دون توظيف أي شخص. العائد على الاستثمار مذهل.',
    ],
  }

  const titles = {
    en: '🔥 Social Proof',
    ar: '🔥 إثبات اجتماعي',
  }

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-12">
          <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold text-gray-900 text-center">
            {titles[language]}
          </motion.h2>
          <motion.div variants={container} className="grid md:grid-cols-3 gap-8">
            {testimonials[language].map((quote, i) => (
              <motion.div key={i} variants={item} className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <p className="text-lg text-gray-800">"{quote}"</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function StatsSection() {
  const { language } = useLanguage()
  
  const stats = {
    en: [
      { label: '40+ Languages', value: 'Go global' },
      { label: '30+ AI Voices', value: 'Every accent' },
      { label: '100+ Language Support', value: 'Voiceovers' },
      { label: '4 Core Tools', value: 'Complete suite' },
    ],
    ar: [
      { label: 'أكثر من 40 لغة', value: 'انطلق عالميًا' },
      { label: 'أكثر من 30 صوت ذكي', value: 'كل لهجة' },
      { label: 'دعم أكثر من 100 لغة', value: 'التعليقات الصوتية' },
      { label: '4 أدوات أساسية', value: 'مجموعة كاملة' },
    ],
  }

  const titles = {
    en: '📊 The Numbers',
    ar: '📊 الأرقام',
  }

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50 via-amber-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="space-y-12">
          <motion.h2 variants={item} className="text-5xl sm:text-6xl font-bold text-gray-900 text-center">
            {titles[language]}
          </motion.h2>
          <motion.div variants={container} className="grid md:grid-cols-4 gap-6">
            {stats[language].map((stat, i) => (
              <motion.div key={i} variants={item} className="p-8 rounded-xl bg-white border border-gray-200 text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.label}</div>
                <p className="text-gray-600 mt-2">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function PricingTeaser() {
  const { language } = useLanguage()
  
  const content = {
    en: {
      title: '💎 Pricing Teaser',
      subtitle: 'Free to Start. Scale When Ready.',
      description: 'Start creating with our free tier. Upgrade when you\'re ready to go full throttle.',
      button: 'View Pricing Plans →',
    },
    ar: {
      title: '💎 نظرة على الأسعار',
      subtitle: 'ابدأ مجانًا. توسع عندما تكون جاهزًا.',
      description: 'ابدأ الإنشاء بالمستوى المجاني. قم بالترقية عندما تكون جاهزًا للانطلاق بكامل القوة.',
      button: 'عرض خطط الأسعار ←',
    },
  }
  
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-5xl sm:text-6xl font-bold text-gray-900">{content[language].title}</h2>
        <p className="text-2xl text-gray-600">{content[language].subtitle}</p>
        <p className="text-lg text-gray-600">{content[language].description}</p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          {content[language].button}
        </Button>
      </div>
    </section>
  )
}

export function FinalCTA() {
  const { language } = useLanguage()
  
  const content = {
    en: {
      title: '🚀 Ready to 10x Your Marketing Output?',
      description: 'Join thousands creating high-converting campaigns in minutes, not months.',
      button1: 'Start Creating Free',
      button2: 'Book a Demo',
    },
    ar: {
      title: '🚀 هل أنت مستعد لمضاعفة ناتجك التسويقي 10 مرات؟',
      description: 'انضم إلى الآلاف الذين يقومون بإنشاء حملات عالية التحويل في دقائق، وليس في شهور.',
      button1: 'ابدأ الإنشاء مجانًا',
      button2: 'احجز عرضًا توضيحيًا',
    },
  }
  
  return (
    <section className="relative w-full py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
          <h2 className="text-5xl sm:text-6xl font-bold text-white">{content[language].title}</h2>
          <p className="text-xl text-blue-100">{content[language].description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
                {content[language].button1}
              </Button>
            </a>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-6 text-lg">
              {content[language].button2}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function TrustElements() {
  const { language } = useLanguage()
  
  const elements = {
    en: [
      '🔒 Enterprise-grade security',
      '⚡ Lightning-fast AI generation',
      '🌍 Global support (40+ languages)',
      '🎯 Multi-network optimization',
      '📱 Works on all devices',
    ],
    ar: [
      '🔒 أمان على مستوى المؤسسات',
      '⚡ توليد ذكاء اصطناعي سريع البرق',
      '🌍 دعم عالمي (أكثر من 40 لغة)',
      '🎯 تحسين متعدد الشبكات',
      '📱 يعمل على جميع الأجهزة',
    ],
  }

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-5 gap-6 text-center">
          {elements[language].map((el, i) => (
            <div key={i} className="text-gray-700">
              {el}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

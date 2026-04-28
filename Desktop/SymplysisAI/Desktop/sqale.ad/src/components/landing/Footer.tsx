"use client";
import React, { useState } from "react"
import { Instagram, Twitter, Zap, Cookie } from "lucide-react"
import { supabase } from "lib/supabase"
import { useLanguage } from "contexts/LanguageContext"
import { useCookieConsent } from "contexts/CookieConsentContext"

const getFooterColumns = (lang: 'en' | 'ar') => [
  {
    title: lang === 'en' ? 'Product' : 'المنتج',
    links: [
    ],
  },
  {
    title: lang === 'en' ? 'Company' : 'الشركة',
    links: [
      { text: lang === 'en' ? 'FAQ' : 'الأسئلة الشائعة', href: '/faq' },
    ],
  },
  {
    title: lang === 'en' ? 'Legal' : 'القانونية',
    links: [
      { text: lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية', href: '/privacy' },
      { text: lang === 'en' ? 'Terms of Service' : 'شروط الخدمة', href: '/terms' },
      { text: lang === 'en' ? 'Cookie Policy' : 'سياسة ملفات تعريف الارتباط', href: '/cookies' },
    ],
  },
]

const getLegalLinks = (lang: 'en' | 'ar') => [
  { text: lang === 'en' ? 'Terms of Service' : 'شروط الخدمة', href: '/terms' },
  { text: lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية', href: '/privacy' },
  { text: lang === 'en' ? 'Cookie Policy' : 'سياسة ملفات تعريف الارتباط', href: '/cookies' },
]

const socialIcons = [
  { icon: Instagram, href: 'https://instagram.com/symplysis.ai', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/symplysis', label: 'Twitter' },
  { icon: Zap, href: 'https://tiktok.com/@symplysis', label: 'TikTok' },
]

export function Footer() {
  const { language } = useLanguage()
  const { openSettings } = useCookieConsent()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const footerColumns = getFooterColumns(language)
  const legalLinks = getLegalLinks(language)
  
  const content = {
    en: {
      newsletterTitle: 'Stay Updated with Symplysis',
      newsletterDesc: 'Get the latest updates on AI marketing tools, tips, and exclusive features delivered to your inbox.',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
      subscribing: 'Subscribing...',
      subscribeSuccess: 'Thanks for subscribing!',
      description: 'The complete AI marketing studio. Create ads, landing pages, voiceovers, and posters 10x faster.',
      copyright: 'All rights reserved.',
      invalidEmail: 'Please enter a valid email address',
      alreadySubscribed: 'This email is already on the waitlist!',
      errorMsg: 'Something went wrong. Please try again.',
    },
    ar: {
      newsletterTitle: 'ابق على اطلاع مع Symplysis',
      newsletterDesc: 'احصل على آخر التحديثات حول أدوات التسويق بالذكاء الاصطناعي والنصائح والميزات الحصرية في بريدك الوارد.',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      subscribe: 'اشترك',
      subscribing: 'جاري الاشتراك...',
      subscribeSuccess: 'شكراً لاشتراكك!',
      description: 'استوديو التسويق الكامل بالذكاء الاصطناعي. أنشئ إعلانات وصفحات هبوط وتعليقات صوتية وملصقات أسرع بـ 10 مرات.',
      copyright: 'جميع الحقوق محفوظة.',
      invalidEmail: 'الرجاء إدخال عنوان بريد إلكتروني صالح',
      alreadySubscribed: 'هذا البريد الإلكتروني مسجل بالفعل في قائمة الانتظار!',
      errorMsg: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(content[language].invalidEmail)
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('early_access_signups')
        .insert([{ 
          email: email.toLowerCase().trim(),
        }])

      if (insertError) {
        if (insertError.code === '23505') {
          setError(content[language].alreadySubscribed)
        } else {
          console.error('Signup error:', insertError)
          setError(content[language].errorMsg)
        }
        return
      }

      setSuccess(true)
      setEmail('')
      setTimeout(() => setSuccess(false), 5000)
    } catch (error: any) {
      console.error('Unexpected error:', error)
      setError(content[language].errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-white text-gray-900 relative w-full pt-20 pb-10">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
        <div className="bg-blue-400 absolute top-1/3 left-1/4 h-64 w-64 rounded-full opacity-5 blur-3xl" />
        <div className="bg-blue-400 absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full opacity-5 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-16 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 md:p-12 transition-all hover:border-blue-200 hover:shadow-lg">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-bold md:text-3xl text-gray-900">
                {content[language].newsletterTitle}
              </h3>
              <p className="text-gray-600 mb-6">
                {content[language].newsletterDesc}
              </p>
              {!success ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
                  <input
                    type="email"
                    placeholder={content[language].emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none transition-all flex-1"
                    disabled={loading}
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 rounded-lg px-6 py-3 font-medium transition-all transform hover:scale-105 disabled:cursor-not-allowed"
                  >
                    {loading ? content[language].subscribing : content[language].subscribe}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{content[language].subscribeSuccess}</span>
                </div>
              )}
              {error && (
                <div className="mt-3 text-sm text-red-600">{error}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-6 flex items-center space-x-2">
              <img
                src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/Symplysis%20Logo/SymplysisAI.svg"
                alt="Symplysis Logo"
                className="h-10 w-10 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">Symplysis</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-xs">
              {content[language].description}
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-lg font-semibold text-gray-900">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.text}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="border-gray-200 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-gray-600 mb-4 text-sm md:mb-0">
            © {new Date().getFullYear()} Symplysis. {content[language].copyright}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {legalLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-300"
              >
                {link.text}
              </a>
            ))}
            <button
              onClick={openSettings}
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-300 flex items-center gap-1.5"
            >
              <Cookie className="w-4 h-4" />
              {language === 'en' ? 'Cookie Settings' : 'إعدادات ملفات تعريف الارتباط'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

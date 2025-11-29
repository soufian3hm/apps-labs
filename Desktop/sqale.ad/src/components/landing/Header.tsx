import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface NavLink {
  name: string
  href: string
}

interface NavbarProps {
  navLinks?: NavLink[]
}

const getDefaultNavLinks = (lang: 'en' | 'ar'): NavLink[] => [
  { name: lang === 'en' ? 'Features' : 'الميزات', href: '#features' },
  { name: lang === 'en' ? 'Pricing' : 'الأسعار', href: '#pricing' },
  { name: lang === 'en' ? 'FAQ' : 'الأسئلة الشائعة', href: '#faq' },
  { name: lang === 'en' ? 'About' : 'حول', href: '#about' },
]

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')

export function Header({ navLinks }: NavbarProps) {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const { language, setLanguage } = useLanguage()
  
  const defaultNavLinks = getDefaultNavLinks(language)
  const links = navLinks || defaultNavLinks
  
  const featureLinks = {
    en: [
      { name: 'AI Ad Copy Generator', href: '/features/ad-copy' },
      { name: 'Landing Page Generator', href: '/features/landing-pages' },
      { name: 'AI Voiceover Studio', href: '/features/voiceovers' },
      { name: 'AI Poster Generator', href: '/features/posters' },
    ],
    ar: [
      { name: 'مولد نصوص الإعلانات بالذكاء الاصطناعي', href: '/features/ad-copy' },
      { name: 'مولد صفحات الهبوط', href: '/features/landing-pages' },
      { name: 'استوديو التعليق الصوتي بالذكاء الاصطناعي', href: '/features/voiceovers' },
      { name: 'مولد الملصقات بالذكاء الاصطناعي', href: '/features/posters' },
    ],
  }
  
  const buttonText = {
    en: 'Get Started',
    ar: 'انضم للوصول المبكر',
  }

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const mobileMenuVariants = {
    hidden: { x: '100%' },
    visible: { x: '0%', transition: { duration: 0.2 } },
    exit: { x: '100%', transition: { duration: 0.2 } },
  }


  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-4 md:px-8 lg:px-12',
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-xl'
          : 'bg-transparent'
      )}
    >
      <div className={cn(
        'mx-auto flex items-center justify-between transition-all duration-300',
        isScrolled ? 'max-w-6xl' : 'max-w-7xl'
      )}>
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
          <img
            src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/Symplysis%20Logo/SymplysisAI.svg"
            alt="Symplysis Logo"
            className="h-8 w-8 rounded-lg"
          />
          <span className="sr-only">Symplysis Logo</span>
          Symplysis
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          {links.map((link) => {
            if (link.name === 'Features' || link.name === 'الميزات') {
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button className="text-gray-600 hover:text-blue-600 transition-colors duration-150 text-base font-medium flex items-center gap-1">
                    {link.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                      >
                        {featureLinks[language].map((feature) => (
                          <a
                            key={feature.name}
                            href={feature.href}
                            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                          >
                            {feature.name}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }
            return (
              <a key={link.name} href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors duration-150 text-base font-medium">
                {link.name}
              </a>
            )
          })}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-150 text-sm font-medium rounded-lg hover:bg-gray-100"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
          <a href="/signup"><Button className="bg-blue-600 hover:bg-blue-700 text-white">{buttonText[language]}</Button></a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-150"
            aria-label="Toggle language"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-150"
            aria-label="Toggle mobile menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="x-icon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu-icon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 top-[72px] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center space-y-8 md:hidden p-8"
          >
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-900 text-2xl font-semibold hover:text-blue-600 transition-colors duration-150"
                onClick={toggleMobileMenu}
              >
                {link.name}
              </a>
            ))}
            <a href="/signup" onClick={toggleMobileMenu}><Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4 px-8 py-4">
              {buttonText[language]}
            </Button></a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

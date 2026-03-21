'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './theme-toggle';
import { IconMenu, IconClose } from './icons';

const navLinks = [
  { key: 'services', href: '#services' },
  { key: 'projects', href: '#projects' },
  { key: 'process', href: '#process' },
  { key: 'faq', href: '#faq' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setMobileOpen(false);
  };

  const handleAnchorClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg/85 backdrop-blur-xl border-b border-edge shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="font-display-en text-xl tracking-tight font-bold text-fg"
            >
              Apps Labs
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  onClick={(e) => { e.preventDefault(); handleAnchorClick(href); }}
                  className="text-sm text-fg-muted hover:text-fg transition-colors duration-200"
                >
                  {t(key)}
                </a>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Locale removed */}

              <ThemeToggle />

              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); handleAnchorClick('#contact'); }}
                className="ml-1 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors duration-200"
              >
                {t('startProject')}
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 text-fg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg/98 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  onClick={(e) => { e.preventDefault(); handleAnchorClick(href); }}
                  className="text-2xl font-display text-fg hover:text-accent transition-colors"
                >
                  {t(key)}
                </a>
              ))}

              <div className="flex items-center gap-4 pt-4">
                {/* Mobile Locale removed */}
                <ThemeToggle />
              </div>

              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); handleAnchorClick('#contact'); }}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-base font-medium text-white hover:bg-accent-hover transition-colors"
              >
                {t('startProject')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { IconArrowUpRight } from './icons';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [
    { label: nav('services'), href: '#services' },
    { label: nav('projects'), href: '#projects' },
    { label: nav('process'), href: '#process' },
    { label: nav('faq'), href: '#faq' },
    { label: t('email'), href: '#contact' },
  ];

  return (
    <footer className="border-t border-edge bg-bg-alt">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="py-16 lg:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr] gap-12 lg:gap-16">
            <div>
              <p className="font-display-en text-xl font-bold text-fg mb-4">
                {t('brand')}
              </p>
              <p className="text-sm text-fg-muted leading-relaxed max-w-sm mb-6">
                {t('description')}
              </p>
              <a
                href="#contact"
                onClick={(e) => handleAnchorClick(e, '#contact')}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors duration-200"
              >
                {t('startProject')}
                <IconArrowUpRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold text-fg mb-4 uppercase tracking-wider">
                {t('navigation')}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={(e) => handleAnchorClick(e, href)}
                      className="text-sm text-fg-muted hover:text-fg transition-colors duration-200"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-fg mb-4 uppercase tracking-wider">
                {t('contact')}
              </p>
              <a
                href="mailto:hello@apps-labs.co"
                className="text-sm text-fg-muted hover:text-accent transition-colors duration-200 block mb-1"
              >
                {t('email')}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-edge py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-fg-tertiary">
            &copy; {new Date().getFullYear()} Apps Labs. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}

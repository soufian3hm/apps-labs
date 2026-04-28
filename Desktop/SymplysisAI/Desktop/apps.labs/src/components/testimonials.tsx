'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';

const quoteKeys = [1, 2] as const;

export function Testimonials() {
  const t = useTranslations('testimonials');

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-bg-alt">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionReveal>
          <div className="max-w-2xl mb-16 lg:mb-20 mx-auto text-center flex flex-col items-center">
            <p className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-wide uppercase mb-4">
              <span className="w-6 h-px bg-accent" />
              {t('label')}
              <span className="w-6 h-px bg-accent" />
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight text-fg mb-5">
              {t('title')}
            </h2>
            <p className="text-fg-muted text-lg leading-relaxed">
              {t('description')}
            </p>
          </div>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {quoteKeys.map((num, i) => (
            <SectionReveal key={num} delay={i * 0.12}>
              <div className="relative h-full rounded-2xl border border-edge bg-bg p-8 sm:p-10 hover:border-accent/30 transition-colors duration-300">
                <div className="mb-6 text-accent">
                  <svg className="w-8 h-8 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                <p className="text-lg sm:text-xl text-fg leading-relaxed mb-8 italic">
                  "{t(`t${num}quote`)}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                    {t(`t${num}author`).charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-fg">
                      {t(`t${num}author`)}
                    </h4>
                  </div>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';

const stepKeys = [1, 2, 3, 4] as const;

export function ProcessSection() {
  const t = useTranslations('process');

  return (
    <section id="process" className="py-24 lg:py-32 bg-bg">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionReveal>
          <div className="max-w-2xl mb-16 lg:mb-20">
            <p className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-wide uppercase mb-4">
              <span className="w-6 h-px bg-accent" />
              {t('label')}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight text-fg mb-5">
              {t('title')}
            </h2>
            <p className="text-fg-muted text-lg leading-relaxed">
              {t('description')}
            </p>
          </div>
        </SectionReveal>

        <div className="relative">
          {/* Connection line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px bg-edge" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {stepKeys.map((num, i) => (
              <SectionReveal key={num} delay={i * 0.12}>
                <div className={`relative ${i > 0 ? 'lg:ps-10' : ''} ${i < 3 ? 'lg:pe-10' : ''}`}>
                  {/* Step number */}
                  <div className="relative z-10 w-12 h-12 rounded-full border-2 border-edge bg-bg-alt flex items-center justify-center mb-6 lg:mb-8">
                    <span className="text-sm font-bold text-accent">
                      {t(`step${num}Num`)}
                    </span>
                  </div>

                  {/* Connector dot on the line (desktop) */}
                  <div className="hidden lg:block absolute top-[3.75rem] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent" />

                  <h3 className="text-lg font-semibold text-fg mb-3">
                    {t(`step${num}Title`)}
                  </h3>
                  <p className="text-sm text-fg-muted leading-relaxed">
                    {t(`step${num}Desc`)}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

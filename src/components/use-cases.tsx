'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';

const caseKeys = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function UseCases() {
  const t = useTranslations('useCases');

  return (
    <section className="py-24 lg:py-32 bg-bg-alt">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionReveal>
          <div className="max-w-3xl mb-16 lg:mb-20">
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

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {caseKeys.map((num, i) => (
            <SectionReveal key={num} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-edge bg-bg p-7 lg:p-8 hover:border-accent/30 transition-colors duration-300">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-4">
                  {t(`case${num}Tag`)}
                </p>
                <h3 className="text-lg font-semibold text-fg mb-4 leading-snug">
                  {t(`case${num}Title`)}
                </h3>
                <p className="text-sm text-fg-muted leading-relaxed">
                  {t(`case${num}Desc`)}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

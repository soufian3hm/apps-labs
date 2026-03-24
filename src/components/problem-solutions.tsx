'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';

const cardKeys = [1, 2, 3, 4] as const;

export function ProblemSolutions() {
  const t = useTranslations('problems');

  return (
    <section id="problems" className="scroll-mt-24 py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionReveal>
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-16 mb-16 lg:mb-20">
            <div>
              <p className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-wide uppercase mb-4">
                <span className="w-6 h-px bg-accent" />
                {t('label')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight text-fg">
                {t('title')}
              </h2>
            </div>
            <div className="lg:pt-10">
              <p className="text-fg-muted text-lg leading-relaxed max-w-2xl">
                {t('description')}
              </p>
            </div>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cardKeys.map((num, i) => (
            <SectionReveal key={num} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-edge bg-surface p-8 lg:p-9">
                <h3 className="text-xl font-semibold text-fg mb-6 leading-snug">
                  {t(`card${num}Title`)}
                </h3>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
                  {t('problemLabel')}
                </p>
                <p className="text-sm text-fg-muted leading-relaxed mb-6">
                  {t(`card${num}Problem`)}
                </p>

                <div className="w-full h-px bg-edge mb-6" />

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
                  {t('solutionLabel')}
                </p>
                <p className="text-sm text-fg leading-relaxed">
                  {t(`card${num}Solution`)}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

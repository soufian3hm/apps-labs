'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';

const stepKeys = [1, 2, 3] as const;

export function ProcessSection() {
  const t = useTranslations('process');

  return (
    <section id="process" className="bg-bg py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionReveal>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-accent">
                <span className="h-px w-6 bg-accent" />
                {t('label')}
              </p>
              <h2 className="font-display text-3xl tracking-tight text-fg sm:text-4xl lg:text-[2.6rem]">
                {t('title')}
              </h2>
            </div>
            <div className="lg:pt-8">
              <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">
                {t('description')}
              </p>
            </div>
          </div>
        </SectionReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {stepKeys.map((num, index) => (
            <SectionReveal key={num} delay={index * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-edge bg-surface p-7 lg:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-bg-alt text-sm font-bold text-accent">
                  {t(`step${num}Num`)}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-fg">{t(`step${num}Title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {t(`step${num}Desc`)}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

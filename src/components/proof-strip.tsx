'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';
import { IconCheck, IconClock, IconShield } from './icons';
import type { ReactNode } from 'react';

const proofKeys = [1, 2, 3] as const;
const expectationKeys = [1, 2, 3] as const;
const expectationIcons: ReactNode[] = [
  <IconClock key="clock" size={18} />,
  <IconCheck key="check" size={18} />,
  <IconShield key="shield" size={18} />,
];

export function ProofStrip() {
  const t = useTranslations('proof');

  return (
    <section className="border-y border-edge bg-bg-alt/70 py-20 lg:py-24">
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

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {proofKeys.map((num, index) => (
            <SectionReveal key={num} delay={index * 0.08}>
              <div className="h-full rounded-2xl border border-edge bg-bg p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {t(`proof${num}Label`)}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-fg">
                  {t(`proof${num}Title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {t(`proof${num}Desc`)}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {expectationKeys.map((num, index) => (
            <SectionReveal key={num} delay={0.2 + index * 0.08}>
              <div className="flex h-full gap-3 rounded-2xl border border-edge bg-surface p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  {expectationIcons[index]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-fg">{t(`expectation${num}Title`)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                    {t(`expectation${num}Desc`)}
                  </p>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

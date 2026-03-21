'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';
import { IconMessageCircle, IconLayers, IconPalette, IconShield } from './icons';
import type { ReactNode } from 'react';

const pointIcons: ReactNode[] = [
  <IconMessageCircle key="msg" size={22} />,
  <IconLayers key="layers" size={22} />,
  <IconPalette key="palette" size={22} />,
  <IconShield key="shield" size={22} />,
];

const pointKeys = [1, 2, 3, 4] as const;

export function WhyChooseUs() {
  const t = useTranslations('whyUs');

  return (
    <section className="py-24 lg:py-32 bg-bg-alt">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionReveal>
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6 lg:gap-16 mb-16 lg:mb-20">
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
              <p className="text-fg-muted text-lg leading-relaxed max-w-xl">
                {t('description')}
              </p>
            </div>
          </div>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {pointKeys.map((num, i) => (
            <SectionReveal key={num} delay={i * 0.1}>
              <div className="group rounded-2xl border border-edge p-8 lg:p-10 hover:border-accent/30 hover:bg-accent/[0.02] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                  {pointIcons[i]}
                </div>
                <h3 className="text-lg font-semibold text-fg mb-3">
                  {t(`point${num}Title`)}
                </h3>
                <p className="text-sm text-fg-muted leading-relaxed">
                  {t(`point${num}Desc`)}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

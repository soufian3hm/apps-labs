'use client';

import { useTranslations } from 'next-intl';
import { SectionReveal } from './section-reveal';
import {
  IconGlobe,
  IconCode,
  IconLayoutDashboard,
  IconCpu,
  IconFileText,
  IconLayers,
} from './icons';
import type { ReactNode } from 'react';

const serviceIcons: Record<string, ReactNode> = {
  commerce: <IconGlobe size={24} />,
  platforms: <IconCode size={24} />,
  operations: <IconLayoutDashboard size={24} />,
  automation: <IconCpu size={24} />,
  content: <IconFileText size={24} />,
  experiences: <IconLayers size={24} />,
};

const serviceKeys = ['commerce', 'platforms', 'operations', 'automation', 'content', 'experiences'] as const;

export function Services() {
  const t = useTranslations('services');

  return (
    <section id="services" className="py-24 lg:py-32 bg-bg-alt">
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

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-px bg-edge rounded-2xl overflow-hidden border border-edge">
          {serviceKeys.map((key, i) => {
            const items = t(`${key}Items`).split('|');
            return (
              <SectionReveal key={key} delay={i * 0.1}>
                <div className="bg-bg-alt p-8 lg:p-10 h-full group hover:bg-surface transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                    {serviceIcons[key]}
                  </div>
                  <h3 className="text-lg font-semibold text-fg mb-4">
                    {t(`${key}Title`)}
                  </h3>
                  <p className="text-sm text-fg-muted leading-relaxed mb-5">
                    {t(`${key}Desc`)}
                  </p>
                  <ul className="space-y-2.5">
                    {items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2.5 text-sm text-fg-muted leading-relaxed"
                      >
                        <span className="mt-2 w-1 h-1 rounded-full bg-accent shrink-0" />
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

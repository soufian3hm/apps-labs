'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { IconArrowRight, IconArrowUpRight } from './icons';

const supportPointKeys = [1, 2, 3, 4] as const;
const panelCardKeys = [1, 2, 3] as const;

function HeroPanel() {
  const t = useTranslations('hero');

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(193,127,62,0.16),transparent_55%)]" />
      <div className="relative rounded-[2rem] border border-edge bg-surface/95 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] xl:p-8">
        <div className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          <span className="h-px w-6 bg-accent" />
          {t('panelLabel')}
        </div>

        <div className="space-y-4">
          {panelCardKeys.map((num) => (
            <div key={num} className="rounded-2xl border border-edge bg-bg p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {t(`card${num}Label`)}
              </p>
              <h3 className="mt-2 text-base font-semibold text-fg">{t(`card${num}Title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {t(`card${num}Desc`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-accent/15 bg-accent/5 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {t('capacityLabel')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-fg">
            {t('capacityText')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden pb-16 pt-28 lg:pb-20 lg:pt-36">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(193,127,62,0.12),transparent_62%)]" />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-accent"
            >
              <span className="h-px w-6 bg-accent" />
              {t('label')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-display text-4xl leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-[3.4rem] xl:text-[4rem]"
            >
              {t('title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted"
            >
              {t('description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
              >
                {t('cta1')}
                <IconArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </a>
              <a
                href="#problems"
                className="group inline-flex items-center gap-2.5 rounded-full border border-edge px-7 py-3.5 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg"
              >
                {t('cta2')}
                <IconArrowUpRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2"
            >
              {supportPointKeys.map((num) => (
                <div
                  key={num}
                  className="flex items-center gap-2.5 rounded-full border border-edge bg-surface/80 px-4 py-3 text-sm text-fg-muted"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{t(`point${num}Title`)}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.28 }}
          >
            <HeroPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

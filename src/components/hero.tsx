'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { IconArrowRight, IconArrowUpRight } from './icons';

function HeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[520px]" dir="ltr">
      <svg
        viewBox="0 0 480 520"
        fill="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Grid lines */}
        <motion.line
          x1="0" y1="130" x2="480" y2="130"
          stroke="var(--border-color)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        <motion.line
          x1="0" y1="260" x2="480" y2="260"
          stroke="var(--border-color)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
        <motion.line
          x1="0" y1="390" x2="480" y2="390"
          stroke="var(--border-color)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.7 }}
        />
        <motion.line
          x1="160" y1="0" x2="160" y2="520"
          stroke="var(--border-color)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />
        <motion.line
          x1="320" y1="0" x2="320" y2="520"
          stroke="var(--border-color)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
        />

        {/* Module blocks */}
        <motion.rect
          x="20" y="20" width="120" height="90" rx="6"
          fill="var(--accent)" fillOpacity="0.08"
          stroke="var(--accent)" strokeWidth="1"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        />
        <motion.text
          x="44" y="72" fill="var(--accent)"
          fontSize="11" fontWeight="500" fontFamily="var(--font-body-active)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          WEBSITE
        </motion.text>

        <motion.rect
          x="180" y="20" width="120" height="90" rx="6"
          fill="var(--surface)" stroke="var(--border-color)" strokeWidth="1"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        />
        <motion.text
          x="199" y="72" fill="var(--foreground-muted)"
          fontSize="11" fontWeight="500" fontFamily="var(--font-body-active)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          WEB APP
        </motion.text>

        <motion.rect
          x="340" y="20" width="120" height="90" rx="6"
          fill="var(--surface)" stroke="var(--border-color)" strokeWidth="1"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        />
        <motion.text
          x="370" y="72" fill="var(--foreground-muted)"
          fontSize="11" fontWeight="500" fontFamily="var(--font-body-active)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          AI TOOL
        </motion.text>

        {/* Large feature panel */}
        <motion.rect
          x="20" y="150" width="280" height="190" rx="8"
          fill="var(--surface)" stroke="var(--border-color)" strokeWidth="1"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        />
        <motion.rect
          x="36" y="170" width="100" height="6" rx="3"
          fill="var(--accent)" fillOpacity="0.5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        />
        <motion.rect
          x="36" y="190" width="200" height="4" rx="2"
          fill="var(--border-color)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        />
        <motion.rect
          x="36" y="204" width="160" height="4" rx="2"
          fill="var(--border-color)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.55 }}
        />
        {/* Mini chart bars */}
        <motion.rect x="36" y="280" width="24" height="40" rx="3" fill="var(--accent)" fillOpacity="0.15"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: '100%' }}
          transition={{ delay: 1.6, duration: 0.4 }}
        />
        <motion.rect x="68" y="260" width="24" height="60" rx="3" fill="var(--accent)" fillOpacity="0.25"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: '100%' }}
          transition={{ delay: 1.7, duration: 0.4 }}
        />
        <motion.rect x="100" y="270" width="24" height="50" rx="3" fill="var(--accent)" fillOpacity="0.2"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: '100%' }}
          transition={{ delay: 1.8, duration: 0.4 }}
        />
        <motion.rect x="132" y="250" width="24" height="70" rx="3" fill="var(--accent)" fillOpacity="0.35"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: '100%' }}
          transition={{ delay: 1.9, duration: 0.4 }}
        />

        {/* Side panel */}
        <motion.rect
          x="320" y="150" width="140" height="90" rx="8"
          fill="var(--accent)" fillOpacity="0.06"
          stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.3"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        />
        <motion.text
          x="340" y="200" fill="var(--accent)"
          fontSize="10" fontWeight="600" fontFamily="var(--font-body-active)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          DASHBOARD
        </motion.text>

        <motion.rect
          x="320" y="260" width="140" height="80" rx="8"
          fill="var(--surface)" stroke="var(--border-color)" strokeWidth="1"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
        />
        <motion.text
          x="340" y="306" fill="var(--foreground-muted)"
          fontSize="10" fontWeight="500" fontFamily="var(--font-body-active)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          INTERNAL TOOL
        </motion.text>

        {/* Bottom wide panel */}
        <motion.rect
          x="20" y="370" width="440" height="70" rx="8"
          fill="var(--surface)" stroke="var(--border-color)" strokeWidth="1"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.4 }}
        />
        <motion.rect
          x="36" y="390" width="60" height="6" rx="3"
          fill="var(--accent)" fillOpacity="0.4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        />
        <motion.rect
          x="36" y="408" width="200" height="4" rx="2"
          fill="var(--border-color)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.75 }}
        />
        <motion.rect
          x="36" y="420" width="140" height="4" rx="2"
          fill="var(--border-color)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        />

        {/* Connection dots */}
        {[
          [160, 130], [320, 130], [160, 260], [320, 260], [160, 390], [320, 390],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r="3"
            fill="var(--accent)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 1.5 + i * 0.1 }}
          />
        ))}

        {/* Floating accent ring */}
        <motion.circle
          cx="440" cy="480" r="25"
          stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeOpacity="0.3"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        />
        <motion.circle
          cx="440" cy="480" r="6"
          fill="var(--accent)" fillOpacity="0.3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        />
      </svg>
    </div>
  );
}

export function Hero() {
  const t = useTranslations('hero');

  const supportPoints = [
    { title: t('forEveryoneTitle'), desc: t('forEveryoneDesc') },
    { title: t('anythingWebTitle'), desc: t('anythingWebDesc') },
    { title: t('builtToLaunchTitle'), desc: t('builtToLaunchDesc') },
  ];

  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-16 items-start">
          {/* Left content */}
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-wide uppercase mb-6"
            >
              <span className="w-6 h-px bg-accent" />
              {t('label')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.1] tracking-tight text-fg mb-6"
            >
              {t('title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-fg-muted text-lg leading-relaxed max-w-xl mb-10"
            >
              {t('description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-16"
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors duration-200"
              >
                {t('cta1')}
                <IconArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </a>
              <a
                href="#projects"
                className="group inline-flex items-center gap-2.5 rounded-full border border-edge px-7 py-3.5 text-sm font-medium text-fg hover:border-fg transition-colors duration-200"
              >
                {t('cta2')}
                <IconArrowUpRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </motion.div>

            {/* Support points */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x rtl:sm:divide-x-reverse divide-edge"
            >
              {supportPoints.map((point, i) => (
                <div
                  key={i}
                  className={`${i > 0 ? 'sm:ps-6' : ''} ${
                    i < supportPoints.length - 1 ? 'sm:pe-6' : ''
                  }`}
                >
                  <p className="text-sm font-semibold text-fg mb-1">{point.title}</p>
                  <p className="text-sm text-fg-muted leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

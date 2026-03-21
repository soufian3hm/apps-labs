'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { SectionReveal } from './section-reveal';
import { IconChevronDown } from './icons';

const faqKeys = [1, 2, 3, 4, 5] as const;

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-edge last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-fg pe-8 group-hover:text-accent transition-colors duration-200">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-fg-muted"
        >
          <IconChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-fg-muted leading-relaxed max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 lg:py-32 bg-bg-alt">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[0.8fr_1fr] gap-12 lg:gap-20">
          <SectionReveal>
            <div className="lg:sticky lg:top-28">
              <p className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-wide uppercase mb-4">
                <span className="w-6 h-px bg-accent" />
                {t('label')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight text-fg">
                {t('title')}
              </h2>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="divide-y-0">
              {faqKeys.map((num, i) => (
                <FaqItem
                  key={num}
                  question={t(`q${num}`)}
                  answer={t(`a${num}`)}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

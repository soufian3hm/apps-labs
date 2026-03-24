'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { SectionReveal } from './section-reveal';
import { IconArrowUpRight } from './icons';

const projectData = [
  {
    key: 'project1',
    gradient: 'from-amber-600/10 to-orange-500/5',
    accentBar: 'bg-amber-600/60',
  },
  {
    key: 'project2',
    gradient: 'from-emerald-600/10 to-teal-500/5',
    accentBar: 'bg-emerald-600/60',
  },
  {
    key: 'project3',
    gradient: 'from-blue-600/10 to-indigo-500/5',
    accentBar: 'bg-blue-600/60',
  },
] as const;

export function Projects() {
  const t = useTranslations('projects');

  return (
    <section id="projects" className="py-24 lg:py-32">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {projectData.map((project, i) => (
            <SectionReveal key={project.key} delay={i * 0.08}>
              <motion.a
                href="#contact"
                className={`group relative flex h-full flex-col rounded-2xl border border-edge overflow-hidden bg-gradient-to-br ${project.gradient} hover:border-accent/30 transition-colors duration-300`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-8 sm:p-9 h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-5">
                    <span className={`w-8 h-1 rounded-full ${project.accentBar} shrink-0 mt-2`} />
                    <span className="text-xs font-medium text-fg-muted uppercase tracking-wider leading-relaxed">
                      {t(`${project.key}Type`)}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl text-fg mb-8">
                    {t(`${project.key}Name`)}
                  </h3>

                  <div className="space-y-6 flex-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
                        {t('problemLabel')}
                      </p>
                      <p className="text-sm text-fg-muted leading-relaxed">
                        {t(`${project.key}Problem`)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
                        {t('buildLabel')}
                      </p>
                      <p className="text-sm text-fg-muted leading-relaxed">
                        {t(`${project.key}Build`)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
                        {t('outcomeLabel')}
                      </p>
                      <p className="text-sm text-fg leading-relaxed">
                        {t(`${project.key}Outcome`)}
                      </p>
                    </div>
                  </div>

                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-fg group-hover:text-accent transition-colors duration-200">
                    {t(`${project.key}Cta`)}
                    <IconArrowUpRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </motion.a>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

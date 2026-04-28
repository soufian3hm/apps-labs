'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { SectionReveal } from './section-reveal';
import { IconArrowUpRight } from './icons';

const projectData = [
  {
    nameKey: 'project1Name',
    typeKey: 'project1Type',
    descKey: 'project1Desc',
    ctaKey: 'project1Cta',
    gradient: 'from-amber-600/10 to-orange-500/5',
    accentBar: 'bg-amber-600/60',
    mrr: '+$10k MRR',
    featured: true,
  },
  {
    nameKey: 'project2Name',
    typeKey: 'project2Type',
    descKey: 'project2Desc',
    ctaKey: 'project2Cta',
    gradient: 'from-emerald-600/10 to-teal-500/5',
    accentBar: 'bg-emerald-600/60',
    mrr: '+$30k MRR',
    featured: false,
  },
  {
    nameKey: 'project3Name',
    typeKey: 'project3Type',
    descKey: 'project3Desc',
    ctaKey: 'project3Cta',
    gradient: 'from-blue-600/10 to-indigo-500/5',
    accentBar: 'bg-blue-600/60',
    mrr: '+$50k MRR',
    featured: false,
  },
] as const;

export function Projects() {
  const t = useTranslations('projects');

  return (
    <section id="projects" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionReveal>
          <div className="max-w-2xl mb-16 lg:mb-20">
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

        {/* Featured project */}
        <SectionReveal>
          <motion.a
            href="#contact"
            className="group relative block rounded-2xl border border-edge overflow-hidden mb-6 bg-gradient-to-br from-amber-600/5 to-orange-500/5 hover:border-accent/30 transition-colors duration-300"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-8 sm:p-10 lg:p-14">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start sm:items-center gap-3 mb-4 mt-2">
                    <span className="w-8 h-1 rounded-full bg-amber-600/60 shrink-0 mt-1.5 sm:mt-0" />
                    <span className="text-xs font-medium text-fg-muted uppercase tracking-wider leading-relaxed">
                      {t('project1Type')}
                    </span>
                  </div>
                  <h3 className="font-display text-3xl sm:text-4xl text-fg mb-4">
                    {t('project1Name')}
                  </h3>
                  <p className="text-fg-muted text-base leading-relaxed max-w-lg">
                    {t('project1Desc')}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-start sm:items-end gap-3 mt-2 sm:mt-0">
                  <span className="inline-flex items-center gap-2 rounded-full border border-edge group-hover:border-accent group-hover:text-accent px-5 py-2.5 text-sm font-medium text-fg transition-colors duration-200">
                    {t('project1Cta')}
                    <IconArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#10b981]/10 border border-[#10b981]/25 px-3 py-1 text-xs font-bold tracking-wide text-[#10b981] uppercase shadow-sm">
                    {projectData[0].mrr}
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        </SectionReveal>

        {/* Other projects */}
        <div className="grid sm:grid-cols-2 gap-6">
          {projectData.slice(1).map((project, i) => (
            <SectionReveal key={project.nameKey} delay={i * 0.1}>
              <motion.a
                href="#contact"
                className={`group relative block rounded-2xl border border-edge overflow-hidden bg-gradient-to-br ${project.gradient} hover:border-accent/30 transition-colors duration-300 h-full`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className={`w-8 h-1 rounded-full ${project.accentBar} shrink-0 mt-1.5 sm:mt-0`} />
                      <span className="text-xs font-medium text-fg-muted uppercase tracking-wider leading-relaxed flex-1">
                        {t(project.typeKey)}
                      </span>
                    </div>
                    <span className="inline-flex self-start sm:ms-auto items-center rounded-full bg-[#10b981]/15 border border-[#10b981]/25 px-2.5 py-0.5 text-[0.65rem] sm:text-xs font-extrabold tracking-wide text-[#10b981] shrink-0 uppercase">
                      {project.mrr}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-fg mb-3">
                    {t(project.nameKey)}
                  </h3>
                  <p className="text-fg-muted text-sm leading-relaxed mb-6">
                    {t(project.descKey)}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-fg group-hover:text-accent transition-colors duration-200">
                    {t(project.ctaKey)}
                    <IconArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

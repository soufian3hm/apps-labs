'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { SectionReveal } from './section-reveal';
import { IconMail, IconUsers, IconLayers, IconSend, IconCheck } from './icons';
import { event as trackEvent } from '@/components/pixel-provider';

const contactSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  whatsapp: z.string().min(1),
  budget: z.string().min(1),
  projectType: z.string().min(1),
  message: z.string().min(1),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function Contact() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ContactFormData | null>(null);
  
  // Modal selection states
  const next5Days = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date>(next5Days[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    setFormData(data);
    setShowModal(true);
  };

  const onFinalize = async () => {
    if (!formData || !selectedDate || !selectedTime) return;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          meeting_date_str: selectedDate.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' }),
          meeting_time: selectedTime,
          meeting_raw_date: selectedDate.toISOString()
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      trackEvent('Lead', { currency: 'USD', value: 100.00 });
      setShowModal(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Something went wrong submitting your request. Please try again.');
    }
  };

  const generateTimeSlots = (date: Date) => {
    const slots = [];
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    for (let h = 9; h <= 20; h++) {
      for (const m of [0, 30]) {
        const slot = new Date(date);
        slot.setHours(h, m, 0, 0);
        if (!isToday || slot > now) {
          slots.push(slot.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }));
        }
      }
    }
    return slots;
  };

  const currentSlots = generateTimeSlots(selectedDate);

  const projectOptions = t('formProjectOptions').split(',');
  const budgetOptions = t('formBudgetOptions')
    .split('|')
    .map((opt) => opt.trim())
    .filter(Boolean);

  const infoPanels = [
    { icon: <IconMail size={18} />, label: t('emailLabel'), value: t('emailValue') },
    { icon: <IconUsers size={18} />, label: t('clientTypeLabel'), value: t('clientTypeValue') },
    { icon: <IconLayers size={18} />, label: t('projectTypeLabel'), value: t('projectTypeValue') },
  ];

  const inputClasses =
    'w-full rounded-xl border border-edge bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-tertiary focus:border-accent focus:ring-0 transition-colors duration-200';
  const labelClasses = 'block text-sm font-medium text-fg mb-2';
  const errorClasses = 'text-xs text-red-500 mt-1';

  return (
    <section id="contact" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[0.85fr_1fr] gap-12 lg:gap-20">
          {/* Left info */}
          <SectionReveal>
            <div>
              <p className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-wide uppercase mb-4">
                <span className="w-6 h-px bg-accent" />
                {t('label')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight text-fg mb-5">
                {t('title')}
              </h2>
              <p className="text-fg-muted text-lg leading-relaxed mb-10">
                {t('description')}
              </p>

              <div className="space-y-6">
                {infoPanels.map((panel, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      {panel.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-fg mb-0.5">{panel.label}</p>
                      <p className="text-sm text-fg-muted">{panel.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Right form */}
          <SectionReveal delay={0.15}>
            <div className="rounded-2xl border border-edge bg-surface p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-5">
                      <IconCheck size={28} />
                    </div>
                    <p className="text-lg font-medium text-fg mb-2">{t('formSuccess')}</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className={labelClasses}>
                          {t('formName')}
                        </label>
                        <input
                          id="name"
                          type="text"
                          className={inputClasses}
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className={errorClasses}>{t('formName')}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="company" className={labelClasses}>
                          {t('formCompany')}
                        </label>
                        <input
                          id="company"
                          type="text"
                          className={inputClasses}
                          {...register('company')}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className={labelClasses}>
                          {t('formEmail')}
                        </label>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          className={inputClasses}
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className={errorClasses}>{t('formEmail')}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="whatsapp" className={labelClasses}>
                          {t('formWhatsApp')}
                        </label>
                        <Controller
                          name="whatsapp"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <div className="relative w-full rounded-xl border border-edge bg-surface focus-within:border-accent transition-colors duration-200 flex" dir="ltr">
                              <PhoneInput
                                defaultCountry="ae"
                                value={value}
                                onChange={onChange}
                                forceDialCode
                                style={{ width: '100%' }}
                                inputStyle={{
                                  width: '100%',
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: 'var(--foreground)',
                                  fontSize: '0.875rem',
                                  padding: '0.75rem 1rem'
                                }}
                                countrySelectorStyleProps={{
                                  buttonStyle: {
                                    background: 'transparent',
                                    border: 'none',
                                    paddingLeft: '1rem',
                                    paddingRight: '0.5rem',
                                    height: '100%',
                                    borderTopLeftRadius: '0.75rem',
                                    borderBottomLeftRadius: '0.75rem'
                                  }
                                }}
                              />
                            </div>
                          )}
                        />
                        {errors.whatsapp && (
                          <p className={errorClasses}>{t('formWhatsApp')}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="budget" className={labelClasses}>
                          {t('formBudget')}
                        </label>
                        <select
                          id="budget"
                          className={inputClasses}
                          {...register('budget')}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            —
                          </option>
                          {budgetOptions.map((opt) => (
                            <option key={opt} value={opt.trim()}>
                              {opt.trim()}
                            </option>
                          ))}
                        </select>
                        {errors.budget && (
                          <p className={errorClasses}>{t('formBudget')}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="projectType" className={labelClasses}>
                          {t('formProjectType')}
                        </label>
                        <select
                          id="projectType"
                          className={inputClasses}
                          {...register('projectType')}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            —
                          </option>
                          {projectOptions.map((opt) => (
                            <option key={opt} value={opt.trim()}>
                              {opt.trim()}
                            </option>
                          ))}
                        </select>
                        {errors.projectType && (
                          <p className={errorClasses}>{t('formProjectType')}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className={labelClasses}>
                        {t('formMessage')}
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className={`${inputClasses} resize-none`}
                        {...register('message')}
                      />
                      {errors.message && (
                        <p className={errorClasses}>{t('formMessage')}</p>
                      )}
                      <p className="text-xs text-fg-tertiary mt-2">
                        {t('formHint')}
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors duration-200 w-full sm:w-auto justify-center"
                    >
                      {t('formSubmit')}
                      <IconSend
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:rotate-[270deg]"
                      />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </SectionReveal>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl border border-edge bg-surface p-6 sm:p-8 shadow-2xl relative"
            >
              <h3 className="text-2xl font-display text-fg mb-1">{t('modalTitle')}</h3>
              <p className="text-sm text-fg-muted mb-6">{t('modalSubtitle')}</p>

              {/* Day selector */}
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-2 border-b border-edge/50">
                {next5Days.map((d, i) => {
                  const isSelected = selectedDate.getTime() === d.getTime();
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                      className={`shrink-0 rounded-xl px-4 py-3 text-center transition-colors duration-200 min-w-[5rem] ${
                        isSelected ? 'bg-accent text-white' : 'bg-bg hover:bg-edge/50 text-fg-muted'
                      }`}
                    >
                      <span className="block text-xs uppercase font-medium mb-1 opacity-80">
                        {d.toLocaleDateString(locale, { weekday: 'short' })}
                      </span>
                      <span className="block text-lg font-bold leading-none">
                        {d.toLocaleDateString(locale, { day: 'numeric' })}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time selector */}
              <div className="h-48 overflow-y-auto pr-2 scrollbar-thin">
                {currentSlots.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-fg-muted text-sm">
                    {t('modalNoSlots')}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentSlots.map(time => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`rounded-lg py-2.5 text-sm font-medium transition-all duration-200 border ${
                            isSelected 
                              ? 'border-accent bg-accent/10 text-accent' 
                              : 'border-edge bg-transparent text-fg hover:border-accent hover:text-accent'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal actions */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-edge/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-fg-muted hover:text-fg hover:bg-edge/30 transition-colors"
                >
                  {t('modalCancel')}
                </button>
                <button
                  type="button"
                  onClick={onFinalize}
                  disabled={!selectedTime}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('modalConfirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

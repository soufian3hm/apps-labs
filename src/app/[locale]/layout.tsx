import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Instrument_Serif, Plus_Jakarta_Sans, Amiri, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/theme-provider';
import '@/app/globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-display-ar',
  display: 'swap',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-body-ar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Apps Labs — We build websites, web apps, and AI projects',
  description:
    'Apps Labs helps companies, startups, and individuals turn ideas into polished digital products. Websites, web apps, SaaS, internal tools, AI projects.',
  openGraph: {
    title: 'Apps Labs — We build websites, web apps, and AI projects',
    description:
      'Turn your ideas into polished digital products. Websites, web apps, SaaS, dashboards, AI tools.',
    type: 'website',
  },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();
  const isArabic = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${instrumentSerif.variable} ${plusJakarta.variable} ${amiri.variable} ${ibmPlexArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-fg antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

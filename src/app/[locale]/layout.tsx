import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Instrument_Serif, Plus_Jakarta_Sans, Amiri, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/theme-provider';
import { createClient } from '@/utils/supabase/server';
import Script from 'next/script';

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

  const supabase = await createClient();
  const { data: settings } = await supabase.from('appslabs_settings').select('fb_pixel_id').eq('id', 1).single();
  const pixelId = settings?.fb_pixel_id || null;

  return (
    <div
      lang={locale}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${instrumentSerif.variable} ${plusJakarta.variable} ${amiri.variable} ${ibmPlexArabic.variable} min-h-screen font-sans`}
    >
      {pixelId && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
      <ThemeProvider>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}

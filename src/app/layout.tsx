import './globals.css';
import type { ReactNode } from 'react';

const FACEBOOK_DOMAIN_VERIFICATION = 'fbdor772aszbd5dofou8w28i2sbcvt';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="facebook-domain-verification"
          content={FACEBOOK_DOMAIN_VERIFICATION}
        />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}

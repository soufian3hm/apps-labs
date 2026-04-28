import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { BRAND_LOGO_URL } from "@/lib/brand";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SymplysisAI — Upload your product. Launch smarter marketing.",
  description:
    "An AI marketing workspace that turns a product image into complete, on-brand campaigns — landing pages, ad copy, voiceovers, posters, and more.",
  metadataBase: new URL("https://symplysis.ai"),
  icons: {
    icon: BRAND_LOGO_URL,
    shortcut: BRAND_LOGO_URL,
    apple: BRAND_LOGO_URL,
  },
  openGraph: {
    title: "SymplysisAI",
    description:
      "From product to campaign — AI-generated assets that feel structured, aligned, and ready to sell.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}

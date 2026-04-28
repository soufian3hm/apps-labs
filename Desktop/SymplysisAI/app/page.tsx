import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Toolkit } from "@/components/marketing/Toolkit";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { PricingTable } from "@/components/marketing/PricingTable";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <SocialProof />
        <Toolkit />
        <Features />
        <HowItWorks />
        <Testimonials />
        <section id="pricing" className="section" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "60ch", margin: "0 auto var(--space-12)" }}>
              <span className="badge badge-brand badge-plain">Pricing</span>
              <h2 style={{ marginTop: "var(--space-4)" }}>Simple plans that scale with you</h2>
              <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-lg)" }}>
                Start free. Upgrade when you need more output, more brands, or more team seats.
              </p>
            </div>
            <PricingTable />
          </div>
        </section>
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

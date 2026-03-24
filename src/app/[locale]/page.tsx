import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { ProblemSolutions } from '@/components/problem-solutions';
import { ProofStrip } from '@/components/proof-strip';
import { Projects } from '@/components/projects';
import { ProcessSection } from '@/components/process-section';
import { Testimonials } from '@/components/testimonials';
import { Faq } from '@/components/faq';
import { Contact } from '@/components/contact';
import { Footer } from '@/components/footer';
import { createClient } from '@/utils/supabase/server';
import { normalizeAppslabsSettings } from '@/lib/appslabs-settings';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('appslabs_settings').select('*').eq('id', 1).single();

  return (
    <>
      <Header />
      <main className="overflow-x-hidden overflow-y-clip">
        <Hero />
        <ProblemSolutions />
        <ProofStrip />
        <ProcessSection />
        <Projects />
        <Testimonials />
        <Contact bookingSettings={normalizeAppslabsSettings(settings || {})} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}

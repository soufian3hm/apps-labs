import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { Services } from '@/components/services';
import { Projects } from '@/components/projects';
import { ProcessSection } from '@/components/process-section';
import { WhyChooseUs } from '@/components/why-choose-us';
import { Testimonials } from '@/components/testimonials';
import { Faq } from '@/components/faq';
import { Contact } from '@/components/contact';
import { Footer } from '@/components/footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden overflow-y-clip">
        <Hero />
        <Services />
        <Projects />
        <Testimonials />
        <ProcessSection />
        <WhyChooseUs />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

import { SiteNav } from '@/components/landing/SiteNav';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Handoff } from '@/components/landing/Handoff';
import { DemoSection } from '@/components/landing/DemoSection';
import { Bento } from '@/components/landing/Bento';
import { Testimonial } from '@/components/landing/Testimonial';
import { SecurityBand } from '@/components/landing/SecurityBand';
import { ClosingCTA } from '@/components/landing/ClosingCTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Stats />
        <Handoff />
        <DemoSection />
        <Bento />
        <Testimonial />
        <SecurityBand />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}

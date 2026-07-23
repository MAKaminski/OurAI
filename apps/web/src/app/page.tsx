import { SiteNav } from '@/components/landing/SiteNav';
import { Hero } from '@/components/landing/Hero';
import { LogoMarquee } from '@/components/landing/LogoMarquee';
import { Stats } from '@/components/landing/Stats';
import { Handoff } from '@/components/landing/Handoff';
import { DemoSection } from '@/components/landing/DemoSection';
import { Bento } from '@/components/landing/Bento';
import { WhoItsFor } from '@/components/landing/WhoItsFor';
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
        <LogoMarquee />
        <Stats />
        <Handoff />
        <DemoSection />
        <Bento />
        <WhoItsFor />
        <Testimonial />
        <SecurityBand />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}

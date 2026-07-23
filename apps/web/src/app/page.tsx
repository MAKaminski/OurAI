import { SiteNav } from '@/components/landing/SiteNav';
import { Hero } from '@/components/landing/Hero';
import { DemoSection } from '@/components/landing/DemoSection';
import { Differentiators } from '@/components/landing/Differentiators';
import { Features } from '@/components/landing/Features';
import { WaitlistForm } from '@/components/landing/WaitlistForm';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <DemoSection />
        <Differentiators />
        <Features />

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Build your next feature with your whole team — and AI.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
            Get early access to OurAI and turn your backlog into shipped software, together.
          </p>
          <div className="mt-8 flex justify-center">
            <WaitlistForm source="footer-cta" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { WaitlistForm } from '@/components/landing/WaitlistForm';
import { FeatureBlock, MonoPanel } from '@/components/product/FeatureBlock';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Marketing coordination (in development)',
  description:
    'Coming to OurAI: marketing as a first-class role in the same room as engineering — so go-to-market strategy is coordinated alongside, and coupled with, what you ship. Built for startups and product engineering teams. Join early access.',
  keywords: [
    ...site.keywords,
    'couple marketing and engineering',
    'marketing and product shipping together',
    'go-to-market coordination software',
    'marketing role in engineering',
  ],
  alternates: { canonical: '/products/marketing' },
};

const IDEAS = [
  {
    title: 'Marketing in the same room',
    body: 'Add marketing as a role alongside product, engineering, and QA — one live transcript, one source of truth, no handoff across tools.',
  },
  {
    title: 'GTM coupled to the build',
    body: 'Plan launch, positioning, and content against the exact features moving through the pipeline — so marketing ships when the software does.',
  },
  {
    title: 'One measured loop',
    body: 'From idea intake to shipped to announced to measured — the same instrumentation that proves engineering value proves marketing impact.',
  },
];

export default function MarketingProductPage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(124,58,237,0.16),transparent),radial-gradient(50%_50%_at_80%_0%,rgba(249,115,22,0.12),transparent)]"
          />
          <div className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Product · Marketing coordination · In development
              </span>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-50 sm:text-6xl">
                Stop separating <span className="text-orange-400">marketing</span> from{' '}
                <span className="text-blue-400">shipping</span>.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
                We&apos;re building marketing into OurAI as a first-class role — so go-to-market
                strategy is coordinated in the same room as engineering, coupled to exactly what the
                team ships.
              </p>
            </Reveal>
          </div>
        </section>

        {/* What it will do */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <Stagger className="grid gap-4 md:grid-cols-3">
            {IDEAS.map((i) => (
              <StaggerItem
                key={i.title}
                className="rounded-2xl border border-white/10 bg-[#0e0e10] p-6"
              >
                <h3 className="text-base font-semibold text-zinc-100">{i.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{i.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <FeatureBlock
            eyebrow="One coupled loop"
            title="Marketing joins the process, not a separate tool"
            body="Today marketing lives downstream of engineering, in different software. OurAI makes it a role in the same live room — so a launch plan moves in lockstep with the branch it depends on."
            points={[
              'Marketing is already a role in the system (act-as Marketing)',
              'Plan GTM against real, in-flight work items',
              'Measured end to end, the same as shipping',
            ]}
            visual={
              <MonoPanel
                label="app.ourai.dev — coupled"
                lines={[
                  ['marketing ·', 'launch post ready when checkout ships', 'zinc'],
                  ['agent ·', 'merged saved-card-checkout · PR #482', 'violet'],
                  ['✓', 'ship + announce, together', 'green'],
                ]}
              />
            }
          />
        </section>

        {/* Early access */}
        <section id="waitlist" className="relative overflow-hidden border-t border-white/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[420px] bg-[radial-gradient(60%_80%_at_50%_120%,rgba(37,99,235,0.16),transparent),radial-gradient(50%_70%_at_50%_120%,rgba(249,115,22,0.14),transparent)]"
          />
          <Reveal className="mx-auto max-w-2xl px-6 py-24 text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
              Want marketing coupled to your shipping?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              This product is in development. Join early access and tell us you want it — pick
              &ldquo;Marketing&rdquo; as your role and we&apos;ll bring you in first.
            </p>
            <div className="mt-8 flex justify-center">
              <WaitlistForm source="product-marketing" />
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}

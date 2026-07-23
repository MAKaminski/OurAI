import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { LiveTranscript } from '@/components/landing/LiveTranscript';
import { WhoItsFor } from '@/components/landing/WhoItsFor';
import { Stats } from '@/components/landing/Stats';
import { ClosingCTA } from '@/components/landing/ClosingCTA';
import { FeatureBlock, MonoPanel } from '@/components/product/FeatureBlock';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Software shipping — the multiplayer AI product',
  description:
    'See how OurAI ships software: intake an idea, let AI refine the spec, promote it to a branch, and watch your team and a fleet of agents build in parallel while a human approves every merge. Built for startups and product engineering teams.',
  keywords: [
    ...site.keywords,
    'how AI coding agents work',
    'AI software shipping workflow',
    'idea to shipped',
    'AI for startups',
  ],
  alternates: { canonical: '/products/shipping' },
};

const STEPS = [
  {
    n: '1',
    tone: 'human' as const,
    title: 'Intake an idea',
    body: 'Anyone drops a raw idea in. AI refines it into a spec with your business context — product management before a line of code.',
  },
  {
    n: '2',
    tone: 'agent' as const,
    title: 'Agents build in parallel',
    body: 'Promote the spec to a branch. Each agent works its own git worktree; many run at once while the whole team watches one live transcript.',
  },
  {
    n: '3',
    tone: 'human' as const,
    title: 'A human ships it',
    body: 'Review the diff, approve, merge. Nothing reaches main automatically — and the outcome is measured, so you can prove the value.',
  },
];

const FAQ = [
  {
    q: 'Who is OurAI for?',
    a: 'Startups and product engineering teams that ship software. It’s built for founders and CTOs, VPs and directors of engineering and product, and engineering managers who need to turn a backlog into shipped software without losing control.',
  },
  {
    q: 'How is this different from an AI code editor or a solo copilot?',
    a: 'A copilot makes one developer faster inside their editor. OurAI puts your whole team and a fleet of agents in one room over one repo — idea intake, parallel branch-per-agent building, and a human-approved merge — so the team ships together, not just individuals.',
  },
  {
    q: 'How does a team keep AI costs predictable?',
    a: 'OurAI is priced per agent, not per seat, with a hard monthly budget cap and concurrency limits. Watchers are free, so a whole startup can join a session without adding to the bill.',
  },
  {
    q: 'Do agents merge on their own?',
    a: 'No. Agents propose; a human reviews the diff and clicks merge. Nothing reaches your default branch without explicit human approval.',
  },
];

function FaqJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}

export default function ShippingProductPage() {
  return (
    <>
      <FaqJsonLd />
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(124,58,237,0.16),transparent),radial-gradient(50%_50%_at_80%_0%,rgba(37,99,235,0.14),transparent)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
                Product · Software shipping
              </span>
              <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-50 sm:text-6xl">
                From an idea to a merged PR — with your <span className="text-blue-400">team</span>{' '}
                and <span className="text-violet-400">agents</span> in one room.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
                OurAI turns your backlog into shipped software. Intake the idea, let AI refine the
                requirements, and watch agents build in parallel while a human approves every merge.
              </p>
              <div className="mt-8">
                <MagneticButton
                  href="/#waitlist"
                  className="inline-flex rounded-lg bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
                >
                  Get early access
                </MagneticButton>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <LiveTranscript />
            </Reveal>
          </div>
        </section>

        {/* How it's used */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
              How it&apos;s used
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
              Three steps, one live room.
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            {STEPS.map((s) => (
              <StaggerItem key={s.n} className="bg-[#0e0e10] p-7">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm ${
                    s.tone === 'human'
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-violet-500/15 text-violet-300'
                  }`}
                >
                  {s.n}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-zinc-100">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Feature blocks */}
        <section className="mx-auto max-w-6xl space-y-24 px-6 py-12">
          <FeatureBlock
            eyebrow="Idea intake first"
            title="Decide what to build before building it"
            body="OurAI starts at intake, not at the code. AI chats the idea into a real spec with acceptance criteria — product management is the front door."
            points={[
              'Refine requirements with your business context',
              'Promote a ready idea to a branch in one click',
            ]}
            visual={
              <MonoPanel
                label="app.ourai.dev — intake"
                lines={[
                  ['product ·', 'ship one-click checkout with saved cards', 'blue'],
                  ['agent ·', 'drafting spec + acceptance criteria…', 'violet'],
                ]}
              />
            }
          />
          <FeatureBlock
            reverse
            eyebrow="Parallel, isolated, safe"
            title="Many agents build at once — nothing collides"
            body="Each agent runs on its own branch and git worktree. A capped pool keeps spend predictable, and AI rightsizes merges so parallel work lands in the right order."
            points={[
              'One agent, one branch, one worktree',
              'Hard monthly budget + concurrency caps',
            ]}
            visual={
              <MonoPanel
                label="app.ourai.dev — build"
                lines={[
                  ['agent ·', 'editing payment/vault.ts', 'violet'],
                  ['dev ·', 'keep it PCI-safe — use the provider vault', 'blue'],
                  ['diff ·', '+142 −18 across 4 files', 'zinc'],
                ]}
              />
            }
          />
          <FeatureBlock
            eyebrow="One live transcript"
            title="Everyone sees the same thing, in order"
            body="An append-only event log the whole team reads in real time — full history for late-joiners. Anyone can steer an agent by dropping a message in."
            points={['Real-time presence + steering', 'Complete audit trail of every run']}
            visual={
              <MonoPanel
                label="app.ourai.dev — transcript"
                lines={[
                  ['qa ·', 'add a test for the empty-cart case', 'blue'],
                  ['agent ·', 'added checkout.empty.test.ts', 'violet'],
                  ['✓', 'human approved · PR #482 merged', 'green'],
                ]}
              />
            }
          />
          <FeatureBlock
            reverse
            eyebrow="Priced per agent · BYOK"
            title="Predictable spend, your own keys"
            body="Watchers are free — cost scales with agent-compute, not headcount. Bring your own model keys, encrypted and scoped per org and per person."
            points={[
              'Roughly 10–18× cheaper than frontier-model tools',
              'DeepSeek default; swap providers in one env var',
            ]}
            visual={
              <MonoPanel
                label="app.ourai.dev — usage"
                lines={[
                  ['budget ·', '$12.40 / $40.00 this month', 'zinc'],
                  ['agents ·', '2 running · 1 queued', 'violet'],
                  ['seats ·', 'unlimited watchers · free', 'blue'],
                ]}
              />
            }
          />
        </section>

        <WhoItsFor />
        <Stats />

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 py-24">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-zinc-50">
              Questions teams ask
            </h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-8 sm:grid-cols-2">
            {FAQ.map((f) => (
              <StaggerItem key={f.q}>
                <h3 className="font-semibold text-zinc-100">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}

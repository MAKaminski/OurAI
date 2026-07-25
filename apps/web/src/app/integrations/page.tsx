import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { TechLogo } from '@/components/brand/TechLogos';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { site } from '@/lib/site';
import {
  CONNECTORS,
  CATEGORY_LABELS,
  type Connector,
  type ConnectorCategory,
} from '@/lib/connectors/registry';

export const metadata: Metadata = {
  title: 'Integrations — model providers & services',
  description:
    'OurAI integrations: bring your own key for DeepSeek, Anthropic Claude, Moonshot Kimi, and OpenAI, with Supabase, PostHog, Resend, Vercel, and GitHub. The multiplayer AI coding workspace that plugs into the tools engineering and finance leaders already trust — per-agent pricing, hard budget caps, and analytics that prove ROI.',
  keywords: [
    ...site.keywords,
    'bring your own key AI',
    'BYOK AI coding agent',
    'DeepSeek coding agent',
    'Claude coding agent for teams',
    'AI coding integrations',
    'AI coding agents with cost controls',
    'multiplayer AI coding for teams',
    'AI pair programming for engineering teams',
    'self-hosted AI coding platform',
    'AI software development ROI',
  ],
  alternates: { canonical: '/integrations' },
};

/** Fixed category render order, driven by the connectors registry. */
const CATEGORY_ORDER: ConnectorCategory[] = ['model', 'source', 'infra', 'analytics'];

/** Group connectors by category into ordered sections. */
function groupedConnectors(): { category: ConnectorCategory; items: Connector[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: CONNECTORS.filter((c) => c.category === category),
  })).filter((section) => section.items.length > 0);
}

const PERSONAS = [
  {
    role: 'Engineering leaders',
    body: 'Parallel agents on isolated branches, human-approved merges, and an open-core you can self-host. Observability on every run — no black box near your repo.',
  },
  {
    role: 'Finance leaders',
    body: 'Priced per agent, not per seat. Hard monthly budget caps and bring-your-own-key mean predictable spend on rates you already negotiated — no per-head surprises.',
  },
  {
    role: 'Founders & product',
    body: 'Idea intake to shipped PR with the whole team in one room. AI refines requirements before code, so the backlog turns into software — measurably faster.',
  },
];

const FAQ = [
  {
    q: 'Can I bring my own model API key?',
    a: 'Yes. OurAI is bring-your-own-key. Add your DeepSeek, Anthropic Claude, Moonshot Kimi, or OpenAI key and OurAI uses it directly — keys are encrypted and scoped per organization and per person, so you keep your negotiated rates and avoid vendor lock-in.',
  },
  {
    q: 'How does OurAI keep AI coding costs predictable?',
    a: 'OurAI is priced per agent, not per seat, and enforces a hard monthly budget cap with concurrency limits. Watchers are free, so a whole org can join a session without adding to the bill. Usage is instrumented in PostHog so finance and engineering leaders can see ROI.',
  },
  {
    q: 'Which AI models does OurAI support?',
    a: 'DeepSeek is the default for its cost-to-quality on agentic coding. Through the model gateway you can swap to Anthropic Claude, Moonshot Kimi, or OpenAI with a single environment variable, and mix providers per team or per task.',
  },
  {
    q: 'Can OurAI be self-hosted?',
    a: 'Yes. The core is open source (AGPL-3.0) with an Apache-2.0 SDK, so engineering teams can self-host and inspect exactly how their code and keys are handled.',
  },
];

/** FAQPage structured data — earns rich results and feeds AI answer engines. */
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

export default function IntegrationsPage() {
  const sections = groupedConnectors();
  return (
    <>
      <FaqJsonLd />
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
            Integrations
          </span>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-5xl">
            Plug OurAI into the models and tools your team already trusts.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            The multiplayer AI coding workspace is bring-your-own-key and open at every layer — from
            the model provider to your database, analytics, and CI. Keep your rates, keep your data,
            and prove the value.
          </p>
        </Reveal>

        {/* Persona value framing */}
        <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
          {PERSONAS.map((p) => (
            <StaggerItem
              key={p.role}
              className="rounded-2xl border border-white/10 bg-[#0e0e10] p-6"
            >
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-blue-400">
                {p.role}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{p.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Integration groups — generated from the connectors registry */}
        <div className="mt-16 space-y-12">
          {sections.map((section) => (
            <section key={section.category}>
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-zinc-100">
                {CATEGORY_LABELS[section.category]}
              </h2>
              <Stagger className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((c) => (
                  <StaggerItem key={c.id} className="h-full">
                    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-[#0e0e10] p-5 text-zinc-100">
                      <div className="flex items-center justify-between">
                        <TechLogo slug={c.slug} size={32} />
                        {c.oauthComingSoon ? (
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                            OAuth soon
                          </span>
                        ) : null}
                      </div>
                      <span className="mt-4 font-semibold">{c.name}</span>
                      <span className="mt-1 text-sm leading-relaxed text-zinc-400">{c.blurb}</span>
                      <a
                        href={c.getKeyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-blue-400 underline-offset-4 transition hover:text-blue-300 hover:underline"
                        aria-label={`Get your ${c.name} key`}
                      >
                        Get your key ↗
                      </a>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ))}
        </div>

        {/* FAQ (visible + structured) */}
        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-[-0.01em] text-zinc-50">
            Questions buyers ask
          </h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-zinc-100">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Reveal className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-8 text-center">
          <p className="text-lg font-medium text-zinc-100">
            Bring your team, bring your keys — see it move an idea to a merged PR.
          </p>
          <MagneticButton
            href="/#waitlist"
            className="mt-5 inline-flex rounded-lg bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          >
            Get early access
          </MagneticButton>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}

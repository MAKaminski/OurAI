import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Pricing',
  description: `${site.name} pricing: bring your own model key, pay per agent — not per seat — and set a hard monthly budget cap that pauses new agents at the ceiling. Solo, Team, and Enterprise tiers. No credit card to join the early-access waitlist.`,
  keywords: [
    ...site.keywords,
    'AI coding pricing',
    'per-agent pricing',
    'bring your own key',
    'BYOK AI pricing',
    'AI budget caps',
    'usage-based AI pricing',
  ],
  alternates: { canonical: '/pricing' },
};

interface Tier {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  cta: { label: string; href: string };
  featured?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: 'Solo',
    tagline: 'For a founder or a single builder steering a couple of agents.',
    price: 'Free core',
    priceNote: 'self-host the open-core, bring your own key',
    cta: { label: 'Get early access', href: '/#waitlist' },
    features: [
      'Bring your own model key (DeepSeek, Claude, Kimi, OpenAI)',
      'Up to 2 concurrent agents',
      'Hard monthly budget cap — spawns pause at the ceiling',
      'Full transcript, idea intake, branch-per-agent builds',
      'Community support',
    ],
  },
  {
    name: 'Team',
    tagline: 'For a product engineering team watching and steering a fleet together.',
    price: 'Per agent',
    priceNote: 'watchers are free — you pay for running agents, not seats',
    cta: { label: 'Get early access', href: '/#waitlist' },
    featured: true,
    features: [
      'Everything in Solo',
      'Priced per running agent — invite the whole team to watch for free',
      'Higher concurrency caps, per-workspace budget caps',
      'Human-approved merges with shared review',
      'Managed hosting option + email support',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For orgs that need SSO, self-hosting, and per-team budget governance.',
    price: "Let's talk",
    priceNote: 'volume agent pricing, annual, and a commercial EE license',
    cta: { label: 'Contact sales', href: site.contactPath },
    features: [
      'Everything in Team',
      'Self-hosted or private deployment (commercial EE)',
      'SSO / SAML and audit logging',
      'Org-wide and per-team budget caps',
      'Priority support and onboarding',
    ],
  },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: 'What does bring-your-own-key (BYOK) mean?',
    a: 'You connect your own model provider key — DeepSeek, Claude, Kimi, or OpenAI — through the pluggable model gateway. Model tokens are billed to you by that provider at cost. OurAI never marks up inference; we meter the agents that run on top.',
  },
  {
    q: 'Why price per agent instead of per seat?',
    a: 'Cost should scale with the compute doing the work, not your headcount. Anyone on the team can watch and steer a live session for free; you only pay for the agents actually running. Add reviewers without adding to the bill.',
  },
  {
    q: 'How do the monthly budget caps work?',
    a: 'You set a hard ceiling in USD. A budget guard tracks spend across running agents and pauses new agent spawns once you reach the cap — no surprise overages. Raise or lower the cap whenever you need to.',
  },
  {
    q: 'Is there a free tier?',
    a: 'The open-core is free to self-host, and Solo runs on your own key. Join the early-access waitlist to get in — no credit card required, because there is no payment integration yet.',
  },
  {
    q: 'Can I self-host?',
    a: 'Yes. The core is open (AGPL-3.0) and the SDK is Apache-2.0. Enterprise adds a commercial EE license for private and self-hosted deployments with SSO and governance.',
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
            Pricing
          </span>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-5xl">
            Bring your own key. Pay per agent. Cap the spend.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
            No markup on inference and no per-seat tax. Connect your own model key, pay only for the
            agents that actually run, and set a hard monthly budget cap that pauses new agents at
            the ceiling. There&apos;s no payment integration yet — join the waitlist for early
            access.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
          {TIERS.map((t) => (
            <StaggerItem
              key={t.name}
              className={`flex h-full flex-col rounded-2xl border p-7 ${
                t.featured
                  ? 'border-emerald-400/40 bg-emerald-500/[0.06] ring-1 ring-emerald-400/30'
                  : 'border-white/10 bg-[#0e0e10]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-zinc-50">{t.name}</h2>
                {t.featured ? (
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t.tagline}</p>
              <div className="mt-5">
                <span className="text-2xl font-semibold text-zinc-50">{t.price}</span>
                <p className="mt-1 text-xs text-zinc-500">{t.priceNote}</p>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      className="mt-0.5 h-4 w-4 flex-none text-emerald-400"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <MagneticButton
                href={t.cta.href}
                className={`mt-7 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${
                  t.featured
                    ? 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300'
                    : 'bg-zinc-50 text-zinc-950 hover:bg-white'
                }`}
              >
                {t.cta.label}
              </MagneticButton>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-8 rounded-2xl border border-white/10 p-6 text-sm leading-relaxed text-zinc-400">
          <span className="font-medium text-zinc-200">How pricing works.</span> BYOK means you pay
          your model provider directly at cost — we never mark up inference. On top of that, OurAI
          meters the agents that run, so watchers are always free. A budget guard tracks spend
          across running agents and pauses new spawns the moment you hit your monthly cap.
        </Reveal>

        <div className="mt-16">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-zinc-50">
              Frequently asked
            </h2>
          </Reveal>
          <Stagger className="mt-6 space-y-4">
            {FAQS.map((f) => (
              <StaggerItem key={f.q} className="rounded-xl border border-white/10 bg-[#0e0e10] p-5">
                <h3 className="text-sm font-semibold text-zinc-100">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-8 text-center">
          <p className="text-lg font-medium text-zinc-100">
            No card, no per-seat tax. Bring your team and your key.
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

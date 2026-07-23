import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Compare — OurAI vs Copilot, Devin & Cursor',
  description:
    'How OurAI compares to GitHub Copilot, Devin, and Cursor. Most AI coding tools make one developer faster; OurAI is the multiplayer AI workspace where a whole team steers a fleet of agents over one repo — idea intake to human-approved merge, priced per agent, open-core and bring-your-own-key.',
  keywords: [
    ...site.keywords,
    'GitHub Copilot alternative',
    'Devin alternative',
    'Cursor alternative for teams',
    'team AI coding tool',
    'multiplayer AI coding',
    'AI coding agents for teams',
  ],
  alternates: { canonical: '/compare' },
};

interface Competitor {
  name: string;
  what: string;
  diffs: string[];
}

const COMPETITORS: Competitor[] = [
  {
    name: 'GitHub Copilot',
    what: 'An in-editor AI pair programmer for individual developers.',
    diffs: [
      'Copilot autocompletes for one developer in one editor; OurAI puts your whole cross-functional team in one live session over the same repo.',
      'Copilot is priced per seat; OurAI is priced per agent, so watchers are free and cost scales with compute, not headcount.',
      'Copilot starts at the code — OurAI starts at idea intake, refining requirements with your business before a branch is cut.',
    ],
  },
  {
    name: 'Devin',
    what: 'An autonomous single AI software engineer.',
    diffs: [
      'Devin runs solo and largely opaque; OurAI streams every step to a shared transcript the whole team can watch and steer.',
      'Nothing reaches main without a human approving the diff — no unattended autonomy on your default branch.',
      'OurAI is open-core, self-hostable, and bring-your-own-key, versus a closed, metered black box.',
    ],
  },
  {
    name: 'Cursor',
    what: 'An AI-native code editor for individuals.',
    diffs: [
      'Cursor optimizes one developer’s editor; OurAI is a shared workspace for the team and its agents together.',
      'Branch-per-agent isolation runs many ideas in parallel — an editor is one person at a time.',
      'Idea intake, requirements refinement, and measured outcomes live in the product, not just code completion.',
    ],
  },
];

export default function ComparePage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">Compare</span>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-5xl">
          Where OurAI is different — and better.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Most AI coding tools make one developer faster inside their editor. {site.name} makes a
          whole team — product, engineering, design — watch and steer a fleet of agents over one
          repo, from idea intake to a human-approved merge. Here&apos;s how we compare to the tools
          teams weigh us against.
        </p>

        <div className="mt-14 space-y-6">
          {COMPETITORS.map((c) => (
            <section key={c.name} className="rounded-2xl border border-white/10 bg-[#0e0e10] p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-zinc-50">
                  {site.name} <span className="text-zinc-500">vs</span> {c.name}
                </h2>
                <span className="text-sm text-zinc-500">{c.what}</span>
              </div>
              <ul className="mt-5 space-y-3">
                {c.diffs.map((d, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-blue-400 to-violet-400"
                    />
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-8 text-center">
          <p className="text-lg font-medium text-zinc-100">
            The difference is multiplayer. Bring your team and see it.
          </p>
          <a
            href="/#waitlist"
            className="mt-5 inline-flex rounded-lg bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          >
            Get early access
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}

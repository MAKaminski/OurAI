import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Breadcrumbs } from '@/components/landing/Breadcrumbs';
import { VideoDemo } from '@/components/demo/VideoDemo';
import { ExampleGallery } from '@/components/learn/ExampleGallery';
import { WikiSteps } from '@/components/learn/WikiSteps';
import { Reveal } from '@/components/motion/Reveal';
import { getCurrentUser } from '@/lib/auth';
import { isFlagEnabled } from '@/lib/flags/server';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Example — ship saved-card checkout',
  description: 'A worked example: how OurAI takes one idea to a merged PR and a measured result.',
  robots: { index: false, follow: false },
};

const SCREENS: {
  caption: string;
  label: string;
  lines: [string, string, 'blue' | 'violet' | 'green' | 'zinc'][];
}[] = [
  {
    caption: 'A teammate drops the idea in; AI drafts the spec and acceptance criteria.',
    label: 'app.ourai.dev — intake',
    lines: [
      ['product ·', 'ship one-click checkout with saved cards', 'blue'],
      ['agent ·', 'spec: tokenize card, vault, 1-click pay…', 'violet'],
    ],
  },
  {
    caption: 'Promote to a branch; an agent builds on its own worktree while the team watches.',
    label: 'app.ourai.dev — build',
    lines: [
      ['agent ·', 'editing payment/vault.ts', 'violet'],
      ['dev ·', 'keep it PCI-safe — use the provider vault', 'blue'],
    ],
  },
  {
    caption: 'QA steers mid-run; the diff is scoped and reviewable.',
    label: 'app.ourai.dev — review',
    lines: [
      ['qa ·', 'add a test for the empty-cart case', 'blue'],
      ['diff ·', '+142 −18 across 4 files', 'zinc'],
    ],
  },
  {
    caption: 'A human approves the merge, then the result is measured in analytics.',
    label: 'app.ourai.dev — shipped',
    lines: [
      ['✓', 'human approved · PR #482 merged', 'green'],
      ['results ·', '+9.3% checkout rate (7d)', 'zinc'],
    ],
  },
];

export default async function LearnShippingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!(await isFlagEnabled('examples', user.id))) notFound();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Examples', href: '/learn' },
            { name: 'Ship a feature', href: '/learn/shipping' },
          ]}
        />
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-blue-400">
            Software shipping · worked example
          </span>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50">
            Ship saved-card checkout
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">
            One idea — &ldquo;let returning customers pay in one click&rdquo; — moving from intake
            to a merged PR and a measured lift. Watch it, see the screens, or read the walkthrough.
          </p>
        </Reveal>

        {/* Watch */}
        <section className="mt-14">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Watch
          </h2>
          <VideoDemo src={site.demoVideo || undefined} />
        </section>

        {/* See it (pictures) */}
        <section className="mt-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">
            See it
          </h2>
          <ExampleGallery screens={SCREENS} />
          <p className="mt-4 font-mono text-xs text-zinc-600">
            Illustrative product screens — not a real customer&apos;s data.
          </p>
        </section>

        {/* Read it (wiki) */}
        <section className="mt-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Read it
          </h2>
          <WikiSteps
            steps={[
              {
                title: 'Intake the idea',
                body: 'Someone posts “one-click checkout with saved cards.” AI asks the clarifying questions (which provider vault? guest vs. returning?) and drafts a spec with acceptance criteria — so you decide what to build before building it.',
              },
              {
                title: 'Promote to a branch',
                body: 'The ready spec becomes a work item on its own branch. This is the moment work becomes real and schedulable — nothing runs until a human promotes it.',
              },
              {
                title: 'Agents build in parallel',
                body: 'An agent picks up the branch on its own git worktree and starts editing. Other ideas run their own agents at the same time; the whole team watches one live transcript and can steer by dropping a message in.',
              },
              {
                title: 'Review and approve',
                body: 'The change arrives as a scoped diff. A human previews it, QA adds a test for the empty-cart edge case, and only then does a person click merge. Nothing reaches main automatically.',
              },
              {
                title: 'Measure the value',
                body: 'Once shipped, the outcome is tracked in analytics — here, a +9.3% checkout rate over seven days. That’s the point: the loop closes on a measured result, not a vibe.',
              },
            ]}
          />
        </section>

        <div className="mt-16 rounded-2xl border border-white/10 p-6 text-sm text-zinc-400">
          Want to run this with your team?{' '}
          <a href="/#waitlist" className="text-zinc-200 underline">
            Get early access
          </a>{' '}
          — or see the{' '}
          <a href="/products/shipping" className="text-zinc-200 underline">
            product overview
          </a>
          .
        </div>
      </main>
      <Footer />
    </>
  );
}

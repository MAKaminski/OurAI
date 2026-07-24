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
  title: 'Example — coordinate a launch (in development)',
  description:
    'A worked example of the marketing function: planning a launch coupled to the feature it depends on.',
  robots: { index: false, follow: false },
};

const SCREENS: {
  caption: string;
  label: string;
  lines: [string, string, 'blue' | 'violet' | 'green' | 'zinc'][];
}[] = [
  {
    caption: 'Marketing joins the same room and picks up the shipping feature as context.',
    label: 'app.ourai.dev — coordinate',
    lines: [
      ['marketing ·', 'plan launch for saved-card checkout', 'zinc'],
      ['agent ·', 'drafting positioning + launch checklist…', 'violet'],
    ],
  },
  {
    caption: 'The launch plan is timed to the branch it depends on — not guessed.',
    label: 'app.ourai.dev — coupled',
    lines: [
      ['marketing ·', 'email + post ready when PR #482 merges', 'zinc'],
      ['agent ·', 'checkout branch: awaiting review', 'violet'],
    ],
  },
  {
    caption: 'Ship and announce together; the same analytics measure both.',
    label: 'app.ourai.dev — launched',
    lines: [
      ['✓', 'merged + announced, same hour', 'green'],
      ['results ·', 'launch → +9.3% checkout, 1.2k signups', 'zinc'],
    ],
  },
];

export default async function LearnMarketingPage() {
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
            { name: 'Coordinate a launch', href: '/learn/marketing' },
          ]}
        />
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Marketing coordination · in development
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50">
            Coordinate a launch, coupled to the build
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">
            This function is in development. Here&apos;s the worked example of where it&apos;s
            headed: marketing plans a launch in the same room as engineering, timed to the feature
            it depends on — so you ship and announce together.
          </p>
        </Reveal>

        <section className="mt-14">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Watch
          </h2>
          <VideoDemo src={site.demoVideo || undefined} />
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">
            See it
          </h2>
          <ExampleGallery screens={SCREENS} />
          <p className="mt-4 font-mono text-xs text-zinc-600">
            Illustrative mockups of a feature still in development.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Read it
          </h2>
          <WikiSteps
            steps={[
              {
                title: 'Marketing enters the same room',
                body: 'Instead of living downstream in separate software, marketing joins as a role (act-as Marketing) alongside product, engineering, and QA — one live transcript, one source of truth.',
              },
              {
                title: 'Plan against real, in-flight work',
                body: 'The launch plan references the actual work item — the saved-card checkout branch — so positioning, email, and content are built for exactly what’s shipping, not a guess.',
              },
              {
                title: 'Couple the timing',
                body: 'The announcement is tied to the branch it depends on. When the PR merges, the launch is already staged — ship and announce in the same hour.',
              },
              {
                title: 'Measure both in one place',
                body: 'The same analytics that prove the engineering value (checkout rate) prove the marketing impact (signups from the launch). One measured loop, end to end.',
              },
            ]}
          />
        </section>

        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-orange-500/10 p-6 text-sm text-zinc-300">
          Want marketing coupled to your shipping?{' '}
          <a href="/products/marketing" className="text-zinc-100 underline">
            See the product
          </a>{' '}
          and{' '}
          <a href="/#waitlist" className="text-zinc-100 underline">
            join early access
          </a>{' '}
          — pick “Marketing” as your role.
        </div>
      </main>
      <Footer />
    </>
  );
}

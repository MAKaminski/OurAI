import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Breadcrumbs } from '@/components/landing/Breadcrumbs';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { getCurrentUser } from '@/lib/auth';
import { isFlagEnabled } from '@/lib/flags/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Examples',
  description: 'Worked examples showing how each OurAI function ships something of value.',
  robots: { index: false, follow: false },
};

const GUIDES = [
  {
    href: '/learn/shipping',
    tone: 'human' as const,
    kicker: 'Software shipping',
    title: 'Ship a feature: saved-card checkout',
    body: 'Follow one idea from intake to a merged PR — in video, screens, and a written walkthrough.',
  },
  {
    href: '/learn/marketing',
    tone: 'agent' as const,
    kicker: 'Marketing coordination · in development',
    title: 'Coordinate a launch, coupled to the build',
    body: 'See how marketing plans a launch in the same room, timed to the feature it depends on.',
  },
];

export default async function LearnPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!(await isFlagEnabled('examples', user.id))) notFound();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Examples', href: '/learn' },
          ]}
        />
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
            Examples
          </span>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-5xl">
            See each function ship something of value.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Worked examples in three formats — watch it, see the screens, or read the walkthrough.
            Pick whichever way you learn best.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-2">
          {GUIDES.map((g) => (
            <StaggerItem key={g.href} className="h-full">
              <Link
                href={g.href}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0e0e10] p-8 transition hover:border-white/25"
              >
                <span
                  className={`font-mono text-xs uppercase tracking-[0.15em] ${
                    g.tone === 'human' ? 'text-blue-400' : 'text-violet-300'
                  }`}
                >
                  {g.kicker}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-zinc-50">{g.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{g.body}</p>
                <span className="mt-6 text-sm font-semibold text-zinc-100 group-hover:underline">
                  Open example →
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </main>
      <Footer />
    </>
  );
}

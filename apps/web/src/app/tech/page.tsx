import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Tech stack',
  description: `The technology behind ${site.name}: Next.js, React, Tailwind, TypeScript, Turborepo, pnpm, Supabase, PostHog, Zod, and a pluggable model gateway (DeepSeek by default). A developer's deep-dive into how the multiplayer AI workspace is built.`,
  keywords: [
    ...site.keywords,
    'Next.js',
    'Supabase',
    'Turborepo',
    'PostHog',
    'DeepSeek',
    'open source AI stack',
  ],
  alternates: { canonical: '/tech' },
};

interface Tech {
  name: string;
  version: string;
  why: string;
  href: string;
}

const STACK: { group: string; items: Tech[] }[] = [
  {
    group: 'Frontend',
    items: [
      {
        name: 'Next.js',
        version: '15',
        why: 'App Router, RSC, edge + node runtimes.',
        href: 'https://nextjs.org',
      },
      {
        name: 'React',
        version: '19',
        why: 'UI, Server Components, streaming.',
        href: 'https://react.dev',
      },
      {
        name: 'Tailwind CSS',
        version: '3.4',
        why: 'Utility-first styling, dark mode.',
        href: 'https://tailwindcss.com',
      },
      {
        name: 'TypeScript',
        version: '5.6',
        why: 'Strict, ESM-first across the monorepo.',
        href: 'https://www.typescriptlang.org',
      },
    ],
  },
  {
    group: 'Platform & data',
    items: [
      {
        name: 'Supabase',
        version: 'Postgres + Auth',
        why: 'Postgres, magic-link auth, RLS, Realtime.',
        href: 'https://supabase.com',
      },
      {
        name: 'Vercel',
        version: 'hosting',
        why: 'Edge deploys, preview per PR.',
        href: 'https://vercel.com',
      },
      {
        name: 'PostHog',
        version: '1.x',
        why: 'Product analytics + funnels + session replay.',
        href: 'https://posthog.com',
      },
      {
        name: 'Zod',
        version: '3.x',
        why: 'Runtime validation of events & inputs.',
        href: 'https://zod.dev',
      },
    ],
  },
  {
    group: 'AI & agents',
    items: [
      {
        name: 'DeepSeek',
        version: 'default model',
        why: 'Best cost/quality for agentic coding.',
        href: 'https://www.deepseek.com',
      },
      {
        name: 'Model gateway',
        version: '@ourai/model-gateway',
        why: 'Swap DeepSeek / Kimi / Anthropic via one env var.',
        href: site.github,
      },
    ],
  },
  {
    group: 'Monorepo & tooling',
    items: [
      {
        name: 'Turborepo',
        version: '2.x',
        why: 'Topological builds + caching.',
        href: 'https://turbo.build',
      },
      {
        name: 'pnpm',
        version: '10',
        why: 'Fast, strict workspace linker.',
        href: 'https://pnpm.io',
      },
      {
        name: 'Changesets',
        version: '2.x',
        why: 'Versioning + release notes.',
        href: 'https://github.com/changesets/changesets',
      },
      {
        name: 'ESLint + Prettier',
        version: '9 / 3',
        why: 'Flat config lint + formatting.',
        href: 'https://eslint.org',
      },
    ],
  },
];

export default function TechPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold tracking-tight">
        <Logo size={26} />
        {site.name}
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Built with</h1>
      <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
        A developer&apos;s deep-dive into the {site.name} stack. It&apos;s a Turborepo monorepo
        (AGPL-3.0 core, Apache-2.0 SDK) — everything below is open and swappable.
      </p>

      <div className="mt-12 space-y-10">
        {STACK.map((section) => (
          <section key={section.group}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {section.group}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.items.map((t) => (
                <a
                  key={t.name}
                  href={t.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-600"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold group-hover:underline">{t.name}</span>
                    <span className="text-xs text-neutral-500">{t.version}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.why}</p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-neutral-200 p-5 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        Want the full architecture? Read the{' '}
        <a
          href={`${site.github}/tree/main/docs`}
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          docs
        </a>{' '}
        (ARCHITECTURE, ROADMAP, ADRs) or explore the{' '}
        <a href={site.github} className="underline" target="_blank" rel="noreferrer">
          source
        </a>
        .
      </div>
    </main>
  );
}

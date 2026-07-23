import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { TechLogo } from '@/components/brand/TechLogos';
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
  slug: string;
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
        slug: 'nextjs',
        version: '15',
        why: 'App Router, RSC, edge + node runtimes.',
        href: 'https://nextjs.org',
      },
      {
        name: 'React',
        slug: 'react',
        version: '19',
        why: 'UI, Server Components, streaming.',
        href: 'https://react.dev',
      },
      {
        name: 'Tailwind CSS',
        slug: 'tailwind',
        version: '3.4',
        why: 'Utility-first styling, dark mode.',
        href: 'https://tailwindcss.com',
      },
      {
        name: 'TypeScript',
        slug: 'typescript',
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
        slug: 'supabase',
        version: 'Postgres + Auth',
        why: 'Postgres, magic-link auth, RLS, Realtime.',
        href: 'https://supabase.com',
      },
      {
        name: 'Vercel',
        slug: 'vercel',
        version: 'hosting',
        why: 'Edge deploys, preview per PR.',
        href: 'https://vercel.com',
      },
      {
        name: 'PostHog',
        slug: 'posthog',
        version: '1.x',
        why: 'Product analytics + funnels + session replay.',
        href: 'https://posthog.com',
      },
      {
        name: 'Zod',
        slug: 'zod',
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
        slug: 'deepseek',
        version: 'default model',
        why: 'Best cost/quality for agentic coding.',
        href: 'https://www.deepseek.com',
      },
      {
        name: 'Model gateway',
        slug: 'gateway',
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
        slug: 'turborepo',
        version: '2.x',
        why: 'Topological builds + caching.',
        href: 'https://turbo.build',
      },
      {
        name: 'pnpm',
        slug: 'pnpm',
        version: '10',
        why: 'Fast, strict workspace linker.',
        href: 'https://pnpm.io',
      },
      {
        name: 'Changesets',
        slug: 'changesets',
        version: '2.x',
        why: 'Versioning + release notes.',
        href: 'https://github.com/changesets/changesets',
      },
      {
        name: 'ESLint + Prettier',
        slug: 'eslint',
        version: '9 / 3',
        why: 'Flat config lint + formatting.',
        href: 'https://eslint.org',
      },
    ],
  },
];

export default function TechPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
          The stack
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-zinc-50">Built with</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          A developer&apos;s deep-dive into the {site.name} stack. It&apos;s a Turborepo monorepo
          (AGPL-3.0 core, Apache-2.0 SDK) — everything below is open and swappable.
        </p>

        <div className="mt-12 space-y-10">
          {STACK.map((section) => (
            <section key={section.group}>
              <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                {section.group}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((t) => (
                  <a
                    key={t.name}
                    href={t.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-white/10 bg-[#0e0e10] p-4 text-zinc-100 transition hover:border-white/25"
                  >
                    <span className="mt-0.5 flex-none">
                      <TechLogo slug={t.slug} size={30} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold group-hover:underline">{t.name}</span>
                        <span className="flex-none font-mono text-xs text-zinc-500">
                          {t.version}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-zinc-400">{t.why}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-white/10 p-5 text-sm text-zinc-400">
          Want the full architecture? Read the{' '}
          <a
            href={`${site.github}/tree/main/docs`}
            className="text-zinc-200 underline"
            target="_blank"
            rel="noreferrer"
          >
            docs
          </a>{' '}
          (ARCHITECTURE, ROADMAP, ADRs) or explore the{' '}
          <a
            href={site.github}
            className="text-zinc-200 underline"
            target="_blank"
            rel="noreferrer"
          >
            source
          </a>
          . Curious which model providers and services plug in?{' '}
          <a href="/integrations" className="text-zinc-200 underline">
            See integrations
          </a>
          .
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { site } from '@/lib/site';
import { getDocs, type DocCategory, type DocEntry } from './docs-index';

export const metadata: Metadata = {
  title: 'Docs',
  description: `Documentation for ${site.name}: architecture, deployment, the roadmap, and the architecture decision records (ADRs) behind the multiplayer AI workspace. Read the design of an open-core, bring-your-own-key platform where a whole team steers a fleet of agents.`,
  keywords: [
    ...site.keywords,
    'OurAI docs',
    'architecture decision records',
    'ADR',
    'open source AI documentation',
    'self-host AI coding platform',
  ],
  alternates: { canonical: '/docs' },
};

const SECTIONS: { category: DocCategory; heading: string; blurb: string }[] = [
  {
    category: 'Guide',
    heading: 'Guides',
    blurb: 'Architecture, deployment, and the plan behind the product.',
  },
  {
    category: 'ADR',
    heading: 'Architecture decision records',
    blurb: 'The decisions — and the trade-offs — that shaped the system.',
  },
];

export default function DocsPage() {
  const docs = getDocs();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">Docs</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-zinc-50">
            Documentation
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            How {site.name} is built and why. Everything below is rendered straight from the{' '}
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-zinc-300">
              docs/
            </code>{' '}
            directory in the open-source repo.
          </p>
        </Reveal>

        {docs.length === 0 ? (
          <Reveal className="mt-12 rounded-xl border border-white/10 p-6 text-sm text-zinc-400">
            The docs live in the repository. Browse them on{' '}
            <a
              href={`${site.github}/tree/main/docs`}
              className="text-zinc-200 underline"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </Reveal>
        ) : (
          <div className="mt-12 space-y-12">
            {SECTIONS.map((section) => {
              const items: DocEntry[] = docs.filter((d) => d.category === section.category);
              if (items.length === 0) return null;
              return (
                <section key={section.category}>
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                    {section.heading}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">{section.blurb}</p>
                  <Stagger className="mt-5 grid gap-4 sm:grid-cols-2">
                    {items.map((doc) => (
                      <StaggerItem key={doc.slug} className="h-full">
                        <Link
                          href={`/docs/${doc.slug}`}
                          className="group flex h-full flex-col rounded-xl border border-white/10 bg-[#0e0e10] p-5 transition hover:border-emerald-400/40"
                        >
                          <span className="font-semibold text-zinc-100 group-hover:underline">
                            {doc.title}
                          </span>
                          <span className="mt-2 font-mono text-xs text-zinc-500">{doc.slug}</span>
                        </Link>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

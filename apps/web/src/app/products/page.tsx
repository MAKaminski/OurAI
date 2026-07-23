import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Products',
  description: `${site.name} products for startups and product engineering teams: multiplayer software shipping today, and marketing coordination — coupling go-to-market with shipping — in development.`,
  keywords: [
    ...site.keywords,
    'AI software shipping',
    'marketing coordination software',
    'product engineering platform',
  ],
  alternates: { canonical: '/products' },
};

const PRODUCTS = [
  {
    href: '/products/shipping',
    status: 'Available',
    tone: 'human' as const,
    name: 'Software shipping',
    body: 'The multiplayer AI workspace: intake an idea, refine the spec, and watch your team and a fleet of agents ship it over one repo — with a human approving every merge.',
  },
  {
    href: '/products/marketing',
    status: 'In development',
    tone: 'agent' as const,
    name: 'Marketing coordination',
    body: 'Marketing joins as a first-class role in the same room, so go-to-market strategy is coordinated alongside — coupled with — what engineering ships. No more silos.',
  },
];

export default function ProductsPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
            Products
          </span>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-5xl">
            One workspace for teams that ship.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Built for startups and product engineering teams. Start with software shipping today;
            marketing coordination is coming to the same room.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <StaggerItem key={p.name} className="h-full">
              <Link
                href={p.href}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0e0e10] p-8 transition hover:border-white/25"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs uppercase tracking-[0.15em] ${
                      p.tone === 'human' ? 'text-blue-400' : 'text-violet-300'
                    }`}
                  >
                    {p.name}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                      p.status === 'Available'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-white/5 text-zinc-500'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-5 flex-1 text-zinc-400">{p.body}</p>
                <span className="mt-6 text-sm font-semibold text-zinc-100 group-hover:underline">
                  Learn more →
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

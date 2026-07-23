import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Breadcrumbs } from '@/components/landing/Breadcrumbs';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: `Every page on ${site.name} — the AI-first operating system for shipping software and marketing.`,
  alternates: { canonical: '/sitemap' },
};

const GROUPS: { heading: string; links: { name: string; href: string; external?: boolean }[] }[] = [
  {
    heading: 'Product',
    links: [
      { name: 'Products overview', href: '/products' },
      { name: 'Software shipping', href: '/products/shipping' },
      { name: 'Marketing coordination', href: '/products/marketing' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { name: 'Integrations', href: '/integrations' },
      { name: 'Compare', href: '/compare' },
      { name: 'Tech stack', href: '/tech' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Contact', href: '/contact' },
      { name: 'GitHub', href: site.github, external: true },
    ],
  },
  {
    heading: 'Get started',
    links: [
      { name: 'Sign in / sign up', href: '/login' },
      { name: 'Get early access', href: '/#waitlist' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Sitemap', href: '/sitemap' },
          ]}
        />
        <h1 className="text-4xl font-semibold tracking-[-0.02em] text-zinc-50">Sitemap</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Every public page on {site.name}. {site.positioning}
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <section key={g.heading}>
              <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                {g.heading}
              </h2>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-300 underline-offset-4 transition hover:text-zinc-50 hover:underline"
                      >
                        {l.name}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-zinc-300 underline-offset-4 transition hover:text-zinc-50 hover:underline"
                      >
                        {l.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

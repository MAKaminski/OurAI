import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Breadcrumbs } from '@/components/landing/Breadcrumbs';
import { site } from '@/lib/site';
import { ROUTES, ROUTE_GROUP_ORDER, type RouteDef, type RouteGroup } from '@/lib/routes/registry';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: `Every page on ${site.name} — the AI-first operating system for shipping software and marketing.`,
  alternates: { canonical: '/sitemap' },
};

/** Group the registry into ordered sections for display. */
function groupedRoutes(): { heading: RouteGroup; routes: RouteDef[] }[] {
  return ROUTE_GROUP_ORDER.map((heading) => ({
    heading,
    routes: ROUTES.filter((r) => r.group === heading),
  })).filter((g) => g.routes.length > 0);
}

export default function SitemapPage() {
  const groups = groupedRoutes();
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
          Every page on {site.name}. {site.positioning}
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {groups.map((g) => (
            <section key={g.heading}>
              <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                {g.heading}
              </h2>
              <ul className="space-y-2">
                {g.routes.map((r) => (
                  <li key={r.path}>
                    <Link
                      href={r.path}
                      className="text-zinc-300 underline-offset-4 transition hover:text-zinc-50 hover:underline"
                    >
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section>
            <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
              Elsewhere
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-300 underline-offset-4 transition hover:text-zinc-50 hover:underline"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

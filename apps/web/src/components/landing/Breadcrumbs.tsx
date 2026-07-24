import Link from 'next/link';
import { site } from '@/lib/site';

/**
 * Visible breadcrumbs + BreadcrumbList JSON-LD (rich results + internal
 * linking). `items` runs root → current; the last item renders as plain text.
 */
export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.href === '/' ? '' : it.href}`,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500"
      >
        {items.map((it, i) => (
          <span key={it.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-zinc-700">/</span>}
            {i < items.length - 1 ? (
              <Link href={it.href} className="transition hover:text-zinc-300">
                {it.name}
              </Link>
            ) : (
              <span className="text-zinc-400">{it.name}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

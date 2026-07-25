import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/motion/Reveal';
import { site } from '@/lib/site';
import { getDoc, getDocs, renderMarkdown } from '../docs-index';

/** Only the docs we listed are valid routes — unknown slugs 404. */
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: 'Doc not found' };
  return {
    title: doc.title,
    description: `${doc.title} — documentation for ${site.name}, the multiplayer AI workspace.`,
    alternates: { canonical: `/docs/${slug}` },
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <Link
            href="/docs"
            className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500 transition hover:text-zinc-300"
          >
            ← All docs
          </Link>
          <span className="mt-6 block font-mono text-xs uppercase tracking-[0.15em] text-emerald-400/80">
            {doc.category}
          </span>
          <article className="mt-2">{renderMarkdown(doc.content)}</article>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}

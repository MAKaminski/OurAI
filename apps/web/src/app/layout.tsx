import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PostHogProvider } from '@/lib/analytics/PostHogProvider';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.company }],
  creator: site.company,
  publisher: site.company,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
    creator: site.twitter,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'technology',
};

/** JSON-LD structured data — helps both classic search and AI answer engines. */
function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.url}/#org`,
        name: site.company,
        url: site.url,
        logo: `${site.url}/icon`,
        description: site.positioning,
        sameAs: [site.github],
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        name: site.name,
        url: site.url,
        publisher: { '@id': `${site.url}/#org` },
        description: site.description,
      },
      {
        '@type': 'SoftwareApplication',
        name: site.name,
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'AI-first operating system',
        operatingSystem: 'Web',
        description: site.description,
        url: site.url,
        featureList: [...site.featureList],
        audience: { '@type': 'Audience', audienceType: site.audience },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${site.url}/#org` },
        sameAs: [site.github],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08080a] text-zinc-100 antialiased">
        <StructuredData />
        <PostHogProvider>
          <MotionProvider>{children}</MotionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

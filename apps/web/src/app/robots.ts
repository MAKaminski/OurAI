import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow classic crawlers and AI answer-engine crawlers alike.
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

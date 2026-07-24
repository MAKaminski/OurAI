import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { publicRoutes } from '@/lib/routes/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return publicRoutes().map((r) => {
    const isHome = r.path === '/';
    return {
      url: `${site.url}${isHome ? '' : r.path}`,
      lastModified,
      changeFrequency: isHome ? 'weekly' : 'monthly',
      priority: isHome ? 1 : 0.7,
    };
  });
}

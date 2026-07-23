import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/products/shipping', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/products/marketing', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/integrations', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/compare', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/tech', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/login', priority: 0.4, changeFrequency: 'monthly' },
  ];
  return routes.map((r) => ({
    url: `${site.url}${r.path === '/' ? '' : r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

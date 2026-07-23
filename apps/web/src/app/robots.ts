import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** AI answer-engine + search crawlers we explicitly welcome. */
const AI_BOTS = [
  'GPTBot', // OpenAI / ChatGPT training + browsing
  'OAI-SearchBot', // ChatGPT search
  'ChatGPT-User', // ChatGPT on-demand fetch
  'ClaudeBot', // Anthropic / Claude
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot', // Perplexity
  'Perplexity-User',
  'Google-Extended', // Gemini / Bard grounding
  'Applebot-Extended',
  'CCBot', // Common Crawl (feeds many LLMs)
];

export default function robots(): MetadataRoute.Robots {
  // Private / auth-gated surfaces — kept out of every crawler's index.
  const disallow = ['/api/', '/account', '/auth/', '/learn', '/chat', '/context', '/companies'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      // Belt-and-suspenders: explicitly welcome AI crawlers on public pages so
      // OurAI is discoverable and citable across ChatGPT, Claude, Perplexity, Gemini.
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

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
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/account', '/auth/'] },
      // Belt-and-suspenders: explicitly allow the AI crawlers so OurAI is
      // discoverable and citable across ChatGPT, Claude, Perplexity, Gemini.
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

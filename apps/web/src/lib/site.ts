/** Single source of truth for site-wide marketing + SEO metadata. */
export const site = {
  name: 'OurAI',
  domain: 'ourai.dev',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ourai.dev',
  tagline: 'The multiplayer AI workspace',
  description:
    'OurAI is the multiplayer AI workspace for startups and product engineering teams that ship software. Your whole team watches and steers AI coding agents over one repo — from idea intake to shipped. Start with an idea, let AI refine the requirements, promote it to a branch, and watch agents build in parallel while a human approves every merge.',
  shortDescription:
    'The multiplayer AI workspace for startups and product engineering teams — watch and steer AI agents ship software together, from idea to shipped.',
  /** Ideal customer profile — who we build and market for. */
  audience: 'Startups and product engineering teams that ship software',
  keywords: [
    'multiplayer AI',
    'AI coding agents',
    'AI coding platform for startups',
    'AI for product engineering teams',
    'ship software faster with AI',
    'AI pair programming for teams',
    'startup engineering velocity',
    'multiplayer AI for product teams',
    'AI software development workflow',
    'idea to production',
    'AI agent orchestration',
    'agentic coding',
    'couple marketing and engineering',
  ],
  twitter: '@ourai',
  github: 'https://github.com/MAKaminski/OurAI',
  company: 'OurAI',
  /** Public-facing contact route — we never expose a raw support email. */
  contactPath: '/contact',
} as const;

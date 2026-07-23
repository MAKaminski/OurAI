/** Single source of truth for site-wide marketing + SEO metadata. */
export const site = {
  name: 'OurAI',
  domain: 'ourai.dev',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ourai.dev',
  tagline: 'The multiplayer AI workspace',
  description:
    'OurAI is the multiplayer AI workspace where your whole team watches and steers AI coding agents over one repo — from idea intake to shipped. Start with an idea, let AI refine the requirements, promote it to a branch, and watch agents build in parallel while a human approves every merge.',
  shortDescription:
    'Your whole team, watching and steering AI agents build software together — from idea to shipped.',
  keywords: [
    'multiplayer AI',
    'AI coding agents',
    'AI pair programming',
    'collaborative AI',
    'AI software development',
    'idea to production',
    'AI agent orchestration',
    'real-time AI workspace',
    'AI product development',
    'agentic coding',
  ],
  twitter: '@ourai',
  github: 'https://github.com/MAKaminski/OurAI',
  company: 'OurAI',
  /** Public-facing contact route — we never expose a raw support email. */
  contactPath: '/contact',
} as const;

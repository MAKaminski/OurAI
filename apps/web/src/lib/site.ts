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
  /**
   * Positioning: OurAI is an AI-first operating system with two functions —
   * software/product shipping and marketing coordination. Kept as secondary
   * messaging + SEO; the hero headline stays "multiplayer AI workspace".
   */
  positioning:
    'The AI-first operating system for shipping software and marketing — two functions, one live room.',
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
    'AI-first operating system',
    'AI OS for engineering and marketing',
    'ship software and marketing together',
  ],
  /** Product capabilities — used in SoftwareApplication `featureList` (SEO). */
  featureList: [
    'Multiplayer AI coding agents over one repo',
    'Idea intake and AI requirements refinement',
    'Branch-per-agent parallel builds',
    'Human-approved merges',
    'Bring-your-own-key model gateway (DeepSeek, Claude, Kimi, OpenAI)',
    'Per-agent pricing with budget caps',
    'Marketing coordination coupled to shipping (in development)',
  ],
  /**
   * Optional pre-login demo video. Empty until a real recording exists — the
   * VideoDemo component falls back to the animated walkthrough. Drop a path
   * (e.g. '/demo.mp4' in public/) or absolute URL here to go live.
   */
  demoVideo: '',
  twitter: '@ourai',
  github: 'https://github.com/MAKaminski/OurAI',
  company: 'OurAI',
  /** Public-facing contact route — we never expose a raw support email. */
  contactPath: '/contact',
} as const;

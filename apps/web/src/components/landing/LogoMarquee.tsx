import { Marquee } from '@/components/motion/Marquee';
import { TechLogo } from '@/components/brand/TechLogos';

/**
 * Social-proof / "bring your own model" strip. Auto-scrolls the providers and
 * services OurAI plugs into — reusing the same brand marks as /integrations.
 */
const ITEMS: { slug: string; name: string }[] = [
  { slug: 'deepseek', name: 'DeepSeek' },
  { slug: 'anthropic', name: 'Claude' },
  { slug: 'kimi', name: 'Kimi' },
  { slug: 'openai', name: 'OpenAI' },
  { slug: 'supabase', name: 'Supabase' },
  { slug: 'posthog', name: 'PostHog' },
  { slug: 'github', name: 'GitHub' },
  { slug: 'vercel', name: 'Vercel' },
];

export function LogoMarquee() {
  return (
    <section className="border-b border-white/10 py-10">
      <p className="mx-auto mb-6 max-w-6xl px-6 font-mono text-xs uppercase tracking-[0.15em] text-zinc-600">
        Bring your own keys · plugs into the tools your team already trusts
      </p>
      <Marquee durationSec={34}>
        {ITEMS.map((it) => (
          <span key={it.name} className="flex items-center gap-2.5 text-zinc-400">
            <TechLogo slug={it.slug} size={26} />
            <span className="text-sm font-medium">{it.name}</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}

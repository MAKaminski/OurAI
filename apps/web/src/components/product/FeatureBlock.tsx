import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Alternating text / visual feature block — the Rilla product-page pattern.
 * `reverse` flips the visual to the left on large screens.
 */
export function FeatureBlock({
  eyebrow,
  title,
  body,
  points,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <Reveal>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className={reverse ? 'lg:order-2' : ''}>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
            {eyebrow}
          </span>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.01em] text-zinc-50 sm:text-3xl">
            {title}
          </h3>
          <p className="mt-3 max-w-md text-zinc-400">{body}</p>
          {points && (
            <ul className="mt-5 space-y-2">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-zinc-300">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-br from-blue-400 to-violet-400"
                  />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
      </div>
    </Reveal>
  );
}

/** Small mono "screen" used as a feature-block visual. Blue=human, violet=agent. */
export function MonoPanel({
  label,
  lines,
}: {
  label: string;
  lines: [who: string, text: string, color: 'blue' | 'violet' | 'green' | 'zinc'][];
}) {
  const color: Record<string, string> = {
    blue: 'text-blue-400',
    violet: 'text-violet-300',
    green: 'text-emerald-400',
    zinc: 'text-zinc-500',
  };
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0e0e10] shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-xs text-zinc-500">{label}</span>
      </div>
      <div className="space-y-2.5 p-5 font-mono text-[13px] leading-relaxed">
        {lines.map(([who, text, c], i) => (
          <p key={i} className={color[c]}>
            <span className="text-zinc-600">{who}</span> {text}
          </p>
        ))}
      </div>
    </div>
  );
}

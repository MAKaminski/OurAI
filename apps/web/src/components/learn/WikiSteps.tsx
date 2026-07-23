import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';

/**
 * The "wiki" format: a written, numbered walkthrough with a connecting rail.
 * The prose is where the value is made explicit for readers who prefer text.
 */
export function WikiSteps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="relative space-y-8 border-l border-white/10 pl-8">
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-[#0e0e10] font-mono text-xs text-zinc-400">
            {i + 1}
          </span>
          <Reveal>
            <h3 className="text-lg font-semibold text-zinc-100">{s.title}</h3>
            <div className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';

/**
 * Explicit ICP section — who OurAI is built for. Naming the buyer sharpens the
 * copy and the SEO: startups and product engineering teams that ship software.
 */
const AUDIENCE = [
  {
    who: 'Startups',
    body: 'Ship more with fewer people. Founders and small teams turn a backlog into shipped software without hiring ahead of the work — agents do the parallel building, humans keep control.',
  },
  {
    who: 'Product engineering teams',
    body: 'Product, engineering, and QA coordinate over one repo instead of scattered tools. Idea intake refines the spec first, then agents build in parallel on isolated branches.',
  },
  {
    who: 'Engineering leaders',
    body: 'VPs, directors, and eng managers get one live view of everything in flight, human-approved merges, and per-agent pricing with a hard budget cap — velocity you can actually measure.',
  },
];

export function WhoItsFor() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
          Who it&apos;s for
        </span>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
          Built for teams that ship software.
        </h2>
        <p className="mt-3 text-zinc-400">
          Startups and product engineering teams — and the leaders who answer for velocity and
          spend.
        </p>
      </Reveal>
      <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
        {AUDIENCE.map((a) => (
          <StaggerItem key={a.who} className="rounded-2xl border border-white/10 bg-[#0e0e10] p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-blue-400">{a.who}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{a.body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

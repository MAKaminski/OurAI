import type { ReactNode } from 'react';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';

/**
 * Capability bento — an asymmetric grid so it doesn't read as a generic
 * feature list. Cells stagger in on scroll; hover lifts the border/tint.
 */
export function Bento() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
          Why OurAI
        </span>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
          Most AI dev tools make one person faster. OurAI makes a whole team ship.
        </h2>
      </div>

      <Stagger className="mt-14 grid auto-rows-[minmax(0,1fr)] gap-4 md:grid-cols-3">
        {/* Lead cell */}
        <StaggerItem className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10 p-8 transition-colors hover:border-white/25 md:col-span-2 md:row-span-2">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-blue-400">humans</span>
            <span className="text-zinc-600">+</span>
            <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300">agents</span>
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.01em] text-zinc-50">
            One room. One repo. One live transcript.
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
            The whole cross-functional team shares a single append-only event log — everyone sees
            the same thing, in order, with full history for late-joiners. Anyone can steer; a human
            approves every merge.
          </p>
          <div className="mt-8 space-y-2 font-mono text-[13px]">
            <p className="text-blue-400">
              <span className="text-zinc-600">pm ·</span> refine the idea into a spec
            </p>
            <p className="text-violet-300">
              <span className="text-zinc-600">agent ·</span> build it on an isolated branch
            </p>
            <p className="text-emerald-400">
              <span className="text-zinc-600">✓</span> human approves · shipped
            </p>
          </div>
        </StaggerItem>

        <BentoCell
          title="Priced per agent, not per seat"
          body="Watchers are free. Cost scales with agent-compute, not headcount — add your whole org to the room."
        />
        <BentoCell
          title="Branch-per-agent isolation"
          body="One agent, one branch, one git worktree. Many run in parallel and never step on each other."
        />
        <BentoCell
          title="Human-approved merges"
          body="Preview the diff, approve, merge. No auto-merge, ever — nothing hits main by accident."
        />
        <BentoCell
          title="Budget + concurrency caps"
          body="A hard monthly ceiling keeps spend flat and predictable, no matter how many agents run."
        />
        <BentoCell
          title="Bring your own keys"
          body="Your models, your keys — stored encrypted and scoped per org and per person. Never shared."
        />
        <BentoCell
          title="Open source core"
          body="AGPL core you can self-host, an Apache-licensed SDK to build on. Inspect everything."
        />
      </Stagger>
    </section>
  );
}

function BentoCell({ title, body }: { title: ReactNode; body: ReactNode }) {
  return (
    <StaggerItem className="rounded-2xl border border-white/10 bg-[#0e0e10] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.02]">
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
    </StaggerItem>
  );
}

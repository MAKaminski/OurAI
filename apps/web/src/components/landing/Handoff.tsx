/**
 * The core loop as three handoffs. Blue = people, violet = agents — the same
 * semantic color device used everywhere. The connecting line reads as a branch.
 */
const STEPS = [
  {
    kicker: 'Intake',
    tone: 'human' as const,
    title: 'An idea becomes a spec',
    body: 'Drop a raw idea into the room. AI refines it into requirements with your business context — product management before a line of code.',
  },
  {
    kicker: 'Build',
    tone: 'agent' as const,
    title: 'Agents build in parallel',
    body: 'Promote the spec to a branch and an agent picks it up on its own git worktree. Many run at once; the whole team watches the same live transcript.',
  },
  {
    kicker: 'Ship',
    tone: 'human' as const,
    title: 'A human approves the merge',
    body: 'Review the diff, approve, merge. Nothing reaches main automatically. The result is measured — so you can prove the value, not just feel it.',
  },
];

export function Handoff() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
          The loop
        </span>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
          Idea in, shipped software out — with a human in the loop the whole way.
        </h2>
      </div>

      <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.kicker} className="relative bg-[#0e0e10] p-7">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm ${
                  step.tone === 'human'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-violet-500/15 text-violet-300'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`font-mono text-xs uppercase tracking-[0.15em] ${
                  step.tone === 'human' ? 'text-blue-400' : 'text-violet-300'
                }`}
              >
                {step.kicker}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-zinc-100">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useMotionEnabled } from '@/components/motion/MotionProvider';

/**
 * The core loop as three handoffs. Blue = people, violet = agents.
 *
 * With motion on, it's a Rilla-style *pinned scroll sequence*: the panel sticks
 * while you scroll, the step rail advances, and the right-hand panel crossfades
 * between steps. With motion off (flag/reduced-motion), it degrades to a static
 * three-up grid so the content is fully present with zero motion.
 */
const STEPS = [
  {
    kicker: 'Intake',
    tone: 'human' as const,
    title: 'An idea becomes a spec',
    body: 'Drop a raw idea into the room. AI refines it into requirements with your business context — product management before a line of code.',
    lines: [
      ['product ·', 'ship one-click checkout with saved cards', 'blue'],
      ['agent ·', 'drafting requirements + acceptance criteria…', 'violet'],
    ] as const,
  },
  {
    kicker: 'Build',
    tone: 'agent' as const,
    title: 'Agents build in parallel',
    body: 'Promote the spec to a branch and an agent picks it up on its own git worktree. Many run at once; the whole team watches the same live transcript.',
    lines: [
      ['agent ·', 'editing payment/vault.ts', 'violet'],
      ['dev ·', 'keep it PCI-safe — use the provider vault', 'blue'],
      ['diff ·', '+142 −18 across 4 files', 'zinc'],
    ] as const,
  },
  {
    kicker: 'Ship',
    tone: 'human' as const,
    title: 'A human approves the merge',
    body: 'Review the diff, approve, merge. Nothing reaches main automatically. The result is measured — so you can prove the value, not just feel it.',
    lines: [
      ['review ·', 'diff looks good — approving', 'blue'],
      ['✓', 'human approved · PR #482 merged', 'green'],
    ] as const,
  },
];

const toneText = (t: 'human' | 'agent') => (t === 'human' ? 'text-blue-400' : 'text-violet-300');
const toneBg = (t: 'human' | 'agent') =>
  t === 'human' ? 'bg-blue-500/15 text-blue-400' : 'bg-violet-500/15 text-violet-300';

const lineColor: Record<string, string> = {
  blue: 'text-blue-400',
  violet: 'text-violet-300',
  green: 'text-emerald-400',
  zinc: 'text-zinc-500',
};

function Header() {
  return (
    <div className="max-w-2xl">
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">The loop</span>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
        Idea in, shipped software out — with a human in the loop the whole way.
      </h2>
    </div>
  );
}

function Panel({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0e0e10] shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-xs text-zinc-500">
          app.ourai.dev — {step.kicker.toLowerCase()}
        </span>
      </div>
      <div className="space-y-2.5 p-5 font-mono text-[13px] leading-relaxed">
        {step.lines.map(([who, text, color], i) => (
          <p key={i} className={lineColor[color]}>
            <span className="text-zinc-600">{who}</span> {text}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Static three-up grid — the reduced-motion / flag-off fallback. */
function HandoffStatic() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <Header />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.kicker} className="relative bg-[#0e0e10] p-7">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm ${toneBg(step.tone)}`}
              >
                {i + 1}
              </span>
              <span
                className={`font-mono text-xs uppercase tracking-[0.15em] ${toneText(step.tone)}`}
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

export function Handoff() {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
    setActive((cur) => (cur === next ? cur : next));
  });

  if (!enabled) return <HandoffStatic />;

  const step = STEPS[active] ?? STEPS[0]!;

  return (
    <section id="how-it-works" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <Header />
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Step rail */}
            <ol className="relative space-y-6 border-l border-white/10 pl-6">
              {STEPS.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.kicker} className="relative">
                    <span
                      className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border transition-colors duration-300 ${
                        on
                          ? s.tone === 'human'
                            ? 'border-blue-400 bg-blue-400'
                            : 'border-violet-300 bg-violet-300'
                          : 'border-white/20 bg-[#08080a]'
                      }`}
                    />
                    <button
                      type="button"
                      aria-current={on}
                      className="block text-left"
                      onClick={() => setActive(i)}
                    >
                      <span
                        className={`font-mono text-xs uppercase tracking-[0.15em] ${on ? toneText(s.tone) : 'text-zinc-600'}`}
                      >
                        {i + 1} · {s.kicker}
                      </span>
                      <span
                        className={`mt-1 block text-lg font-semibold transition-colors duration-300 ${on ? 'text-zinc-50' : 'text-zinc-600'}`}
                      >
                        {s.title}
                      </span>
                      <span
                        className={`mt-1 block max-w-md text-sm leading-relaxed transition-opacity duration-300 ${on ? 'text-zinc-400 opacity-100' : 'text-zinc-600 opacity-60'}`}
                      >
                        {s.body}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Crossfading panel */}
            <div className="relative min-h-[240px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Panel step={step} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

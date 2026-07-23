import { WaitlistForm } from './WaitlistForm';
import { WaitlistCount } from './WaitlistCount';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(37,99,235,0.10),transparent)]"
      />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
        >
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Now onboarding early teams · YC F26
        </a>

        <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Your whole team, building software with AI —{' '}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            together, live.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-400">
          OurAI is the multiplayer AI workspace. Start with an idea, let AI refine the requirements
          with your business, then watch coding agents build it in parallel across branches — while
          a human approves every merge. From idea intake to shipped, in one shared room.
        </p>

        <div id="waitlist" className="mt-8 flex flex-col items-center gap-3">
          <WaitlistForm source="hero" />
          <WaitlistCount />
        </div>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 border-t border-neutral-200 pt-8 text-center dark:border-neutral-800">
          <div>
            <dt className="text-2xl font-semibold">~10–18×</dt>
            <dd className="text-xs text-neutral-500">cheaper than frontier-model tools</dd>
          </div>
          <div>
            <dt className="text-2xl font-semibold">1 room</dt>
            <dd className="text-xs text-neutral-500">product, PM, dev, QA — all watching</dd>
          </div>
          <div>
            <dt className="text-2xl font-semibold">0</dt>
            <dd className="text-xs text-neutral-500">merges without a human approval</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

import { WaitlistForm } from './WaitlistForm';
import { WaitlistCount } from './WaitlistCount';
import { LiveTranscript } from './LiveTranscript';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(124,58,237,0.16),transparent),radial-gradient(50%_50%_at_80%_0%,rgba(37,99,235,0.14),transparent)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
        {/* Left: copy */}
        <div>
          <span className="ourai-rise inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Multiplayer AI workspace
          </span>

          <h1 className="ourai-rise ourai-rise-2 mt-5 text-balance text-4xl font-semibold leading-[1.03] tracking-[-0.03em] text-zinc-50 sm:text-6xl">
            Watch <span className="text-blue-400">your team</span> and{' '}
            <span className="text-violet-400">AI agents</span> ship one repo — together, live.
          </h1>

          <p className="ourai-rise ourai-rise-3 mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400">
            From idea intake to a merged PR, over a shared live transcript. Everyone watches, anyone
            steers, and a human approves every merge.
          </p>

          <div id="waitlist" className="ourai-rise ourai-rise-4 mt-8 flex flex-col gap-3">
            <WaitlistForm source="hero" />
            <WaitlistCount />
          </div>

          <p className="mt-6 font-mono text-xs text-zinc-600">
            No credit card · Open source core (AGPL-3.0) · Self-hostable
          </p>
        </div>

        {/* Right: the product itself */}
        <div className="ourai-rise ourai-rise-3">
          <LiveTranscript />
        </div>
      </div>
    </section>
  );
}

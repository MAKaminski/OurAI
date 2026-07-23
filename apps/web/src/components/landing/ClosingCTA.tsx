import { WaitlistForm } from './WaitlistForm';
import { WaitlistCount } from './WaitlistCount';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Closing CTA — the one place we allow a restrained blue→violet glow, echoing
 * the human/agent color device that runs through the whole page.
 */
export function ClosingCTA() {
  return (
    <section id="waitlist" className="relative overflow-hidden border-t border-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[420px] bg-[radial-gradient(60%_80%_at_50%_120%,rgba(37,99,235,0.18),transparent),radial-gradient(50%_70%_at_50%_120%,rgba(124,58,237,0.16),transparent)]"
      />
      <Reveal className="mx-auto max-w-3xl px-6 py-28 text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-5xl">
          Turn your backlog into shipped software — together.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-zinc-400">
          Get early access to OurAI. Bring your team, bring your keys, and watch an idea move all
          the way to a merged PR.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3">
          <WaitlistForm source="footer-cta" />
          <WaitlistCount />
        </div>
        <p className="mt-6 font-mono text-xs text-zinc-600">
          No credit card · Open source core (AGPL-3.0) · Self-hostable
        </p>
      </Reveal>
    </section>
  );
}

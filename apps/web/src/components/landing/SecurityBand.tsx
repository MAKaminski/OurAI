import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';

/**
 * Trust band — the things a team needs to be true before letting agents near
 * their repo. Restated plainly, no lock-icon theater.
 */
const POINTS = [
  {
    title: 'Bring your own keys',
    body: 'Your model keys are encrypted at rest and scoped per org and per person. Passwords are never accessible across an org.',
  },
  {
    title: 'Isolated by default',
    body: 'Row-level security on every table. Each org and person sees only their own data — enforced in the database, not just the app.',
  },
  {
    title: 'Human approves every merge',
    body: 'Agents propose; people decide. No change reaches main without a human reviewing the diff and clicking merge.',
  },
  {
    title: 'Open source, self-hostable',
    body: 'Run the AGPL core on your own infrastructure. Nothing about how your code is handled is a black box.',
  },
];

export function SecurityBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">Trust</span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-zinc-50 sm:text-4xl">
            Built for teams that can&apos;t hand their repo to a black box.
          </h2>
        </div>
      </Reveal>
      <Stagger className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {POINTS.map((p) => (
          <StaggerItem key={p.title} className="flex gap-4">
            <span
              aria-hidden
              className="mt-1 h-4 w-4 flex-none rounded-full border border-emerald-500/40 bg-emerald-500/10"
            />
            <div>
              <h3 className="text-base font-semibold text-zinc-100">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{p.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

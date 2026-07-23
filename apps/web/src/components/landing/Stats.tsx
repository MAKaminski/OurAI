import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { CountUp } from '@/components/motion/CountUp';

/**
 * Stat row in tabular mono — hard numbers read as product truth, not marketing.
 * Numeric stats count up on scroll-in; conceptual ones (∞) reveal with them.
 */
interface Stat {
  count?: { to: number; suffix?: string; prefix?: string };
  static?: string;
  unit: string;
  label: string;
}

const STATS: Stat[] = [
  { static: '∞', unit: 'watchers', label: 'Free to watch — you only pay for agent-compute' },
  {
    count: { to: 100, suffix: '%' },
    unit: 'reviewed',
    label: 'Every merge is approved by a human',
  },
  {
    count: { to: 10, suffix: '×' },
    unit: 'cheaper',
    label: 'Priced per agent — ~10–18× under frontier-model tools',
  },
  { static: '1', unit: 'repo', label: 'Everyone works over the same source of truth' },
];

export function Stats() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <Stagger className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
        {STATS.map((s) => (
          <StaggerItem key={s.unit} className="px-6 py-10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-zinc-50">
                {s.count ? (
                  <CountUp to={s.count.to} suffix={s.count.suffix} prefix={s.count.prefix} />
                ) : (
                  s.static
                )}
              </span>
              <span className="font-mono text-sm text-zinc-500">{s.unit}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

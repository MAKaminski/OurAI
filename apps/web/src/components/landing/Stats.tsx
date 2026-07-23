/**
 * Stat row in tabular mono — hard numbers read as product truth, not marketing.
 * Framed honestly as design targets for an early-access product.
 */
const STATS = [
  { value: '1', unit: 'repo', label: 'Everyone works over the same source of truth' },
  { value: '∞', unit: 'watchers', label: 'Free to watch — you only pay for agent-compute' },
  { value: '100%', unit: 'reviewed', label: 'Every merge is approved by a human' },
  { value: '<1s', unit: 'to sync', label: 'Live transcript updates for every teammate' },
];

export function Stats() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.unit} className="px-6 py-10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-zinc-50">
                {s.value}
              </span>
              <span className="font-mono text-sm text-zinc-500">{s.unit}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

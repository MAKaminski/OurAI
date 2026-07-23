const FEATURES = [
  ['Live shared transcript', 'An append-only event log every teammate reads in real time.'],
  ['AI requirements refinement', 'Chat the idea into a spec with your business before building.'],
  ['Branch-per-agent isolation', 'One agent, one branch, one git worktree — parallel and safe.'],
  ['Outstanding-work view', 'See every queued, running, and needs-review branch at a glance.'],
  ['Human-approved merges', 'Preview the diff, approve, merge. No auto-merge, ever.'],
  ['Budget + concurrency caps', 'A hard monthly ceiling keeps spend flat and predictable.'],
  ['Swappable models', 'DeepSeek by default; switch providers with one env var.'],
  ['Open source core', 'AGPL core you can self-host; Apache-licensed SDK to build on.'],
];

export function Features() {
  return (
    <section
      id="features"
      className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/30"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything the team needs</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            One workspace from idea to shipped — instrumented so you can prove the value.
          </p>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([title, body]) => (
            <div key={title}>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                <h3 className="text-sm font-semibold">{title}</h3>
              </div>
              <p className="mt-1 pl-6 text-sm text-neutral-600 dark:text-neutral-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

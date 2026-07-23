const ITEMS = [
  {
    title: 'Multiplayer by design',
    body: 'Not a solo copilot. The whole cross-functional team shares one room and one live transcript — everyone sees the same thing, in order, with full history for late-joiners.',
    icon: '👥',
  },
  {
    title: 'Idea intake is the front door',
    body: 'Start with a company and an idea. AI refines the requirements with your business before a line of code is written — product management first, code second.',
    icon: '🗂️',
  },
  {
    title: 'Parallel agents, safe merges',
    body: 'Each idea gets its own agent on its own branch. Many run at once; AI rightsizes the work and a human approves every merge. Nothing hits main by accident.',
    icon: '🌿',
  },
  {
    title: 'Priced per agent, not per seat',
    body: 'Watchers are free — cost scales with agent-compute, not headcount. Add your whole org to the room without adding to the bill.',
    icon: '💸',
  },
];

export function Differentiators() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Why teams choose OurAI</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Most AI dev tools make one person faster. OurAI makes a whole team ship together.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50"
          >
            <div className="text-2xl">{item.icon}</div>
            <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

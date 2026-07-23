import type { Event } from '@ourai/shared';

/** Renders the append-only transcript. Scaffold: takes events as a prop. */
export function EventStream({ events = [] }: { events?: Event[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-neutral-500">No events yet.</p>;
  }
  return (
    <ol className="space-y-2">
      {events.map((e) => (
        <li key={e.id} className="rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900/50">
          <span className="mr-2 text-xs uppercase tracking-wide text-neutral-500">{e.kind}</span>
          <span className="text-xs text-neutral-400">#{e.seq}</span>
        </li>
      ))}
    </ol>
  );
}

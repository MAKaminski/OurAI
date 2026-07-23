import type { WorkItemStatus } from '@ourai/shared';

const COLUMNS: WorkItemStatus[] = ['queued', 'running', 'awaiting_review', 'merged'];

/** Branch / outstanding-work view (docs plan v2 §3.3). Scaffold: empty. */
export function OutstandingWork() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {COLUMNS.map((col) => (
        <div key={col} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900/50">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {col.replace('_', ' ')}
          </h3>
          <p className="text-xs text-neutral-400">Nothing here.</p>
        </div>
      ))}
    </div>
  );
}

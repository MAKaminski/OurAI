import type { IdeaStatus } from '@ourai/shared';

const COLUMNS: IdeaStatus[] = ['inbox', 'triaged', 'promoted', 'shipped', 'rejected'];

/** Kanban board for the idea-intake backlog. Scaffold: empty columns. */
export function IdeaBoard() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {COLUMNS.map((col) => (
        <div key={col} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900/50">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {col}
          </h3>
          <p className="text-xs text-neutral-400">No ideas.</p>
        </div>
      ))}
    </div>
  );
}

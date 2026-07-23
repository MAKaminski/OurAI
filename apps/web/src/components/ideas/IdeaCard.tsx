import type { Idea } from '@ourai/shared';

export function IdeaCard({ idea }: { idea: Pick<Idea, 'title' | 'status'> }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="font-medium">{idea.title}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{idea.status}</div>
    </div>
  );
}

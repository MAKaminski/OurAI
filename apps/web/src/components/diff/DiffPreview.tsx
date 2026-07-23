'use client';

/** Diff preview + human-approved merge button (docs plan v2 §3.3). */
export function DiffPreview({ workItemId }: { workItemId: string }) {
  return (
    <div className="space-y-3">
      <pre className="overflow-x-auto rounded-md bg-neutral-950 p-4 text-xs text-neutral-100">
        <code># diff for {workItemId} — loaded in Phase 1c</code>
      </pre>
      <button
        type="button"
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
      >
        Approve &amp; merge
      </button>
    </div>
  );
}

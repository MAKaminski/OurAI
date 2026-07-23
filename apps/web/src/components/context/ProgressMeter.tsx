import type { ContextJob } from '@/lib/context/types';

const KIND_LABEL: Record<ContextJob['kind'], string> = {
  organize: 'Organizing with AI',
  sort: 'Sorting',
  ingest: 'Ingesting',
};

/** A clear progress meter for an AI-processing job. */
export function ProgressMeter({ job }: { job: ContextJob }) {
  const done = job.status === 'done';
  const error = job.status === 'error';
  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium">
          {KIND_LABEL[job.kind]}
          {job.detail ? <span className="ml-2 text-neutral-500">{job.detail}</span> : null}
        </span>
        <span className="font-mono tabular-nums text-neutral-500">
          {error ? 'error' : `${job.progress}%`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            error
              ? 'bg-red-500'
              : done
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-violet-500'
          }`}
          style={{ width: `${error ? 100 : job.progress}%` }}
        />
      </div>
    </div>
  );
}

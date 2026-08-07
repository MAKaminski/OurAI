'use client';

import { useState } from 'react';

interface BuildResponse {
  ok?: boolean;
  error?: string;
  prUrl?: string;
  prNumber?: number;
  branch?: string;
  summary?: string;
  files?: string[];
}

/**
 * Build execution: generate code from the approved plan and open a draft PR on
 * the company's connected repo. Distinct from the implementation-plan artifacts
 * above it — this actually writes to GitHub.
 */
export function BuildPanel({
  companyId,
  requestId,
  existingPrUrl,
  onBuilt,
}: {
  companyId: string;
  requestId: string;
  existingPrUrl: string | null;
  onBuilt: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuildResponse | null>(null);
  const prUrl = result?.prUrl ?? existingPrUrl;

  async function run() {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/requests/${requestId}/build-pr`, {
        method: 'POST',
      });
      const data = (await res.json()) as BuildResponse;
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Build failed.');
      } else {
        setResult(data);
        onBuilt();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Build</h2>
          <p className="text-xs text-neutral-500">
            Generate code from the approved plan and open a draft PR on the connected repo.
          </p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
        >
          {running ? 'Building…' : prUrl ? 'Rebuild → new PR' : 'Generate code & open draft PR'}
        </button>
      </div>

      {running ? (
        <p className="text-xs text-neutral-400">
          Generating file changes and opening the PR — this can take 10–40s…
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {prUrl ? (
        <div className="space-y-2 rounded-md bg-emerald-50 p-3 text-sm dark:bg-emerald-900/20">
          <a
            href={prUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-emerald-700 underline dark:text-emerald-300"
          >
            View draft PR ↗
          </a>
          {result?.summary ? (
            <p className="text-neutral-600 dark:text-neutral-400">{result.summary}</p>
          ) : null}
          {result?.files?.length ? (
            <ul className="mt-1 space-y-0.5 font-mono text-xs text-neutral-500">
              {result.files.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

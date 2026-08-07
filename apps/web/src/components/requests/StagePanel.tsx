'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ArtifactStage } from '@ourai/shared';
import type { ArtifactView } from '@/lib/requests/types';

const STAGE_COPY: Record<ArtifactStage, { heading: string; blurb: string; noun: string }> = {
  design: {
    heading: 'Design brief',
    blurb: 'design decisions and components',
    noun: 'design item',
  },
  build: { heading: 'Implementation plan', blurb: 'build tasks', noun: 'task' },
  qa: { heading: 'Test plan', blurb: 'test cases', noun: 'test case' },
  staging: { heading: 'Release checklist', blurb: 'go-live steps', noun: 'checklist item' },
};

export function StagePanel({
  companyId,
  requestId,
  stage,
  nextLabel,
  onAdvanced,
}: {
  companyId: string;
  requestId: string;
  stage: ArtifactStage;
  /** Label of the stage this one advances to (e.g. "Build", "Done"). */
  nextLabel: string;
  /** Called after approval so the parent can reload the request + stepper. */
  onAdvanced: () => void;
}) {
  const [artifacts, setArtifacts] = useState<ArtifactView[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/companies/${companyId}/requests/${requestId}/stages/${stage}`;
  const copy = STAGE_COPY[stage];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(base);
      const data = (await res.json()) as { artifacts?: ArtifactView[]; error?: string };
      if (!res.ok) setError(data.error ?? 'Failed to load stage.');
      else setArtifacts(data.artifacts ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate() {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(base, { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) setError(data.error ?? 'Generation failed.');
      await load();
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  }

  async function save(a: ArtifactView) {
    setError(null);
    const res = await fetch(base, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, title: a.title, content: a.content }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) setError(data.error ?? 'Could not save.');
    else await load();
  }

  async function add() {
    setError(null);
    const res = await fetch(base, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `New ${copy.noun}`, content: null }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) setError(data.error ?? 'Could not add.');
    else await load();
  }

  async function remove(id: string) {
    setError(null);
    const res = await fetch(`${base}?artifactId=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) setError(data.error ?? 'Could not delete.');
    else await load();
  }

  async function approve() {
    if (approving) return;
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(`${base}/approve`, { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Approval failed.');
        return;
      }
      onAdvanced();
    } catch (err) {
      setError(String(err));
    } finally {
      setApproving(false);
    }
  }

  function patchLocal(id: string, field: 'title' | 'content', value: string) {
    setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{copy.heading}</h2>
        <button
          onClick={generate}
          disabled={generating}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
        >
          {generating
            ? 'Generating…'
            : artifacts.length
              ? 'Regenerate'
              : `Generate ${copy.heading}`}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Loading…</p>
      ) : artifacts.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No {copy.blurb} yet. Generate a proposal, then review and edit before approving.
        </p>
      ) : (
        <ul className="space-y-3">
          {artifacts.map((a) => (
            <li
              key={a.id}
              className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="flex items-center gap-2">
                <input
                  value={a.title}
                  onChange={(e) => patchLocal(a.id, 'title', e.target.value)}
                  className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm font-medium dark:border-neutral-700 dark:bg-neutral-900"
                />
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase text-neutral-500 dark:bg-neutral-800">
                  {a.source}
                </span>
              </div>
              <textarea
                value={a.content ?? ''}
                onChange={(e) => patchLocal(a.id, 'content', e.target.value)}
                placeholder="Details"
                rows={3}
                className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => save(a)}
                  className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
                >
                  Save
                </button>
                <button
                  onClick={() => remove(a.id)}
                  className="rounded-md border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button onClick={add} className="text-sm text-neutral-500 underline">
        + Add a {copy.noun} manually
      </button>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {artifacts.length > 0 ? (
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button
            onClick={approve}
            disabled={approving}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {approving ? 'Approving…' : `Approve → continue to ${nextLabel}`}
          </button>
        </div>
      ) : null}
    </section>
  );
}

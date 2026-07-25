'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { RequestPriority } from '@ourai/shared';
import type { RequestView } from '@/lib/requests/types';

const STAGE_LABELS: Record<string, string> = {
  intake: 'Intake',
  kpi_review: 'KPI review',
  design: 'Design',
  build: 'Build',
  qa: 'QA',
  staging: 'Staging',
  done: 'Done',
  rejected: 'Rejected',
};

const PRIORITIES: RequestPriority[] = ['low', 'normal', 'high', 'urgent'];

export function RequestsBoard({ companyId }: { companyId: string }) {
  const [requests, setRequests] = useState<RequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/companies/${companyId}/requests`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(base);
      const data = (await res.json()) as { requests?: RequestView[]; error?: string };
      if (!res.ok) setError(data.error ?? 'Failed to load requests.');
      else setRequests(data.requests ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body: body.trim() || null, priority }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not add request.');
        return;
      }
      setTitle('');
      setBody('');
      setPriority('normal');
      await load();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <h2 className="text-sm font-semibold">(+) Add a Request</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What should we build?"
          required
          maxLength={200}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details, context, links…"
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex items-center gap-3">
          <label className="text-sm">
            Priority{' '}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as RequestPriority)}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
          >
            {submitting ? 'Adding…' : 'Add request'}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      </form>

      <section>
        {loading ? (
          <p className="text-sm text-neutral-400">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-neutral-400">No requests yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {requests.map((r) => (
              <li key={r.id} className="py-3">
                <Link
                  href={`/companies/${companyId}/requests/${r.id}`}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-medium">{r.title}</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {STAGE_LABELS[r.stage] ?? r.stage}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

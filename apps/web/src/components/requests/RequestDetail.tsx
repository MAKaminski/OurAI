'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { KpiView, RequestView } from '@/lib/requests/types';

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

interface DetailResponse {
  request?: RequestView;
  kpis?: KpiView[];
  error?: string;
}

export function RequestDetail({ companyId, requestId }: { companyId: string; requestId: string }) {
  const [request, setRequest] = useState<RequestView | null>(null);
  const [kpis, setKpis] = useState<KpiView[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/companies/${companyId}/requests/${requestId}`;
  const kpiBase = `${base}/kpis`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(base);
      const data = (await res.json()) as DetailResponse;
      if (!res.ok) {
        setError(data.error ?? 'Failed to load request.');
      } else {
        setRequest(data.request ?? null);
        setKpis(data.kpis ?? []);
      }
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
      const res = await fetch(kpiBase, { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) setError(data.error ?? 'KPI generation failed.');
      await load();
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  }

  async function saveKpi(kpi: KpiView) {
    setError(null);
    const res = await fetch(kpiBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: kpi.id,
        name: kpi.name,
        target: kpi.target,
        rationale: kpi.rationale,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) setError(data.error ?? 'Could not save KPI.');
    else await load();
  }

  async function addKpi() {
    setError(null);
    const res = await fetch(kpiBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New KPI', target: 'Set a target', rationale: null }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) setError(data.error ?? 'Could not add KPI.');
    else await load();
  }

  async function removeKpi(kpiId: string) {
    setError(null);
    const res = await fetch(`${kpiBase}?kpiId=${encodeURIComponent(kpiId)}`, { method: 'DELETE' });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) setError(data.error ?? 'Could not delete KPI.');
    else await load();
  }

  async function approve() {
    if (approving) return;
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(`${kpiBase}/approve`, { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) setError(data.error ?? 'Approval failed.');
      await load();
    } catch (err) {
      setError(String(err));
    } finally {
      setApproving(false);
    }
  }

  function patchLocal(id: string, field: keyof KpiView, value: string) {
    setKpis((prev) => prev.map((k) => (k.id === id ? { ...k, [field]: value } : k)));
  }

  if (loading) return <p className="text-sm text-neutral-400">Loading…</p>;
  if (!request) return <p className="text-sm text-red-600">{error ?? 'Request not found.'}</p>;

  const inKpiStage = request.stage === 'intake' || request.stage === 'kpi_review';
  const canApprove = request.stage === 'kpi_review' && kpis.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/companies/${companyId}/requests`}
          className="text-xs text-neutral-500 underline"
        >
          ← All requests
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{request.title}</h1>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {STAGE_LABELS[request.stage] ?? request.stage}
          </span>
        </div>
        {request.body ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
            {request.body}
          </p>
        ) : null}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Product KPIs</h2>
          {inKpiStage ? (
            <button
              onClick={generate}
              disabled={generating}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              {generating ? 'Generating…' : kpis.length ? 'Regenerate KPIs' : 'Generate KPIs'}
            </button>
          ) : null}
        </div>

        {kpis.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No KPIs yet. Generate a proposal, then review and edit before approving.
          </p>
        ) : (
          <ul className="space-y-3">
            {kpis.map((k) => (
              <li
                key={k.id}
                className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={k.name}
                    onChange={(e) => patchLocal(k.id, 'name', e.target.value)}
                    className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm font-medium dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase text-neutral-500 dark:bg-neutral-800">
                    {k.source}
                  </span>
                </div>
                <input
                  value={k.target}
                  onChange={(e) => patchLocal(k.id, 'target', e.target.value)}
                  placeholder="Target"
                  className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <textarea
                  value={k.rationale ?? ''}
                  onChange={(e) => patchLocal(k.id, 'rationale', e.target.value)}
                  placeholder="Rationale"
                  rows={2}
                  className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveKpi(k)}
                    className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => removeKpi(k.id)}
                    className="rounded-md border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {inKpiStage ? (
          <button onClick={addKpi} className="text-sm text-neutral-500 underline">
            + Add a KPI manually
          </button>
        ) : null}

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        {canApprove ? (
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <button
              onClick={approve}
              disabled={approving}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {approving ? 'Approving…' : 'Approve KPIs → continue to Design'}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

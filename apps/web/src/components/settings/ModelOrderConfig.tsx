'use client';

import { useCallback, useEffect, useState } from 'react';

interface OrderResponse {
  order?: string[];
  labels?: Record<string, string>;
  configured?: string[];
  error?: string;
}

/**
 * Reorderable list of model providers for a company. The KPI/stage agents try
 * providers top-to-bottom and fall through on failure, so this is the company's
 * ranked preference. Providers without a saved key are flagged.
 */
export function ModelOrderConfig({ companyId }: { companyId: string }) {
  const [order, setOrder] = useState<string[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [configured, setConfigured] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const base = `/api/companies/${companyId}/model-order`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(base, { cache: 'no-store' });
      const data = (await res.json()) as OrderResponse;
      if (!res.ok) {
        setStatus(data.error ?? 'Failed to load.');
      } else {
        setOrder(data.order ?? []);
        setLabels(data.labels ?? {});
        setConfigured(data.configured ?? []);
      }
    } catch (err) {
      setStatus(String(err));
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    const a = next[i]!;
    next[i] = next[j]!;
    next[j] = a;
    setOrder(next);
    setDirty(true);
    setStatus(null);
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(base, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      const data = (await res.json()) as { ok?: boolean; order?: string[]; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? 'Could not save.');
      } else {
        setOrder(data.order ?? order);
        setDirty(false);
        setStatus('Saved.');
      }
    } catch (err) {
      setStatus(String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-400">Loading…</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Agents try these providers top to bottom and fall through to the next if one fails (a dead
        key, out of balance, or an error). Order is per company; the keys themselves come from each
        member’s vault.
      </p>
      <ol className="space-y-2">
        {order.map((p, i) => {
          const hasKey = configured.includes(p);
          return (
            <li
              key={p}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
            >
              <span className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs text-neutral-400">{i + 1}</span>
                <span className="font-medium">{labels[p] ?? p}</span>
                {hasKey ? (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    key set
                  </span>
                ) : (
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase text-neutral-400 dark:bg-neutral-800">
                    no key
                  </span>
                )}
              </span>
              <span className="flex gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${labels[p] ?? p} up`}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  aria-label={`Move ${labels[p] ?? p} down`}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                >
                  ↓
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {saving ? 'Saving…' : 'Save order'}
        </button>
        {status ? <span className="text-sm text-neutral-500">{status}</span> : null}
      </div>
    </div>
  );
}

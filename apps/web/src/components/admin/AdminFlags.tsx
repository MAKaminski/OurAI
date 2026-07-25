'use client';

import { useCallback, useEffect, useState } from 'react';

interface FlagRow {
  name: string;
  key: string;
  description: string;
  defaultValue: boolean;
  override: boolean | null;
  effective: boolean;
}

export function AdminFlags() {
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/flags');
      const data = (await res.json()) as { flags?: FlagRow[]; error?: string };
      if (!res.ok) setError(data.error ?? 'Failed to load flags.');
      else setFlags(data.flags ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function set(key: string, enabled: boolean | null) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) setError(data.error ?? 'Update failed.');
      await load();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-neutral-400">Loading flags…</p>;

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {flags.map((f) => (
          <li key={f.key} className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">
                {f.name} <span className="font-mono text-xs text-neutral-400">({f.key})</span>
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">{f.description}</p>
              <p className="mt-1 text-xs text-neutral-400">
                default {String(f.defaultValue)} ·{' '}
                {f.override === null ? 'no override' : `override ${String(f.override)}`} ·{' '}
                <span className={f.effective ? 'text-emerald-600' : 'text-neutral-500'}>
                  effective {String(f.effective)}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => set(f.key, true)}
                disabled={busy === f.key}
                className={`rounded-md px-2.5 py-1 text-xs font-medium disabled:opacity-60 ${
                  f.override === true
                    ? 'bg-emerald-600 text-white'
                    : 'border border-neutral-300 dark:border-neutral-700'
                }`}
              >
                On
              </button>
              <button
                onClick={() => set(f.key, false)}
                disabled={busy === f.key}
                className={`rounded-md px-2.5 py-1 text-xs font-medium disabled:opacity-60 ${
                  f.override === false
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'border border-neutral-300 dark:border-neutral-700'
                }`}
              >
                Off
              </button>
              <button
                onClick={() => set(f.key, null)}
                disabled={busy === f.key || f.override === null}
                className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
              >
                Clear
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

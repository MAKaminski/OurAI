'use client';

import { useCallback, useEffect, useState } from 'react';

interface SecretView {
  key: string;
  isSensitive: boolean;
  display: string;
  updatedAt: string;
}

export interface Scope {
  type: 'user' | 'org';
  orgId?: string;
}

function scopeQuery(scope: Scope): string {
  const params = new URLSearchParams({ scope: scope.type });
  if (scope.type === 'org' && scope.orgId) params.set('orgId', scope.orgId);
  return params.toString();
}

export function SecretsManager({ scope, hint }: { scope: Scope; hint: string }) {
  const [secrets, setSecrets] = useState<SecretView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isSensitive, setIsSensitive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/secrets?${scopeQuery(scope)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'failed to load');
      setSecrets(data.secrets ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    void load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: scope.type, orgId: scope.orgId, key, value, isSensitive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'failed to save');
      setKey('');
      setValue('');
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(k: string) {
    const params = new URLSearchParams(scopeQuery(scope));
    params.set('key', k);
    await fetch(`/api/secrets?${params.toString()}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-500">{hint}</p>

      <form
        onSubmit={add}
        className="grid gap-2 rounded-xl border border-neutral-200 p-4 sm:grid-cols-[1fr_1fr_auto] dark:border-neutral-800"
      >
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="KEY (e.g. DEEPSEEK_API_KEY)"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type={isSensitive ? 'password' : 'text'}
          placeholder="value"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <label className="flex items-center gap-2 text-xs text-neutral-500 sm:col-span-3">
          <input
            type="checkbox"
            checked={isSensitive}
            onChange={(e) => setIsSensitive(e.target.checked)}
          />
          Sensitive (encrypted at rest, hidden — e.g. API keys & passwords)
        </label>
      </form>

      {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-4 divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {loading ? (
          <p className="p-4 text-sm text-neutral-500">Loading…</p>
        ) : secrets.length === 0 ? (
          <p className="p-4 text-sm text-neutral-500">No values yet.</p>
        ) : (
          secrets.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium">{s.key}</code>
                  {s.isSensitive && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-800">
                      secret
                    </span>
                  )}
                </div>
                <div className="truncate font-mono text-xs text-neutral-500">{s.display}</div>
              </div>
              <button
                type="button"
                onClick={() => remove(s.key)}
                className="shrink-0 text-xs text-red-600 hover:underline dark:text-red-400"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

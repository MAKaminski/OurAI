'use client';

import { useCallback, useEffect, useState } from 'react';

interface Setting {
  key: string;
  isSensitive: boolean;
  display: string;
  updatedAt: string;
}

interface ListResponse {
  configured: boolean;
  reason?: string;
  settings: Setting[];
}

/** Common BYOK keys, offered as quick suggestions. */
const SUGGESTED = ['MODEL_API_KEY', 'GITHUB_TOKEN', 'MODEL_ID', 'MODEL_BASE_URL'];

export function SettingsManager({ companyId }: { companyId: string }) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [configured, setConfigured] = useState(true);
  const [reason, setReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [sensitive, setSensitive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const base = `/api/companies/${companyId}/settings`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(base, { cache: 'no-store' });
      const data = (await res.json()) as ListResponse;
      setConfigured(data.configured);
      setReason(data.reason);
      setSettings(data.settings ?? []);
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim(), value, isSensitive: sensitive }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'save failed');
      }
      setKey('');
      setValue('');
      await load();
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(k: string) {
    await fetch(`${base}/${encodeURIComponent(k)}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-8">
      {!configured && (
        <div className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Settings storage isn&apos;t configured in this environment yet
          {reason ? ` — ${reason}` : ''}. You can still see the form; values will save once Supabase
          and an encryption key are set.
        </div>
      )}

      {/* Add / update */}
      <form
        onSubmit={onSave}
        className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
      >
        <h2 className="text-sm font-semibold">Add a value</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Bring your own keys. Mark secrets as <strong>Sensitive</strong> — they&apos;re encrypted
          at rest and only ever shown masked.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium">Key</span>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="MODEL_API_KEY"
              list="suggested-keys"
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            <datalist id="suggested-keys">
              {SUGGESTED.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="text-xs font-medium">Value</span>
            <input
              type={sensitive ? 'password' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={sensitive ? 'sk-…' : 'plain value'}
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-medium">Type</legend>
          <div className="mt-2 flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sensitivity"
                checked={sensitive}
                onChange={() => setSensitive(true)}
              />
              <span>
                Sensitive <span className="text-xs text-neutral-500">(encrypted, masked)</span>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sensitivity"
                checked={!sensitive}
                onChange={() => setSensitive(false)}
              />
              <span>
                Non-sensitive <span className="text-xs text-neutral-500">(stored as-is)</span>
              </span>
            </label>
          </div>
        </fieldset>

        {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
        >
          {saving ? 'Saving…' : 'Save value'}
        </button>
      </form>

      {/* Existing */}
      <div>
        <h2 className="text-sm font-semibold">Stored values</h2>
        {loading ? (
          <p className="mt-3 text-sm text-neutral-500">Loading…</p>
        ) : settings.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No values yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {settings.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium">{s.key}</code>
                    {s.isSensitive ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                        sensitive
                      </span>
                    ) : (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        plain
                      </span>
                    )}
                  </div>
                  <div className="truncate font-mono text-xs text-neutral-500">{s.display}</div>
                </div>
                <button
                  type="button"
                  onClick={() => void onDelete(s.key)}
                  className="shrink-0 rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

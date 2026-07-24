'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CONNECTORS,
  CATEGORY_LABELS,
  type Connector,
  type ConnectorCategory,
} from '@/lib/connectors/registry';
import { TechLogo } from '@/components/brand/TechLogos';

interface Org {
  id: string;
  name: string;
  slug: string | null;
  createdAt: string;
}
type Selection = { type: 'user' } | { type: 'org'; id: string; name: string };

function scopeQuery(sel: Selection): string {
  const p = new URLSearchParams({ scope: sel.type });
  if (sel.type === 'org') p.set('orgId', sel.id);
  return p.toString();
}

const CATEGORY_ORDER: ConnectorCategory[] = ['model', 'source', 'infra', 'analytics'];

export function ConnectorsManager({ initialOrgs }: { initialOrgs: Org[] }) {
  const [selection, setSelection] = useState<Selection>({ type: 'user' });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/secrets?${scopeQuery(selection)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'failed to load');
      setKeys(new Set((data.secrets ?? []).map((s: { key: string }) => s.key)));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [selection]);

  useEffect(() => {
    void load();
  }, [load]);

  const tab = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm transition ${
      active
        ? 'bg-zinc-50 text-zinc-950'
        : 'border border-white/15 text-zinc-400 hover:text-zinc-100'
    }`;

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">
        Connect the services your team uses. Credentials are encrypted at rest and scoped to{' '}
        {selection.type === 'org' ? `“${selection.name}”` : 'you'} — the same vault as Settings &
        keys.
      </p>

      {/* Scope switcher */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelection({ type: 'user' })}
          className={tab(selection.type === 'user')}
        >
          Personal
        </button>
        {initialOrgs.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setSelection({ type: 'org', id: o.id, name: o.name })}
            className={tab(selection.type === 'org' && selection.id === o.id)}
          >
            {o.name}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      <div className="space-y-10">
        {CATEGORY_ORDER.map((cat) => {
          const items = CONNECTORS.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((c) => (
                  <ConnectorCard
                    key={c.id}
                    connector={c}
                    connected={c.fields.every((f) => keys.has(f.key))}
                    loading={loading}
                    scope={selection}
                    onChange={load}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ConnectorCard({
  connector,
  connected,
  loading,
  scope,
  onChange,
}: {
  connector: Connector;
  connected: boolean;
  loading: boolean;
  scope: Selection;
  onChange: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      for (const f of connector.fields) {
        const res = await fetch('/api/secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: scope.type,
            orgId: scope.type === 'org' ? scope.id : undefined,
            key: f.key,
            value: values[f.key] ?? '',
            isSensitive: f.sensitive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'failed to connect');
      }
      setOpen(false);
      setValues({});
      await onChange();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setErr('');
    try {
      for (const f of connector.fields) {
        const p = new URLSearchParams({ scope: scope.type });
        if (scope.type === 'org') p.set('orgId', scope.id);
        p.set('key', f.key);
        await fetch(`/api/secrets?${p.toString()}`, { method: 'DELETE' });
      }
      await onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0e10] p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-none">
          <TechLogo slug={connector.slug} size={30} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-100">{connector.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-zinc-500'
              }`}
            >
              {loading ? '…' : connected ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">{connector.blurb}</p>
        </div>
      </div>

      {open && !connected && (
        <form onSubmit={connect} className="mt-4 space-y-2">
          {connector.fields.map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs text-zinc-500">{f.label}</span>
              <input
                type={f.sensitive ? 'password' : 'text'}
                required
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/40"
              />
            </label>
          ))}
          {err && <p className="text-xs text-red-400">{err}</p>}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-60"
            >
              {busy ? 'Connecting…' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 flex items-center justify-between">
        <a
          href={connector.getKeyUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-zinc-500 underline-offset-2 transition hover:text-zinc-200 hover:underline"
        >
          Get your key ↗
        </a>
        <div className="flex items-center gap-3">
          {connector.oauthComingSoon && !connected && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-600">
              OAuth soon
            </span>
          )}
          {connected ? (
            <button
              type="button"
              onClick={disconnect}
              disabled={busy}
              className="text-xs text-red-400 transition hover:underline disabled:opacity-60"
            >
              {busy ? 'Removing…' : 'Disconnect'}
            </button>
          ) : (
            !open && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-zinc-100 transition hover:border-white/30"
              >
                Connect
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

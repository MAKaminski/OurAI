'use client';

import { useState } from 'react';
import { SecretsManager, type Scope } from './SecretsManager';

interface Org {
  id: string;
  name: string;
  slug: string | null;
  createdAt: string;
}

type Selection = { type: 'user' } | { type: 'org'; id: string; name: string };

export function AccountManager({ email, initialOrgs }: { email: string; initialOrgs: Org[] }) {
  const [orgs, setOrgs] = useState<Org[]>(initialOrgs);
  const [selection, setSelection] = useState<Selection>({ type: 'user' });
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function createOrg(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'failed to create org');
      const org: Org = data.org;
      setOrgs((prev) => [...prev, org]);
      setSelection({ type: 'org', id: org.id, name: org.name });
      setNewName('');
      setCreating(false);
    } catch (e2) {
      setError(String(e2));
    } finally {
      setBusy(false);
    }
  }

  const scope: Scope =
    selection.type === 'org' ? { type: 'org', orgId: selection.id } : { type: 'user' };
  const hint =
    selection.type === 'org'
      ? `Shared with everyone in ${selection.name}. Sensitive values are encrypted and never visible to other organizations.`
      : 'Private to you. Not visible to any organization or other user.';

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings & keys</h1>
          <p className="text-sm text-neutral-500">{email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Scope switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelection({ type: 'user' })}
          className={tab(selection.type === 'user')}
        >
          Personal
        </button>
        {orgs.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setSelection({ type: 'org', id: o.id, name: o.name })}
            className={tab(selection.type === 'org' && selection.id === o.id)}
          >
            {o.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCreating((c) => !c)}
          className="rounded-full border border-dashed border-neutral-300 px-3 py-1 text-sm text-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:hover:text-white"
        >
          + New organization
        </button>
      </div>

      {orgs.length === 0 && !creating && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
          You&apos;re not in any organization yet. Create one to share keys with your team — you
          won&apos;t be added to any org automatically.
        </div>
      )}

      {creating && (
        <form
          onSubmit={createOrg}
          className="mb-6 flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 sm:flex-row dark:border-neutral-800"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Organization name"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
          >
            {busy ? 'Creating…' : 'Create organization'}
          </button>
        </form>
      )}

      {error && <p className="mb-4 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <SecretsManager
        key={selection.type === 'org' ? selection.id : 'user'}
        scope={scope}
        hint={hint}
      />
    </main>
  );
}

function tab(active: boolean): string {
  return active
    ? 'rounded-full bg-neutral-900 px-3 py-1 text-sm font-medium text-white dark:bg-white dark:text-neutral-900'
    : 'rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700';
}

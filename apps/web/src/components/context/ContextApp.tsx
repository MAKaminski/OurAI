'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProgressMeter } from './ProgressMeter';
import type { ContextItem, ContextJob, ContextScope, JobKind } from '@/lib/context/types';

interface Org {
  id: string;
  name: string;
}
type Selection = { type: 'user' } | { type: 'org'; id: string; name: string };

function scopeParams(sel: Selection): { scope: ContextScope; orgId?: string } {
  return sel.type === 'org' ? { scope: 'org', orgId: sel.id } : { scope: 'user' };
}
function qs(sel: Selection): string {
  const p = scopeParams(sel);
  const u = new URLSearchParams({ scope: p.scope });
  if (p.orgId) u.set('orgId', p.orgId);
  return u.toString();
}

export function ContextApp() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [sel, setSel] = useState<Selection>({ type: 'user' });
  const [items, setItems] = useState<ContextItem[]>([]);
  const [jobs, setJobs] = useState<ContextJob[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    void fetch('/api/orgs')
      .then((r) => r.json())
      .then((d: { orgs?: Org[] }) => setOrgs(d.orgs ?? []));
  }, []);

  const loadItems = useCallback(async () => {
    const r = await fetch(`/api/context/items?${qs(sel)}`, { cache: 'no-store' });
    if (r.ok) setItems(((await r.json()) as { items: ContextItem[] }).items);
  }, [sel]);

  const loadJobs = useCallback(async () => {
    const r = await fetch(`/api/context/jobs?${qs(sel)}`, { cache: 'no-store' });
    if (r.ok) setJobs(((await r.json()) as { jobs: ContextJob[] }).jobs);
  }, [sel]);

  useEffect(() => {
    void loadItems();
    void loadJobs();
  }, [loadItems, loadJobs]);

  // Poll while any job is running, to animate the progress meters.
  useEffect(() => {
    const running = jobs.some((j) => j.status === 'running');
    if (running && !pollRef.current) {
      pollRef.current = setInterval(() => {
        void loadJobs();
        void loadItems();
      }, 1000);
    } else if (!running && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [jobs, loadJobs, loadItems]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/context/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...scopeParams(sel),
        title,
        body,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    setTitle('');
    setBody('');
    setTags('');
    void loadItems();
  }

  async function runJob(kind: JobKind) {
    await fetch('/api/context/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...scopeParams(sel), kind }),
    });
    void loadJobs();
  }

  async function removeItem(id: string) {
    await fetch(`/api/context/items?id=${id}`, { method: 'DELETE' });
    void loadItems();
  }

  const activeJobs = jobs.filter((j) => j.status === 'running');

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Context</h1>
          <p className="text-sm text-neutral-500">
            Create, organize, and sort the context your team and agents rely on.
          </p>
        </div>
      </div>

      {/* Scope switcher */}
      <div className="mb-6 flex flex-wrap gap-2">
        <ScopeTab active={sel.type === 'user'} onClick={() => setSel({ type: 'user' })}>
          Personal
        </ScopeTab>
        {orgs.map((o) => (
          <ScopeTab
            key={o.id}
            active={sel.type === 'org' && sel.id === o.id}
            onClick={() => setSel({ type: 'org', id: o.id, name: o.name })}
          >
            {o.name}
          </ScopeTab>
        ))}
      </div>

      {/* AI actions + progress meters. Org-level organize is enforced to
          owners/admins by RLS; a non-admin's job simply won't be created. */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => runJob('organize')}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Organize with AI
          </button>
          <button
            type="button"
            onClick={() => runJob('sort')}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
          >
            Sort
          </button>
        </div>
        {activeJobs.length > 0 && (
          <div className="space-y-2">
            {activeJobs.map((j) => (
              <ProgressMeter key={j.id} job={j} />
            ))}
          </div>
        )}
      </div>

      {/* Add item */}
      <form
        onSubmit={addItem}
        className="mb-6 space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Context title"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Content…"
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex gap-2">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags, comma, separated"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            Add context
          </button>
        </div>
      </form>

      {/* Items */}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">No context yet.</p>
        ) : (
          items.map((it) => (
            <article
              key={it.id}
              className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{it.title}</h3>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </div>
              {it.body && (
                <p className="mt-1 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {it.body}
                </p>
              )}
              {it.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {it.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </main>
  );
}

function ScopeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-neutral-900 px-3 py-1 text-sm font-medium text-white dark:bg-white dark:text-neutral-900'
          : 'rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
      }
    >
      {children}
    </button>
  );
}

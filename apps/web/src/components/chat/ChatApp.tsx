'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatMessages } from '@/hooks/useChatMessages';
import type { Profile, Workspace } from '@/lib/chat/types';

export function ChatApp({ meUserId }: { meUserId: string }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [creating, setCreating] = useState('');

  // Bootstrap profile + load workspaces/profiles.
  useEffect(() => {
    void fetch('/api/chat/me', { method: 'POST' });
    void fetch('/api/chat/workspaces')
      .then((r) => r.json())
      .then((d: { workspaces?: Workspace[] }) => {
        const ws = d.workspaces ?? [];
        setWorkspaces(ws);
        setActive((cur) => cur ?? ws.find((w) => w.kind === 'support')?.id ?? ws[0]?.id ?? null);
      });
    void fetch('/api/chat/profiles')
      .then((r) => r.json())
      .then((d: { profiles?: Profile[] }) => setProfiles(d.profiles ?? []));
  }, []);

  const { messages, reload } = useChatMessages(active);

  const byId = useMemo(() => new Map(profiles.map((p) => [p.userId, p])), [profiles]);

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const name = creating.trim();
    if (!name) return;
    const res = await fetch('/api/chat/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const d = await res.json();
    if (res.ok) {
      setWorkspaces((w) => [...w, d.workspace]);
      setActive(d.workspace.id);
      setCreating('');
    }
  }

  const activeWs = workspaces.find((w) => w.id === active) ?? null;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl gap-4 px-4 py-6">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 space-y-4">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Workspaces
          </h2>
          <ul className="space-y-1">
            {workspaces.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => setActive(w.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                    active === w.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {w.kind === 'support' ? '🛟' : '#'} {w.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={createWorkspace} className="space-y-1">
          <input
            value={creating}
            onChange={(e) => setCreating(e.target.value)}
            placeholder="New workspace"
            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
          />
        </form>
      </aside>

      {/* Conversation */}
      <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-neutral-200 dark:border-neutral-800">
        <header className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="text-sm font-semibold">{activeWs?.name ?? 'Select a workspace'}</div>
          {activeWs?.kind === 'support' && (
            <div className="text-xs text-neutral-500">
              Messages here go to Support. Only you and Support can see them.
            </div>
          )}
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-neutral-500">No messages yet. Say hello 👋</p>
          ) : (
            messages.map((m) => {
              const author = byId.get(m.authorId);
              const mine = m.authorId === meUserId;
              return (
                <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <span className="mb-0.5 text-[11px] text-neutral-500">
                    {author?.displayName ?? (m.authorName || 'Someone')}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? 'bg-blue-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'
                    }`}
                  >
                    <Highlighted body={m.body} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {active && <Composer workspaceId={active} profiles={profiles} onSent={() => reload()} />}
      </section>
    </div>
  );
}

/** Renders @mentions in bold. */
function Highlighted({ body }: { body: string }) {
  const parts = body.split(/(@[A-Za-z0-9_]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('@') ? (
          <span key={i} className="font-semibold underline decoration-dotted">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Composer({
  workspaceId,
  profiles,
  onSent,
}: {
  workspaceId: string;
  profiles: Profile[];
  onSent: () => void;
}) {
  const [text, setText] = useState('');
  const [menu, setMenu] = useState<Profile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function onChange(v: string) {
    setText(v);
    const m = v.match(/@([A-Za-z0-9_]*)$/);
    if (m) {
      const q = (m[1] ?? '').toLowerCase();
      setMenu(
        profiles
          .filter(
            (p) => p.alias.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q),
          )
          .slice(0, 6),
      );
    } else {
      setMenu([]);
    }
  }

  function pick(p: Profile) {
    setText((t) => t.replace(/@([A-Za-z0-9_]*)$/, `@${p.alias} `));
    setMenu([]);
    inputRef.current?.focus();
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const bodyText = text.trim();
    if (!bodyText) return;
    // Resolve @aliases in the text to user ids.
    const aliases = [...bodyText.matchAll(/@([A-Za-z0-9_]+)/g)].map((x) => x[1]);
    const mentions = profiles.filter((p) => aliases.includes(p.alias)).map((p) => p.userId);
    setText('');
    setMenu([]);
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, body: bodyText, mentions }),
    });
    onSent();
  }

  return (
    <form
      onSubmit={send}
      className="relative border-t border-neutral-200 p-3 dark:border-neutral-800"
    >
      {menu.length > 0 && (
        <ul className="absolute bottom-14 left-3 w-64 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {menu.map((p) => (
            <li key={p.userId}>
              <button
                type="button"
                onClick={() => pick(p)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="font-medium">@{p.alias}</span>
                <span className="text-xs text-neutral-500">{p.displayName}</span>
                {p.isSupport && <span className="ml-auto text-xs">🛟</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Message… use @ to mention"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          Send
        </button>
      </div>
    </form>
  );
}

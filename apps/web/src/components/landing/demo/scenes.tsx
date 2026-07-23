import type { ReactNode } from 'react';

/**
 * The scenes that make up the end-to-end product story:
 * idea → AI-refined requirements → promote to a public branch → PM schedules
 * work with a clear cost/benefit → Devs & QAs build in parallel → AI rightsizes
 * merges and hands out new to-dos → Shipped → measured results in PostHog.
 *
 * Each scene renders a lightweight mock UI. A real screen-recorded video can be
 * dropped in later by giving a scene a `videoSrc` (see DemoWalkthrough).
 */
export interface Scene {
  id: string;
  label: string;
  caption: string;
  render: () => ReactNode;
}

function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="ourai-fade-up flex h-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      {children}
    </div>
  );
}

function Bar({ pct, tone = 'bg-blue-500' }: { pct: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const SCENES: Scene[] = [
  {
    id: 'idea',
    label: 'Idea',
    caption: 'It starts with an idea. Anyone on the team drops it into intake.',
    render: () => (
      <Panel>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Idea intake · inbox
          </span>
          <Chip tone="blue">Product</Chip>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="text-sm font-semibold">Let customers pay with a saved card</div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Returning users should check out in one click instead of re-entering card details.
          </p>
          <div className="mt-3 flex gap-2">
            <Chip>checkout</Chip>
            <Chip>growth</Chip>
          </div>
        </div>
        <p className="text-xs text-neutral-500">Captured in seconds — no ticket, no meeting.</p>
      </Panel>
    ),
  },
  {
    id: 'refine',
    label: 'AI refines requirements',
    caption: 'Product chats the idea into a real spec — AI asks the business the right questions.',
    render: () => (
      <Panel>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Requirements · AI refinement
        </span>
        <div className="flex flex-col gap-2 text-sm">
          <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
            <span className="mb-0.5 block text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              OurAI
            </span>
            Should saved cards work for guest checkout too, or only logged-in users?
          </div>
          <div className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-blue-600 px-3 py-2 text-white">
            <span className="mb-0.5 block text-[10px] font-semibold text-blue-100">You</span>
            Logged-in only for v1. Must be PCI-safe — use our payment provider&apos;s vault.
          </div>
          <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
            <span className="mb-0.5 block text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              OurAI
            </span>
            Got it. Drafted 6 acceptance criteria + edge cases (expired card, 3DS). Review?
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2">
          <Chip tone="green">6 acceptance criteria</Chip>
          <Chip tone="green">3 edge cases</Chip>
        </div>
      </Panel>
    ),
  },
  {
    id: 'promote',
    label: 'Promote to a branch',
    caption: 'Product promotes the refined idea to a public branch — the work is now real.',
    render: () => (
      <Panel>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Promote → public branch
        </span>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <code className="rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
              ourai/saved-card-checkout
            </code>
            <Chip tone="violet">promoted</Chip>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
            branched from <code>main</code> · visible to the whole team
          </div>
        </div>
        <button
          type="button"
          className="w-fit rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
          disabled
        >
          Promote to public branch →
        </button>
        <p className="text-xs text-neutral-500">One click turns a spec into schedulable work.</p>
      </Panel>
    ),
  },
  {
    id: 'schedule',
    label: 'PM schedules + CBA',
    caption: 'The PM schedules the work and makes the cost/benefit of shipping it explicit.',
    render: () => (
      <Panel>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Plan · cost–benefit
          </span>
          <Chip tone="amber">PM</Chip>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Est. agent cost</div>
            <div className="text-lg font-semibold">$1.80</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Projected lift</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              +9% checkout
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span>Frontend · saved-card UI</span>
            <span className="text-neutral-500">Dev A</span>
          </div>
          <Bar pct={20} tone="bg-blue-500" />
          <div className="flex items-center justify-between text-xs">
            <span>Backend · vault integration</span>
            <span className="text-neutral-500">Dev B</span>
          </div>
          <Bar pct={20} tone="bg-blue-500" />
          <div className="flex items-center justify-between text-xs">
            <span>Test plan · 3DS + expiry</span>
            <span className="text-neutral-500">QA</span>
          </div>
          <Bar pct={20} tone="bg-emerald-500" />
        </div>
      </Panel>
    ),
  },
  {
    id: 'build',
    label: 'Build in parallel',
    caption: 'Devs and QAs work independently — each on its own branch, each with an agent.',
    render: () => (
      <Panel>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          3 agents running · capped pool
        </span>
        {[
          ['ourai/saved-card-ui', 'Dev A', 72, 'bg-blue-500', 'running'],
          ['ourai/card-vault-api', 'Dev B', 58, 'bg-blue-500', 'running'],
          ['ourai/checkout-e2e', 'QA', 40, 'bg-emerald-500', 'running'],
        ].map(([branch, who, pct, tone]) => (
          <div
            key={branch as string}
            className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between text-xs">
              <code>{branch}</code>
              <Chip tone="blue">{who}</Chip>
            </div>
            <div className="mt-2">
              <Bar pct={pct as number} tone={tone as string} />
            </div>
          </div>
        ))}
        <p className="mt-auto text-xs text-neutral-500">
          Everyone watches every transcript stream live — steer any agent at any time.
        </p>
      </Panel>
    ),
  },
  {
    id: 'merge',
    label: 'AI rightsizes merges',
    caption: 'As branches land, AI rebalances the work and hands teammates new to-dos.',
    render: () => (
      <Panel>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Merge orchestration
        </span>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
            <code className="text-xs">card-vault-api</code>
            <Chip tone="green">merged</Chip>
          </div>
          <div className="rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-xs dark:border-amber-500/30 dark:bg-amber-500/10">
            <span className="font-semibold">OurAI bot →</span> vault API merged. New to-do for{' '}
            <b>Dev A</b>: point saved-card UI at the merged endpoint. Rebased{' '}
            <code>checkout-e2e</code> onto latest to avoid conflicts.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">↻</span>
            <code className="text-xs">saved-card-ui</code>
            <Chip tone="blue">auto-rebased</Chip>
          </div>
        </div>
        <p className="mt-auto text-xs text-neutral-500">
          Parallel work, merged in the right order — no one steps on anyone.
        </p>
      </Panel>
    ),
  },
  {
    id: 'shipped',
    label: 'Shipped',
    caption: 'A human approves the final merge. It ships.',
    render: () => (
      <Panel>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="text-4xl">🚀</div>
          <div className="text-xl font-semibold">Shipped to production</div>
          <code className="rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
            feat: one-click checkout with saved cards
          </code>
          <div className="flex gap-2">
            <Chip tone="green">human-approved</Chip>
            <Chip tone="green">3 branches merged</Chip>
            <Chip tone="green">$1.74 spent</Chip>
          </div>
        </div>
      </Panel>
    ),
  },
  {
    id: 'results',
    label: 'Measured results',
    caption: 'Then you measure it — signups and actions, tracked in PostHog.',
    render: () => (
      <Panel>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Results · PostHog
          </span>
          <Chip tone="green">live</Chip>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-lg font-semibold">1,284</div>
            <div className="text-[11px] text-neutral-500">signups (7d)</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              +9.3%
            </div>
            <div className="text-[11px] text-neutral-500">checkout rate</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-lg font-semibold">41%</div>
            <div className="text-[11px] text-neutral-500">used saved card</div>
          </div>
        </div>
        <div className="mt-1 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span>Visited</span>
            <span>Signed up</span>
            <span>Took action</span>
          </div>
          <div className="flex items-end gap-1">
            <div className="h-16 flex-1 rounded-t bg-blue-500/80" />
            <div className="h-10 flex-1 rounded-t bg-blue-500/60" />
            <div className="h-7 flex-1 rounded-t bg-blue-500/40" />
          </div>
        </div>
        <p className="mt-auto text-xs text-neutral-500">
          Idea → shipped → measured. The loop closes here.
        </p>
      </Panel>
    ),
  },
];

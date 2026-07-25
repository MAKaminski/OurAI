import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Reads the orchestrator's monthly budget cap from env. Returns a display
 * string: a formatted dollar amount when the value parses as a number,
 * otherwise a clearly-honest "not set" placeholder.
 */
function monthlyBudgetLabel(): string {
  const raw = process.env.MONTHLY_BUDGET_USD?.trim();
  if (!raw) return 'not set';
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const budget = monthlyBudgetLabel();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="underline">
            Home
          </Link>
          <Link href="/account" className="underline">
            Account
          </Link>
        </nav>
      </div>

      <p className="mb-8 text-sm text-neutral-500">
        A first look at your budget and spend. This is a v1 overview — not a payment page. No cards,
        no invoices, no charges are handled here.
      </p>

      {/* Monthly budget cap — the one figure wired to config today. */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-500">Monthly budget cap</h2>
        <p className="mt-1 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
          {budget}
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Set by the orchestrator via the <code className="font-mono">MONTHLY_BUDGET_USD</code>{' '}
          environment variable. It caps how much the agents are allowed to spend in a month.
        </p>
      </section>

      {/* Per-session spend is recorded in the DB but not yet surfaced in the UI. */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-500">Per-agent spend</h2>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            Coming soon
          </span>
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          Each agent run records its cost in{' '}
          <code className="font-mono">ourai.sessions.cost_usd</code>. A running total and
          per-session breakdown will surface here so you can see spend against the cap above.
        </p>
      </section>

      {/* BYOK: model spend never touches our billing — it lands on the user's provider. */}
      <section className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-500">Bring your own keys (BYOK)</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Billing is BYOK: you supply your own model provider keys, so model usage is charged
          directly to your provider account. The figures here track orchestration budget, not your
          provider invoices.
        </p>
      </section>
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/auth/admin';
import { isFlagEnabled } from '@/lib/flags/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { listCompaniesForUser, type Company } from '@/lib/companies/store';
import { listRequests } from '@/lib/requests/store';
import type { RequestView } from '@/lib/requests/types';

export const dynamic = 'force-dynamic';

const TERMINAL = new Set(['done', 'rejected']);

interface CompanyRollup {
  company: Company;
  inFlight: number;
  shipped: number;
  latest: RequestView | null;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = await getSupabaseServerClient();
  let companies: Company[] = [];
  if (supabase) {
    try {
      companies = await listCompaniesForUser(supabase);
    } catch {
      companies = [];
    }
  }

  // Request rollups only when the pipeline is enabled for this user.
  const workflowOn = await isFlagEnabled('productWorkflow', user.id);
  const rollups: CompanyRollup[] = [];
  if (supabase && workflowOn) {
    for (const company of companies) {
      try {
        const requests = await listRequests(supabase, company.id);
        rollups.push({
          company,
          inFlight: requests.filter((r) => !TERMINAL.has(r.stage)).length,
          shipped: requests.filter((r) => r.stage === 'done').length,
          latest: requests[0] ?? null,
        });
      } catch {
        rollups.push({ company, inFlight: 0, shipped: 0, latest: null });
      }
    }
  }

  const totalInFlight = rollups.reduce((n, r) => n + r.inFlight, 0);
  const totalShipped = rollups.reduce((n, r) => n + r.shipped, 0);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Home</h1>
          <p className="mt-1 text-sm text-neutral-500">{user.email}</p>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/connections" className="underline">
            Connections
          </Link>
          <Link href="/account" className="underline">
            Account
          </Link>
          {isAdmin(user) ? (
            <Link href="/admin" className="text-amber-600 underline dark:text-amber-400">
              Admin
            </Link>
          ) : null}
        </nav>
      </div>

      {/* At-a-glance counters (only meaningful with the pipeline on). */}
      {workflowOn ? (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Companies" value={companies.length} />
          <Stat label="Requests in flight" value={totalInFlight} />
          <Stat label="Shipped" value={totalShipped} />
        </div>
      ) : null}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Your companies
          </h2>
          <Link
            href="/companies/new"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            New company
          </Link>
        </div>

        {companies.length === 0 ? (
          <p className="text-sm text-neutral-500">
            You don’t have any companies yet.{' '}
            <Link href="/companies/new" className="underline">
              Create your first
            </Link>{' '}
            to start shipping requests.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {(workflowOn
              ? rollups
              : companies.map((company) => ({ company, inFlight: 0, shipped: 0, latest: null }))
            ).map(({ company, inFlight, shipped, latest }) => (
              <li
                key={company.id}
                className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <Link href={`/companies/${company.id}`} className="block">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{company.name}</span>
                    <span className="font-mono text-xs text-neutral-400">{company.githubRepo}</span>
                  </div>
                </Link>
                {workflowOn ? (
                  <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                    <span>{inFlight} in flight</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {shipped} shipped
                    </span>
                    <Link href={`/companies/${company.id}/requests`} className="ml-auto underline">
                      Requests →
                    </Link>
                  </div>
                ) : null}
                {latest ? (
                  <p className="mt-2 truncate text-xs text-neutral-400">Latest: {latest.title}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-neutral-500">{label}</div>
    </div>
  );
}

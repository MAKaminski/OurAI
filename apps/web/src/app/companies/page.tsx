import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { listCompaniesForUser, type Company } from '@/lib/companies/store';

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let companies: Company[] = [];
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    try {
      companies = await listCompaniesForUser(supabase);
    } catch {
      companies = [];
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your companies</h1>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm underline">
            Home
          </Link>
          {isAdmin(user) ? (
            <Link href="/admin" className="text-sm text-amber-600 underline dark:text-amber-400">
              Admin
            </Link>
          ) : null}
          <Link
            href="/companies/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Create company
          </Link>
        </div>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No companies yet.{' '}
          <Link href="/companies/new" className="underline">
            Create your first company
          </Link>{' '}
          to start adding requests.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {companies.map((c) => (
            <li key={c.id} className="py-3">
              <Link href={`/companies/${c.id}`} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="font-mono text-xs text-neutral-400">{c.githubRepo}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

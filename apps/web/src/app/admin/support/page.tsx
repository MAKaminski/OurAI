import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  // Admin-only surface: 404 for everyone else (does not reveal the route exists).
  if (!isAdmin(user)) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Support</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="underline">
            Flags
          </Link>
          <Link href="/dashboard" className="underline">
            Home
          </Link>
        </nav>
      </div>

      <p className="mb-6 text-sm text-neutral-500">
        The support desk overview. Support operates from the seeded Support workspace, which has an
        RLS superpower in chat — it can read across tenants to help any user — so handle it with
        care.
      </p>

      {/* Entry point into the Support workspace conversations. */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-500">Support workspace</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Open chat in the Support workspace to pick up user conversations. The elevated
          row-level-security policy lets Support see the threads it needs to resolve.
        </p>
        <Link
          href="/chat"
          className="mt-3 inline-block text-sm font-medium text-emerald-600 underline dark:text-emerald-400"
        >
          Go to chat →
        </Link>
      </section>

      {/* Placeholder: no query is wired to list live threads yet. */}
      <section className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-500">Open support threads</h2>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            Placeholder
          </span>
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          A live list of open support threads will appear here. No query is wired up yet — this is a
          placeholder for the queue.
        </p>
      </section>
    </main>
  );
}

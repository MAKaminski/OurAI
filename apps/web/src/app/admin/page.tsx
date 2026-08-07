import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AdminFlags } from '@/components/admin/AdminFlags';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  // Admin-only surface: 404 for everyone else (does not reveal the route exists).
  if (!isAdmin(user)) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Feature flags</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/companies" className="underline">
            Companies
          </Link>
          <Link href="/admin/support" className="underline">
            Support
          </Link>
          <Link href="/account" className="underline">
            Account
          </Link>
        </nav>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Toggle features on or off for the whole app. An override wins over PostHog and the built-in
        default; “Clear” removes the override and falls back to normal resolution.
      </p>
      <AdminFlags />
    </main>
  );
}

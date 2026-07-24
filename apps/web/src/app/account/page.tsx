import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/auth/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { listMyOrgs, type Org } from '@/lib/orgs/store';
import { AccountManager } from '@/components/account/AccountManager';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let orgs: Org[] = [];
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    try {
      orgs = await listMyOrgs(supabase);
    } catch {
      orgs = [];
    }
  }

  return (
    <div>
      {/* The path into the product: companies live here, admin only for admins. */}
      <nav className="mx-auto flex max-w-2xl items-center gap-4 px-6 pt-8 text-sm font-medium">
        <Link href="/dashboard" className="underline">
          Home
        </Link>
        <Link href="/companies" className="underline">
          Your companies →
        </Link>
        {isAdmin(user) ? (
          <Link href="/admin" className="text-amber-600 underline dark:text-amber-400">
            Admin
          </Link>
        ) : null}
      </nav>
      <AccountManager email={user.email ?? ''} initialOrgs={orgs} />
    </div>
  );
}

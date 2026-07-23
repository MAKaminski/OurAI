import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
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

  return <AccountManager email={user.email ?? ''} initialOrgs={orgs} />;
}

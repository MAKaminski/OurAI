import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ConnectorsManager } from '@/components/connectors/ConnectorsManager';
import { Logo } from '@/components/brand/Logo';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { listMyOrgs, type Org } from '@/lib/orgs/store';
import { isFlagEnabled } from '@/lib/flags/server';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!(await isFlagEnabled('connectors', user.id))) notFound();

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
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080a]/80 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-zinc-50"
          >
            <Logo size={24} />
            {site.name}
          </Link>
          <Link href="/account" className="text-sm text-zinc-400 transition hover:text-zinc-50">
            Settings
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-50">Connections</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Bring your own keys — connect the services your team already uses.
        </p>
        <div className="mt-8">
          <ConnectorsManager initialOrgs={orgs} />
        </div>
      </main>
    </>
  );
}

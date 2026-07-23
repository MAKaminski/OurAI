import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ContextApp } from '@/components/context/ContextApp';
import { Logo } from '@/components/brand/Logo';
import { getCurrentUser } from '@/lib/auth';
import { isFlagEnabled } from '@/lib/flags/server';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function ContextPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  // Dark-launched: 404 until the `context-manager` flag is enabled for the user.
  if (!(await isFlagEnabled('contextManager', user.id))) notFound();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/80 px-6 py-3 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Logo size={24} />
            {site.name}
          </Link>
          <Link
            href="/account"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Settings
          </Link>
        </div>
      </header>
      <ContextApp />
    </>
  );
}

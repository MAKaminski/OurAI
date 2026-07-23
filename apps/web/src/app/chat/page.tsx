import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChatApp } from '@/components/chat/ChatApp';
import { Logo } from '@/components/brand/Logo';
import { getCurrentUser } from '@/lib/auth';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/80 px-6 py-3 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Logo size={24} />
            {site.name}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/account" className="hover:text-neutral-900 dark:hover:text-white">
              Settings
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="hover:text-neutral-900 dark:hover:text-white">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <ChatApp meUserId={user.id} />
    </>
  );
}

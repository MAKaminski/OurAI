import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/account');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold tracking-tight">
        <span className="inline-block h-6 w-6 rounded-md bg-neutral-900 dark:bg-white" />
        OurAI
      </Link>
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Sign in to create an organization and configure your keys.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}

import { redirect } from 'next/navigation';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/account');

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
          Sign in or sign up
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
          Welcome to OurAI
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter your email and we&apos;ll send a one-time link. New here? The same link creates your
          account and organization — no password to set.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

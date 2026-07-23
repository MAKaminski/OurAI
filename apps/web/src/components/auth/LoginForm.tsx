'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'unconfigured';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus('unconfigured');
      return;
    }
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800 dark:text-emerald-300">
        ✓ Check your email — we sent a magic sign-in link to{' '}
        <span className="font-semibold">{email}</span>.
      </div>
    );
  }

  if (status === 'unconfigured') {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-800 dark:text-amber-300">
        Sign-in isn&apos;t configured yet — set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Work email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {status === 'sending' ? 'Sending link…' : 'Email me a magic link'}
      </button>
      {status === 'error' && <p className="text-xs text-red-600 dark:text-red-400">{message}</p>}
      <p className="text-xs text-neutral-500">
        No passwords. We&apos;ll email you a one-time sign-in link.
      </p>
    </form>
  );
}

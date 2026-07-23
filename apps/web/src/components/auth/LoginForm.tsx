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
      options: {
        // Create the account on first sign-in — one flow for login and signup.
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
        ✓ Check your email — we sent a one-time sign-in link to{' '}
        <span className="font-semibold">{email}</span>. Open it on this device to finish.
      </div>
    );
  }

  if (status === 'unconfigured') {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-300">
        Sign-in isn&apos;t configured yet — set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (the Vercel–Supabase integration sets these
        automatically).
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-zinc-200">Work email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending link…' : 'Continue with email'}
      </button>
      {status === 'error' && <p className="text-xs text-red-400">{message}</p>}
      <p className="text-xs text-zinc-500">
        No passwords. The link both signs you in and creates your account if you&apos;re new.
      </p>
    </form>
  );
}

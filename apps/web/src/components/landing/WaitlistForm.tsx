'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics/track';
import { EVENTS } from '@/lib/analytics/config';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function WaitlistForm({ source = 'hero' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    track(EVENTS.WAITLIST_VIEW_FORM, { source });
  }, [source]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, source }),
      });
      if (!res.ok) throw new Error('request failed');
      track(EVENTS.WAITLIST_SUBMIT, { source, role });
      setStatus('success');
      setMessage("You're on the list. We'll be in touch soon.");
      setEmail('');
      setRole('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong — please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800 dark:text-emerald-300"
      >
        ✓ {message}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Work email"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {status === 'submitting' ? 'Joining…' : 'Get early access'}
        </button>
      </div>
      <div className="mt-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label="Your role"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-600 sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          <option value="">What's your role? (optional)</option>
          <option value="founder">Founder / Exec</option>
          <option value="product">Product</option>
          <option value="engineering">Engineering</option>
          <option value="design">Design</option>
          <option value="other">Other</option>
        </select>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{message}</p>
      )}
      <p className="mt-2 text-xs text-neutral-500">
        No spam. We&apos;ll email you when your spot opens up.
      </p>
    </form>
  );
}

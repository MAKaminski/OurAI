'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics/track';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'failed to send');
      track('contact_submitted');
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setError(String(err));
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800 dark:text-emerald-300">
        ✓ Thanks — your message reached our team. We&apos;ll get back to you by email.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Your name"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="you@company.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Message</span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="How can we help?"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
      {status === 'error' && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

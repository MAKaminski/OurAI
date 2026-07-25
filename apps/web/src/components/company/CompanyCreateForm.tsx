'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CreateCompanyResponse {
  ok?: boolean;
  error?: string;
  company?: { id: string };
}

/** Company creation front door. Posts to /api/companies (RLS-scoped). */
export function CompanyCreateForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, githubRepo: repo, description }),
      });
      const data = (await res.json()) as CreateCompanyResponse;
      if (!res.ok || !data.ok || !data.company) {
        setError(data.error ?? 'Could not create company.');
        return;
      }
      router.push(`/companies/${data.company.id}`);
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium">Company name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Acme"
          required
          minLength={2}
          maxLength={80}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">GitHub repo</span>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="owner/repo"
          required
          pattern="[A-Za-z0-9._-]+/[A-Za-z0-9._-]+"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="What does this company build?"
          rows={3}
        />
      </label>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {submitting ? 'Creating…' : 'Create company'}
      </button>
    </form>
  );
}

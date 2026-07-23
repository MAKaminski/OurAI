'use client';

import { useState } from 'react';

/** Company creation + first idea intake. Scaffold: local state only. */
export function CompanyCreateForm() {
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        // Submission wired to persistence in Phase 1a.
      }}
    >
      <label className="block">
        <span className="text-sm font-medium">Company name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Acme"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">GitHub repo</span>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="owner/repo"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
      >
        Create company
      </button>
    </form>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SecretResponse {
  ok?: boolean;
  error?: string;
}

interface CreateCompanyResponse {
  ok?: boolean;
  error?: string;
  company?: { id: string };
}

interface CreateRequestResponse {
  ok?: boolean;
  error?: string;
  request?: { id: string };
}

const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900';
const PRIMARY_BUTTON_CLASS =
  'rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900';

/** Three-step, value-first onboarding: connect GitHub (optional), create a
 * company, and drop the first request — reusing the existing APIs. Each step
 * unlocks the next, and every step keeps its own local state. */
export function StartWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — GitHub token (optional)
  const [token, setToken] = useState('');
  const [savingToken, setSavingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Step 2 — company
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Step 3 — first request
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  async function saveToken() {
    if (savingToken) return;
    setSavingToken(true);
    setTokenError(null);
    try {
      const res = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'user',
          key: 'GITHUB_TOKEN',
          value: token,
          isSensitive: true,
        }),
      });
      const data = (await res.json()) as SecretResponse;
      if (!res.ok || !data.ok) {
        setTokenError(data.error ?? 'Could not save token.');
        return;
      }
      setStep(2);
    } catch (err) {
      setTokenError(String(err));
    } finally {
      setSavingToken(false);
    }
  }

  async function createCompany(e: React.FormEvent) {
    e.preventDefault();
    if (creatingCompany) return;
    setCreatingCompany(true);
    setCompanyError(null);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, githubRepo: repo, description: '' }),
      });
      const data = (await res.json()) as CreateCompanyResponse;
      if (!res.ok || !data.ok || !data.company) {
        setCompanyError(data.error ?? 'Could not create company.');
        return;
      }
      setCompanyId(data.company.id);
      setStep(3);
    } catch (err) {
      setCompanyError(String(err));
    } finally {
      setCreatingCompany(false);
    }
  }

  async function createRequest(e: React.FormEvent) {
    e.preventDefault();
    if (creatingRequest || !companyId) return;
    setCreatingRequest(true);
    setRequestError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body: details,
          priority: 'normal',
          actingRole: null,
        }),
      });
      const data = (await res.json()) as CreateRequestResponse;
      if (!res.ok || !data.ok || !data.request) {
        setRequestError(data.error ?? 'Could not create request.');
        return;
      }
      setRequestId(data.request.id);
    } catch (err) {
      setRequestError(String(err));
    } finally {
      setCreatingRequest(false);
    }
  }

  const steps = [
    { n: 1, label: 'Connect GitHub' },
    { n: 2, label: 'Create a company' },
    { n: 3, label: 'First request' },
  ] as const;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Get started</h1>
      <p className="mt-1 text-sm text-neutral-500">Three quick steps to your first request.</p>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-3">
        {steps.map((s) => {
          const done = step > s.n;
          const active = step === s.n;
          return (
            <li key={s.n} className="flex items-center gap-2">
              <span
                className={
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ' +
                  (done || active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400')
                }
              >
                {done ? '✓' : s.n}
              </span>
              <span
                className={
                  'text-xs ' +
                  (active
                    ? 'font-medium text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-500')
                }
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-neutral-400">Step {step} of 3</p>

      {/* Step 1 — GitHub */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">1. Connect GitHub</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Optional — lets us open pull requests on your behalf.{' '}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Get a token ↗
          </a>
        </p>
        {step === 1 ? (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">GitHub token</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={INPUT_CLASS}
                placeholder="ghp_…"
                autoComplete="off"
              />
            </label>
            {tokenError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{tokenError}</p>
            ) : null}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveToken}
                disabled={savingToken || token.trim().length === 0}
                className={PRIMARY_BUTTON_CLASS}
              >
                {savingToken ? 'Saving…' : 'Save & continue'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={savingToken}
                className="text-sm underline disabled:opacity-60"
              >
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">Done</p>
        )}
      </section>

      {/* Step 2 — company */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">2. Create a company</h2>
        {step < 2 ? (
          <p className="mt-1 text-sm text-neutral-400">Finish step 1 to continue.</p>
        ) : step === 2 ? (
          <form className="mt-4 space-y-4" onSubmit={createCompany}>
            <label className="block">
              <span className="text-sm font-medium">Company name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLASS}
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
                className={INPUT_CLASS}
                placeholder="owner/repo"
                required
                pattern="[A-Za-z0-9._-]+/[A-Za-z0-9._-]+"
              />
            </label>
            {companyError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{companyError}</p>
            ) : null}
            <button type="submit" disabled={creatingCompany} className={PRIMARY_BUTTON_CLASS}>
              {creatingCompany ? 'Creating…' : 'Create company'}
            </button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">Done</p>
        )}
      </section>

      {/* Step 3 — first request */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">3. Drop your first request</h2>
        {step < 3 ? (
          <p className="mt-1 text-sm text-neutral-400">Finish step 2 to continue.</p>
        ) : requestId && companyId ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Your first request is in. Nice work.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={`/companies/${companyId}/requests/${requestId}`}
                className={PRIMARY_BUTTON_CLASS + ' inline-block'}
              >
                Go to your request →
              </Link>
              <Link href="/dashboard" className="text-sm underline">
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={createRequest}>
            <label className="block">
              <span className="text-sm font-medium">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={INPUT_CLASS}
                placeholder="Add a dark mode toggle"
                required
                minLength={1}
                maxLength={200}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Details</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={INPUT_CLASS}
                placeholder="What would you like built?"
                rows={4}
              />
            </label>
            {requestError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{requestError}</p>
            ) : null}
            <button type="submit" disabled={creatingRequest} className={PRIMARY_BUTTON_CLASS}>
              {creatingRequest ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

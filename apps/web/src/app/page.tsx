import Link from 'next/link';

/** Landing / company list. Scaffold: static shell, no data yet (Phase 1a). */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">OurAI</h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        A multiplayer AI workspace. Start with a company, intake ideas, and let agents build the
        features affiliated with it — everyone watching and steering live.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/companies/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Create a company
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Your companies
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          No companies yet. (Wired in Phase 1a — auth + live data.)
        </p>
      </section>
    </main>
  );
}

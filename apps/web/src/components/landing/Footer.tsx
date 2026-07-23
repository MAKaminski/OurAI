import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-500 sm:flex-row">
        <p>
          © {site.company}. {site.name} — {site.tagline}.
        </p>
        <div className="flex items-center gap-5">
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            GitHub
          </a>
          <a href="#waitlist" className="hover:text-neutral-900 dark:hover:text-white">
            Early access
          </a>
        </div>
      </div>
    </footer>
  );
}

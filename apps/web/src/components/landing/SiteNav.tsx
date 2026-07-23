import Link from 'next/link';
import { site } from '@/lib/site';
import { Logo } from '@/components/brand/Logo';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/80 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo size={26} />
          {site.name}
        </Link>
        <div className="hidden items-center gap-6 text-sm text-neutral-600 md:flex dark:text-neutral-400">
          <a href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-white">
            How it works
          </a>
          <a href="#why" className="hover:text-neutral-900 dark:hover:text-white">
            Why OurAI
          </a>
          <a href="#features" className="hover:text-neutral-900 dark:hover:text-white">
            Features
          </a>
          <Link href="/tech" className="hover:text-neutral-900 dark:hover:text-white">
            Tech
          </Link>
          <Link href="/contact" className="hover:text-neutral-900 dark:hover:text-white">
            Contact
          </Link>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Sign in
          </Link>
          <a
            href="#waitlist"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            Get early access
          </a>
        </div>
      </nav>
    </header>
  );
}

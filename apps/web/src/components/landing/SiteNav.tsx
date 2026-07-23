import Link from 'next/link';
import { site } from '@/lib/site';
import { Logo } from '@/components/brand/Logo';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080a]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-zinc-50"
        >
          <Logo size={26} />
          {site.name}
        </Link>
        <div className="hidden items-center gap-6 text-sm text-zinc-400 lg:flex">
          <Link href="/#how-it-works" className="transition hover:text-zinc-50">
            How it works
          </Link>
          <Link href="/#why" className="transition hover:text-zinc-50">
            Why OurAI
          </Link>
          <Link href="/integrations" className="transition hover:text-zinc-50">
            Integrations
          </Link>
          <Link href="/compare" className="transition hover:text-zinc-50">
            Compare
          </Link>
          <Link href="/tech" className="transition hover:text-zinc-50">
            Tech
          </Link>
          <Link href="/contact" className="transition hover:text-zinc-50">
            Contact
          </Link>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-zinc-50"
          >
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-50"
          >
            Sign in
          </Link>
          <Link
            href="/#waitlist"
            className="rounded-lg bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          >
            Get early access
          </Link>
        </div>
      </nav>
    </header>
  );
}

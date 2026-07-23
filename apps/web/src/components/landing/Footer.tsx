import Link from 'next/link';
import { site } from '@/lib/site';
import { Logo } from '@/components/brand/Logo';

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-12 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Logo size={22} />
          <p>
            © {site.company} — {site.tagline}.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-zinc-100"
          >
            GitHub
          </a>
          <Link href="/tech" className="transition hover:text-zinc-100">
            Tech
          </Link>
          <Link href="/contact" className="transition hover:text-zinc-100">
            Contact
          </Link>
          <a href="#waitlist" className="transition hover:text-zinc-100">
            Early access
          </a>
        </div>
      </div>
    </footer>
  );
}

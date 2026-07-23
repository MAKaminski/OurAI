'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { site } from '@/lib/site';
import { Logo } from '@/components/brand/Logo';

/**
 * Sticky nav that solidifies its background and tightens its padding after a
 * small scroll — a subtle Rilla-style depth cue. Degrades to a plain sticky
 * bar when motion is off (the scroll listener is cheap and harmless either way).
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > 8;
    setScrolled((cur) => (cur === next ? cur : next));
  });

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur transition-colors duration-300 ${
        scrolled ? 'border-white/10 bg-[#08080a]/85' : 'border-transparent bg-[#08080a]/40'
      }`}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-4'
        }`}
      >
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

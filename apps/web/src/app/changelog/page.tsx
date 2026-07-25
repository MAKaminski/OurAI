import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/motion/Reveal';
import { site } from '@/lib/site';
import { readRepoFile, renderMarkdown, resolveRepoPath } from '../docs/docs-index';

export const metadata: Metadata = {
  title: 'Changelog',
  description: `What's new in ${site.name}. Release notes and repo-wide milestones for the multiplayer AI workspace, managed with Changesets.`,
  keywords: [...site.keywords, 'OurAI changelog', 'release notes', 'product updates'],
  alternates: { canonical: '/changelog' },
};

interface ChangelogSource {
  /** Rendered markdown, newest first. */
  content: string;
  note: string;
}

/**
 * Prefer pending `.changeset/*.md` entries (excluding README.md); fall back to
 * the root CHANGELOG.md; otherwise return null so the page shows a placeholder.
 * All fs access is guarded — a missing directory never crashes the build.
 */
function loadChangelog(): ChangelogSource | null {
  const changesetDir = resolveRepoPath('.changeset');
  if (changesetDir) {
    try {
      const entries = fs
        .readdirSync(changesetDir)
        .filter((name) => name.toLowerCase().endsWith('.md') && name.toLowerCase() !== 'readme.md')
        .sort();
      if (entries.length > 0) {
        const content = entries
          .map((name) => {
            try {
              return fs.readFileSync(path.join(changesetDir, name), 'utf8');
            } catch {
              return '';
            }
          })
          .filter((text) => text.trim().length > 0)
          .join('\n\n---\n\n');
        if (content.trim().length > 0) {
          return { content, note: 'Pending changes, from the repository’s changesets.' };
        }
      }
    } catch {
      // fall through to CHANGELOG.md
    }
  }

  const changelog = readRepoFile('CHANGELOG.md');
  if (changelog && changelog.trim().length > 0) {
    return { content: changelog, note: 'Repo-wide milestones, from CHANGELOG.md.' };
  }

  return null;
}

export default function ChangelogPage() {
  const source = loadChangelog();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
            Changelog
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-zinc-50">
            What&apos;s new
          </h1>
          {source ? <p className="mt-3 text-sm text-zinc-500">{source.note}</p> : null}
        </Reveal>

        {source ? (
          <Reveal className="mt-10">
            <article>{renderMarkdown(source.content)}</article>
          </Reveal>
        ) : (
          <Reveal className="mt-10 rounded-xl border border-white/10 bg-[#0e0e10] p-6 text-sm leading-relaxed text-zinc-400">
            Changelog coming soon — releases are managed with{' '}
            <a
              href="https://github.com/changesets/changesets"
              className="text-zinc-200 underline"
              target="_blank"
              rel="noreferrer"
            >
              Changesets
            </a>
            . Follow along on{' '}
            <a
              href={site.github}
              className="text-zinc-200 underline"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </Reveal>
        )}
      </main>
      <Footer />
    </>
  );
}

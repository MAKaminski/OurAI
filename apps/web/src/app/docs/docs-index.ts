import { createElement, type ReactNode } from 'react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Dependency-free helpers for reading the repository's `docs/` (and other
 * root-level files like `.changeset/` and `CHANGELOG.md`) at build/runtime.
 *
 * cwd caveat: `next build` and the server run with cwd = `apps/web`, but the
 * content lives at the monorepo root. We probe a few candidate roots and use
 * the first that contains the target, so it works from either location. Every
 * fs call is wrapped in try/catch and degrades to an empty/placeholder state —
 * a missing directory must never crash the build.
 */

/** Candidate repo roots, most-specific first, relative to the current cwd. */
function candidateRoots(): string[] {
  const cwd = process.cwd();
  return [cwd, path.join(cwd, '..'), path.join(cwd, '..', '..'), path.join(cwd, '..', '..', '..')];
}

/**
 * Resolve a repo-relative path (e.g. `docs`, `CHANGELOG.md`) to the first
 * candidate root where it exists. Returns null when none contain it.
 */
export function resolveRepoPath(relative: string): string | null {
  for (const root of candidateRoots()) {
    const candidate = path.join(root, relative);
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // ignore and try the next root
    }
  }
  return null;
}

/** Read a repo-relative file as UTF-8, or null if it is missing/unreadable. */
export function readRepoFile(relative: string): string | null {
  const resolved = resolveRepoPath(relative);
  if (!resolved) return null;
  try {
    return fs.readFileSync(resolved, 'utf8');
  } catch {
    return null;
  }
}

export type DocCategory = 'Guide' | 'ADR';

export interface DocEntry {
  slug: string;
  title: string;
  category: DocCategory;
  /** Repo-relative path to the markdown file. */
  file: string;
}

/** First `# ` heading of the markdown, or a humanized fallback from the slug. */
function firstHeading(markdown: string, fallback: string): string {
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('# ')) return line.slice(2).trim();
  }
  return fallback;
}

function humanize(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(' ');
}

function listMarkdown(dirRelative: string): string[] {
  const resolved = resolveRepoPath(dirRelative);
  if (!resolved) return [];
  try {
    return fs
      .readdirSync(resolved)
      .filter((name) => name.toLowerCase().endsWith('.md'))
      .sort();
  } catch {
    return [];
  }
}

/**
 * List every doc we know how to render, from `docs/*.md` (Guides) and
 * `docs/adr/*.md` (ADRs). Slugs are derived from filenames; ADR slugs are
 * prefixed with `adr-` to keep them collision-free and traversal-safe.
 */
export function getDocs(): DocEntry[] {
  const guides: DocEntry[] = listMarkdown('docs').map((name) => {
    const base = name.replace(/\.md$/i, '');
    const slug = base.toLowerCase();
    const file = path.join('docs', name);
    const markdown = readRepoFile(file) ?? '';
    return { slug, title: firstHeading(markdown, humanize(slug)), category: 'Guide', file };
  });

  const adrs: DocEntry[] = listMarkdown(path.join('docs', 'adr')).map((name) => {
    const base = name.replace(/\.md$/i, '');
    const slug = `adr-${base.toLowerCase()}`;
    const file = path.join('docs', 'adr', name);
    const markdown = readRepoFile(file) ?? '';
    return { slug, title: firstHeading(markdown, humanize(base)), category: 'ADR', file };
  });

  return [...guides, ...adrs];
}

export interface LoadedDoc {
  title: string;
  content: string;
  category: DocCategory;
}

/**
 * Load a single doc by slug. The slug is matched against the known set from
 * `getDocs()` — no user-supplied string is ever joined into a filesystem path,
 * so path traversal is impossible. Returns null for unknown slugs.
 */
export function getDoc(slug: string): LoadedDoc | null {
  const entry = getDocs().find((d) => d.slug === slug);
  if (!entry) return null;
  const content = readRepoFile(entry.file);
  if (content === null) return null;
  return { title: entry.title, content, category: entry.category };
}

/**
 * Minimal, dependency-free, XSS-safe markdown → React transform. Handles
 * fenced code blocks, ATX headings, and blank-line-separated paragraphs. All
 * text is rendered as JSX children (auto-escaped) — never via
 * dangerouslySetInnerHTML.
 */
export function renderMarkdown(markdown: string): ReactNode {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push(
      createElement(
        'p',
        {
          key: `p-${key++}`,
          className: 'my-4 whitespace-pre-wrap leading-relaxed text-zinc-300',
        },
        paragraph.join('\n'),
      ),
    );
    paragraph = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Fenced code block: consume until the closing fence (or EOF).
    if (line.trimStart().startsWith('```')) {
      flushParagraph();
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? '').trimStart().startsWith('```')) {
        code.push(lines[i] ?? '');
        i++;
      }
      blocks.push(
        createElement(
          'pre',
          {
            key: `code-${key++}`,
            className:
              'my-5 overflow-x-auto rounded-lg border border-white/10 bg-[#0e0e10] p-4 font-mono text-xs leading-relaxed text-zinc-300',
          },
          createElement('code', null, code.join('\n')),
        ),
      );
      continue;
    }

    // ATX headings (#, ##, ###...).
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      const level = heading[1]!.length;
      const text = heading[2]!.trim();
      const tag = level <= 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
      const className =
        level <= 1
          ? 'mt-8 mb-4 text-3xl font-semibold tracking-[-0.02em] text-zinc-50'
          : level === 2
            ? 'mt-8 mb-3 text-xl font-semibold text-zinc-50'
            : 'mt-6 mb-2 text-base font-semibold text-zinc-100';
      blocks.push(createElement(tag, { key: `h-${key++}`, className }, text));
      continue;
    }

    // Blank line ends the current paragraph.
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    paragraph.push(line);
  }
  flushParagraph();

  return blocks;
}

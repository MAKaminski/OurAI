/**
 * Inline SVG brand marks — no remote images, CSP-safe. Faithful marks where a
 * recognizable one exists; brand-colored monograms otherwise. Rendered on a
 * dark surface, so inherently-black marks (Vercel, Next, GitHub) are drawn in
 * white/currentColor per the usual dark-theme convention.
 */

import type { ReactElement } from 'react';

type LogoProps = { size?: number; className?: string };

function Monogram({
  label,
  color,
  size = 28,
  className = '',
}: LogoProps & { label: string; color: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-lg font-mono font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        color,
        fontSize: size * 0.4,
        border: `1px solid ${color}55`,
      }}
    >
      {label}
    </span>
  );
}

const marks: Record<string, (p: LogoProps) => ReactElement> = {
  nextjs: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#000" stroke="rgba(255,255,255,0.18)" />
      <path d="M9 7.5v9M9 7.5l7.5 9M15.5 7.5v6.2" stroke="#fff" strokeWidth="1.3" fill="none" />
    </svg>
  ),
  react: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <g stroke="#61DAFB" fill="none" strokeWidth="1">
        <ellipse rx="10" ry="4.2" cx="12" cy="12" />
        <ellipse rx="10" ry="4.2" cx="12" cy="12" transform="rotate(60 12 12)" />
        <ellipse rx="10" ry="4.2" cx="12" cy="12" transform="rotate(120 12 12)" />
      </g>
      <circle cx="12" cy="12" r="2" fill="#61DAFB" />
    </svg>
  ),
  tailwind: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#38BDF8"
        d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35C13.38 10.79 14.5 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C15.62 7.21 14.5 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35C8.38 16.79 9.5 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C10.62 13.21 9.5 12 7 12z"
      />
    </svg>
  ),
  typescript: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="3" fill="#3178C6" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        fontWeight="700"
        fill="#fff"
      >
        TS
      </text>
    </svg>
  ),
  supabase: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#3ECF8E" d="M13 2 4 13h7v9l9-11h-7z" />
    </svg>
  ),
  vercel: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M12 3l10 17H2z" />
    </svg>
  ),
  github: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 22.29 24 17.79 24 12.5 24 5.87 18.63.5 12 .5z"
      />
    </svg>
  ),
  pnpm: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="#F69220">
        <rect x="14" y="2" width="6" height="6" rx="1" fill="#F9AD00" />
        <rect x="14" y="9" width="6" height="6" rx="1" />
        <rect x="7" y="9" width="6" height="6" rx="1" />
        <rect x="14" y="16" width="6" height="6" rx="1" />
        <rect x="7" y="16" width="6" height="6" rx="1" />
        <rect x="0" y="16" width="6" height="6" rx="1" />
      </g>
    </svg>
  ),
  turborepo: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="none" stroke="url(#turbo)" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="url(#turbo)" strokeWidth="2.4" />
      <defs>
        <linearGradient id="turbo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0096FF" />
          <stop offset="1" stopColor="#FF1E56" />
        </linearGradient>
      </defs>
    </svg>
  ),
  node: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#539E43" d="M12 1.5 22 7v10l-10 5.5L2 17V7z" opacity="0.9" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize="7"
        fontFamily="ui-monospace, monospace"
        fontWeight="700"
        fill="#fff"
      >
        js
      </text>
    </svg>
  ),
};

const monograms: Record<string, { label: string; color: string }> = {
  posthog: { label: 'PH', color: '#F54E00' },
  deepseek: { label: 'DS', color: '#4D6BFE' },
  anthropic: { label: 'A', color: '#D97757' },
  openai: { label: 'AI', color: '#10A37F' },
  kimi: { label: 'K', color: '#6E56CF' },
  resend: { label: 'R', color: '#e5e7eb' },
  zod: { label: 'Z', color: '#3E67B1' },
  eslint: { label: 'ES', color: '#8080F2' },
  prettier: { label: 'Pr', color: '#F7B93E' },
  changesets: { label: 'Δ', color: '#2088FF' },
  playwright: { label: 'Pw', color: '#2EAD33' },
  gateway: { label: '⇄', color: '#a78bfa' },
};

/** Render a brand mark by slug. Falls back to a branded monogram. */
export function TechLogo({ slug, size = 28, className }: { slug: string } & LogoProps) {
  const Mark = marks[slug];
  if (Mark) return <Mark size={size} className={className} />;
  const m = monograms[slug];
  if (m) return <Monogram label={m.label} color={m.color} size={size} className={className} />;
  return <Monogram label="•" color="#a1a1aa" size={size} className={className} />;
}

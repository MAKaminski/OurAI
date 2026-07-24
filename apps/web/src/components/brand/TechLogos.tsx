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
  openai: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#e5e7eb"
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.5245 4.4874zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
      />
    </svg>
  ),
  anthropic: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <g stroke="#D97757" strokeWidth="1.7" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="12" y1="3.5" x2="12" y2="8" transform={`rotate(${i * 30} 12 12)`} />
        ))}
      </g>
    </svg>
  ),
  deepseek: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4D6BFE"
        d="M2.5 11.6c0-2.8 2.6-5 6-5 2.4 0 4.2 1 5.7 2.6 1.1 1.2 2.4 1.7 3.8 1.3 1-.3 1.7-1 2-2 .1 1.9-.7 3.5-2.4 4.4.8.4 1.7.4 2.6.1-1 1.8-2.9 2.9-5.1 2.9H8.5c-3.3 0-6-2.3-6-4.3z"
      />
      <circle cx="7.6" cy="10.7" r="0.9" fill="#fff" />
    </svg>
  ),
  kimi: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#6E56CF" d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" />
    </svg>
  ),
  posthog: ({ size = 28, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <g stroke="#1D4AFF" strokeWidth="1.5" strokeLinecap="round">
        <line x1="9" y1="9" x2="7.5" y2="5.5" />
        <line x1="12" y1="8.2" x2="12" y2="4.3" />
        <line x1="15" y1="9" x2="16.5" y2="5.5" />
        <line x1="6.4" y1="11" x2="3.8" y2="8.6" />
        <line x1="17.6" y1="11" x2="20.2" y2="8.6" />
      </g>
      <path fill="#1D4AFF" d="M3.5 18a8.5 8.5 0 0 1 17 0z" />
      <circle cx="17.4" cy="15.6" r="0.9" fill="#fff" />
    </svg>
  ),
};

const monograms: Record<string, { label: string; color: string }> = {
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

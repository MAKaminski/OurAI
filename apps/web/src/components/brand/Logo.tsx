/**
 * OurAI logo mark: a git branch (two nodes joining a trunk via a merge curve)
 * with two sparkles in distinct colors — blue for humans/users, violet for AI
 * agents — the two kinds of participants in a multiplayer session.
 */
export function Logo({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="OurAI logo"
      className={className}
    >
      {/* trunk */}
      <line
        x1="7"
        y1="4"
        x2="7"
        y2="20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* branch line curving out to the agent node */}
      <path
        d="M7 13 C 7 17, 17 15, 17 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* human node (trunk) */}
      <circle cx="7" cy="4" r="2.6" fill="#2563eb" />
      {/* agent node (branch tip) */}
      <circle cx="17" cy="20" r="2.6" fill="#7c3aed" />
      {/* human sparkle */}
      <path
        d="M6 9 l0.5 1.4 1.4 0.5 -1.4 0.5 -0.5 1.4 -0.5 -1.4 -1.4 -0.5 1.4 -0.5 z"
        fill="#2563eb"
      />
      {/* agent sparkle */}
      <path
        d="M18 8 l0.6 1.7 1.7 0.6 -1.7 0.6 -0.6 1.7 -0.6 -1.7 -1.7 -0.6 1.7 -0.6 z"
        fill="#7c3aed"
      />
    </svg>
  );
}

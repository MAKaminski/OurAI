'use client';

import type { ReactNode } from 'react';
import { useMotionEnabled } from './MotionProvider';

/**
 * Infinite auto-scrolling strip. The children are rendered twice so the track
 * wraps seamlessly at translateX(-50%). Pauses on hover; renders a single
 * static row when motion is disabled. `durationSec` controls speed.
 */
export function Marquee({
  children,
  durationSec = 32,
  className = '',
}: {
  children: ReactNode;
  durationSec?: number;
  className?: string;
}) {
  const enabled = useMotionEnabled();

  if (!enabled) {
    return (
      <div className={`flex flex-wrap items-center gap-x-10 gap-y-4 ${className}`}>{children}</div>
    );
  }

  return (
    <div className={`ourai-marquee ${className}`}>
      <div className="ourai-marquee-track" style={{ animationDuration: `${durationSec}s` }}>
        <div className="ourai-marquee-group">{children}</div>
        <div className="ourai-marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

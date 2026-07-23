'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView } from 'motion/react';
import { useMotionEnabled } from './MotionProvider';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Counts a number up from 0 to `to` the first time it scrolls into view. The
 * final formatted value is always the initial DOM text, so it is correct for
 * SSR/SEO and when motion is disabled (it simply never animates).
 */
export function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.4,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !inView || !el) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [enabled, inView, to, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}

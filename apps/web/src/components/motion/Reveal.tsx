'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useMotionEnabled } from './MotionProvider';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fade + rise a block into view once it crosses the viewport. Renders its
 * children statically when motion is disabled. `delay` staggers siblings that
 * animate independently.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const enabled = useMotionEnabled();
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

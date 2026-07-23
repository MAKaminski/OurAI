'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { ReactLenis } from 'lenis/react';
import { useFlag } from '@/lib/flags/useFlag';

/**
 * Central switch for the marketing-site motion layer. Motion is ON only when
 * the `siteMotion` flag is on AND the visitor hasn't asked for reduced motion.
 * When off, primitives render their content statically (final state) and Lenis
 * smooth scroll is not mounted — so the site is fully usable with zero motion.
 */
const MotionEnabledContext = createContext(true);

export function useMotionEnabled(): boolean {
  return useContext(MotionEnabledContext);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const flagOn = useFlag('siteMotion');
  const reduced = useReducedMotion();
  const enabled = flagOn && !reduced;

  return (
    <MotionEnabledContext.Provider value={enabled}>
      {enabled ? (
        <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 }}>
          {children}
        </ReactLenis>
      ) : (
        children
      )}
    </MotionEnabledContext.Provider>
  );
}

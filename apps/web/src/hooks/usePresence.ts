'use client';

import { useEffect, useState } from 'react';

export interface Peer {
  userId: string;
  displayName: string;
}

/** Track connected peers in a session room. Scaffold: empty. */
export function usePresence(_sessionId: string): Peer[] {
  const [peers] = useState<Peer[]>([]);
  useEffect(() => {
    // presence channel wired in Phase 1a.
  }, [_sessionId]);
  return peers;
}

'use client';

import { useEffect, useState } from 'react';
import type { Event } from '@ourai/shared';

/**
 * Subscribe to a session's live transcript. Scaffold: returns an empty log;
 * Phase 1b wires this to persistence.subscribeEvents + getEvents backfill.
 */
export function useEventStream(_sessionId: string): Event[] {
  const [events] = useState<Event[]>([]);
  useEffect(() => {
    // subscribe/unsubscribe wired in Phase 1b.
  }, [_sessionId]);
  return events;
}

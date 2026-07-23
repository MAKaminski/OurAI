'use client';

import { usePresence } from '@/hooks/usePresence';

/** Shows who is connected to the session room. */
export function PresenceBar({ sessionId }: { sessionId: string }) {
  const peers = usePresence(sessionId);
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-500">
      <span>{peers.length} online</span>
    </div>
  );
}

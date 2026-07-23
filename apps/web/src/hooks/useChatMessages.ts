'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ChatMessage } from '@/lib/chat/types';

/**
 * Loads a workspace's messages and keeps them live. Subscribes to Supabase
 * Realtime INSERTs on ourai.chat_messages for this workspace (RLS-filtered), and
 * refetches new rows since the last seq when one arrives. Falls back to the
 * initial fetch when Realtime isn't available.
 */
export function useChatMessages(workspaceId: string | null): {
  messages: ChatMessage[];
  reload: () => void;
} {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const maxSeq = useRef(0);

  const loadSince = useCallback(
    async (since: number) => {
      if (!workspaceId) return;
      const res = await fetch(
        `/api/chat/messages?workspaceId=${encodeURIComponent(workspaceId)}&since=${since}`,
        { cache: 'no-store' },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ChatMessage[] };
      if (data.messages.length === 0) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev, ...data.messages.filter((m) => !seen.has(m.id))];
        merged.sort((a, b) => a.seq - b.seq);
        maxSeq.current = merged.length ? (merged[merged.length - 1]?.seq ?? 0) : 0;
        return merged;
      });
    },
    [workspaceId],
  );

  const reload = useCallback(() => {
    setMessages([]);
    maxSeq.current = 0;
    void loadSince(0);
  }, [loadSince]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!workspaceId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`chat:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'ourai',
          table: 'chat_messages',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          void loadSince(maxSeq.current);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [workspaceId, loadSince]);

  return { messages, reload };
}

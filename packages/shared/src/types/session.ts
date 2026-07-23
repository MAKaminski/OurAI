import type { SessionId, WorkItemId } from './ids.js';

/** One agent run, bound to a work item + its branch. */
export type SessionStatus = 'queued' | 'running' | 'paused' | 'done' | 'error';

export interface Session {
  id: SessionId;
  workItemId: WorkItemId;
  status: SessionStatus;
  modelProvider: string | null;
  modelId: string | null;
  /** Month-to-date USD attributed to this session (budget accounting). */
  costUsd: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export type NewSession = Omit<Session, 'id' | 'createdAt'>;

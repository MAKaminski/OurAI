import type { EventId, SessionId, UserId } from './ids.js';

/**
 * The append-only event log is the heart of OurAI: it is the shared transcript,
 * the audit trail, and the replay mechanism all at once. Everything a viewer
 * sees is a projection of `events` ordered by `seq`.
 */
export type AuthorType = 'human' | 'agent' | 'system';

export type EventKind = 'message' | 'tool_call' | 'tool_result' | 'diff' | 'status' | 'system';

interface EventBase {
  id: EventId;
  sessionId: SessionId;
  /** Per-session monotonic sequence, assigned by persistence. The live cursor. */
  seq: number;
  authorType: AuthorType;
  /** Human user id, agent id, or null for system events. */
  authorId: UserId | null;
  createdAt: string;
}

export interface MessageEvent extends EventBase {
  kind: 'message';
  payload: {
    role: 'user' | 'assistant';
    content: string;
    /** The role the human was "acting as" when steering (cosmetic). */
    actAsRole?: string;
  };
}

export interface ToolCallEvent extends EventBase {
  kind: 'tool_call';
  payload: { toolName: string; callId: string; args: unknown };
}

export interface ToolResultEvent extends EventBase {
  kind: 'tool_result';
  payload: { callId: string; ok: boolean; result?: unknown; error?: string };
}

export interface DiffEvent extends EventBase {
  kind: 'diff';
  payload: {
    branch: string;
    unifiedDiff: string;
    filesChanged: number;
    additions: number;
    deletions: number;
  };
}

export interface StatusEvent extends EventBase {
  kind: 'status';
  payload: {
    status: 'queued' | 'running' | 'blocked' | 'awaiting_review' | 'merged' | 'failed' | 'done';
    detail?: string;
  };
}

export interface SystemEvent extends EventBase {
  kind: 'system';
  payload: { message: string; level?: 'info' | 'warn' | 'error' };
}

export type Event =
  MessageEvent | ToolCallEvent | ToolResultEvent | DiffEvent | StatusEvent | SystemEvent;

/** Insert shape — persistence assigns `id`, `seq`, and `createdAt`. */
export type NewEvent =
  | Omit<MessageEvent, 'id' | 'seq' | 'createdAt'>
  | Omit<ToolCallEvent, 'id' | 'seq' | 'createdAt'>
  | Omit<ToolResultEvent, 'id' | 'seq' | 'createdAt'>
  | Omit<DiffEvent, 'id' | 'seq' | 'createdAt'>
  | Omit<StatusEvent, 'id' | 'seq' | 'createdAt'>
  | Omit<SystemEvent, 'id' | 'seq' | 'createdAt'>;

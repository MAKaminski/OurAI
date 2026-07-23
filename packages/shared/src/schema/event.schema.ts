import { z } from 'zod';

/** Runtime validators for events, mirroring the types in ../types/event.ts. */

export const authorTypeSchema = z.enum(['human', 'agent', 'system']);
export const eventKindSchema = z.enum([
  'message',
  'tool_call',
  'tool_result',
  'diff',
  'status',
  'system',
]);

const messagePayload = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  actAsRole: z.string().optional(),
});

const toolCallPayload = z.object({
  toolName: z.string(),
  callId: z.string(),
  args: z.unknown(),
});

const toolResultPayload = z.object({
  callId: z.string(),
  ok: z.boolean(),
  result: z.unknown().optional(),
  error: z.string().optional(),
});

const diffPayload = z.object({
  branch: z.string(),
  unifiedDiff: z.string(),
  filesChanged: z.number().int().nonnegative(),
  additions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
});

const statusPayload = z.object({
  status: z.enum(['queued', 'running', 'blocked', 'awaiting_review', 'merged', 'failed', 'done']),
  detail: z.string().optional(),
});

const systemPayload = z.object({
  message: z.string(),
  level: z.enum(['info', 'warn', 'error']).optional(),
});

/** Discriminated union of the insert (`NewEvent`) payloads. */
export const newEventSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('message'), payload: messagePayload }),
  z.object({ kind: z.literal('tool_call'), payload: toolCallPayload }),
  z.object({ kind: z.literal('tool_result'), payload: toolResultPayload }),
  z.object({ kind: z.literal('diff'), payload: diffPayload }),
  z.object({ kind: z.literal('status'), payload: statusPayload }),
  z.object({ kind: z.literal('system'), payload: systemPayload }),
]);

export type NewEventInput = z.infer<typeof newEventSchema>;

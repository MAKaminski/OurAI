import { z } from 'zod';

export const workItemStatusSchema = z.enum([
  'queued',
  'running',
  'awaiting_review',
  'merged',
  'failed',
  'abandoned',
]);

/** Payload accepted when promoting an idea (or an ad-hoc request) into work. */
export const createWorkItemSchema = z.object({
  title: z.string().min(1).max(200),
  ideaId: z.string().uuid().nullable().default(null),
  actingRole: z
    .enum(['product', 'dev', 'qa', 'devops', 'sales', 'pm', 'marketing'])
    .nullable()
    .default(null),
});

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;

import { z } from 'zod';

export const ideaStatusSchema = z.enum(['inbox', 'triaged', 'promoted', 'shipped', 'rejected']);

/** Payload accepted when a human intakes a new idea. */
export const createIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10_000).nullable().default(null),
  actingRole: z
    .enum(['product', 'dev', 'qa', 'devops', 'sales', 'pm', 'marketing'])
    .nullable()
    .default(null),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;

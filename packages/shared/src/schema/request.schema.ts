import { z } from 'zod';

export const requestStageSchema = z.enum([
  'intake',
  'kpi_review',
  'design',
  'build',
  'qa',
  'staging',
  'done',
  'rejected',
]);

export const requestPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

const actingRoleSchema = z
  .enum(['product', 'dev', 'qa', 'devops', 'sales', 'pm', 'marketing'])
  .nullable()
  .default(null);

/** Payload accepted when a human submits a new request (the front door). */
export const createRequestSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(20_000).nullable().default(null),
  priority: requestPrioritySchema.default('normal'),
  actingRole: actingRoleSchema,
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

/** A single KPI as proposed by the agent or entered/edited by a human. */
export const kpiInputSchema = z.object({
  name: z.string().min(1).max(160),
  target: z.string().min(1).max(160),
  rationale: z.string().max(2_000).nullable().default(null),
});

export type KpiInput = z.infer<typeof kpiInputSchema>;

/** The strict JSON shape the KPI agent must return. */
export const kpiAgentOutputSchema = z.object({
  kpis: z.array(kpiInputSchema).min(1).max(8),
});

export type KpiAgentOutput = z.infer<typeof kpiAgentOutputSchema>;

/** The artifact-producing pipeline stages (design/build/qa/staging). */
export const artifactStageSchema = z.enum(['design', 'build', 'qa', 'staging']);

/** A single stage artifact as proposed by the agent or entered/edited by a human. */
export const stageArtifactInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(20_000).nullable().default(null),
});

export type StageArtifactInput = z.infer<typeof stageArtifactInputSchema>;

/** The strict JSON shape every artifact-stage agent must return. */
export const stageAgentOutputSchema = z.object({
  items: z.array(stageArtifactInputSchema).min(1).max(12),
});

export type StageAgentOutput = z.infer<typeof stageAgentOutputSchema>;

/** A single generated file in a build (full contents, repo-relative path). */
export const buildFileSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(400)
    // Repo-relative only: no leading slash, no parent traversal.
    .refine((p) => !p.startsWith('/') && !p.split('/').includes('..'), {
      message: 'path must be repo-relative (no leading slash or "..")',
    }),
  content: z.string().max(100_000),
});

export type BuildFile = z.infer<typeof buildFileSchema>;

/** The strict JSON shape the Build agent must return. */
export const buildAgentOutputSchema = z.object({
  summary: z.string().min(1).max(2_000),
  files: z.array(buildFileSchema).min(1).max(20),
});

export type BuildAgentOutput = z.infer<typeof buildAgentOutputSchema>;

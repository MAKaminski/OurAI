import { z } from 'zod';

/** Orchestrator configuration — the feature flags + caps from docs plan §3.5. */
export const envSchema = z.object({
  MODEL_PROVIDER: z.enum(['deepseek', 'kimi', 'anthropic']).default('deepseek'),
  MODEL_ID: z.string().optional(),
  MODEL_API_KEY: z.string().default(''),
  MODEL_BASE_URL: z.string().url().optional(),

  PERSISTENCE_PROVIDER: z.enum(['supabase', 'memory']).default('supabase'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  SYNC_MODE: z.enum(['realtime', 'poll']).default('realtime'),
  GITHUB_MODE: z.enum(['pr', 'direct', 'off']).default('pr'),
  GITHUB_TOKEN: z.string().optional(),

  MAX_CONCURRENT_AGENTS: z.coerce.number().int().positive().default(3),
  MONTHLY_BUDGET_USD: z.coerce.number().nonnegative().default(40),
});

export type OrchestratorEnv = z.infer<typeof envSchema>;

/** Parse + validate process.env. Throws with a readable message on misconfig. */
export function loadEnv(source: Record<string, string | undefined> = process.env): OrchestratorEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid orchestrator env:\n${parsed.error.toString()}`);
  }
  return parsed.data;
}

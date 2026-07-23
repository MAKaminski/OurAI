import { createPersistence } from '@ourai/persistence';
import { createProvider, defaultModelId } from '@ourai/model-gateway';
import { loadEnv } from './config/env.js';
import { BudgetGuard } from './budget/BudgetGuard.js';
import { WorkQueue } from './queue/WorkQueue.js';
import { WorktreeManager } from './worktree/WorktreeManager.js';
import { AgentPool } from './pool/AgentPool.js';
import { Worker } from './worker.js';
import { logger } from './logging/logger.js';

/**
 * Orchestrator entrypoint: load + validate env, construct the persistence and
 * model providers via their factories, wire the queue/pool/worktree/budget, and
 * start the worker. Handles SIGTERM for a graceful drain.
 */
async function main(): Promise<void> {
  const env = loadEnv();
  const modelId = env.MODEL_ID ?? defaultModelId(env.MODEL_PROVIDER);

  const persistence = createPersistence({
    provider: env.PERSISTENCE_PROVIDER,
    supabase:
      env.PERSISTENCE_PROVIDER === 'supabase' && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
        ? { url: env.SUPABASE_URL, key: env.SUPABASE_SERVICE_ROLE_KEY }
        : undefined,
  });

  const provider = createProvider({
    provider: env.MODEL_PROVIDER,
    apiKey: env.MODEL_API_KEY,
    baseUrl: env.MODEL_BASE_URL,
  });

  const budget = new BudgetGuard(env.MONTHLY_BUDGET_USD, modelId);
  const queue = new WorkQueue();
  const worktrees = new WorktreeManager(process.cwd(), 'main');
  const pool = new AgentPool(env.MAX_CONCURRENT_AGENTS, worktrees, budget, () => {
    throw new Error('slot factory not wired (Phase 1c)');
  });

  const worker = new Worker({ persistence, pool, queue, budget });

  process.on('SIGTERM', () => worker.stop());
  process.on('SIGINT', () => worker.stop());

  logger.info('orchestrator configured', {
    modelProvider: provider.name,
    modelId,
    persistence: env.PERSISTENCE_PROVIDER,
    maxConcurrent: env.MAX_CONCURRENT_AGENTS,
    monthlyBudgetUsd: env.MONTHLY_BUDGET_USD,
  });

  await worker.start();
}

main().catch((err: unknown) => {
  logger.error('orchestrator failed to start', { error: String(err) });
  process.exitCode = 1;
});

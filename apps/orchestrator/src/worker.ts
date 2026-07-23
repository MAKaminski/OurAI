import type { PersistenceAdapter } from '@ourai/persistence';
import type { AgentPool } from './pool/AgentPool.js';
import type { WorkQueue } from './queue/WorkQueue.js';
import type { BudgetGuard } from './budget/BudgetGuard.js';
import { logger } from './logging/logger.js';

export interface WorkerDeps {
  persistence: PersistenceAdapter;
  pool: AgentPool;
  queue: WorkQueue;
  budget: BudgetGuard;
}

/**
 * The always-on control loop: pull promoted work items into the queue, fill
 * idle agent slots up to the cap, back off when the pool is full or the budget
 * is exhausted (docs plan §3). Runs until `stop()`.
 *
 * Scaffold status: skeleton — the tick body lands in Phase 1c.
 */
export class Worker {
  private stopped = false;

  constructor(private readonly deps: WorkerDeps) {}

  async start(): Promise<void> {
    logger.info('orchestrator worker starting', {
      queueSize: this.deps.queue.size(),
      running: this.deps.pool.runningCount(),
      budgetRemainingUsd: this.deps.budget.remainingUsd(),
    });
    throw new Error('Worker.start: not implemented (Phase 1c)');
  }

  stop(): void {
    this.stopped = true;
    logger.info('orchestrator worker stopping');
  }

  get isStopped(): boolean {
    return this.stopped;
  }
}

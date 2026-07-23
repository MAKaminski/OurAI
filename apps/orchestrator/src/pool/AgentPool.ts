import type { WorkItem } from '@ourai/shared';
import type { AgentSlot } from './AgentSlot.js';
import type { WorktreeManager } from '../worktree/WorktreeManager.js';
import type { BudgetGuard } from '../budget/BudgetGuard.js';

/**
 * Owns up to `maxConcurrent` agent slots and enforces the concurrency cap
 * (default 3). Cost tracks running agents, not branch count (docs plan §3.1).
 *
 * Scaffold status: capacity accounting is real; spawn wiring is a stub.
 */
export class AgentPool {
  private running = 0;

  constructor(
    private readonly maxConcurrent: number,
    private readonly worktrees: WorktreeManager,
    private readonly budget: BudgetGuard,
    private readonly slotFactory: () => AgentSlot,
  ) {}

  hasCapacity(): boolean {
    return this.running < this.maxConcurrent && this.budget.canSpend();
  }

  runningCount(): number {
    return this.running;
  }

  spawn(_workItem: WorkItem): Promise<void> {
    if (!this.hasCapacity()) {
      throw new Error('AgentPool: no capacity (cap reached or budget exhausted)');
    }
    throw new Error('AgentPool.spawn: not implemented (Phase 1c)');
  }
}

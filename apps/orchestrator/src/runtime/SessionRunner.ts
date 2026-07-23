import type { ModelProvider } from '@ourai/model-gateway';
import type { PersistenceAdapter } from '@ourai/persistence';
import type { WorkItem } from '@ourai/shared';
import type { Worktree } from '../worktree/WorktreeManager.js';
import type { BudgetGuard } from '../budget/BudgetGuard.js';

export interface SessionRunnerDeps {
  persistence: PersistenceAdapter;
  provider: ModelProvider;
  modelId: string;
  budget: BudgetGuard;
}

/**
 * Runs the agent-core loop for one work item in its own worktree, funneling
 * every step through an EventSink into the shared transcript.
 *
 * Scaffold status: stub — wired in Phase 1b/1c.
 */
export class SessionRunner {
  constructor(private readonly deps: SessionRunnerDeps) {}

  run(_workItem: WorkItem, _worktree: Worktree, _signal: AbortSignal): Promise<void> {
    throw new Error('SessionRunner.run: not implemented (Phase 1b)');
  }
}

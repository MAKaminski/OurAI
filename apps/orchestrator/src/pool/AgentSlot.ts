import type { WorkItem } from '@ourai/shared';
import type { Worktree } from '../worktree/WorktreeManager.js';
import type { SessionRunner } from '../runtime/SessionRunner.js';

export type SlotStatus = 'idle' | 'running' | 'done' | 'error';

/** One running agent: its work item, worktree, runner, and abort handle. */
export class AgentSlot {
  status: SlotStatus = 'idle';
  private controller: AbortController | null = null;

  constructor(private readonly runner: SessionRunner) {}

  get busy(): boolean {
    return this.status === 'running';
  }

  async run(workItem: WorkItem, worktree: Worktree): Promise<void> {
    this.status = 'running';
    this.controller = new AbortController();
    try {
      await this.runner.run(workItem, worktree, this.controller.signal);
      this.status = 'done';
    } catch {
      this.status = 'error';
    } finally {
      this.controller = null;
    }
  }

  abort(): void {
    this.controller?.abort();
  }
}

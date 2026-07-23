import type { WorkItemId } from '@ourai/shared';

export interface Worktree {
  workItemId: WorkItemId;
  branch: string;
  /** Absolute path to the checked-out worktree. */
  path: string;
}

/**
 * Manages one git worktree per active agent from a single clone, so parallel
 * submissions never collide (docs plan §3.1). Runs
 * `git worktree add .worktrees/<slug> -b ourai/<slug> origin/<default>`.
 *
 * Scaffold status: stub.
 */
export class WorktreeManager {
  constructor(
    private readonly repoDir: string,
    private readonly defaultBranch: string,
  ) {}

  create(_workItemId: WorkItemId, _branch: string): Promise<Worktree> {
    throw new Error('WorktreeManager.create: not implemented (Phase 1c)');
  }

  remove(_worktree: Worktree): Promise<void> {
    throw new Error('WorktreeManager.remove: not implemented (Phase 1c)');
  }

  list(): Promise<Worktree[]> {
    throw new Error('WorktreeManager.list: not implemented (Phase 1c)');
  }

  /** The clone this manager derives worktrees from. */
  get root(): string {
    return this.repoDir;
  }

  get base(): string {
    return this.defaultBranch;
  }
}

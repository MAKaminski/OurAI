import { defineTool, notImplemented } from '../defineTool.js';

export interface DiffResult {
  unifiedDiff: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export const gitDiffTool = defineTool<{ base?: string }, DiffResult>({
  name: 'git_diff',
  description: 'Produce a unified diff of the worktree against a base ref.',
  parameters: {
    type: 'object',
    properties: { base: { type: 'string', description: 'Base ref (default: origin/main)' } },
  },
  execute: () => notImplemented('git_diff', 'Phase 1c'),
});

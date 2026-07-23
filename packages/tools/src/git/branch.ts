import { defineTool, notImplemented } from '../defineTool.js';

export const gitBranchTool = defineTool<{ name: string; from?: string }, { branch: string }>({
  name: 'git_branch',
  description: 'Create a branch in the agent worktree.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      from: { type: 'string', description: 'Base ref (default: origin/main)' },
    },
    required: ['name'],
  },
  execute: () => notImplemented('git_branch', 'Phase 1c'),
});

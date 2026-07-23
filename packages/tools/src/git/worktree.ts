import { defineTool, notImplemented } from '../defineTool.js';

/**
 * Creates/uses a git worktree so each agent works an isolated branch off one
 * clone — what makes many parallel submissions safe (docs plan §3.1).
 */
export const gitWorktreeTool = defineTool<{ branch: string }, { path: string }>({
  name: 'git_worktree',
  description: 'Create or reuse a git worktree for an isolated agent branch.',
  parameters: {
    type: 'object',
    properties: { branch: { type: 'string', description: 'Branch name, e.g. ourai/add-login' } },
    required: ['branch'],
  },
  execute: () => notImplemented('git_worktree', 'Phase 1c'),
});

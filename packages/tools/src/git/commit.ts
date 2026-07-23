import { defineTool, notImplemented } from '../defineTool.js';

export const gitCommitTool = defineTool<{ message: string }, { sha: string }>({
  name: 'git_commit',
  description: 'Stage all changes and commit them on the current branch.',
  parameters: {
    type: 'object',
    properties: { message: { type: 'string' } },
    required: ['message'],
  },
  execute: () => notImplemented('git_commit', 'Phase 1c'),
});

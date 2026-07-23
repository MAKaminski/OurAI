import { defineTool, notImplemented } from '../defineTool.js';

/** Human-approved merge only — never auto-merge in Phase 1 (docs plan §2). */
export const gitMergeTool = defineTool<{ branch: string; into: string }, { merged: boolean }>({
  name: 'git_merge',
  description: 'Merge an agent branch into the target branch (human-approved).',
  parameters: {
    type: 'object',
    properties: { branch: { type: 'string' }, into: { type: 'string' } },
    required: ['branch', 'into'],
  },
  execute: () => notImplemented('git_merge', 'Phase 1d'),
});

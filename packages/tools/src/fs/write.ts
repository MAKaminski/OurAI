import { defineTool, notImplemented } from '../defineTool.js';

export const fsWriteTool = defineTool<{ path: string; content: string }, { bytes: number }>({
  name: 'fs_write',
  description: 'Write a UTF-8 file in the agent worktree (creates or overwrites).',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Path relative to the worktree' },
      content: { type: 'string' },
    },
    required: ['path', 'content'],
  },
  execute: () => notImplemented('fs_write', 'Phase 1c'),
});

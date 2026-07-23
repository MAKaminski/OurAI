import { defineTool, notImplemented } from '../defineTool.js';

export const fsReadTool = defineTool<{ path: string }, { content: string }>({
  name: 'fs_read',
  description: 'Read a UTF-8 file from the agent worktree.',
  parameters: {
    type: 'object',
    properties: { path: { type: 'string', description: 'Path relative to the worktree' } },
    required: ['path'],
  },
  execute: () => notImplemented('fs_read', 'Phase 1c'),
});

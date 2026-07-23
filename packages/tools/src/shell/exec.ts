import { defineTool, notImplemented } from '../defineTool.js';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export const shellExecTool = defineTool<{ command: string }, ExecResult>({
  name: 'shell_exec',
  description: 'Run a shell command inside the agent worktree.',
  parameters: {
    type: 'object',
    properties: { command: { type: 'string' } },
    required: ['command'],
  },
  execute: () => notImplemented('shell_exec', 'Phase 1c'),
});

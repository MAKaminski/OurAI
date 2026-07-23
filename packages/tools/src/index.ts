import { ToolRegistry } from '@ourai/agent-core';
import { fsReadTool } from './fs/read.js';
import { fsWriteTool } from './fs/write.js';
import { gitWorktreeTool } from './git/worktree.js';
import { gitBranchTool } from './git/branch.js';
import { gitCommitTool } from './git/commit.js';
import { gitMergeTool } from './git/merge.js';
import { gitDiffTool } from './git/diff.js';
import { shellExecTool } from './shell/exec.js';
import { githubOpenPrTool } from './github/pr.js';

export { defineTool, notImplemented, type ToolSpec } from './defineTool.js';
export { fsReadTool } from './fs/read.js';
export { fsWriteTool } from './fs/write.js';
export { gitWorktreeTool } from './git/worktree.js';
export { gitBranchTool } from './git/branch.js';
export { gitCommitTool } from './git/commit.js';
export { gitMergeTool } from './git/merge.js';
export { gitDiffTool, type DiffResult } from './git/diff.js';
export { shellExecTool, type ExecResult } from './shell/exec.js';
export { githubOpenPrTool } from './github/pr.js';

/** The default tool set an agent gets, bound to its worktree at runtime. */
export const DEFAULT_TOOLS = [
  fsReadTool,
  fsWriteTool,
  gitWorktreeTool,
  gitBranchTool,
  gitCommitTool,
  gitMergeTool,
  gitDiffTool,
  shellExecTool,
  githubOpenPrTool,
];

/** Register the default tools into a fresh (or existing) registry. */
export function registerDefaultTools(registry: ToolRegistry = new ToolRegistry()): ToolRegistry {
  for (const tool of DEFAULT_TOOLS) registry.register(tool);
  return registry;
}

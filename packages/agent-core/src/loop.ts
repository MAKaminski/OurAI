import type { AgentConfig, LoopEventHandler, ToolContext } from './types.js';
import type { ToolRegistry } from './tool-registry.js';

export interface RunResult {
  turns: number;
  finished: boolean;
}

/**
 * The agentic loop: plan → act (tool calls) → observe (tool results) → repeat
 * until the model stops or `maxTurns` is hit. Every step is emitted via
 * `onEvent` so the orchestrator can persist it to the shared transcript.
 *
 * Scaffold status: stub — the control flow lands in Phase 1b.
 */
export async function runAgentLoop(
  _config: AgentConfig,
  _registry: ToolRegistry,
  _ctx: ToolContext,
  _task: string,
  _onEvent: LoopEventHandler,
): Promise<RunResult> {
  throw new Error('runAgentLoop: not implemented (Phase 1b)');
}

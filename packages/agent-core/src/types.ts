import type {
  ChatMessage,
  ModelProvider,
  ToolDefinition,
  UsageCallback,
} from '@ourai/model-gateway';

/** Runtime context handed to a tool at execution time. */
export interface ToolContext {
  /** The agent's isolated git worktree path. All fs/git tools operate here. */
  cwd: string;
  signal?: AbortSignal;
}

/** A capability the agent can invoke. Concrete tools live in @ourai/tools. */
export interface Tool<Args = unknown, Result = unknown> {
  name: string;
  description: string;
  /** JSON Schema for the arguments. */
  parameters: Record<string, unknown>;
  toDefinition(): ToolDefinition;
  execute(args: Args, ctx: ToolContext): Promise<Result>;
}

export interface AgentConfig {
  provider: ModelProvider;
  model: string;
  systemPrompt: string;
  maxTurns: number;
  onUsage?: UsageCallback;
}

/** Emitted by the loop for each step; the orchestrator maps these to Events. */
export type LoopEvent =
  | { type: 'message'; message: ChatMessage }
  | { type: 'tool_call'; name: string; callId: string; args: unknown }
  | { type: 'tool_result'; callId: string; ok: boolean; result?: unknown; error?: string }
  | { type: 'status'; status: string; detail?: string };

export type LoopEventHandler = (event: LoopEvent) => void | Promise<void>;

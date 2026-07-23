export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ToolCall {
  id: string;
  type: 'function';
  /** `arguments` is a JSON-encoded string (OpenAI-compatible). */
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: ChatRole;
  content: string | null;
  name?: string;
  /** Set on role:'tool' — the tool_call this message answers. */
  toolCallId?: string;
  /** Set on role:'assistant' when the model requests tool calls. */
  toolCalls?: ToolCall[];
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    /** JSON Schema for the arguments. */
    parameters: Record<string, unknown>;
  };
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** Computed by the gateway from its cost table. */
  costUsd?: number;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  temperature?: number;
  maxTokens?: number;
  /** Load-bearing for the budget guard — must thread through to the fetch. */
  signal?: AbortSignal;
}

export type FinishReason = 'stop' | 'tool_calls' | 'length' | 'content_filter' | 'error';

export interface ChatResponse {
  message: ChatMessage;
  finishReason: FinishReason;
  usage: TokenUsage;
}

export type StreamChunk =
  | { type: 'text'; delta: string }
  | { type: 'tool_call'; delta: Partial<ToolCall> }
  | { type: 'usage'; usage: TokenUsage }
  | { type: 'done'; finishReason: FinishReason };

/** Budget hook: called with each usage report as tokens are consumed. */
export type UsageCallback = (usage: TokenUsage) => void | Promise<void>;

/** Uniform interface over any OpenAI-compatible (or native) provider. */
export interface ModelProvider {
  readonly name: string;
  chat(req: ChatRequest, onUsage?: UsageCallback): Promise<ChatResponse>;
  stream(req: ChatRequest, onUsage?: UsageCallback): AsyncIterable<StreamChunk>;
}

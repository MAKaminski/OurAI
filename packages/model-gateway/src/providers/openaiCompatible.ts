import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  FinishReason,
  ModelProvider,
  StreamChunk,
  TokenUsage,
  ToolCall,
  UsageCallback,
} from '../ModelProvider.js';
import { computeCostUsd } from '../usage.js';

export interface OpenAICompatibleConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
}

// ---- wire shapes (the subset of the OpenAI Chat Completions API we use) ----

interface WireMessage {
  role: string;
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

interface WireChoice {
  message: WireMessage;
  finish_reason: string | null;
}

interface WireUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface WireResponse {
  choices: WireChoice[];
  usage?: WireUsage;
}

function toWireMessage(m: ChatMessage): WireMessage {
  const wire: WireMessage = { role: m.role, content: m.content };
  if (m.name) wire.name = m.name;
  if (m.toolCallId) wire.tool_call_id = m.toolCallId;
  if (m.toolCalls) wire.tool_calls = m.toolCalls;
  return wire;
}

function fromWireMessage(m: WireMessage): ChatMessage {
  const msg: ChatMessage = {
    role: (m.role as ChatMessage['role']) ?? 'assistant',
    content: m.content ?? null,
  };
  if (m.name) msg.name = m.name;
  if (m.tool_call_id) msg.toolCallId = m.tool_call_id;
  if (m.tool_calls && m.tool_calls.length > 0) msg.toolCalls = m.tool_calls;
  return msg;
}

const FINISH_REASONS: ReadonlySet<string> = new Set([
  'stop',
  'tool_calls',
  'length',
  'content_filter',
  'error',
]);

function toFinishReason(raw: string | null): FinishReason {
  // Some providers return 'function_call' or 'tool_call' (singular).
  if (raw === 'function_call' || raw === 'tool_call') return 'tool_calls';
  return raw && FINISH_REASONS.has(raw) ? (raw as FinishReason) : 'stop';
}

/**
 * Shared base for OpenAI-compatible providers (DeepSeek, Kimi, OpenRouter…).
 * Subclasses only differ by base URL, API key, and default model id.
 */
export class OpenAICompatibleProvider implements ModelProvider {
  readonly name: string;
  protected readonly baseUrl: string;
  protected readonly apiKey: string;

  constructor(config: OpenAICompatibleConfig) {
    this.name = config.name;
    // Normalize so we can always append '/chat/completions'.
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
  }

  async chat(req: ChatRequest, onUsage?: UsageCallback): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error(`${this.name}.chat: missing API key`);
    }

    const body: Record<string, unknown> = {
      model: req.model,
      messages: req.messages.map(toWireMessage),
    };
    if (req.tools && req.tools.length > 0) body.tools = req.tools;
    if (req.toolChoice) body.tool_choice = req.toolChoice;
    if (typeof req.temperature === 'number') body.temperature = req.temperature;
    if (typeof req.maxTokens === 'number') body.max_tokens = req.maxTokens;

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: req.signal,
      });
    } catch (err) {
      throw new Error(`${this.name}.chat: request failed: ${String(err)}`);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(
        `${this.name}.chat: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`,
      );
    }

    const json = (await res.json()) as WireResponse;
    const choice = json.choices?.[0];
    if (!choice) {
      throw new Error(`${this.name}.chat: no choices in response`);
    }

    const usage: TokenUsage = {
      promptTokens: json.usage?.prompt_tokens ?? 0,
      completionTokens: json.usage?.completion_tokens ?? 0,
      totalTokens: json.usage?.total_tokens ?? 0,
    };
    usage.costUsd = computeCostUsd(req.model, usage);
    if (onUsage) await onUsage(usage);

    return {
      message: fromWireMessage(choice.message),
      finishReason: toFinishReason(choice.finish_reason),
      usage,
    };
  }

  // eslint-disable-next-line require-yield
  async *stream(_req: ChatRequest, _onUsage?: UsageCallback): AsyncIterable<StreamChunk> {
    throw new Error(`${this.name}.stream: not implemented (Phase 1b)`);
  }
}

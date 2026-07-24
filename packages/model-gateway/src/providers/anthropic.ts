import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  FinishReason,
  ModelProvider,
  StreamChunk,
  TokenUsage,
  UsageCallback,
} from '../ModelProvider.js';
import { computeCostUsd } from '../usage.js';

export const ANTHROPIC_DEFAULT_MODEL = 'claude-sonnet-5';

const ANTHROPIC_VERSION = '2023-06-01';
/** Anthropic requires max_tokens; use a sensible default when unset. */
const DEFAULT_MAX_TOKENS = 4096;

interface WireTextBlock {
  type: 'text';
  text: string;
}
interface WireToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}
type WireContentBlock = WireTextBlock | WireToolUseBlock | { type: string; [k: string]: unknown };

interface WireResponse {
  content?: WireContentBlock[];
  stop_reason?: string | null;
  usage?: { input_tokens?: number; output_tokens?: number };
}

function toWireRole(role: ChatMessage['role']): 'user' | 'assistant' {
  // Anthropic only accepts user/assistant in `messages`; tool results ride as
  // user messages, system is hoisted out separately.
  return role === 'assistant' ? 'assistant' : 'user';
}

function toStopReason(raw: string | null | undefined): FinishReason {
  switch (raw) {
    case 'end_turn':
    case 'stop_sequence':
      return 'stop';
    case 'max_tokens':
      return 'length';
    case 'tool_use':
      return 'tool_calls';
    default:
      return 'stop';
  }
}

/**
 * Native Anthropic provider (Messages API differs from OpenAI's shape, so it
 * does not extend OpenAICompatibleProvider). Reference/high-quality tier.
 *
 * Implements non-streaming `chat()`; `stream()` remains a later addition. Tool
 * calls are mapped best-effort — the pipeline's agent stages are plain
 * system+user text, which is the well-exercised path.
 */
export class AnthropicProvider implements ModelProvider {
  readonly name = 'anthropic';
  constructor(
    protected readonly apiKey: string,
    protected readonly baseUrl = 'https://api.anthropic.com',
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private post(body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
    return fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
      signal,
    }).catch((err) => {
      throw new Error(`anthropic.chat: request failed: ${String(err)}`);
    });
  }

  async chat(req: ChatRequest, onUsage?: UsageCallback): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error('anthropic.chat: missing API key');

    // Hoist system messages to the top-level `system` field; keep the rest.
    const system = req.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content ?? '')
      .join('\n\n');
    const messages = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: toWireRole(m.role), content: m.content ?? '' }));

    const body: Record<string, unknown> = {
      model: req.model,
      max_tokens: req.maxTokens ?? DEFAULT_MAX_TOKENS,
      messages,
    };
    if (system) body.system = system;
    if (typeof req.temperature === 'number') body.temperature = req.temperature;

    let res = await this.post(body, req.signal);

    // The newest Claude models reject `temperature` ("deprecated for this
    // model"). Rather than hardcode which models allow it, drop the offending
    // param and retry once so both old and new models work.
    if (res.status === 400 && 'temperature' in body) {
      const detail = await res
        .clone()
        .text()
        .catch(() => '');
      if (/temperature/i.test(detail)) {
        delete body.temperature;
        res = await this.post(body, req.signal);
      }
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(
        `anthropic.chat: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`,
      );
    }

    const json = (await res.json()) as WireResponse;
    const text = (json.content ?? [])
      .filter((b): b is WireTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const usage: TokenUsage = {
      promptTokens: json.usage?.input_tokens ?? 0,
      completionTokens: json.usage?.output_tokens ?? 0,
      totalTokens: (json.usage?.input_tokens ?? 0) + (json.usage?.output_tokens ?? 0),
    };
    usage.costUsd = computeCostUsd(req.model, usage);
    if (onUsage) await onUsage(usage);

    return {
      message: { role: 'assistant', content: text },
      finishReason: toStopReason(json.stop_reason),
      usage,
    };
  }

  // eslint-disable-next-line require-yield
  async *stream(_req: ChatRequest, _onUsage?: UsageCallback): AsyncIterable<StreamChunk> {
    throw new Error('anthropic.stream: not implemented (Phase 1b)');
  }
}

import type {
  ChatRequest,
  ChatResponse,
  ModelProvider,
  StreamChunk,
  UsageCallback,
} from '../ModelProvider.js';

export interface OpenAICompatibleConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
}

/**
 * Shared base for OpenAI-compatible providers (DeepSeek, Kimi, OpenRouter…).
 * Subclasses only differ by base URL, API key, and default model id.
 *
 * Scaffold status: request/stream bodies are stubs.
 */
export class OpenAICompatibleProvider implements ModelProvider {
  readonly name: string;
  protected readonly baseUrl: string;
  protected readonly apiKey: string;

  constructor(config: OpenAICompatibleConfig) {
    this.name = config.name;
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  chat(_req: ChatRequest, _onUsage?: UsageCallback): Promise<ChatResponse> {
    throw new Error(`${this.name}.chat: not implemented (Phase 1b)`);
  }

  // eslint-disable-next-line require-yield
  async *stream(_req: ChatRequest, _onUsage?: UsageCallback): AsyncIterable<StreamChunk> {
    throw new Error(`${this.name}.stream: not implemented (Phase 1b)`);
  }
}

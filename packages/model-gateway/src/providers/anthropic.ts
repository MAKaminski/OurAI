import type {
  ChatRequest,
  ChatResponse,
  ModelProvider,
  StreamChunk,
  UsageCallback,
} from '../ModelProvider.js';

export const ANTHROPIC_DEFAULT_MODEL = 'claude-sonnet-5';

/**
 * Native Anthropic provider (Messages API differs from OpenAI's shape, so it
 * does not extend OpenAICompatibleProvider). Reference/high-quality tier.
 *
 * Scaffold status: stub.
 */
export class AnthropicProvider implements ModelProvider {
  readonly name = 'anthropic';
  constructor(
    protected readonly apiKey: string,
    protected readonly baseUrl = 'https://api.anthropic.com',
  ) {}

  chat(_req: ChatRequest, _onUsage?: UsageCallback): Promise<ChatResponse> {
    throw new Error('anthropic.chat: not implemented (Phase 1b)');
  }

  // eslint-disable-next-line require-yield
  async *stream(_req: ChatRequest, _onUsage?: UsageCallback): AsyncIterable<StreamChunk> {
    throw new Error('anthropic.stream: not implemented (Phase 1b)');
  }
}

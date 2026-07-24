import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnthropicProvider } from './anthropic.js';
import { OpenAICompatibleProvider } from './openaiCompatible.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Parse the JSON body a fetch mock was called with. */
function bodyOf(mock: ReturnType<typeof vi.fn>, callIndex: number): Record<string, unknown> {
  const init = mock.mock.calls[callIndex]?.[1] as RequestInit | undefined;
  return JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AnthropicProvider.chat', () => {
  it('drops `temperature` and retries when the model rejects it (the 400 that hit prod)', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse(
          { type: 'error', error: { message: '`temperature` is deprecated for this model.' } },
          400,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          content: [{ type: 'text', text: '{"kpis":[]}' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 12, output_tokens: 8 },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const provider = new AnthropicProvider('sk-ant-test');
    const res = await provider.chat({
      model: 'claude-sonnet-5',
      messages: [{ role: 'user', content: 'hi' }],
      temperature: 0.3,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(bodyOf(fetchMock, 0)).toHaveProperty('temperature', 0.3); // first try sends it
    expect(bodyOf(fetchMock, 1)).not.toHaveProperty('temperature'); // retry drops it
    expect(res.message.content).toBe('{"kpis":[]}');
    expect(res.usage.completionTokens).toBe(8);
  });

  it('does not retry on an unrelated 400', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'model not found' } }, 400));
    vi.stubGlobal('fetch', fetchMock);

    const provider = new AnthropicProvider('sk-ant-test');
    await expect(
      provider.chat({ model: 'x', messages: [{ role: 'user', content: 'hi' }], temperature: 0.3 }),
    ).rejects.toThrow(/400/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('OpenAICompatibleProvider.chat', () => {
  it('maps the OpenAI wire shape to a ChatResponse', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        choices: [
          { message: { role: 'assistant', content: '{"kpis":[]}' }, finish_reason: 'stop' },
        ],
        usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const provider = new OpenAICompatibleProvider({
      name: 'deepseek',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: 'sk-test',
    });
    const res = await provider.chat({
      model: 'deepseek-chat-v3.2',
      messages: [{ role: 'user', content: 'hi' }],
    });

    expect(res.finishReason).toBe('stop');
    expect(res.message.content).toBe('{"kpis":[]}');
    expect(res.usage.totalTokens).toBe(8);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.deepseek.com/v1/chat/completions');
  });

  it('surfaces a non-2xx as an error (e.g. the 402 out-of-balance case)', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'Insufficient Balance' } }, 402));
    vi.stubGlobal('fetch', fetchMock);

    const provider = new OpenAICompatibleProvider({
      name: 'deepseek',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: 'sk-test',
    });
    await expect(
      provider.chat({ model: 'deepseek-chat-v3.2', messages: [{ role: 'user', content: 'hi' }] }),
    ).rejects.toThrow(/402/);
  });
});

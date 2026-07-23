import { OpenAICompatibleProvider } from './openaiCompatible.js';

export const KIMI_DEFAULT_MODEL = 'moonshotai/kimi-k2.6';

/** Stronger tool-use at ~5–6× the token cost; A/B via `MODEL_PROVIDER=kimi`. */
export class KimiProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, baseUrl = 'https://api.moonshot.ai/v1') {
    super({ name: 'kimi', baseUrl, apiKey });
  }
}

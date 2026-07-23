import { OpenAICompatibleProvider } from './openaiCompatible.js';

export const DEEPSEEK_DEFAULT_MODEL = 'deepseek-chat-v3.2';

/** Default provider — best cost/quality for agentic coding (docs plan §7). */
export class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, baseUrl = 'https://api.deepseek.com/v1') {
    super({ name: 'deepseek', baseUrl, apiKey });
  }
}

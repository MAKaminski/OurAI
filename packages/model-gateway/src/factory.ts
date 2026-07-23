import type { ModelProvider } from './ModelProvider.js';
import { DeepSeekProvider, DEEPSEEK_DEFAULT_MODEL } from './providers/deepseek.js';
import { KimiProvider, KIMI_DEFAULT_MODEL } from './providers/kimi.js';
import { AnthropicProvider, ANTHROPIC_DEFAULT_MODEL } from './providers/anthropic.js';

export type ModelProviderName = 'deepseek' | 'kimi' | 'anthropic';

export interface ModelFactoryConfig {
  provider: ModelProviderName;
  apiKey: string;
  baseUrl?: string;
}

export function defaultModelId(provider: ModelProviderName): string {
  switch (provider) {
    case 'deepseek':
      return DEEPSEEK_DEFAULT_MODEL;
    case 'kimi':
      return KIMI_DEFAULT_MODEL;
    case 'anthropic':
      return ANTHROPIC_DEFAULT_MODEL;
    default: {
      const exhaustive: never = provider;
      throw new Error(`unknown model provider: ${String(exhaustive)}`);
    }
  }
}

/** Construct the configured model provider (`MODEL_PROVIDER`). */
export function createProvider(config: ModelFactoryConfig): ModelProvider {
  switch (config.provider) {
    case 'deepseek':
      return new DeepSeekProvider(config.apiKey, config.baseUrl);
    case 'kimi':
      return new KimiProvider(config.apiKey, config.baseUrl);
    case 'anthropic':
      return new AnthropicProvider(config.apiKey, config.baseUrl);
    default: {
      const exhaustive: never = config.provider;
      throw new Error(`unknown model provider: ${String(exhaustive)}`);
    }
  }
}

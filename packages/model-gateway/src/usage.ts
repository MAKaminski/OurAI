import type { TokenUsage } from './ModelProvider.js';

/** USD per 1M tokens, list prices (verify at contract time). See docs plan §7. */
export interface ModelCost {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const COST_TABLE: Record<string, ModelCost> = {
  'deepseek-chat-v3.2': { inputPerMillion: 0.214, outputPerMillion: 0.322 },
  'deepseek-chat-v3.1': { inputPerMillion: 0.25, outputPerMillion: 0.95 },
  'moonshotai/kimi-k2.6': { inputPerMillion: 0.95, outputPerMillion: 4.0 },
  'moonshotai/kimi-k2.5': { inputPerMillion: 0.6, outputPerMillion: 3.0 },
};

export function computeCostUsd(modelId: string, usage: TokenUsage): number {
  const cost = COST_TABLE[modelId];
  if (!cost) return 0;
  return (
    (usage.promptTokens / 1_000_000) * cost.inputPerMillion +
    (usage.completionTokens / 1_000_000) * cost.outputPerMillion
  );
}

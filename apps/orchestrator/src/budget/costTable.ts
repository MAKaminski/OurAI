import { computeCostUsd, type TokenUsage } from '@ourai/model-gateway';

/** Re-export the gateway cost helper so budget code has one import site. */
export function usageToUsd(modelId: string, usage: TokenUsage): number {
  return usage.costUsd ?? computeCostUsd(modelId, usage);
}

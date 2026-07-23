import type { TokenUsage, UsageCallback } from '@ourai/model-gateway';
import { usageToUsd } from './costTable.js';

/**
 * Enforces the monthly USD ceiling (`MONTHLY_BUDGET_USD`). Tracks month-to-date
 * spend; blocks new agent spawns and aborts in-flight calls once the cap is hit
 * (docs plan §7.3). This is what makes cost "flat", implemented in software.
 */
export class BudgetGuard {
  private mtdUsd = 0;

  constructor(
    private readonly monthlyBudgetUsd: number,
    private readonly modelId: string,
  ) {}

  /** Whether an estimated spend can still fit under the ceiling. */
  canSpend(estUsd = 0): boolean {
    return this.mtdUsd + estUsd <= this.monthlyBudgetUsd;
  }

  spentUsd(): number {
    return this.mtdUsd;
  }

  remainingUsd(): number {
    return Math.max(0, this.monthlyBudgetUsd - this.mtdUsd);
  }

  /** Record consumed tokens against the budget. */
  record(usage: TokenUsage): void {
    this.mtdUsd += usageToUsd(this.modelId, usage);
  }

  /** Wrap into a UsageCallback to pass to ModelProvider.chat/stream. */
  asUsageCallback(): UsageCallback {
    return (usage) => this.record(usage);
  }
}

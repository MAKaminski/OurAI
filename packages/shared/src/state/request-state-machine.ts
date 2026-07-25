import type { RequestStage } from '../types/request.js';

/** Allowed request stage transitions (the product pipeline). */
const REQUEST_TRANSITIONS: Record<RequestStage, readonly RequestStage[]> = {
  intake: ['kpi_review', 'rejected'],
  kpi_review: ['design', 'rejected', 'intake'],
  design: ['build', 'rejected', 'kpi_review'],
  build: ['qa', 'rejected'],
  qa: ['staging', 'build'],
  staging: ['done', 'qa'],
  done: [],
  rejected: ['intake'],
};

export function canTransitionRequest(from: RequestStage, to: RequestStage): boolean {
  return REQUEST_TRANSITIONS[from].includes(to);
}

export function assertRequestTransition(from: RequestStage, to: RequestStage): void {
  if (!canTransitionRequest(from, to)) {
    throw new Error(`Invalid request transition: ${from} → ${to}`);
  }
}

/** Terminal stages carry no further work. */
export function isTerminalRequestStage(stage: RequestStage): boolean {
  return stage === 'done' || stage === 'rejected';
}

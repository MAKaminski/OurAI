import type { WorkItemStatus } from '../types/work-item.js';

/** Allowed work-item status transitions (the branch/outstanding-work view). */
const WORK_ITEM_TRANSITIONS: Record<WorkItemStatus, readonly WorkItemStatus[]> = {
  queued: ['running', 'abandoned'],
  running: ['awaiting_review', 'failed', 'abandoned'],
  awaiting_review: ['merged', 'running', 'abandoned'],
  merged: [],
  failed: ['queued', 'abandoned'],
  abandoned: [],
};

export function canTransitionWorkItem(from: WorkItemStatus, to: WorkItemStatus): boolean {
  return WORK_ITEM_TRANSITIONS[from].includes(to);
}

export function assertWorkItemTransition(from: WorkItemStatus, to: WorkItemStatus): void {
  if (!canTransitionWorkItem(from, to)) {
    throw new Error(`Invalid work-item transition: ${from} → ${to}`);
  }
}

/** Terminal states never leave the branch view's active columns. */
export function isTerminalWorkItemStatus(status: WorkItemStatus): boolean {
  return status === 'merged' || status === 'abandoned';
}

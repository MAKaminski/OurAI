import type { WorkItemId } from '@ourai/shared';

/** A unit of queued work — a promoted idea waiting for an agent slot. */
export interface QueuedWork {
  workItemId: WorkItemId;
  enqueuedAt: string;
}

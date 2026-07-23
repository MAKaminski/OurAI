import type { WorkItemId } from '@ourai/shared';
import type { QueuedWork } from './types.js';

/**
 * FIFO of work items awaiting an agent slot. Branches outstanding ≠ agents
 * running: many items can sit here while only `MAX_CONCURRENT_AGENTS` run
 * (docs plan §3.1). In-memory for dev; rehydrate from persistence on boot.
 */
export class WorkQueue {
  private items: QueuedWork[] = [];

  enqueue(work: QueuedWork): void {
    if (this.items.some((w) => w.workItemId === work.workItemId)) return;
    this.items.push(work);
  }

  dequeue(): QueuedWork | undefined {
    return this.items.shift();
  }

  peek(): QueuedWork | undefined {
    return this.items[0];
  }

  size(): number {
    return this.items.length;
  }

  has(workItemId: WorkItemId): boolean {
    return this.items.some((w) => w.workItemId === workItemId);
  }
}

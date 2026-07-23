import type { CompanyId, IdeaId, SessionId, UserId, WorkItemId } from './ids.js';
import type { MemberRole } from './company.js';

/**
 * Work item lifecycle — a promoted idea being built by one agent on one branch.
 *   queued          → waiting for an agent slot
 *   running         → agent actively working the branch
 *   awaiting_review → agent finished; diff ready to preview
 *   merged          → human approved; merged to the default branch
 *   failed          → agent errored out
 *   abandoned       → discarded without merging
 */
export type WorkItemStatus =
  'queued' | 'running' | 'awaiting_review' | 'merged' | 'failed' | 'abandoned';

export interface WorkItem {
  id: WorkItemId;
  companyId: CompanyId;
  /** The idea this work item was promoted from (nullable for ad-hoc submissions). */
  ideaId: IdeaId | null;
  title: string;
  /** Isolated branch, e.g. "ourai/<slug>". Unique per company. */
  branch: string;
  status: WorkItemStatus;
  actingRole: MemberRole | null;
  submittedBy: UserId | null;
  /** The current/last agent session bound to this work item. */
  sessionId: SessionId | null;
  createdAt: string;
}

export type NewWorkItem = Omit<WorkItem, 'id' | 'createdAt'>;

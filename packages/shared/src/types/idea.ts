import type { CompanyId, IdeaId, UserId } from './ids.js';
import type { MemberRole } from './company.js';

/**
 * Idea lifecycle — the intake backlog.
 *   inbox    → just captured
 *   triaged  → reviewed, kept
 *   promoted → turned into a work item (an agent will build it)
 *   shipped  → the work item merged
 *   rejected → discarded
 */
export type IdeaStatus = 'inbox' | 'triaged' | 'promoted' | 'shipped' | 'rejected';

export interface Idea {
  id: IdeaId;
  companyId: CompanyId;
  title: string;
  body: string | null;
  status: IdeaStatus;
  /** The role the submitter was "acting as" — cosmetic now, routing hook later. */
  actingRole: MemberRole | null;
  submittedBy: UserId | null;
  createdAt: string;
}

export type NewIdea = Omit<Idea, 'id' | 'createdAt'>;

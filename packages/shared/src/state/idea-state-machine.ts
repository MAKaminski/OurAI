import type { IdeaStatus } from '../types/idea.js';

/** Allowed idea status transitions. */
const IDEA_TRANSITIONS: Record<IdeaStatus, readonly IdeaStatus[]> = {
  inbox: ['triaged', 'rejected'],
  triaged: ['promoted', 'rejected', 'inbox'],
  promoted: ['shipped', 'rejected'],
  shipped: [],
  rejected: ['inbox'],
};

export function canTransitionIdea(from: IdeaStatus, to: IdeaStatus): boolean {
  return IDEA_TRANSITIONS[from].includes(to);
}

export function assertIdeaTransition(from: IdeaStatus, to: IdeaStatus): void {
  if (!canTransitionIdea(from, to)) {
    throw new Error(`Invalid idea transition: ${from} → ${to}`);
  }
}

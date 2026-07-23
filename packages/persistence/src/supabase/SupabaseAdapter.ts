import type {
  Company,
  NewCompany,
  Idea,
  NewIdea,
  WorkItem,
  NewWorkItem,
  Session,
  NewSession,
  Event,
  NewEvent,
  CompanyId,
  IdeaId,
  WorkItemId,
  SessionId,
  UserId,
} from '@ourai/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PersistenceAdapter, PresenceState, Unsubscribe } from '../PersistenceAdapter.js';
import { createSupabaseClient, type SupabaseConfig } from './client.js';

const NOT_IMPLEMENTED = 'SupabaseAdapter: not implemented (Phase 1a)';

/**
 * Default persistence + sync provider. Reads/writes the tables in
 * infra/supabase/migrations and fans events out over Supabase Realtime.
 *
 * Scaffold status: method bodies are stubs — the shapes are locked, the wiring
 * lands in Phase 1a.
 */
export class SupabaseAdapter implements PersistenceAdapter {
  private readonly client: SupabaseClient;

  constructor(config: SupabaseConfig) {
    this.client = createSupabaseClient(config);
  }

  createCompany(_input: NewCompany): Promise<Company> {
    throw new Error(NOT_IMPLEMENTED);
  }
  getCompany(_id: CompanyId): Promise<Company | null> {
    throw new Error(NOT_IMPLEMENTED);
  }
  listCompaniesForUser(_userId: UserId): Promise<Company[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  updateCompany(_id: CompanyId, _patch: Partial<NewCompany>): Promise<Company> {
    throw new Error(NOT_IMPLEMENTED);
  }

  createIdea(_input: NewIdea): Promise<Idea> {
    throw new Error(NOT_IMPLEMENTED);
  }
  getIdea(_id: IdeaId): Promise<Idea | null> {
    throw new Error(NOT_IMPLEMENTED);
  }
  listIdeas(_companyId: CompanyId): Promise<Idea[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  updateIdea(_id: IdeaId, _patch: Partial<NewIdea>): Promise<Idea> {
    throw new Error(NOT_IMPLEMENTED);
  }

  createWorkItem(_input: NewWorkItem): Promise<WorkItem> {
    throw new Error(NOT_IMPLEMENTED);
  }
  getWorkItem(_id: WorkItemId): Promise<WorkItem | null> {
    throw new Error(NOT_IMPLEMENTED);
  }
  listWorkItems(_companyId: CompanyId): Promise<WorkItem[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  updateWorkItem(_id: WorkItemId, _patch: Partial<NewWorkItem>): Promise<WorkItem> {
    throw new Error(NOT_IMPLEMENTED);
  }

  createSession(_input: NewSession): Promise<Session> {
    throw new Error(NOT_IMPLEMENTED);
  }
  getSession(_id: SessionId): Promise<Session | null> {
    throw new Error(NOT_IMPLEMENTED);
  }
  listSessions(_workItemId: WorkItemId): Promise<Session[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  updateSession(_id: SessionId, _patch: Partial<NewSession>): Promise<Session> {
    throw new Error(NOT_IMPLEMENTED);
  }

  appendEvent(_input: NewEvent): Promise<Event> {
    throw new Error(NOT_IMPLEMENTED);
  }
  getEvents(_sessionId: SessionId, _sinceSeq?: number, _limit?: number): Promise<Event[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  subscribeEvents(_sessionId: SessionId, _onEvent: (event: Event) => void): Unsubscribe {
    throw new Error(NOT_IMPLEMENTED);
  }

  trackPresence(_sessionId: SessionId, _state: PresenceState): Promise<Unsubscribe> {
    throw new Error(NOT_IMPLEMENTED);
  }
  subscribePresence(
    _sessionId: SessionId,
    _onChange: (states: PresenceState[]) => void,
  ): Unsubscribe {
    throw new Error(NOT_IMPLEMENTED);
  }
}

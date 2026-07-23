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

/** Ephemeral presence for a session room. */
export interface PresenceState {
  userId: UserId;
  displayName: string;
  actAsRole: string | null;
  onlineAt: string;
}

export type Unsubscribe = () => void;

/**
 * The single storage/sync boundary. The default implementation is Supabase
 * (Postgres + Realtime); swapping providers is a config change, not a rewrite.
 * The append-only `events` log is the shared transcript — clients only read it,
 * the orchestrator only appends to it.
 */
export interface PersistenceAdapter {
  // ---- companies ----
  createCompany(input: NewCompany): Promise<Company>;
  getCompany(id: CompanyId): Promise<Company | null>;
  listCompaniesForUser(userId: UserId): Promise<Company[]>;
  updateCompany(id: CompanyId, patch: Partial<NewCompany>): Promise<Company>;

  // ---- ideas (the intake backlog) ----
  createIdea(input: NewIdea): Promise<Idea>;
  getIdea(id: IdeaId): Promise<Idea | null>;
  listIdeas(companyId: CompanyId): Promise<Idea[]>;
  updateIdea(id: IdeaId, patch: Partial<NewIdea>): Promise<Idea>;

  // ---- work items ----
  createWorkItem(input: NewWorkItem): Promise<WorkItem>;
  getWorkItem(id: WorkItemId): Promise<WorkItem | null>;
  listWorkItems(companyId: CompanyId): Promise<WorkItem[]>;
  updateWorkItem(id: WorkItemId, patch: Partial<NewWorkItem>): Promise<WorkItem>;

  // ---- sessions ----
  createSession(input: NewSession): Promise<Session>;
  getSession(id: SessionId): Promise<Session | null>;
  listSessions(workItemId: WorkItemId): Promise<Session[]>;
  updateSession(id: SessionId, patch: Partial<NewSession>): Promise<Session>;

  // ---- events (append-only transcript) ----
  appendEvent(input: NewEvent): Promise<Event>;
  /** Events with seq > sinceSeq, ascending. Omit sinceSeq to read from start. */
  getEvents(sessionId: SessionId, sinceSeq?: number, limit?: number): Promise<Event[]>;
  subscribeEvents(sessionId: SessionId, onEvent: (event: Event) => void): Unsubscribe;

  // ---- presence (ephemeral) ----
  trackPresence(sessionId: SessionId, state: PresenceState): Promise<Unsubscribe>;
  subscribePresence(sessionId: SessionId, onChange: (states: PresenceState[]) => void): Unsubscribe;
}

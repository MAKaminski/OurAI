import {
  asId,
  type Company,
  type NewCompany,
  type Idea,
  type NewIdea,
  type WorkItem,
  type NewWorkItem,
  type Session,
  type NewSession,
  type Event,
  type NewEvent,
  type CompanyId,
  type IdeaId,
  type WorkItemId,
  type SessionId,
  type EventId,
  type UserId,
} from '@ourai/shared';
import type { PersistenceAdapter, PresenceState, Unsubscribe } from '../PersistenceAdapter.js';

/**
 * Zero-dependency in-memory implementation for local dev and tests. Not durable
 * and not multi-process — it exists so `agent-core`/orchestrator logic can be
 * exercised without a live Supabase project.
 */
export class MemoryAdapter implements PersistenceAdapter {
  private companies = new Map<string, Company>();
  private ideas = new Map<string, Idea>();
  private workItems = new Map<string, WorkItem>();
  private sessions = new Map<string, Session>();
  private events = new Map<string, Event[]>();
  private eventSubs = new Map<string, Set<(event: Event) => void>>();
  private counter = 0;

  private nextId(prefix: string): string {
    this.counter += 1;
    return `${prefix}_${this.counter}`;
  }

  private now(): string {
    // Avoids Date.now() so the adapter is deterministic under test harnesses
    // that stub time; callers that need real timestamps can override.
    return new Date(this.counter).toISOString();
  }

  async createCompany(input: NewCompany): Promise<Company> {
    const company: Company = {
      ...input,
      id: asId<'CompanyId'>(this.nextId('co')),
      createdAt: this.now(),
    };
    this.companies.set(company.id, company);
    return company;
  }
  async getCompany(id: CompanyId): Promise<Company | null> {
    return this.companies.get(id) ?? null;
  }
  async listCompaniesForUser(userId: UserId): Promise<Company[]> {
    return [...this.companies.values()].filter((c) => c.createdBy === userId);
  }
  async updateCompany(id: CompanyId, patch: Partial<NewCompany>): Promise<Company> {
    const prev = this.companies.get(id);
    if (!prev) throw new Error(`company not found: ${id}`);
    const next = { ...prev, ...patch };
    this.companies.set(id, next);
    return next;
  }

  async createIdea(input: NewIdea): Promise<Idea> {
    const idea: Idea = { ...input, id: asId<'IdeaId'>(this.nextId('idea')), createdAt: this.now() };
    this.ideas.set(idea.id, idea);
    return idea;
  }
  async getIdea(id: IdeaId): Promise<Idea | null> {
    return this.ideas.get(id) ?? null;
  }
  async listIdeas(companyId: CompanyId): Promise<Idea[]> {
    return [...this.ideas.values()].filter((i) => i.companyId === companyId);
  }
  async updateIdea(id: IdeaId, patch: Partial<NewIdea>): Promise<Idea> {
    const prev = this.ideas.get(id);
    if (!prev) throw new Error(`idea not found: ${id}`);
    const next = { ...prev, ...patch };
    this.ideas.set(id, next);
    return next;
  }

  async createWorkItem(input: NewWorkItem): Promise<WorkItem> {
    const item: WorkItem = {
      ...input,
      id: asId<'WorkItemId'>(this.nextId('wi')),
      createdAt: this.now(),
    };
    this.workItems.set(item.id, item);
    return item;
  }
  async getWorkItem(id: WorkItemId): Promise<WorkItem | null> {
    return this.workItems.get(id) ?? null;
  }
  async listWorkItems(companyId: CompanyId): Promise<WorkItem[]> {
    return [...this.workItems.values()].filter((w) => w.companyId === companyId);
  }
  async updateWorkItem(id: WorkItemId, patch: Partial<NewWorkItem>): Promise<WorkItem> {
    const prev = this.workItems.get(id);
    if (!prev) throw new Error(`work item not found: ${id}`);
    const next = { ...prev, ...patch };
    this.workItems.set(id, next);
    return next;
  }

  async createSession(input: NewSession): Promise<Session> {
    const session: Session = {
      ...input,
      id: asId<'SessionId'>(this.nextId('sess')),
      createdAt: this.now(),
    };
    this.sessions.set(session.id, session);
    this.events.set(session.id, []);
    return session;
  }
  async getSession(id: SessionId): Promise<Session | null> {
    return this.sessions.get(id) ?? null;
  }
  async listSessions(workItemId: WorkItemId): Promise<Session[]> {
    return [...this.sessions.values()].filter((s) => s.workItemId === workItemId);
  }
  async updateSession(id: SessionId, patch: Partial<NewSession>): Promise<Session> {
    const prev = this.sessions.get(id);
    if (!prev) throw new Error(`session not found: ${id}`);
    const next = { ...prev, ...patch };
    this.sessions.set(id, next);
    return next;
  }

  async appendEvent(input: NewEvent): Promise<Event> {
    const log = this.events.get(input.sessionId) ?? [];
    const event = {
      ...input,
      id: asId<'EventId'>(this.nextId('evt')) as EventId,
      seq: log.length + 1,
      createdAt: this.now(),
    } as Event;
    log.push(event);
    this.events.set(input.sessionId, log);
    this.eventSubs.get(input.sessionId)?.forEach((cb) => cb(event));
    return event;
  }
  async getEvents(sessionId: SessionId, sinceSeq = 0, limit?: number): Promise<Event[]> {
    const log = (this.events.get(sessionId) ?? []).filter((e) => e.seq > sinceSeq);
    return limit ? log.slice(0, limit) : log;
  }
  subscribeEvents(sessionId: SessionId, onEvent: (event: Event) => void): Unsubscribe {
    const subs = this.eventSubs.get(sessionId) ?? new Set();
    subs.add(onEvent);
    this.eventSubs.set(sessionId, subs);
    return () => subs.delete(onEvent);
  }

  async trackPresence(_sessionId: SessionId, _state: PresenceState): Promise<Unsubscribe> {
    return () => {};
  }
  subscribePresence(
    _sessionId: SessionId,
    _onChange: (states: PresenceState[]) => void,
  ): Unsubscribe {
    return () => {};
  }
}

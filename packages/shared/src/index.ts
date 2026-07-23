// Types
export type {
  Brand,
  CompanyId,
  IdeaId,
  WorkItemId,
  SessionId,
  EventId,
  UserId,
} from './types/ids.js';
export { asId } from './types/ids.js';

export type {
  Company,
  NewCompany,
  CompanyMember,
  NewCompanyMember,
  MemberRole,
} from './types/company.js';
export type { Idea, NewIdea, IdeaStatus } from './types/idea.js';
export type { WorkItem, NewWorkItem, WorkItemStatus } from './types/work-item.js';
export type { Session, NewSession, SessionStatus } from './types/session.js';
export type {
  Event,
  NewEvent,
  EventKind,
  AuthorType,
  MessageEvent,
  ToolCallEvent,
  ToolResultEvent,
  DiffEvent,
  StatusEvent,
  SystemEvent,
} from './types/event.js';

// Schemas
export {
  authorTypeSchema,
  eventKindSchema,
  newEventSchema,
  type NewEventInput,
} from './schema/event.schema.js';
export { ideaStatusSchema, createIdeaSchema, type CreateIdeaInput } from './schema/idea.schema.js';
export {
  workItemStatusSchema,
  createWorkItemSchema,
  type CreateWorkItemInput,
} from './schema/work-item.schema.js';

// State machines
export { canTransitionIdea, assertIdeaTransition } from './state/idea-state-machine.js';
export {
  canTransitionWorkItem,
  assertWorkItemTransition,
  isTerminalWorkItemStatus,
} from './state/work-item-state-machine.js';

// Constants
export { DEFAULTS, ROLE_COLORS, ALL_ROLES } from './constants.js';

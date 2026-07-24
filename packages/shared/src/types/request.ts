import type {
  CompanyId,
  RequestId,
  StageRunId,
  RequestKpiId,
  StageArtifactId,
  UserId,
} from './ids.js';
import type { MemberRole } from './company.js';

/**
 * A Request is the product-workflow spine: the "(+) Add a Request" front door
 * that moves through agentic + human-reviewed stages. It is distinct from the
 * lightweight `ideas` backlog — a request carries the full pipeline.
 *
 *   intake     → just submitted
 *   kpi_review → the KPI agent proposed KPIs; awaiting human approve/modify
 *   design     → KPIs approved; design stage (agentic)
 *   build      → dev work (worktree-per-agent, future)
 *   qa         → quality gate
 *   staging    → pre-prod environment
 *   done       → shipped
 *   rejected   → discarded
 */
export type RequestStage =
  'intake' | 'kpi_review' | 'design' | 'build' | 'qa' | 'staging' | 'done' | 'rejected';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Request {
  id: RequestId;
  companyId: CompanyId;
  title: string;
  body: string | null;
  stage: RequestStage;
  priority: RequestPriority;
  /** The role the submitter was "acting as" — cosmetic now, routing hook later. */
  actingRole: MemberRole | null;
  submittedBy: UserId | null;
  createdAt: string;
  updatedAt: string;
}

export type NewRequest = Omit<Request, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * The agentic stages that run against a request. Each produces a StageRun row
 * (progress + the human-in-the-loop gate) and stage output rows: `kpi` writes
 * `request_kpis`; `design`/`build`/`qa`/`staging` write `request_stage_artifacts`.
 */
export type AgenticStage = 'kpi' | 'design' | 'build' | 'qa' | 'staging';

/** The stages whose output lands in the generic `request_stage_artifacts` table. */
export type ArtifactStage = 'design' | 'build' | 'qa' | 'staging';

/**
 * A single execution of an agentic stage.
 *   queued   → created, not started
 *   running  → the agent is working
 *   proposed → agent finished; output awaits human approve/modify (the HITL gate)
 *   approved → a human accepted (advances the request stage)
 *   error    → the run failed (see `detail`)
 */
export type StageRunStatus = 'queued' | 'running' | 'proposed' | 'approved' | 'error';

export interface StageRun {
  id: StageRunId;
  requestId: RequestId;
  stage: AgenticStage;
  status: StageRunStatus;
  progress: number;
  detail: string | null;
  modelProvider: string | null;
  modelId: string | null;
  costUsd: number;
  createdBy: UserId | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export type RequestKpiSource = 'agent' | 'human';
export type RequestKpiStatus = 'proposed' | 'accepted' | 'rejected';

/** A proposed/edited product KPI attached to a request (stage-2 output). */
export interface RequestKpi {
  id: RequestKpiId;
  requestId: RequestId;
  name: string;
  target: string;
  rationale: string | null;
  source: RequestKpiSource;
  status: RequestKpiStatus;
  position: number;
  createdBy: UserId | null;
  updatedAt: string;
  createdAt: string;
}

/**
 * The output of an artifact-producing stage (design/build/qa/staging): one row
 * per proposed/edited item — a design section, a build task, a QA case, a
 * release-checklist entry. Agent-proposed then human-editable (same HITL gate as
 * KPIs), keyed by `stage`.
 */
export interface StageArtifact {
  id: StageArtifactId;
  requestId: RequestId;
  stage: ArtifactStage;
  title: string;
  content: string | null;
  source: RequestKpiSource;
  status: RequestKpiStatus;
  position: number;
  createdBy: UserId | null;
  updatedAt: string;
  createdAt: string;
}

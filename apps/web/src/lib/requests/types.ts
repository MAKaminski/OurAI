import type {
  RequestStage,
  RequestPriority,
  AgenticStage,
  StageRunStatus,
  RequestKpiSource,
  RequestKpiStatus,
} from '@ourai/shared';

/** A request as returned to the web app (camelCase view of `ourai.requests`). */
export interface RequestView {
  id: string;
  companyId: string;
  title: string;
  body: string | null;
  stage: RequestStage;
  priority: RequestPriority;
  actingRole: string | null;
  submittedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestRow {
  id: string;
  company_id: string;
  title: string;
  body: string | null;
  stage: RequestStage;
  priority: RequestPriority;
  acting_role: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export const REQUEST_COLUMNS =
  'id,company_id,title,body,stage,priority,acting_role,submitted_by,created_at,updated_at';

export function toRequestView(r: RequestRow): RequestView {
  return {
    id: r.id,
    companyId: r.company_id,
    title: r.title,
    body: r.body,
    stage: r.stage,
    priority: r.priority,
    actingRole: r.acting_role,
    submittedBy: r.submitted_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** A KPI as returned to the web app (camelCase view of `ourai.request_kpis`). */
export interface KpiView {
  id: string;
  requestId: string;
  name: string;
  target: string;
  rationale: string | null;
  source: RequestKpiSource;
  status: RequestKpiStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface KpiRow {
  id: string;
  request_id: string;
  name: string;
  target: string;
  rationale: string | null;
  source: RequestKpiSource;
  status: RequestKpiStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

export const KPI_COLUMNS =
  'id,request_id,name,target,rationale,source,status,position,created_at,updated_at';

export function toKpiView(r: KpiRow): KpiView {
  return {
    id: r.id,
    requestId: r.request_id,
    name: r.name,
    target: r.target,
    rationale: r.rationale,
    source: r.source,
    status: r.status,
    position: r.position,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** A stage-run as returned to the web app (camelCase view of `ourai.request_stage_runs`). */
export interface StageRunView {
  id: string;
  requestId: string;
  stage: AgenticStage;
  status: StageRunStatus;
  progress: number;
  detail: string | null;
  modelProvider: string | null;
  modelId: string | null;
  costUsd: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface StageRunRow {
  id: string;
  request_id: string;
  stage: AgenticStage;
  status: StageRunStatus;
  progress: number;
  detail: string | null;
  model_provider: string | null;
  model_id: string | null;
  cost_usd: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export const STAGE_RUN_COLUMNS =
  'id,request_id,stage,status,progress,detail,model_provider,model_id,cost_usd,created_at,started_at,completed_at';

export function toStageRunView(r: StageRunRow): StageRunView {
  return {
    id: r.id,
    requestId: r.request_id,
    stage: r.stage,
    status: r.status,
    progress: r.progress,
    detail: r.detail,
    modelProvider: r.model_provider,
    modelId: r.model_id,
    costUsd: Number(r.cost_usd),
    createdAt: r.created_at,
    startedAt: r.started_at,
    completedAt: r.completed_at,
  };
}

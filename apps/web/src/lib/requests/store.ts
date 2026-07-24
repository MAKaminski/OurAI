import type { SupabaseClient } from '@supabase/supabase-js';
import {
  assertRequestTransition,
  type ArtifactStage,
  type CreateRequestInput,
  type KpiInput,
  type RequestStage,
  type StageArtifactInput,
} from '@ourai/shared';
import {
  ARTIFACT_COLUMNS,
  KPI_COLUMNS,
  REQUEST_COLUMNS,
  STAGE_RUN_COLUMNS,
  toArtifactView,
  toKpiView,
  toRequestView,
  toStageRunView,
  type ArtifactRow,
  type ArtifactView,
  type KpiRow,
  type KpiView,
  type RequestRow,
  type RequestView,
  type StageRunRow,
  type StageRunView,
} from './types';
import { runKpiAgent } from './kpiAgent';
import { runStageAgent, type PriorContext } from './stageAgent';
import { getModelOrder } from '@/lib/companies/modelOrder';

/** Each artifact stage advances to the next request stage on approval. */
const NEXT_STAGE: Record<ArtifactStage, RequestStage> = {
  design: 'build',
  build: 'qa',
  qa: 'staging',
  staging: 'done',
};

/** The earlier artifact stages whose approved output seeds each stage's agent. */
const PRIOR_ARTIFACT_STAGES: Record<ArtifactStage, ArtifactStage[]> = {
  design: [],
  build: ['design'],
  qa: ['design', 'build'],
  staging: ['build', 'qa'],
};

// ---------------------------------------------------------------- requests

export async function listRequests(
  supabase: SupabaseClient,
  companyId: string,
): Promise<RequestView[]> {
  const { data, error } = await supabase
    .from('requests')
    .select(REQUEST_COLUMNS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`list requests failed: ${error.message}`);
  return (data as RequestRow[]).map(toRequestView);
}

export async function getRequest(
  supabase: SupabaseClient,
  requestId: string,
): Promise<RequestView | null> {
  const { data, error } = await supabase
    .from('requests')
    .select(REQUEST_COLUMNS)
    .eq('id', requestId)
    .maybeSingle();
  if (error) throw new Error(`get request failed: ${error.message}`);
  return data ? toRequestView(data as RequestRow) : null;
}

export async function createRequest(
  supabase: SupabaseClient,
  companyId: string,
  userId: string,
  input: CreateRequestInput,
): Promise<RequestView> {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      company_id: companyId,
      title: input.title,
      body: input.body,
      priority: input.priority,
      acting_role: input.actingRole,
      submitted_by: userId,
      stage: 'intake',
    })
    .select(REQUEST_COLUMNS)
    .single();
  if (error) throw new Error(`create request failed: ${error.message}`);
  return toRequestView(data as RequestRow);
}

/** Transition a request's stage, enforcing the shared state machine. */
export async function advanceStage(
  supabase: SupabaseClient,
  requestId: string,
  to: RequestStage,
): Promise<RequestView> {
  const current = await getRequest(supabase, requestId);
  if (!current) throw new Error('request not found');
  assertRequestTransition(current.stage, to);
  const { data, error } = await supabase
    .from('requests')
    .update({ stage: to, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select(REQUEST_COLUMNS)
    .single();
  if (error) throw new Error(`advance stage failed: ${error.message}`);
  return toRequestView(data as RequestRow);
}

// -------------------------------------------------------------------- kpis

export async function listKpis(supabase: SupabaseClient, requestId: string): Promise<KpiView[]> {
  const { data, error } = await supabase
    .from('request_kpis')
    .select(KPI_COLUMNS)
    .eq('request_id', requestId)
    .order('position');
  if (error) throw new Error(`list kpis failed: ${error.message}`);
  return (data as KpiRow[]).map(toKpiView);
}

/** Insert a manual KPI (human source) or update an existing one's fields. */
export async function upsertKpi(
  supabase: SupabaseClient,
  requestId: string,
  userId: string,
  input: KpiInput,
  kpiId?: string,
): Promise<KpiView> {
  if (kpiId) {
    const { data, error } = await supabase
      .from('request_kpis')
      .update({
        name: input.name,
        target: input.target,
        rationale: input.rationale,
        updated_at: new Date().toISOString(),
      })
      .eq('id', kpiId)
      .eq('request_id', requestId)
      .select(KPI_COLUMNS)
      .single();
    if (error) throw new Error(`update kpi failed: ${error.message}`);
    return toKpiView(data as KpiRow);
  }

  // Append after the current max position.
  const { data: last } = await supabase
    .from('request_kpis')
    .select('position')
    .eq('request_id', requestId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = ((last as { position: number } | null)?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('request_kpis')
    .insert({
      request_id: requestId,
      name: input.name,
      target: input.target,
      rationale: input.rationale,
      source: 'human',
      status: 'accepted',
      position,
      created_by: userId,
    })
    .select(KPI_COLUMNS)
    .single();
  if (error) throw new Error(`insert kpi failed: ${error.message}`);
  return toKpiView(data as KpiRow);
}

export async function deleteKpi(
  supabase: SupabaseClient,
  requestId: string,
  kpiId: string,
): Promise<void> {
  const { error } = await supabase
    .from('request_kpis')
    .delete()
    .eq('id', kpiId)
    .eq('request_id', requestId);
  if (error) throw new Error(`delete kpi failed: ${error.message}`);
}

// -------------------------------------------------------------- kpi stage

export interface KpiStageResult {
  run: StageRunView;
  kpis: KpiView[];
}

/**
 * Run the KPI agent stage for a request: open a stage-run (running), call the
 * model, replace prior agent-proposed KPIs with the fresh proposal, and flip
 * the run to `proposed` (the human-in-the-loop gate). Advances an `intake`
 * request to `kpi_review`. Re-runnable while in `intake`/`kpi_review`.
 */
export async function runKpiStage(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
): Promise<KpiStageResult> {
  const request = await getRequest(supabase, requestId);
  if (!request) throw new Error('request not found');
  if (request.stage !== 'intake' && request.stage !== 'kpi_review') {
    throw new Error(`KPIs can only be generated before design (stage: ${request.stage})`);
  }

  const { data: runData, error: runErr } = await supabase
    .from('request_stage_runs')
    .insert({
      request_id: requestId,
      stage: 'kpi',
      status: 'running',
      progress: 10,
      created_by: userId,
      started_at: new Date().toISOString(),
    })
    .select(STAGE_RUN_COLUMNS)
    .single();
  if (runErr) throw new Error(`open stage run failed: ${runErr.message}`);
  const runId = (runData as StageRunRow).id;

  let result;
  try {
    const order = await getModelOrder(supabase, request.companyId);
    result = await runKpiAgent(
      supabase,
      userId,
      { title: request.title, body: request.body },
      order,
    );
  } catch (err) {
    await supabase
      .from('request_stage_runs')
      .update({
        status: 'error',
        detail: String(err instanceof Error ? err.message : err),
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);
    throw err;
  }

  // Replace any prior agent proposal so a re-run is idempotent; keep human rows.
  await supabase.from('request_kpis').delete().eq('request_id', requestId).eq('source', 'agent');

  const rows = result.kpis.map((k, i) => ({
    request_id: requestId,
    name: k.name,
    target: k.target,
    rationale: k.rationale,
    source: 'agent' as const,
    status: 'proposed' as const,
    position: i,
    created_by: userId,
  }));
  const { error: kpiErr } = await supabase.from('request_kpis').insert(rows);
  if (kpiErr) throw new Error(`insert proposed kpis failed: ${kpiErr.message}`);

  const { data: doneRun, error: doneErr } = await supabase
    .from('request_stage_runs')
    .update({
      status: 'proposed',
      progress: 100,
      model_provider: result.provider,
      model_id: result.modelId,
      cost_usd: result.usage.costUsd ?? 0,
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId)
    .select(STAGE_RUN_COLUMNS)
    .single();
  if (doneErr) throw new Error(`finalize stage run failed: ${doneErr.message}`);

  if (request.stage === 'intake') {
    await advanceStage(supabase, requestId, 'kpi_review');
  }

  return { run: toStageRunView(doneRun as StageRunRow), kpis: await listKpis(supabase, requestId) };
}

/**
 * Approve the KPI stage (the HITL gate): accept all proposed KPIs, mark the
 * latest KPI run `approved`, and advance the request `kpi_review → design`.
 */
export async function approveKpis(
  supabase: SupabaseClient,
  requestId: string,
): Promise<RequestView> {
  const request = await getRequest(supabase, requestId);
  if (!request) throw new Error('request not found');
  assertRequestTransition(request.stage, 'design');

  const kpis = await listKpis(supabase, requestId);
  if (kpis.length === 0) throw new Error('cannot approve: no KPIs to approve');

  const { error: acceptErr } = await supabase
    .from('request_kpis')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('request_id', requestId)
    .eq('status', 'proposed');
  if (acceptErr) throw new Error(`accept kpis failed: ${acceptErr.message}`);

  // Flip the most recent KPI run to approved (best-effort, non-fatal).
  const { data: latest } = await supabase
    .from('request_stage_runs')
    .select('id')
    .eq('request_id', requestId)
    .eq('stage', 'kpi')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest) {
    await supabase
      .from('request_stage_runs')
      .update({ status: 'approved' })
      .eq('id', (latest as { id: string }).id);
  }

  return advanceStage(supabase, requestId, 'design');
}

// ---------------------------------------------------------- stage artifacts

export async function listArtifacts(
  supabase: SupabaseClient,
  requestId: string,
  stage: ArtifactStage,
): Promise<ArtifactView[]> {
  const { data, error } = await supabase
    .from('request_stage_artifacts')
    .select(ARTIFACT_COLUMNS)
    .eq('request_id', requestId)
    .eq('stage', stage)
    .order('position');
  if (error) throw new Error(`list artifacts failed: ${error.message}`);
  return (data as ArtifactRow[]).map(toArtifactView);
}

/** Insert a manual artifact (human source) or update an existing one's fields. */
export async function upsertArtifact(
  supabase: SupabaseClient,
  requestId: string,
  userId: string,
  stage: ArtifactStage,
  input: StageArtifactInput,
  artifactId?: string,
): Promise<ArtifactView> {
  if (artifactId) {
    const { data, error } = await supabase
      .from('request_stage_artifacts')
      .update({ title: input.title, content: input.content, updated_at: new Date().toISOString() })
      .eq('id', artifactId)
      .eq('request_id', requestId)
      .select(ARTIFACT_COLUMNS)
      .single();
    if (error) throw new Error(`update artifact failed: ${error.message}`);
    return toArtifactView(data as ArtifactRow);
  }

  const { data: last } = await supabase
    .from('request_stage_artifacts')
    .select('position')
    .eq('request_id', requestId)
    .eq('stage', stage)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = ((last as { position: number } | null)?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('request_stage_artifacts')
    .insert({
      request_id: requestId,
      stage,
      title: input.title,
      content: input.content,
      source: 'human',
      status: 'accepted',
      position,
      created_by: userId,
    })
    .select(ARTIFACT_COLUMNS)
    .single();
  if (error) throw new Error(`insert artifact failed: ${error.message}`);
  return toArtifactView(data as ArtifactRow);
}

export async function deleteArtifact(
  supabase: SupabaseClient,
  requestId: string,
  artifactId: string,
): Promise<void> {
  const { error } = await supabase
    .from('request_stage_artifacts')
    .delete()
    .eq('id', artifactId)
    .eq('request_id', requestId);
  if (error) throw new Error(`delete artifact failed: ${error.message}`);
}

export interface StageResult {
  run: StageRunView;
  artifacts: ArtifactView[];
}

/** Gather approved prior-stage output (KPIs + earlier artifacts) as agent context. */
async function priorContextFor(
  supabase: SupabaseClient,
  requestId: string,
  stage: ArtifactStage,
): Promise<PriorContext[]> {
  const prior: PriorContext[] = [];
  // KPIs seed every downstream stage.
  const kpis = await listKpis(supabase, requestId);
  if (kpis.length > 0) {
    prior.push({
      label: 'KPIs',
      items: kpis.map((k) => ({
        title: k.name,
        content: `${k.target}${k.rationale ? ` — ${k.rationale}` : ''}`,
      })),
    });
  }
  for (const s of PRIOR_ARTIFACT_STAGES[stage]) {
    const items = await listArtifacts(supabase, requestId, s);
    if (items.length > 0) {
      prior.push({ label: s, items: items.map((a) => ({ title: a.title, content: a.content })) });
    }
  }
  return prior;
}

/**
 * Run an artifact-producing stage agent (design/build/qa/staging): open a
 * stage-run (running), call the model with prior approved output as context,
 * replace prior agent artifacts with the fresh proposal, and flip the run to
 * `proposed` (the human-in-the-loop gate). The request must already be in that
 * stage. Re-runnable while in-stage.
 */
export async function runAgentStage(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
  stage: ArtifactStage,
): Promise<StageResult> {
  const request = await getRequest(supabase, requestId);
  if (!request) throw new Error('request not found');
  if (request.stage !== stage) {
    throw new Error(`request is in '${request.stage}', not '${stage}'`);
  }

  const { data: runData, error: runErr } = await supabase
    .from('request_stage_runs')
    .insert({
      request_id: requestId,
      stage,
      status: 'running',
      progress: 10,
      created_by: userId,
      started_at: new Date().toISOString(),
    })
    .select(STAGE_RUN_COLUMNS)
    .single();
  if (runErr) throw new Error(`open stage run failed: ${runErr.message}`);
  const runId = (runData as StageRunRow).id;

  let result;
  try {
    const prior = await priorContextFor(supabase, requestId, stage);
    const order = await getModelOrder(supabase, request.companyId);
    result = await runStageAgent(
      supabase,
      userId,
      stage,
      { title: request.title, body: request.body },
      prior,
      order,
    );
  } catch (err) {
    await supabase
      .from('request_stage_runs')
      .update({
        status: 'error',
        detail: String(err instanceof Error ? err.message : err),
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);
    throw err;
  }

  // Replace any prior agent proposal for this stage so a re-run is idempotent.
  await supabase
    .from('request_stage_artifacts')
    .delete()
    .eq('request_id', requestId)
    .eq('stage', stage)
    .eq('source', 'agent');

  const rows = result.items.map((it, i) => ({
    request_id: requestId,
    stage,
    title: it.title,
    content: it.content,
    source: 'agent' as const,
    status: 'proposed' as const,
    position: i,
    created_by: userId,
  }));
  const { error: artErr } = await supabase.from('request_stage_artifacts').insert(rows);
  if (artErr) throw new Error(`insert proposed artifacts failed: ${artErr.message}`);

  const { data: doneRun, error: doneErr } = await supabase
    .from('request_stage_runs')
    .update({
      status: 'proposed',
      progress: 100,
      model_provider: result.provider,
      model_id: result.modelId,
      cost_usd: result.usage.costUsd ?? 0,
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId)
    .select(STAGE_RUN_COLUMNS)
    .single();
  if (doneErr) throw new Error(`finalize stage run failed: ${doneErr.message}`);

  return {
    run: toStageRunView(doneRun as StageRunRow),
    artifacts: await listArtifacts(supabase, requestId, stage),
  };
}

/**
 * Approve an artifact stage (the HITL gate): accept its artifacts, mark the
 * latest run `approved`, and advance the request to the next stage
 * (`design → build → qa → staging → done`).
 */
export async function approveStage(
  supabase: SupabaseClient,
  requestId: string,
  stage: ArtifactStage,
): Promise<RequestView> {
  const request = await getRequest(supabase, requestId);
  if (!request) throw new Error('request not found');
  if (request.stage !== stage) {
    throw new Error(`request is in '${request.stage}', not '${stage}'`);
  }
  const next = NEXT_STAGE[stage];
  assertRequestTransition(request.stage, next);

  const artifacts = await listArtifacts(supabase, requestId, stage);
  if (artifacts.length === 0) throw new Error(`cannot approve: no ${stage} items to approve`);

  const { error: acceptErr } = await supabase
    .from('request_stage_artifacts')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('request_id', requestId)
    .eq('stage', stage)
    .eq('status', 'proposed');
  if (acceptErr) throw new Error(`accept artifacts failed: ${acceptErr.message}`);

  const { data: latest } = await supabase
    .from('request_stage_runs')
    .select('id')
    .eq('request_id', requestId)
    .eq('stage', stage)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest) {
    await supabase
      .from('request_stage_runs')
      .update({ status: 'approved' })
      .eq('id', (latest as { id: string }).id);
  }

  return advanceStage(supabase, requestId, next);
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContextCollection, ContextItem, ContextJob, ContextScope, JobKind } from './types';

const ownerCol = (scope: ContextScope) => (scope === 'org' ? 'org_id' : 'user_id');

function scopeCols(scope: ContextScope, ownerId: string) {
  return {
    scope,
    org_id: scope === 'org' ? ownerId : null,
    user_id: scope === 'user' ? ownerId : null,
  };
}

// ---- collections ----
export async function listCollections(
  supabase: SupabaseClient,
  scope: ContextScope,
  ownerId: string,
): Promise<ContextCollection[]> {
  const { data, error } = await supabase
    .from('context_collections')
    .select('id,name,position')
    .eq('scope', scope)
    .eq(ownerCol(scope), ownerId)
    .order('position');
  if (error) throw new Error(`list collections failed: ${error.message}`);
  return (data ?? []) as ContextCollection[];
}

export async function createCollection(
  supabase: SupabaseClient,
  scope: ContextScope,
  ownerId: string,
  userId: string,
  name: string,
): Promise<void> {
  const { error } = await supabase
    .from('context_collections')
    .insert({ ...scopeCols(scope, ownerId), name, created_by: userId });
  if (error) throw new Error(`create collection failed: ${error.message}`);
}

// ---- items ----
interface ItemRow {
  id: string;
  collection_id: string | null;
  title: string;
  body: string;
  tags: string[];
  position: number;
  updated_at: string;
}

export async function listItems(
  supabase: SupabaseClient,
  scope: ContextScope,
  ownerId: string,
): Promise<ContextItem[]> {
  const { data, error } = await supabase
    .from('context_items')
    .select('id,collection_id,title,body,tags,position,updated_at')
    .eq('scope', scope)
    .eq(ownerCol(scope), ownerId)
    .order('position')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(`list items failed: ${error.message}`);
  return (data as ItemRow[]).map((r) => ({
    id: r.id,
    collectionId: r.collection_id,
    title: r.title,
    body: r.body,
    tags: r.tags ?? [],
    position: r.position,
    updatedAt: r.updated_at,
  }));
}

export async function createItem(
  supabase: SupabaseClient,
  scope: ContextScope,
  ownerId: string,
  userId: string,
  input: { title: string; body: string; tags: string[]; collectionId: string | null },
): Promise<void> {
  const { error } = await supabase.from('context_items').insert({
    ...scopeCols(scope, ownerId),
    collection_id: input.collectionId,
    title: input.title,
    body: input.body,
    tags: input.tags,
    created_by: userId,
  });
  if (error) throw new Error(`create item failed: ${error.message}`);
}

export async function deleteItem(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('context_items').delete().eq('id', id);
  if (error) throw new Error(`delete item failed: ${error.message}`);
}

// ---- jobs (AI-processing progress meters) ----
const DURATION_MS: Record<JobKind, number> = { organize: 6000, sort: 3000, ingest: 8000 };

interface JobRow {
  id: string;
  kind: JobKind;
  status: ContextJob['status'];
  progress: number;
  detail: string | null;
  created_at: string;
}

function toJob(r: JobRow): ContextJob {
  return {
    id: r.id,
    kind: r.kind,
    status: r.status,
    progress: r.progress,
    detail: r.detail,
    createdAt: r.created_at,
  };
}

export async function createJob(
  supabase: SupabaseClient,
  scope: ContextScope,
  ownerId: string,
  userId: string,
  kind: JobKind,
): Promise<void> {
  const { error } = await supabase.from('context_jobs').insert({
    ...scopeCols(scope, ownerId),
    kind,
    status: 'running',
    progress: 0,
    detail:
      kind === 'organize'
        ? 'Grouping related context…'
        : kind === 'sort'
          ? 'Sorting by relevance…'
          : 'Ingesting…',
    created_by: userId,
  });
  if (error) throw new Error(`create job failed: ${error.message}`);
}

/**
 * Advance running jobs. Progress is derived from elapsed wall-clock against a
 * per-kind duration — a stand-in for real agent processing so the progress
 * meters animate end-to-end. Real agent jobs will write progress directly.
 */
export async function listAndAdvanceJobs(
  supabase: SupabaseClient,
  scope: ContextScope,
  ownerId: string,
): Promise<ContextJob[]> {
  const { data, error } = await supabase
    .from('context_jobs')
    .select('id,kind,status,progress,detail,created_at')
    .eq('scope', scope)
    .eq(ownerCol(scope), ownerId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw new Error(`list jobs failed: ${error.message}`);

  const rows = (data as JobRow[]) ?? [];
  const now = Date.now();
  const advanced = await Promise.all(
    rows.map(async (r) => {
      if (r.status !== 'running') return toJob(r);
      const elapsed = now - new Date(r.created_at).getTime();
      const pct = Math.min(100, Math.floor((elapsed / DURATION_MS[r.kind]) * 100));
      const done = pct >= 100;
      if (pct !== r.progress || done) {
        await supabase
          .from('context_jobs')
          .update({
            progress: pct,
            status: done ? 'done' : 'running',
            detail: done ? 'Complete' : r.detail,
            updated_at: new Date(now).toISOString(),
          })
          .eq('id', r.id);
      }
      return toJob({ ...r, progress: pct, status: done ? 'done' : 'running' });
    }),
  );
  return advanced;
}

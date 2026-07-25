import type { SupabaseClient } from '@supabase/supabase-js';

/** The engines a data source may use (matches the DB check constraint). */
export type DataSourceEngine = 'postgres' | 'mysql' | 'bigquery' | 'snowflake' | 'rest';

/** A blueprint map as returned to the web app (camelCase view of the row). */
export interface BlueprintMap {
  id: string;
  orgId: string;
  name: string;
  /** The nodes+edges diagram document (opaque JSON to the persistence layer). */
  doc: unknown;
  version: number;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
}

interface BlueprintMapRow {
  id: string;
  org_id: string;
  name: string;
  doc: unknown;
  version: number;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

const BLUEPRINT_COLUMNS = 'id,org_id,name,doc,version,updated_by,updated_at,created_at';

function toBlueprintMap(r: BlueprintMapRow): BlueprintMap {
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    doc: r.doc,
    version: r.version,
    updatedBy: r.updated_by,
    updatedAt: r.updated_at,
    createdAt: r.created_at,
  };
}

/** The org's latest blueprint map (null when RLS hides it or none exists). */
export async function getBlueprint(
  supabase: SupabaseClient,
  orgId: string,
): Promise<BlueprintMap | null> {
  const { data, error } = await supabase
    .from('blueprint_maps')
    .select(BLUEPRINT_COLUMNS)
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`get blueprint failed: ${error.message}`);
  return data ? toBlueprintMap(data as BlueprintMapRow) : null;
}

/**
 * Save the org's blueprint. One logical blueprint per org: update-then-insert
 * (avoids relying on upsert against PostgREST — mirrors `setModelOrder`). On
 * update the `version` is bumped so callers can detect concurrent writes. RLS
 * rejects writes for non-members.
 */
export async function saveBlueprint(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  name: string,
  doc: unknown,
): Promise<BlueprintMap> {
  const { data: existing, error: findErr } = await supabase
    .from('blueprint_maps')
    .select('id,version')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findErr) throw new Error(`save blueprint failed: ${findErr.message}`);

  if (existing) {
    const current = existing as { id: string; version: number };
    const { data, error } = await supabase
      .from('blueprint_maps')
      .update({
        name,
        doc,
        version: current.version + 1,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', current.id)
      .select(BLUEPRINT_COLUMNS)
      .single();
    if (error) throw new Error(`update blueprint failed: ${error.message}`);
    return toBlueprintMap(data as BlueprintMapRow);
  }

  const { data, error } = await supabase
    .from('blueprint_maps')
    .insert({ org_id: orgId, name, doc, version: 1, updated_by: userId })
    .select(BLUEPRINT_COLUMNS)
    .single();
  if (error) throw new Error(`insert blueprint failed: ${error.message}`);
  return toBlueprintMap(data as BlueprintMapRow);
}

/** A registered external data source (camelCase view of the row). */
export interface DataSource {
  id: string;
  orgId: string;
  name: string;
  engine: DataSourceEngine;
  /** Key into the org's BYOK secrets holding the connection credentials. */
  secretKey: string;
  schemaCache: unknown;
  lastIntrospectedAt: string | null;
  updatedBy: string | null;
  createdAt: string;
}

interface DataSourceRow {
  id: string;
  org_id: string;
  name: string;
  engine: DataSourceEngine;
  secret_key: string;
  schema_cache: unknown;
  last_introspected_at: string | null;
  updated_by: string | null;
  created_at: string;
}

const DATA_SOURCE_COLUMNS =
  'id,org_id,name,engine,secret_key,schema_cache,last_introspected_at,updated_by,created_at';

function toDataSource(r: DataSourceRow): DataSource {
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    engine: r.engine,
    secretKey: r.secret_key,
    schemaCache: r.schema_cache,
    lastIntrospectedAt: r.last_introspected_at,
    updatedBy: r.updated_by,
    createdAt: r.created_at,
  };
}

/** Data sources for an org (RLS returns only the caller's org rows). */
export async function listDataSources(
  supabase: SupabaseClient,
  orgId: string,
): Promise<DataSource[]> {
  const { data, error } = await supabase
    .from('data_sources')
    .select(DATA_SOURCE_COLUMNS)
    .eq('org_id', orgId)
    .order('created_at');
  if (error) throw new Error(`list data sources failed: ${error.message}`);
  return (data as DataSourceRow[]).map(toDataSource);
}

export interface UpsertDataSourceInput {
  /** Present → update that row; absent → insert a new data source. */
  id?: string;
  name: string;
  engine: DataSourceEngine;
  secretKey: string;
}

/**
 * Create or update a data source. Update-then-insert keyed on `input.id`
 * (mirrors `setModelOrder`), so a missing/RLS-hidden id falls through to an
 * insert only when no id was supplied. RLS rejects writes for non-members.
 */
export async function upsertDataSource(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  input: UpsertDataSourceInput,
): Promise<DataSource> {
  if (input.id) {
    const { data, error } = await supabase
      .from('data_sources')
      .update({
        name: input.name,
        engine: input.engine,
        secret_key: input.secretKey,
        updated_by: userId,
      })
      .eq('id', input.id)
      .eq('org_id', orgId)
      .select(DATA_SOURCE_COLUMNS)
      .single();
    if (error) throw new Error(`update data source failed: ${error.message}`);
    return toDataSource(data as DataSourceRow);
  }

  const { data, error } = await supabase
    .from('data_sources')
    .insert({
      org_id: orgId,
      name: input.name,
      engine: input.engine,
      secret_key: input.secretKey,
      updated_by: userId,
    })
    .select(DATA_SOURCE_COLUMNS)
    .single();
  if (error) throw new Error(`insert data source failed: ${error.message}`);
  return toDataSource(data as DataSourceRow);
}

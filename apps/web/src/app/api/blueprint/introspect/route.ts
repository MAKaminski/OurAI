import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { listDataSources } from '@/lib/blueprint/store';

export const dynamic = 'force-dynamic';

/**
 * POST { orgId, dataSourceId } → introspect a data source's schema.
 *
 * DELIBERATE SAFE STUB: for this MVP we do NOT connect to external databases.
 * Live introspection would require opening an arbitrary network connection to a
 * user-supplied host (postgres/mysql/bigquery/snowflake/rest) — no new deps and
 * no arbitrary network are permitted here. Instead we verify the data source is
 * registered and visible to the caller (RLS-scoped) and return a clearly-labeled
 * `not_implemented` result at HTTP 200. Wire real introspection in a later slice.
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ ok: false, error: 'not configured' }, { status: 501 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { orgId?: string; dataSourceId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const orgId = (body.orgId ?? '').trim();
  const dataSourceId = (body.dataSourceId ?? '').trim();
  if (!orgId) return NextResponse.json({ ok: false, error: 'orgId is required' }, { status: 400 });
  if (!dataSourceId) {
    return NextResponse.json({ ok: false, error: 'dataSourceId is required' }, { status: 400 });
  }

  try {
    // Look up the data source under the user-scoped (RLS) client — a non-member
    // or missing id yields no match and a 404.
    const sources = await listDataSources(supabase, orgId);
    const source = sources.find((s) => s.id === dataSourceId);
    if (!source) {
      return NextResponse.json({ ok: false, error: 'data source not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      status: 'not_implemented',
      message: 'Live schema introspection is not yet enabled; the data source is registered.',
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

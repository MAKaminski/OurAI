import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getBlueprint, saveBlueprint } from '@/lib/blueprint/store';

export const dynamic = 'force-dynamic';

/** GET ?orgId= → the org's latest blueprint map (RLS-scoped). */
export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ configured: false, map: null });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const orgId = new URL(request.url).searchParams.get('orgId')?.trim() ?? '';
  if (!orgId) return NextResponse.json({ error: 'orgId is required' }, { status: 400 });

  try {
    return NextResponse.json({ configured: true, map: await getBlueprint(supabase, orgId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** PUT { orgId, name, doc } → save the org's blueprint. Membership via RLS. */
export async function PUT(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ ok: false, error: 'not configured' }, { status: 501 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { orgId?: string; name?: string; doc?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const orgId = (body.orgId ?? '').trim();
  if (!orgId) return NextResponse.json({ ok: false, error: 'orgId is required' }, { status: 400 });
  if (!isPlainObject(body.doc)) {
    return NextResponse.json({ ok: false, error: 'doc must be an object' }, { status: 400 });
  }
  const name = (body.name ?? '').trim() || 'Blueprint';

  try {
    const map = await saveBlueprint(supabase, orgId, user.id, name, body.doc);
    return NextResponse.json({ ok: true, map });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

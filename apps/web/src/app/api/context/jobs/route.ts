import { NextResponse } from 'next/server';
import { contextAuth, ownerFor, parseScope } from '@/lib/context/routeAuth';
import { createJob, listAndAdvanceJobs } from '@/lib/context/store';
import type { JobKind } from '@/lib/context/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const a = await contextAuth();
  if ('error' in a) return a.error;
  const { searchParams } = new URL(request.url);
  const scope = parseScope(searchParams.get('scope'));
  if (!scope) return NextResponse.json({ error: 'scope must be org|user' }, { status: 400 });
  const ownerId = ownerFor(scope, searchParams.get('orgId'), a.user.id);
  if (!ownerId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  try {
    return NextResponse.json({ jobs: await listAndAdvanceJobs(a.supabase, scope, ownerId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const a = await contextAuth();
  if ('error' in a) return a.error;
  let body: { scope?: string; orgId?: string; kind?: JobKind };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const scope = parseScope(body.scope ?? null);
  if (!scope)
    return NextResponse.json({ ok: false, error: 'scope must be org|user' }, { status: 400 });
  const ownerId = ownerFor(scope, body.orgId ?? null, a.user.id);
  if (!ownerId) return NextResponse.json({ ok: false, error: 'orgId required' }, { status: 400 });
  const kind = body.kind;
  if (kind !== 'organize' && kind !== 'sort' && kind !== 'ingest') {
    return NextResponse.json({ ok: false, error: 'invalid kind' }, { status: 400 });
  }
  try {
    await createJob(a.supabase, scope, ownerId, a.user.id, kind);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

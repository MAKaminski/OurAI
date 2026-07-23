import { NextResponse } from 'next/server';
import { contextAuth, ownerFor, parseScope } from '@/lib/context/routeAuth';
import { createCollection, listCollections } from '@/lib/context/store';

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
    return NextResponse.json({ collections: await listCollections(a.supabase, scope, ownerId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const a = await contextAuth();
  if ('error' in a) return a.error;
  let body: { scope?: string; orgId?: string; name?: string };
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
  const name = (body.name ?? '').trim();
  if (name.length < 1 || name.length > 80) {
    return NextResponse.json({ ok: false, error: 'invalid name' }, { status: 400 });
  }
  try {
    await createCollection(a.supabase, scope, ownerId, a.user.id, name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

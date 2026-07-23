import { NextResponse } from 'next/server';
import { contextAuth, ownerFor, parseScope } from '@/lib/context/routeAuth';
import { createItem, deleteItem, listItems } from '@/lib/context/store';

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
    return NextResponse.json({ items: await listItems(a.supabase, scope, ownerId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

interface CreateBody {
  scope?: string;
  orgId?: string;
  title?: string;
  body?: string;
  tags?: string[];
  collectionId?: string | null;
}

export async function POST(request: Request) {
  const a = await contextAuth();
  if ('error' in a) return a.error;
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const scope = parseScope(body.scope ?? null);
  if (!scope)
    return NextResponse.json({ ok: false, error: 'scope must be org|user' }, { status: 400 });
  const ownerId = ownerFor(scope, body.orgId ?? null, a.user.id);
  if (!ownerId) return NextResponse.json({ ok: false, error: 'orgId required' }, { status: 400 });
  const title = (body.title ?? '').trim().slice(0, 200);
  if (title.length < 1)
    return NextResponse.json({ ok: false, error: 'title required' }, { status: 400 });
  try {
    await createItem(a.supabase, scope, ownerId, a.user.id, {
      title,
      body: (body.body ?? '').slice(0, 20000),
      tags: (body.tags ?? [])
        .slice(0, 20)
        .map((t) => t.trim())
        .filter(Boolean),
      collectionId: body.collectionId ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const a = await contextAuth();
  if ('error' in a) return a.error;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  try {
    await deleteItem(a.supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

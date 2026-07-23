import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { deleteSecret, listSecrets, upsertSecret, type SecretScope } from '@/lib/secrets/store';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const KEY_RE = /^[A-Za-z0-9_.-]{1,64}$/;

async function auth(): Promise<{ supabase: SupabaseClient; user: User } | { error: NextResponse }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: 'not configured' }, { status: 501 }) };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  return { supabase, user };
}

/** Resolve the owner id for a scope. Org scope requires an orgId (RLS then
 * checks membership); user scope always resolves to the caller. */
function ownerFor(scope: SecretScope, orgId: string | null, userId: string): string | null {
  if (scope === 'user') return userId;
  if (scope === 'org') return orgId;
  return null;
}

export async function GET(request: Request) {
  const a = await auth();
  if ('error' in a) return a.error;
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') as SecretScope | null;
  const orgId = searchParams.get('orgId');
  if (scope !== 'org' && scope !== 'user') {
    return NextResponse.json({ error: 'scope must be org|user' }, { status: 400 });
  }
  const ownerId = ownerFor(scope, orgId, a.user.id);
  if (!ownerId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  try {
    return NextResponse.json({ secrets: await listSecrets(a.supabase, scope, ownerId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

interface UpsertBody {
  scope?: SecretScope;
  orgId?: string;
  key?: string;
  value?: string;
  isSensitive?: boolean;
}

export async function POST(request: Request) {
  const a = await auth();
  if ('error' in a) return a.error;
  let body: UpsertBody;
  try {
    body = (await request.json()) as UpsertBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const scope = body.scope;
  if (scope !== 'org' && scope !== 'user') {
    return NextResponse.json({ ok: false, error: 'scope must be org|user' }, { status: 400 });
  }
  const ownerId = ownerFor(scope, body.orgId ?? null, a.user.id);
  if (!ownerId) return NextResponse.json({ ok: false, error: 'orgId required' }, { status: 400 });
  const key = (body.key ?? '').trim();
  const value = body.value ?? '';
  if (!KEY_RE.test(key)) {
    return NextResponse.json({ ok: false, error: 'invalid key' }, { status: 400 });
  }
  if (value.length === 0) {
    return NextResponse.json({ ok: false, error: 'value is required' }, { status: 400 });
  }
  try {
    await upsertSecret(
      a.supabase,
      scope,
      ownerId,
      a.user.id,
      key,
      value,
      Boolean(body.isSensitive),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const a = await auth();
  if ('error' in a) return a.error;
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') as SecretScope | null;
  const orgId = searchParams.get('orgId');
  const key = searchParams.get('key') ?? '';
  if (scope !== 'org' && scope !== 'user') {
    return NextResponse.json({ ok: false, error: 'scope must be org|user' }, { status: 400 });
  }
  const ownerId = ownerFor(scope, orgId, a.user.id);
  if (!ownerId) return NextResponse.json({ ok: false, error: 'orgId required' }, { status: 400 });
  if (!KEY_RE.test(key)) {
    return NextResponse.json({ ok: false, error: 'invalid key' }, { status: 400 });
  }
  try {
    await deleteSecret(a.supabase, scope, ownerId, key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

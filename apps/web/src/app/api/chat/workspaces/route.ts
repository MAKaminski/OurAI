import { NextResponse } from 'next/server';
import { chatAuth } from '@/lib/chat/routeAuth';
import { createWorkspace, ensureProfile, listWorkspaces } from '@/lib/chat/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await chatAuth();
  if ('error' in a) return a.error;
  try {
    // Make sure the caller has a profile before they enter chat.
    await ensureProfile(a.supabase, a.user);
    return NextResponse.json({ workspaces: await listWorkspaces(a.supabase) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const a = await chatAuth();
  if ('error' in a) return a.error;
  let body: { name?: string; orgId?: string };
  try {
    body = (await request.json()) as { name?: string; orgId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const name = (body.name ?? '').trim();
  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ ok: false, error: 'name must be 2–80 chars' }, { status: 400 });
  }
  try {
    const workspace = await createWorkspace(a.supabase, a.user.id, name, body.orgId ?? null);
    return NextResponse.json({ ok: true, workspace });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

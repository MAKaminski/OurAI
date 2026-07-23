import { NextResponse } from 'next/server';
import { chatAuth } from '@/lib/chat/routeAuth';
import { enrichMessages, listMessages, listProfiles, sendMessage } from '@/lib/chat/store';
import type { Profile } from '@/lib/chat/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const a = await chatAuth();
  if ('error' in a) return a.error;
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const since = Number.parseInt(searchParams.get('since') ?? '0', 10) || 0;
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
  }
  try {
    const [messages, profiles] = await Promise.all([
      listMessages(a.supabase, workspaceId, since),
      listProfiles(a.supabase),
    ]);
    const byId = new Map<string, Profile>(profiles.map((p) => [p.userId, p]));
    return NextResponse.json({ messages: enrichMessages(messages, byId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

interface SendBody {
  workspaceId?: string;
  body?: string;
  mentions?: string[];
}

export async function POST(request: Request) {
  const a = await chatAuth();
  if ('error' in a) return a.error;
  let body: SendBody;
  try {
    body = (await request.json()) as SendBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const workspaceId = body.workspaceId ?? '';
  const text = (body.body ?? '').trim().slice(0, 4000);
  if (!workspaceId)
    return NextResponse.json({ ok: false, error: 'workspaceId required' }, { status: 400 });
  if (text.length < 1)
    return NextResponse.json({ ok: false, error: 'message is required' }, { status: 400 });
  try {
    await sendMessage(a.supabase, workspaceId, a.user.id, text, body.mentions ?? []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { chatAuth } from '@/lib/chat/routeAuth';
import { listProfiles } from '@/lib/chat/store';

export const dynamic = 'force-dynamic';

/** Profiles for @-mention autocomplete (display name + alias; no emails). */
export async function GET() {
  const a = await chatAuth();
  if ('error' in a) return a.error;
  try {
    return NextResponse.json({ profiles: await listProfiles(a.supabase) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

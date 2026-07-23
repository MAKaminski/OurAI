import { NextResponse } from 'next/server';
import { chatAuth } from '@/lib/chat/routeAuth';
import { ensureProfile } from '@/lib/chat/store';

export const dynamic = 'force-dynamic';

/** Bootstrap the caller's chat profile (creates it on first call). */
export async function POST() {
  const a = await chatAuth();
  if ('error' in a) return a.error;
  try {
    return NextResponse.json({ profile: await ensureProfile(a.supabase, a.user) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

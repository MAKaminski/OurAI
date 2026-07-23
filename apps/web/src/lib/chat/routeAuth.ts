import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/** Shared auth guard for chat routes (mirrors the secrets/orgs pattern). */
export async function chatAuth(): Promise<
  { supabase: SupabaseClient; user: User } | { error: NextResponse }
> {
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

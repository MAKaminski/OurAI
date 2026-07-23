import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isFlagEnabled } from '@/lib/flags/server';
import type { ContextScope } from './types';

/** Auth + `contextManager` flag gate for context routes. 404s while dark. */
export async function contextAuth(): Promise<
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
  if (!(await isFlagEnabled('contextManager', user.id))) {
    return { error: NextResponse.json({ error: 'not_found' }, { status: 404 }) };
  }
  return { supabase, user };
}

export function ownerFor(scope: ContextScope, orgId: string | null, userId: string): string | null {
  if (scope === 'user') return userId;
  if (scope === 'org') return orgId;
  return null;
}

export function parseScope(value: string | null): ContextScope | null {
  return value === 'org' || value === 'user' ? value : null;
}

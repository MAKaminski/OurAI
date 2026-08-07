import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isFlagEnabled } from '@/lib/flags/server';

/**
 * Auth + `productWorkflow` flag gate + company-membership check for request
 * routes. Returns the RLS-scoped client and user, or an error response. 404s
 * while the flag is dark so the surface is invisible until launch.
 *
 * Membership is ultimately enforced by RLS on every query, but we check it here
 * too so a non-member gets a clean 404 instead of empty/late failures.
 */
export async function requestAuth(
  companyId: string,
): Promise<{ supabase: SupabaseClient; user: User } | { error: NextResponse }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: 'not configured' }, { status: 501 }) };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };

  if (!(await isFlagEnabled('productWorkflow', user.id))) {
    return { error: NextResponse.json({ error: 'not_found' }, { status: 404 }) };
  }

  // RLS makes a non-member's company invisible; confirm the caller can see it.
  const { data: company, error } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .maybeSingle();
  if (error) return { error: NextResponse.json({ error: String(error.message) }, { status: 500 }) };
  if (!company) return { error: NextResponse.json({ error: 'not_found' }, { status: 404 }) };

  return { supabase, user };
}

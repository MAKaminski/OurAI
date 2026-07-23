import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveSupabaseAnonKey, resolveSupabaseUrl } from './env';

/**
 * Browser Supabase client factory. Reads public env; all queries are
 * constrained by RLS. Returns null when Supabase isn't configured.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = resolveSupabaseUrl();
  const anon = resolveSupabaseAnonKey();
  cached = url && anon ? createBrowserClient(url, anon, { db: { schema: 'ourai' } }) : null;
  return cached;
}

export function getBrowserSupabaseConfig() {
  return {
    url: resolveSupabaseUrl(),
    anonKey: resolveSupabaseAnonKey(),
  };
}

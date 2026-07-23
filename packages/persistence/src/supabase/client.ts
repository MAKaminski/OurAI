import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  /** anon key (browser) or service-role key (orchestrator, bypasses RLS). */
  key: string;
}

export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  // NOTE: OurAI data lives in the isolated `ourai` schema. When this adapter is
  // implemented, construct the client with `db: { schema: 'ourai' }` (typed as
  // SupabaseClient<..., 'ourai'>). The web app already does this in
  // apps/web/src/lib/supabase. Kept schema-default here to match the stub type.
  return createClient(config.url, config.key, {
    auth: { persistSession: false },
  });
}

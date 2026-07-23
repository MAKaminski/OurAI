/**
 * Browser Supabase client factory. Reads public env; constrained by RLS.
 * Scaffold: returns config only — the real client is created in Phase 1a.
 */
export function getBrowserSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };
}

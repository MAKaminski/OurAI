/**
 * Server (RSC / route handler) Supabase config. Scaffold placeholder.
 */
export function getServerSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };
}

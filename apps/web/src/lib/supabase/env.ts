/**
 * Resolve the Supabase URL + anon/publishable key from the various env var
 * names different setups use.
 *
 * The Vercel–Supabase integration injects `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`; some projects only carry the non-public
 * `SUPABASE_URL` / `SUPABASE_ANON_KEY`, and newer Supabase projects name the
 * key `*_PUBLISHABLE_KEY`. Referencing `process.env.NEXT_PUBLIC_*` with these
 * exact static forms lets Next.js inline them into the browser bundle at build
 * time; the non-public fallbacks only resolve on the server (they are stripped
 * from client code), which is the correct behavior.
 *
 * `||` (not `??`) is used intentionally so an env var set to an empty string
 * falls through to the next candidate.
 */
export function resolveSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
}

export function resolveSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  );
}

export function supabaseConfigured(): boolean {
  return Boolean(resolveSupabaseUrl() && resolveSupabaseAnonKey());
}

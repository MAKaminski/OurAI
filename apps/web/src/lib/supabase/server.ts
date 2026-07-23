import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Server (RSC / route handler) Supabase config. Kept for the persistence
 * factory that reads a plain URL/key pair.
 */
export function getServerSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };
}

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * A request-scoped Supabase client bound to the caller's session cookies. All
 * queries run as the logged-in user, so **RLS enforces org/personal isolation
 * at the database** — the source of truth for "secrets never cross an org".
 * Returns null when Supabase isn't configured (keeps builds green without env).
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    // All OurAI tables live in the isolated `ourai` schema — never `public`.
    db: { schema: 'ourai' },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set({ name, value, ...options });
          }
        } catch {
          // Called from a Server Component render — cookie writes are ignored
          // here; the middleware refreshes the session instead.
        }
      },
    },
  });
}

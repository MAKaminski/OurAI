import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Refreshes the Supabase auth session on each request so Server Components see a
 * current user. No-op when Supabase isn't configured.
 */
export async function middleware(request: NextRequest) {
  // Auth-code safety net: a magic-link/OAuth `code` should hit /auth/callback,
  // but Supabase sends it to the Site URL root when the callback URL isn't
  // allow-listed. Forward any stray `?code=` to the callback so the session is
  // still exchanged (the real fix is Supabase's Site URL + redirect allow-list).
  const { pathname, searchParams } = request.nextUrl;
  if (searchParams.has('code') && pathname !== '/auth/callback') {
    const callback = request.nextUrl.clone();
    callback.pathname = '/auth/callback';
    if (!callback.searchParams.get('next')) {
      callback.searchParams.set('next', pathname === '/' ? '/account' : pathname);
    }
    return NextResponse.redirect(callback);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt)$).*)',
  ],
};

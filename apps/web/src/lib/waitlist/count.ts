/**
 * Server-side waitlist count from the Supabase `waitlist` table, via the
 * PostgREST exact-count header. Cached in-process for 60s so the landing page
 * doesn't hit the database on every request. Returns null when Supabase isn't
 * configured (the counter then stays hidden).
 */
let cached: { at: number; count: number | null } | null = null;
const TTL_MS = 60_000;

export async function getWaitlistCount(): Promise<number | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.count;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  let count: number | null = null;
  try {
    const res = await fetch(`${url}/rest/v1/waitlist?select=id`, {
      method: 'HEAD',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Accept-Profile': 'ourai',
        Prefer: 'count=exact',
        Range: '0-0',
      },
    });
    // Content-Range looks like "0-0/123" (or "*/123" when the range is empty).
    const total = res.headers.get('content-range')?.split('/')[1];
    if (total && total !== '*') count = Number.parseInt(total, 10);
  } catch {
    count = null;
  }

  cached = { at: Date.now(), count };
  return count;
}

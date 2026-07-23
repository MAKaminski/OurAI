import { NextResponse } from 'next/server';
import { captureServerEvent } from '@/lib/analytics/server';

interface WaitlistBody {
  email?: string;
  role?: string;
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Waitlist capture. Records a server-side PostHog conversion event and (when a
 * Supabase service key is configured) persists the signup to the `waitlist`
 * table. Analytics/persistence are best-effort — the signup never hard-fails on
 * their account.
 */
export async function POST(request: Request) {
  let body: WaitlistBody;
  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
  }

  await captureServerEvent(email, 'waitlist_submitted', {
    role: body.role ?? null,
    source: body.source ?? null,
    $set: { email, waitlist_role: body.role ?? null },
  });

  await persistWaitlist(email, body.role ?? null, body.source ?? null);

  return NextResponse.json({ ok: true });
}

/** Optional Supabase persistence via the REST endpoint (no SDK on this path). */
async function persistWaitlist(
  email: string,
  role: string | null,
  source: string | null,
): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ email, role, source }),
    });
  } catch {
    // best-effort
  }
}

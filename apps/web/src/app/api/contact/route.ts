import { NextResponse } from 'next/server';
import { sendSupportEmail } from '@/lib/email/support';
import { captureServerEvent } from '@/lib/analytics/server';

export const dynamic = 'force-dynamic';

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact form handler. Routes the message to the hidden Support address via
 * email and records a PostHog event as a durable fallback. Never exposes the
 * support address, and never hard-fails on a side-effect.
 */
export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const name = (body.name ?? '').trim().slice(0, 120);
  const email = (body.email ?? '').trim().toLowerCase();
  const message = (body.message ?? '').trim().slice(0, 5000);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
  }
  if (message.length < 1) {
    return NextResponse.json({ ok: false, error: 'message is required' }, { status: 400 });
  }

  const emailed = await sendSupportEmail({ name: name || 'Anonymous', email, message });
  await captureServerEvent(email, 'contact_submitted', {
    name: name || null,
    emailed,
    messageLength: message.length,
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { listSettings, settingsBackendStatus, upsertSetting } from '@/lib/settings/store';

// NOTE: Membership/auth enforcement lands with Phase 1a (Supabase Auth). RLS
// policies already scope these rows to company members; once the route reads the
// caller's session it will pass the user's JWT instead of the service key.

interface Ctx {
  params: Promise<{ companyId: string }>;
}

export async function GET(_request: Request, { params }: Ctx) {
  const { companyId } = await params;
  const backend = settingsBackendStatus();
  if (!backend.configured) {
    return NextResponse.json({ configured: false, reason: backend.reason, settings: [] });
  }
  try {
    const settings = await listSettings(companyId);
    return NextResponse.json({ configured: true, settings });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

interface UpsertBody {
  key?: string;
  value?: string;
  isSensitive?: boolean;
}

export async function POST(request: Request, { params }: Ctx) {
  const { companyId } = await params;
  if (!settingsBackendStatus().configured) {
    return NextResponse.json(
      { ok: false, error: 'settings backend not configured' },
      { status: 501 },
    );
  }
  let body: UpsertBody;
  try {
    body = (await request.json()) as UpsertBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const key = (body.key ?? '').trim();
  const value = body.value ?? '';
  if (!/^[A-Za-z0-9_.-]{1,64}$/.test(key)) {
    return NextResponse.json({ ok: false, error: 'invalid key' }, { status: 400 });
  }
  if (value.length === 0) {
    return NextResponse.json({ ok: false, error: 'value is required' }, { status: 400 });
  }
  try {
    await upsertSetting(companyId, key, value, Boolean(body.isSensitive));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

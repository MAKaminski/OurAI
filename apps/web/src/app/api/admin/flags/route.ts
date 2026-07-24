import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/auth/admin';
import { FLAGS } from '@/lib/flags/registry';
import { getAllOverrides, setFlagOverride } from '@/lib/flags/overrides';

export const dynamic = 'force-dynamic';

const KNOWN_KEYS = new Set<string>(Object.values(FLAGS).map((f) => f.key));

export async function GET() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const overrides = await getAllOverrides();
  const flags = Object.entries(FLAGS).map(([name, def]) => {
    const override = def.key in overrides ? overrides[def.key] : null;
    return {
      name,
      key: def.key,
      description: def.description,
      defaultValue: def.defaultValue,
      override, // boolean | null
      effective: override ?? def.defaultValue,
    };
  });
  return NextResponse.json({ flags });
}

interface SetBody {
  key?: string;
  enabled?: boolean | null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!isAdmin(user) || !user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: SetBody;
  try {
    body = (await request.json()) as SetBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const key = (body.key ?? '').trim();
  if (!KNOWN_KEYS.has(key)) {
    return NextResponse.json({ ok: false, error: 'unknown flag key' }, { status: 400 });
  }
  const enabled = body.enabled;
  if (enabled !== null && typeof enabled !== 'boolean') {
    return NextResponse.json(
      { ok: false, error: 'enabled must be boolean or null' },
      { status: 400 },
    );
  }
  try {
    await setFlagOverride(key, enabled, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { deleteSetting, settingsBackendStatus } from '@/lib/settings/store';

interface Ctx {
  params: Promise<{ companyId: string; key: string }>;
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { companyId, key } = await params;
  if (!settingsBackendStatus().configured) {
    return NextResponse.json(
      { ok: false, error: 'settings backend not configured' },
      { status: 501 },
    );
  }
  try {
    await deleteSetting(companyId, decodeURIComponent(key));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

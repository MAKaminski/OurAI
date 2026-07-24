import { NextResponse } from 'next/server';
import { createRequestSchema } from '@ourai/shared';
import { requestAuth } from '@/lib/requests/routeAuth';
import { createRequest, listRequests } from '@/lib/requests/store';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ companyId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { companyId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    return NextResponse.json({ requests: await listRequests(a.supabase, companyId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  const { companyId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const parsed = createRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }
  try {
    const created = await createRequest(a.supabase, companyId, a.user.id, parsed.data);
    return NextResponse.json({ ok: true, request: created });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

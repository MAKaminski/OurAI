import { NextResponse } from 'next/server';
import { requestAuth } from '@/lib/requests/routeAuth';
import { approveKpis } from '@/lib/requests/store';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ companyId: string; requestId: string }>;
}

/** POST — approve the KPI stage (HITL gate) and advance the request to design. */
export async function POST(_request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    const request = await approveKpis(a.supabase, requestId);
    return NextResponse.json({ ok: true, request });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

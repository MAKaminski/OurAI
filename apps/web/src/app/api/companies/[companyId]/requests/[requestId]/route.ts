import { NextResponse } from 'next/server';
import { requestAuth } from '@/lib/requests/routeAuth';
import { getRequest, listKpis } from '@/lib/requests/store';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ companyId: string; requestId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    const request = await getRequest(a.supabase, requestId);
    if (!request || request.companyId !== companyId) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ request, kpis: await listKpis(a.supabase, requestId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

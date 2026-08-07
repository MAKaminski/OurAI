import { NextResponse } from 'next/server';
import { artifactStageSchema } from '@ourai/shared';
import { requestAuth } from '@/lib/requests/routeAuth';
import { approveStage } from '@/lib/requests/store';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ companyId: string; requestId: string; stage: string }>;
}

/** POST — approve an artifact stage (HITL gate) and advance to the next stage. */
export async function POST(_request: Request, { params }: Params) {
  const { companyId, requestId, stage } = await params;
  const s = artifactStageSchema.safeParse(stage);
  if (!s.success) return NextResponse.json({ ok: false, error: 'invalid stage' }, { status: 400 });
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    const request = await approveStage(a.supabase, requestId, s.data);
    return NextResponse.json({ ok: true, request });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

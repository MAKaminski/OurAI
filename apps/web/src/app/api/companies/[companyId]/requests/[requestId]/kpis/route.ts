import { NextResponse } from 'next/server';
import { kpiInputSchema } from '@ourai/shared';
import { requestAuth } from '@/lib/requests/routeAuth';
import { deleteKpi, listKpis, runKpiStage, upsertKpi } from '@/lib/requests/store';
import { ModelKeyMissingError } from '@/lib/requests/kpiAgent';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ companyId: string; requestId: string }>;
}

/** GET — list KPIs for a request. */
export async function GET(_request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    return NextResponse.json({ kpis: await listKpis(a.supabase, requestId) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** POST — run the KPI agent (generate proposed KPIs). */
export async function POST(_request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    const result = await runKpiStage(a.supabase, a.user.id, requestId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    // A missing model key is a user-actionable 400, not a server error.
    if (err instanceof ModelKeyMissingError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

/** PATCH — add a manual KPI (no id) or edit an existing one (with id). */
export async function PATCH(request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  // `id` is optional (present = edit, absent = manual add); the rest is validated
  // by the shared KPI schema so the store always receives a well-formed input.
  const id = (json as { id?: unknown }).id;
  if (id !== undefined && typeof id !== 'string') {
    return NextResponse.json({ ok: false, error: 'id must be a string' }, { status: 400 });
  }
  const parsed = kpiInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }
  try {
    const kpi = await upsertKpi(a.supabase, requestId, a.user.id, parsed.data, id);
    return NextResponse.json({ ok: true, kpi });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

/** DELETE — remove a KPI (?kpiId=…). */
export async function DELETE(request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  const kpiId = new URL(request.url).searchParams.get('kpiId') ?? '';
  if (!kpiId) return NextResponse.json({ ok: false, error: 'kpiId required' }, { status: 400 });
  try {
    await deleteKpi(a.supabase, requestId, kpiId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

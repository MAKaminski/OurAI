import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCompany } from '@/lib/companies/store';
import { getModelOrder, setModelOrder } from '@/lib/companies/modelOrder';
import { PROVIDER_LABEL, resolveCredentials } from '@/lib/requests/modelCredential';

export const dynamic = 'force-dynamic';

interface Ctx {
  params: Promise<{ companyId: string }>;
}

async function auth(companyId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: 'not configured' }, { status: 501 }) };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  // RLS hides a non-member's company → treat as not found.
  const company = await getCompany(supabase, companyId);
  if (!company) return { error: NextResponse.json({ error: 'not_found' }, { status: 404 }) };
  return { supabase, user };
}

export async function GET(_request: Request, { params }: Ctx) {
  const { companyId } = await params;
  const a = await auth(companyId);
  if ('error' in a) return a.error;
  try {
    const [order, creds] = await Promise.all([
      getModelOrder(a.supabase, companyId),
      resolveCredentials(a.supabase, a.user.id),
    ]);
    return NextResponse.json({
      order,
      labels: PROVIDER_LABEL,
      // Which providers the caller actually has a key for (so the UI can flag
      // entries in the order that won't do anything yet).
      configured: creds.map((c) => c.provider),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const { companyId } = await params;
  const a = await auth(companyId);
  if ('error' in a) return a.error;

  let body: { order?: unknown };
  try {
    body = (await request.json()) as { order?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  if (!Array.isArray(body.order) || !body.order.every((x) => typeof x === 'string')) {
    return NextResponse.json({ ok: false, error: 'order must be a string[]' }, { status: 400 });
  }
  try {
    const order = await setModelOrder(a.supabase, companyId, a.user.id, body.order as string[]);
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

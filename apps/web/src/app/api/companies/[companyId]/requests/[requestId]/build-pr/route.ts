import { NextResponse } from 'next/server';
import { requestAuth } from '@/lib/requests/routeAuth';
import { getRequest, runBuild } from '@/lib/requests/store';
import { GithubTokenMissingError, ModelKeyMissingError } from '@/lib/requests/modelCredential';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ companyId: string; requestId: string }>;
}

/** GET — the request's stored build result (PR link etc.), for display. */
export async function GET(_request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    const request = await getRequest(a.supabase, requestId);
    if (!request) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({
      prUrl: request.prUrl,
      prNumber: request.prNumber,
      branch: request.buildBranch,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** POST — generate code and open a draft PR on the connected repo. */
export async function POST(_request: Request, { params }: Params) {
  const { companyId, requestId } = await params;
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    const result = await runBuild(a.supabase, a.user.id, requestId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    // Missing token/model key are user-actionable 400s.
    if (err instanceof GithubTokenMissingError || err instanceof ModelKeyMissingError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { artifactStageSchema, stageArtifactInputSchema } from '@ourai/shared';
import { requestAuth } from '@/lib/requests/routeAuth';
import { deleteArtifact, listArtifacts, runAgentStage, upsertArtifact } from '@/lib/requests/store';
import { ModelKeyMissingError } from '@/lib/requests/modelCredential';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ companyId: string; requestId: string; stage: string }>;
}

/** Validate the `[stage]` path segment against the artifact-stage enum. */
function parseStage(raw: string) {
  return artifactStageSchema.safeParse(raw);
}

/** GET — list artifacts for a stage. */
export async function GET(_request: Request, { params }: Params) {
  const { companyId, requestId, stage } = await params;
  const s = parseStage(stage);
  if (!s.success) return NextResponse.json({ error: 'invalid stage' }, { status: 400 });
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    return NextResponse.json({ artifacts: await listArtifacts(a.supabase, requestId, s.data) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** POST — run the stage agent (generate proposed artifacts). */
export async function POST(_request: Request, { params }: Params) {
  const { companyId, requestId, stage } = await params;
  const s = parseStage(stage);
  if (!s.success) return NextResponse.json({ ok: false, error: 'invalid stage' }, { status: 400 });
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  try {
    const result = await runAgentStage(a.supabase, a.user.id, requestId, s.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof ModelKeyMissingError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

/** PATCH — add a manual artifact (no id) or edit an existing one (with id). */
export async function PATCH(request: Request, { params }: Params) {
  const { companyId, requestId, stage } = await params;
  const s = parseStage(stage);
  if (!s.success) return NextResponse.json({ ok: false, error: 'invalid stage' }, { status: 400 });
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
  const id = (json as { id?: unknown }).id;
  if (id !== undefined && typeof id !== 'string') {
    return NextResponse.json({ ok: false, error: 'id must be a string' }, { status: 400 });
  }
  const parsed = stageArtifactInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }
  try {
    const artifact = await upsertArtifact(
      a.supabase,
      requestId,
      a.user.id,
      s.data,
      parsed.data,
      id,
    );
    return NextResponse.json({ ok: true, artifact });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

/** DELETE — remove an artifact (?artifactId=…). */
export async function DELETE(request: Request, { params }: Params) {
  const { companyId, requestId, stage } = await params;
  const s = parseStage(stage);
  if (!s.success) return NextResponse.json({ ok: false, error: 'invalid stage' }, { status: 400 });
  const a = await requestAuth(companyId);
  if ('error' in a) return a.error;
  const artifactId = new URL(request.url).searchParams.get('artifactId') ?? '';
  if (!artifactId) {
    return NextResponse.json({ ok: false, error: 'artifactId required' }, { status: 400 });
  }
  try {
    await deleteArtifact(a.supabase, requestId, artifactId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

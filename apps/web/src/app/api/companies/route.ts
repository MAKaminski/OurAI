import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createCompany, listCompaniesForUser } from '@/lib/companies/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ configured: false, companies: [] });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ configured: true, companies: await listCompaniesForUser(supabase) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** "owner/repo" — GitHub's segment rules, kept deliberately permissive. */
const REPO_RE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ ok: false, error: 'not configured' }, { status: 501 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { name?: string; githubRepo?: string; description?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ ok: false, error: 'name must be 2–80 characters' }, { status: 400 });
  }
  const githubRepo = (body.githubRepo ?? '').trim();
  if (!REPO_RE.test(githubRepo)) {
    return NextResponse.json(
      { ok: false, error: 'github repo must be in "owner/repo" form' },
      { status: 400 },
    );
  }
  const description = (body.description ?? '').trim() || null;

  try {
    const company = await createCompany(supabase, user.id, { name, githubRepo, description });
    return NextResponse.json({ ok: true, company });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

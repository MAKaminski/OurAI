import type { SupabaseClient } from '@supabase/supabase-js';

export interface Org {
  id: string;
  name: string;
  slug: string | null;
  createdAt: string;
}

interface OrgRow {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
}

/** Orgs the caller belongs to (RLS returns only their memberships). */
export async function listMyOrgs(supabase: SupabaseClient): Promise<Org[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id,name,slug,created_at')
    .order('created_at');
  if (error) throw new Error(`list orgs failed: ${error.message}`);
  return (data as OrgRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    createdAt: r.created_at,
  }));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/**
 * Create an org and make the caller its owner. Never auto-called — only in
 * response to an explicit "create organization" action.
 */
export async function createOrg(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<Org> {
  const slug = `${slugify(name)}-${Math.abs(hash(userId + name)) % 10000}`;
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, slug, created_by: userId })
    .select('id,name,slug,created_at')
    .single();
  if (error) throw new Error(`create org failed: ${error.message}`);

  const org = data as OrgRow;
  const { error: memberErr } = await supabase
    .from('organization_members')
    .insert({ org_id: org.id, user_id: userId, role: 'owner' });
  if (memberErr) throw new Error(`add owner failed: ${memberErr.message}`);

  return { id: org.id, name: org.name, slug: org.slug, createdAt: org.created_at };
}

/** Small deterministic hash for slug disambiguation (not security-sensitive). */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

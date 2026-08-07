import type { SupabaseClient } from '@supabase/supabase-js';

/** A company as returned to the web app (camelCase view of the `ourai.companies` row). */
export interface Company {
  id: string;
  name: string;
  githubRepo: string;
  defaultBranch: string;
  description: string | null;
  createdAt: string;
}

interface CompanyRow {
  id: string;
  name: string;
  github_repo: string;
  default_branch: string;
  description: string | null;
  created_at: string;
}

const COMPANY_COLUMNS = 'id,name,github_repo,default_branch,description,created_at';

function toCompany(r: CompanyRow): Company {
  return {
    id: r.id,
    name: r.name,
    githubRepo: r.github_repo,
    defaultBranch: r.default_branch,
    description: r.description,
    createdAt: r.created_at,
  };
}

/** Companies the caller belongs to (RLS returns only their memberships). */
export async function listCompaniesForUser(supabase: SupabaseClient): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select(COMPANY_COLUMNS)
    .order('created_at');
  if (error) throw new Error(`list companies failed: ${error.message}`);
  return (data as CompanyRow[]).map(toCompany);
}

/** A single company by id (null when RLS hides it or it doesn't exist). */
export async function getCompany(
  supabase: SupabaseClient,
  companyId: string,
): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select(COMPANY_COLUMNS)
    .eq('id', companyId)
    .maybeSingle();
  if (error) throw new Error(`get company failed: ${error.message}`);
  return data ? toCompany(data as CompanyRow) : null;
}

export interface CreateCompanyInput {
  name: string;
  githubRepo: string;
  defaultBranch?: string;
  description?: string | null;
}

/**
 * Create a company and make the caller its owning member. Mirrors `createOrg`:
 * two writes under the user-scoped (RLS) client. This depends on the 0009
 * migration's two RLS fixes — the broadened `companies_select` (so the
 * `insert().select()` read-back sees the row before membership exists) and the
 * new `company_members` insert policy (so the owner row can be written).
 * Never auto-called — only in response to an explicit "create company" action.
 */
export async function createCompany(
  supabase: SupabaseClient,
  userId: string,
  input: CreateCompanyInput,
): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: input.name,
      github_repo: input.githubRepo,
      default_branch: input.defaultBranch ?? 'main',
      description: input.description ?? null,
      created_by: userId,
    })
    .select(COMPANY_COLUMNS)
    .single();
  if (error) throw new Error(`create company failed: ${error.message}`);

  const company = toCompany(data as CompanyRow);
  const { error: memberErr } = await supabase
    .from('company_members')
    .insert({ company_id: company.id, user_id: userId, role: 'product' });
  if (memberErr) throw new Error(`add owner failed: ${memberErr.message}`);

  return company;
}

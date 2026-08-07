import type { SupabaseClient } from '@supabase/supabase-js';
import type { ModelProviderName } from '@ourai/model-gateway';
import { MODEL_PROVIDERS, normalizeProviderOrder } from '@/lib/requests/modelCredential';

/**
 * Per-company preferred model-provider order (`ourai.company_model_preferences`).
 * RLS-scoped to company members, so reads/writes go through the user-scoped
 * client. A missing row means "use the default order".
 */
export async function getModelOrder(
  supabase: SupabaseClient,
  companyId: string,
): Promise<ModelProviderName[]> {
  const { data, error } = await supabase
    .from('company_model_preferences')
    .select('provider_order')
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw new Error(`get model order failed: ${error.message}`);
  return normalizeProviderOrder((data as { provider_order: string[] } | null)?.provider_order);
}

/** Save a company's provider order (normalized so it is always complete + valid). */
export async function setModelOrder(
  supabase: SupabaseClient,
  companyId: string,
  userId: string,
  order: readonly string[],
): Promise<ModelProviderName[]> {
  const normalized = normalizeProviderOrder(order);
  const row = {
    company_id: companyId,
    provider_order: normalized,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };
  // Update-then-insert (avoids relying on upsert against the PK from PostgREST).
  const { data: existing } = await supabase
    .from('company_model_preferences')
    .select('company_id')
    .eq('company_id', companyId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('company_model_preferences')
      .update(row)
      .eq('company_id', companyId);
    if (error) throw new Error(`update model order failed: ${error.message}`);
  } else {
    const { error } = await supabase.from('company_model_preferences').insert(row);
    if (error) throw new Error(`insert model order failed: ${error.message}`);
  }
  return normalized;
}

export { MODEL_PROVIDERS };

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  decryptSecret,
  encryptSecret,
  encryptionConfigured,
  maskSecret,
} from '@/lib/crypto/secrets';

export type SecretScope = 'org' | 'user';

/** A secret as returned to the client — sensitive values are masked, never raw. */
export interface SecretView {
  key: string;
  isSensitive: boolean;
  /** Plaintext for non-sensitive; a masked preview for sensitive. */
  display: string;
  updatedAt: string;
}

interface SecretRow {
  id: string;
  key: string;
  value: string | null;
  encrypted_value: string | null;
  is_sensitive: boolean;
  updated_at: string;
}

const ownerColumn = (scope: SecretScope) => (scope === 'org' ? 'org_id' : 'user_id');

/**
 * List secrets for a scope+owner. RLS on the `secrets` table guarantees the
 * caller only ever receives rows for an org they belong to (or their own user
 * rows) — cross-org rows are invisible at the database, not just filtered here.
 */
export async function listSecrets(
  supabase: SupabaseClient,
  scope: SecretScope,
  ownerId: string,
): Promise<SecretView[]> {
  const { data, error } = await supabase
    .from('secrets')
    .select('id,key,value,encrypted_value,is_sensitive,updated_at')
    .eq('scope', scope)
    .eq(ownerColumn(scope), ownerId)
    .order('key');
  if (error) throw new Error(`list secrets failed: ${error.message}`);

  return (data as SecretRow[]).map((row) => ({
    key: row.key,
    isSensitive: row.is_sensitive,
    display: row.is_sensitive
      ? row.encrypted_value
        ? maskSecret(decryptSecret(row.encrypted_value))
        : '••••'
      : (row.value ?? ''),
    updatedAt: row.updated_at,
  }));
}

export async function upsertSecret(
  supabase: SupabaseClient,
  scope: SecretScope,
  ownerId: string,
  userId: string,
  key: string,
  value: string,
  isSensitive: boolean,
): Promise<void> {
  if (isSensitive && !encryptionConfigured()) {
    throw new Error('SETTINGS_ENCRYPTION_KEY is not set — cannot store sensitive values.');
  }

  const row = {
    scope,
    org_id: scope === 'org' ? ownerId : null,
    user_id: scope === 'user' ? ownerId : null,
    key,
    value: isSensitive ? null : value,
    encrypted_value: isSensitive ? encryptSecret(value) : null,
    is_sensitive: isSensitive,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  // Find an existing row (RLS-scoped) then update, else insert — avoids relying
  // on upsert against a partial unique index.
  const { data: existing, error: findErr } = await supabase
    .from('secrets')
    .select('id')
    .eq('scope', scope)
    .eq(ownerColumn(scope), ownerId)
    .eq('key', key)
    .maybeSingle();
  if (findErr) throw new Error(`lookup secret failed: ${findErr.message}`);

  if (existing) {
    const { error } = await supabase.from('secrets').update(row).eq('id', existing.id);
    if (error) throw new Error(`update secret failed: ${error.message}`);
  } else {
    const { error } = await supabase.from('secrets').insert(row);
    if (error) throw new Error(`insert secret failed: ${error.message}`);
  }
}

export async function deleteSecret(
  supabase: SupabaseClient,
  scope: SecretScope,
  ownerId: string,
  key: string,
): Promise<void> {
  const { error } = await supabase
    .from('secrets')
    .delete()
    .eq('scope', scope)
    .eq(ownerColumn(scope), ownerId)
    .eq('key', key);
  if (error) throw new Error(`delete secret failed: ${error.message}`);
}

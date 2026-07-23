import { createPersistence, type PersistenceAdapter } from '@ourai/persistence';
import { getServerSupabaseConfig } from './supabase/server';

/** Construct the web app's persistence adapter (server side). */
export function getPersistence(): PersistenceAdapter {
  const { url, anonKey } = getServerSupabaseConfig();
  return createPersistence({
    provider: url && anonKey ? 'supabase' : 'memory',
    supabase: url && anonKey ? { url, key: anonKey } : undefined,
  });
}

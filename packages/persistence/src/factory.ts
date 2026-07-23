import type { PersistenceAdapter } from './PersistenceAdapter.js';
import { SupabaseAdapter } from './supabase/SupabaseAdapter.js';
import { MemoryAdapter } from './memory/MemoryAdapter.js';

export type PersistenceProvider = 'supabase' | 'memory';

export interface PersistenceFactoryConfig {
  provider: PersistenceProvider;
  supabase?: { url: string; key: string };
}

/** Construct the configured persistence adapter (`PERSISTENCE_PROVIDER`). */
export function createPersistence(config: PersistenceFactoryConfig): PersistenceAdapter {
  switch (config.provider) {
    case 'supabase':
      if (!config.supabase) throw new Error('supabase config (url, key) is required');
      return new SupabaseAdapter(config.supabase);
    case 'memory':
      return new MemoryAdapter();
    default: {
      const exhaustive: never = config.provider;
      throw new Error(`unknown persistence provider: ${String(exhaustive)}`);
    }
  }
}

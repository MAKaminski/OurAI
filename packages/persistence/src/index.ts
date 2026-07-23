export type { PersistenceAdapter, PresenceState, Unsubscribe } from './PersistenceAdapter.js';
export { SupabaseAdapter } from './supabase/SupabaseAdapter.js';
export { createSupabaseClient, type SupabaseConfig } from './supabase/client.js';
export { MemoryAdapter } from './memory/MemoryAdapter.js';
export {
  createPersistence,
  type PersistenceProvider,
  type PersistenceFactoryConfig,
} from './factory.js';

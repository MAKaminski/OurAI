import type { User } from '@supabase/supabase-js';

/**
 * The single super-admin. Kept as a constant (not env) so the gate is explicit
 * and reviewable; change here to move it. Admin unlocks `/admin` (in-app feature
 * flag control) and is checked server-side on every admin route.
 */
export const ADMIN_EMAIL = 'mkaminski1337@gmail.com';

export function isAdmin(user: User | null | undefined): boolean {
  return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;
}

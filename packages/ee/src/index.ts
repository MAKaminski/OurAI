/**
 * OurAI Enterprise Edition (COMMERCIAL LICENSE — see ./LICENSE).
 *
 * This directory is intentionally licensed separately from the AGPL/Apache
 * code in the rest of the monorepo (the open-core split, docs/adr/0003). It
 * houses features reserved for the paid tier: SSO/SAML, role-based access
 * control, audit logs, and org management.
 *
 * Scaffold status: interface placeholders only.
 */

export interface SsoProvider {
  readonly kind: 'saml' | 'oidc';
  /** Returns the redirect URL to begin an SSO login. */
  authorizeUrl(state: string): string;
}

export interface AuditLogEntry {
  actorId: string;
  action: string;
  target: string;
  at: string;
}

export interface AuditLogSink {
  record(entry: AuditLogEntry): Promise<void>;
}

/** RBAC permission check — the real per-role gates (Phase 2+ / paid). */
export interface AccessPolicy {
  can(userId: string, action: string, resource: string): Promise<boolean>;
}

export const EE_ENABLED = false;

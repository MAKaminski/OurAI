import type { MemberRole } from './types/company.js';

/** Default resource + cost caps (overridable via orchestrator env). */
export const DEFAULTS = {
  MAX_CONCURRENT_AGENTS: 3,
  MONTHLY_BUDGET_USD: 40,
  MODEL_PROVIDER: 'deepseek',
  SYNC_MODE: 'realtime',
  GITHUB_MODE: 'pr',
  DEFAULT_BRANCH: 'main',
  /** Branch prefix for agent worktrees, e.g. "ourai/add-login". */
  BRANCH_PREFIX: 'ourai/',
} as const;

/** Cosmetic presence colors per role (Phase 1). */
export const ROLE_COLORS: Record<MemberRole, string> = {
  product: '#7c3aed',
  dev: '#2563eb',
  qa: '#059669',
  devops: '#d97706',
  sales: '#db2777',
  pm: '#0891b2',
};

export const ALL_ROLES: readonly MemberRole[] = ['product', 'dev', 'qa', 'devops', 'sales', 'pm'];

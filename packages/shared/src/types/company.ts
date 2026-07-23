import type { CompanyId, UserId } from './ids.js';

/**
 * A Company is the top-level entity in OurAI — the "project management / idea
 * intake" front door. One company maps to exactly one GitHub repository; you
 * create a company first, then intake ideas against it, then agents build
 * features affiliated with it.
 */
export interface Company {
  id: CompanyId;
  name: string;
  /** GitHub repository in "owner/repo" form. */
  githubRepo: string;
  defaultBranch: string;
  description: string | null;
  createdBy: UserId;
  createdAt: string;
}

export type NewCompany = Omit<Company, 'id' | 'createdAt'>;

/** Cosmetic role in Phase 1 — drives the "act as" label + presence color. */
export type MemberRole = 'product' | 'dev' | 'qa' | 'devops' | 'sales' | 'pm' | 'marketing';

export interface CompanyMember {
  companyId: CompanyId;
  userId: UserId;
  role: MemberRole;
  /** Presence color (hex). */
  color: string;
  createdAt: string;
}

export type NewCompanyMember = Omit<CompanyMember, 'createdAt'>;

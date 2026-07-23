export interface Profile {
  userId: string;
  displayName: string;
  alias: string;
  color: string;
  isSupport: boolean;
}

export type WorkspaceKind = 'team' | 'support';

export interface Workspace {
  id: string;
  name: string;
  kind: WorkspaceKind;
  orgId: string | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  workspaceId: string;
  authorId: string;
  authorName: string;
  authorAlias: string;
  body: string;
  seq: number;
  createdAt: string;
  mentions: string[]; // mentioned user ids
}

/** Well-known id of the shared Support workspace (seeded in migration 0006). */
export const SUPPORT_WORKSPACE_ID = '00000000-0000-0000-0000-0000000005a1';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { ChatMessage, Profile, Workspace } from './types';

/** Slugified @handle base from an email local part. */
function aliasBase(email: string): string {
  return (
    (email.split('@')[0] ?? 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24) || 'user'
  );
}

/**
 * Ensure the signed-in user has a profile (display name + @alias). Flags the
 * profile as Support when their email matches SUPPORT_EMAIL — that's the alias
 * behind which all support messages are routed. Idempotent.
 */
export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<Profile> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('user_id,display_name,alias,color,is_support')
    .eq('user_id', user.id)
    .maybeSingle();

  const isSupport = Boolean(
    process.env.SUPPORT_EMAIL &&
    user.email &&
    user.email.toLowerCase() === process.env.SUPPORT_EMAIL.toLowerCase(),
  );

  if (existing) {
    // Keep the Support flag in sync (e.g. if SUPPORT_EMAIL was set later).
    if (existing.is_support !== isSupport) {
      await supabase.from('profiles').update({ is_support: isSupport }).eq('user_id', user.id);
    }
    return {
      userId: existing.user_id,
      displayName: isSupport ? 'Support' : existing.display_name,
      alias: isSupport ? 'Support' : existing.alias,
      color: existing.color,
      isSupport,
    };
  }

  const email = user.email ?? 'user@ourai.dev';
  const displayName = isSupport ? 'Support' : (email.split('@')[0] ?? 'user');
  const alias = isSupport ? 'Support' : `${aliasBase(email)}_${user.id.slice(0, 4)}`;
  await supabase.from('profiles').insert({
    user_id: user.id,
    display_name: displayName,
    alias,
    is_support: isSupport,
  });
  return { userId: user.id, displayName, alias, color: '#2563eb', isSupport };
}

export async function listProfiles(supabase: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id,display_name,alias,color,is_support')
    .order('display_name');
  if (error) throw new Error(`list profiles failed: ${error.message}`);
  return (data ?? []).map((p) => ({
    userId: p.user_id,
    displayName: p.display_name,
    alias: p.alias,
    color: p.color,
    isSupport: p.is_support,
  }));
}

export async function listWorkspaces(supabase: SupabaseClient): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('id,name,kind,org_id,created_at')
    .order('created_at');
  if (error) throw new Error(`list workspaces failed: ${error.message}`);
  return (data ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    kind: w.kind,
    orgId: w.org_id,
    createdAt: w.created_at,
  }));
}

export async function createWorkspace(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  orgId: string | null,
): Promise<Workspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, kind: 'team', org_id: orgId, created_by: userId })
    .select('id,name,kind,org_id,created_at')
    .single();
  if (error) throw new Error(`create workspace failed: ${error.message}`);
  await supabase
    .from('workspace_members')
    .insert({ workspace_id: data.id, user_id: userId, role: 'owner' });
  return {
    id: data.id,
    name: data.name,
    kind: data.kind,
    orgId: data.org_id,
    createdAt: data.created_at,
  };
}

interface MessageRow {
  id: string;
  workspace_id: string;
  author_id: string;
  body: string;
  seq: number;
  created_at: string;
  message_mentions: { mentioned_user_id: string }[] | null;
}

/**
 * List messages in a workspace. Author display names are resolved by the caller
 * from the profiles map (there is no FK from chat_messages to profiles to
 * embed), so `authorName`/`authorAlias` are left blank here.
 */
export async function listMessages(
  supabase: SupabaseClient,
  workspaceId: string,
  sinceSeq = 0,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id,workspace_id,author_id,body,seq,created_at,message_mentions(mentioned_user_id)')
    .eq('workspace_id', workspaceId)
    .gt('seq', sinceSeq)
    .order('seq')
    .limit(200);
  if (error) throw new Error(`list messages failed: ${error.message}`);
  return (data as unknown as MessageRow[]).map((m) => ({
    id: m.id,
    workspaceId: m.workspace_id,
    authorId: m.author_id,
    authorName: '',
    authorAlias: '',
    body: m.body,
    seq: m.seq,
    createdAt: m.created_at,
    mentions: (m.message_mentions ?? []).map((x) => x.mentioned_user_id),
  }));
}

/** Fill authorName/authorAlias from a userId→Profile map. */
export function enrichMessages(messages: ChatMessage[], byId: Map<string, Profile>): ChatMessage[] {
  return messages.map((m) => {
    const p = byId.get(m.authorId);
    return { ...m, authorName: p?.displayName ?? 'Someone', authorAlias: p?.alias ?? 'user' };
  });
}

export async function sendMessage(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
  body: string,
  mentionedUserIds: string[],
): Promise<void> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ workspace_id: workspaceId, author_id: userId, body })
    .select('id')
    .single();
  if (error) throw new Error(`send message failed: ${error.message}`);

  const unique = [...new Set(mentionedUserIds)].filter((id) => id && id !== userId);
  if (unique.length > 0) {
    await supabase
      .from('message_mentions')
      .insert(unique.map((mentioned_user_id) => ({ message_id: data.id, mentioned_user_id })));
  }
}

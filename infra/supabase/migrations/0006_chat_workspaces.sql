-- Chat: user profiles/aliases, workspaces, messages, @-mentions, and a Support
-- workspace. Schema `ourai` (never `public`).
--
-- Model:
--   profiles         — a display name + @alias per auth user (no email exposed).
--   workspaces       — a chat space; kind 'team' (org-scoped) or 'support'.
--   workspace_members— membership of team workspaces.
--   chat_messages    — messages in a workspace, gap-free `seq` per workspace.
--   message_mentions — @-mentions linking a message to mentioned users.
--
-- Support routing: the Support user's profile has is_support = true. In a
-- 'support' workspace, a user sees only their OWN messages while the Support
-- user sees ALL of them — a private support desk. Anyone signed in may post to
-- the Support workspace.

create table ourai.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  alias        text unique not null,   -- the @handle used for mentions
  color        text not null default '#2563eb',
  is_support   boolean not null default false,
  created_at   timestamptz not null default now()
);

create table ourai.workspaces (
  id         uuid primary key default extensions.gen_random_uuid(),
  name       text not null,
  kind       text not null default 'team' check (kind in ('team', 'support')),
  org_id     uuid references ourai.organizations (id) on delete cascade,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);
create index workspaces_org_idx on ourai.workspaces (org_id);

create table ourai.workspace_members (
  workspace_id uuid not null references ourai.workspaces (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'member',
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_members_user_idx on ourai.workspace_members (user_id);

create table ourai.chat_messages (
  id           uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references ourai.workspaces (id) on delete cascade,
  author_id    uuid not null references auth.users (id) on delete cascade,
  body         text not null,
  seq          bigint not null,
  created_at   timestamptz not null default now()
);
create unique index chat_messages_ws_seq_uidx on ourai.chat_messages (workspace_id, seq);
create index chat_messages_ws_created_idx on ourai.chat_messages (workspace_id, created_at);

create table ourai.message_mentions (
  message_id        uuid not null references ourai.chat_messages (id) on delete cascade,
  mentioned_user_id uuid not null references auth.users (id) on delete cascade,
  primary key (message_id, mentioned_user_id)
);
create index message_mentions_user_idx on ourai.message_mentions (mentioned_user_id);

-- gap-free per-workspace sequence
create or replace function ourai.assign_message_seq() returns trigger as $$
begin
  if new.seq is null or new.seq = 0 then
    select coalesce(max(seq), 0) + 1 into new.seq
    from ourai.chat_messages where workspace_id = new.workspace_id;
  end if;
  return new;
end;
$$ language plpgsql set search_path = ourai;

create trigger chat_messages_assign_seq
  before insert on ourai.chat_messages
  for each row execute function ourai.assign_message_seq();

-- Predicates (security definer, pinned search_path).
create or replace function ourai.is_workspace_member(target_ws uuid) returns boolean as $$
  select exists (
    select 1 from ourai.workspace_members m
    where m.workspace_id = target_ws and m.user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = ourai, auth;

create or replace function ourai.is_support_workspace(target_ws uuid) returns boolean as $$
  select exists (
    select 1 from ourai.workspaces w where w.id = target_ws and w.kind = 'support'
  );
$$ language sql stable security definer set search_path = ourai, auth;

create or replace function ourai.is_support_user() returns boolean as $$
  select exists (
    select 1 from ourai.profiles p where p.user_id = auth.uid() and p.is_support
  );
$$ language sql stable security definer set search_path = ourai, auth;

alter table ourai.profiles enable row level security;
alter table ourai.workspaces enable row level security;
alter table ourai.workspace_members enable row level security;
alter table ourai.chat_messages enable row level security;
alter table ourai.message_mentions enable row level security;

-- profiles: any signed-in user can read profiles (display name + alias only —
-- no email lives here) to power @-mention autocomplete; you manage your own.
create policy profiles_select on ourai.profiles
  for select using (auth.uid() is not null);
create policy profiles_upsert on ourai.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- workspaces: team workspaces visible to members; support workspaces visible to
-- any signed-in user (so they can reach Support). Creators insert their own.
create policy workspaces_select on ourai.workspaces
  for select using (
    kind = 'support' or ourai.is_workspace_member(id)
  );
create policy workspaces_insert on ourai.workspaces
  for insert with check (created_by = auth.uid() and kind = 'team');

-- membership: members see the roster; a user may add themselves.
create policy workspace_members_select on ourai.workspace_members
  for select using (ourai.is_workspace_member(workspace_id));
create policy workspace_members_insert on ourai.workspace_members
  for insert with check (user_id = auth.uid() or ourai.is_workspace_member(workspace_id));

-- chat messages:
--   team workspace  → visible/writable to members.
--   support workspace→ a user sees only their own messages; the Support user
--                      sees all; anyone signed in may post.
create policy chat_messages_select on ourai.chat_messages
  for select using (
    ourai.is_workspace_member(workspace_id)
    or (ourai.is_support_workspace(workspace_id) and (author_id = auth.uid() or ourai.is_support_user()))
  );
create policy chat_messages_insert on ourai.chat_messages
  for insert with check (
    author_id = auth.uid()
    and (ourai.is_workspace_member(workspace_id) or ourai.is_support_workspace(workspace_id))
  );

-- mentions: visible if you can see the message OR you are the mentioned user
-- (so an @-mention reaches you). Inserted by the message's author.
create policy message_mentions_select on ourai.message_mentions
  for select using (
    mentioned_user_id = auth.uid()
    or exists (
      select 1 from ourai.chat_messages c
      where c.id = message_mentions.message_id
        and (
          ourai.is_workspace_member(c.workspace_id)
          or (ourai.is_support_workspace(c.workspace_id) and (c.author_id = auth.uid() or ourai.is_support_user()))
        )
    )
  );
create policy message_mentions_insert on ourai.message_mentions
  for insert with check (
    exists (
      select 1 from ourai.chat_messages c
      where c.id = message_mentions.message_id and c.author_id = auth.uid()
    )
  );

-- Realtime for the chat stream.
alter publication supabase_realtime add table ourai.chat_messages;

-- Seed a single shared Support workspace (well-known id). The Support *user*
-- is whoever signs in with SUPPORT_EMAIL; the app flags their profile
-- is_support = true on first sign-in (see the app's ensureProfile()).
insert into ourai.workspaces (id, name, kind, created_by)
values ('00000000-0000-0000-0000-0000000005a1', 'Support', 'support', null)
on conflict (id) do nothing;

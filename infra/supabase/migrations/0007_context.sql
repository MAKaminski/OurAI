-- Context library: create, organize, and sort context at org and personal
-- scope, with role-based permissions and AI-processing jobs (progress meters).
-- Schema `ourai` (never `public`).
--
-- Permissions (WHO can organize, HOW):
--   personal scope → the owning user has full control.
--   org scope      → members READ and ADD items; only org owners/admins may
--                    reorganize (move/reorder/delete) or run organize/sort jobs.

-- org-admin predicate (owner|admin) for the "who can organize" gate.
create or replace function ourai.is_org_admin(target_org uuid) returns boolean as $$
  select exists (
    select 1 from ourai.organization_members m
    where m.org_id = target_org and m.user_id = auth.uid() and m.role in ('owner', 'admin')
  );
$$ language sql stable security definer set search_path = ourai, auth;

create table ourai.context_collections (
  id         uuid primary key default extensions.gen_random_uuid(),
  scope      text not null check (scope in ('org', 'user')),
  org_id     uuid references ourai.organizations (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete cascade,
  name       text not null,
  position   int not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  constraint context_collection_scope check (
    (scope = 'org' and org_id is not null and user_id is null)
    or (scope = 'user' and user_id is not null and org_id is null)
  )
);
create index context_collections_owner_idx on ourai.context_collections (scope, org_id, user_id);

create table ourai.context_items (
  id            uuid primary key default extensions.gen_random_uuid(),
  scope         text not null check (scope in ('org', 'user')),
  org_id        uuid references ourai.organizations (id) on delete cascade,
  user_id       uuid references auth.users (id) on delete cascade,
  collection_id uuid references ourai.context_collections (id) on delete set null,
  title         text not null,
  body          text not null default '',
  tags          text[] not null default '{}',
  position      int not null default 0,
  created_by    uuid references auth.users (id),
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  constraint context_item_scope check (
    (scope = 'org' and org_id is not null and user_id is null)
    or (scope = 'user' and user_id is not null and org_id is null)
  )
);
create index context_items_owner_idx on ourai.context_items (scope, org_id, user_id);
create index context_items_collection_idx on ourai.context_items (collection_id);

-- AI-processing jobs (organize / sort / ingest) — drive the progress meters.
create table ourai.context_jobs (
  id         uuid primary key default extensions.gen_random_uuid(),
  scope      text not null check (scope in ('org', 'user')),
  org_id     uuid references ourai.organizations (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('organize', 'sort', 'ingest')),
  status     text not null default 'running' check (status in ('queued', 'running', 'done', 'error')),
  progress   int not null default 0 check (progress between 0 and 100),
  detail     text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint context_job_scope check (
    (scope = 'org' and org_id is not null and user_id is null)
    or (scope = 'user' and user_id is not null and org_id is null)
  )
);
create index context_jobs_owner_idx on ourai.context_jobs (scope, org_id, user_id, status);

alter table ourai.context_collections enable row level security;
alter table ourai.context_items enable row level security;
alter table ourai.context_jobs enable row level security;

-- Scope helpers reused in policies:
--   read  = personal owner OR org member
--   write = personal owner OR org admin (the "who can organize")
-- collections
create policy context_collections_select on ourai.context_collections
  for select using (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_member(org_id))
  );
create policy context_collections_write on ourai.context_collections
  for all
  using (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_admin(org_id))
  )
  with check (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_admin(org_id))
  );

-- items: members may read + ADD; only owners/admins may modify/delete/reorganize.
create policy context_items_select on ourai.context_items
  for select using (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_member(org_id))
  );
create policy context_items_insert on ourai.context_items
  for insert with check (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_member(org_id))
  );
create policy context_items_update on ourai.context_items
  for update
  using (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_admin(org_id))
  )
  with check (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_admin(org_id))
  );
create policy context_items_delete on ourai.context_items
  for delete using (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_admin(org_id))
  );

-- jobs: personal owner OR org admin (running an organize/sort is an admin action).
create policy context_jobs_select on ourai.context_jobs
  for select using (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_member(org_id))
  );
create policy context_jobs_write on ourai.context_jobs
  for all
  using (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_admin(org_id))
  )
  with check (
    (scope = 'user' and user_id = auth.uid())
    or (scope = 'org' and ourai.is_org_admin(org_id))
  );

-- Realtime so progress meters update live.
alter publication supabase_realtime add table ourai.context_jobs;

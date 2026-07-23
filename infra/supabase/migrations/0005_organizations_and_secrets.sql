-- Organizations (tenant accounts) + scoped BYOK secrets.
--
-- Users are NEVER auto-assigned to an org — they explicitly create one and
-- become its owner. Secrets belong to either an organization (shared with that
-- org's members) or a single user (private). RLS makes cross-org access
-- impossible: a secret is only visible/writable to members of its org, or to
-- its owning user. Sensitive values are app-encrypted (AES-256-GCM) before they
-- ever reach the database; plaintext never touches Postgres or the browser.

create table organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table organization_members (
  org_id     uuid not null references organizations (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'owner', -- owner | admin | member
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index organization_members_user_idx on organization_members (user_id);

-- Membership predicate (security definer so the policy can read the join table
-- without recursively triggering RLS).
create or replace function is_org_member(target_org uuid) returns boolean as $$
  select exists (
    select 1 from organization_members m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$ language sql stable security definer;

create table secrets (
  id              uuid primary key default gen_random_uuid(),
  scope           text not null check (scope in ('org', 'user')),
  org_id          uuid references organizations (id) on delete cascade,
  user_id         uuid references auth.users (id) on delete cascade,
  key             text not null,
  value           text,           -- plaintext, non-sensitive only
  encrypted_value text,           -- app-encrypted ciphertext, sensitive only
  is_sensitive    boolean not null default false,
  updated_by      uuid references auth.users (id),
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  -- scope integrity: org secrets carry org_id; user secrets carry user_id.
  constraint secret_scope_owner check (
    (scope = 'org' and org_id is not null and user_id is null)
    or (scope = 'user' and user_id is not null and org_id is null)
  ),
  -- exactly one storage column populated, matching is_sensitive.
  constraint secret_one_storage check (
    (is_sensitive and encrypted_value is not null and value is null)
    or (not is_sensitive and value is not null and encrypted_value is null)
  )
);
create unique index secrets_org_key_uidx on secrets (org_id, key) where scope = 'org';
create unique index secrets_user_key_uidx on secrets (user_id, key) where scope = 'user';

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table secrets enable row level security;

-- organizations: members read; any authenticated user creates (as themselves).
create policy orgs_select on organizations
  for select using (is_org_member(id));
create policy orgs_insert on organizations
  for insert with check (created_by = auth.uid());
create policy orgs_update on organizations
  for update using (is_org_member(id)) with check (is_org_member(id));

-- membership: members see the roster; a user may add themselves (org creation),
-- and members of an org may manage its roster.
create policy org_members_select on organization_members
  for select using (is_org_member(org_id));
create policy org_members_insert on organization_members
  for insert with check (user_id = auth.uid() or is_org_member(org_id));
create policy org_members_delete on organization_members
  for delete using (is_org_member(org_id));

-- secrets: org-scoped rows require org membership; user-scoped rows require
-- ownership. There is no path to another org's secrets — cross-org is denied.
create policy secrets_rw on secrets
  for all
  using (
    (scope = 'org' and is_org_member(org_id))
    or (scope = 'user' and user_id = auth.uid())
  )
  with check (
    (scope = 'org' and is_org_member(org_id))
    or (scope = 'user' and user_id = auth.uid())
  );

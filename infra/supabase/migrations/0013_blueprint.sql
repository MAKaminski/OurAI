-- Blueprint persistence: site-structure diagrams + external data sources.
-- Schema `ourai` (never `public`).
--
-- Model:
--   blueprint_maps — the persisted site-structure blueprint (nodes+edges JSON in
--                    `doc`) for an organization, versioned. One logical blueprint
--                    per org; `version` bumps on each save.
--   data_sources   — external data sources (postgres/mysql/bigquery/snowflake/rest)
--                    registered for an org. `secret_key` references the org's
--                    BYOK secret holding the connection credentials; schema
--                    introspection results are cached in `schema_cache`.
--
-- RLS: both tables are org-scoped. The existing security-definer predicate
-- `ourai.is_org_member(org_id)` (migrations/0005) gates all access — a
-- non-member can neither read nor write another org's rows. Cross-org is denied.

create table ourai.blueprint_maps (
  id         uuid primary key default extensions.gen_random_uuid(),
  org_id     uuid not null references ourai.organizations (id) on delete cascade,
  name       text not null,
  doc        jsonb not null,
  version    int not null default 1,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index blueprint_maps_org_idx on ourai.blueprint_maps (org_id);

create table ourai.data_sources (
  id                   uuid primary key default extensions.gen_random_uuid(),
  org_id               uuid not null references ourai.organizations (id) on delete cascade,
  name                 text not null,
  engine               text not null check (engine in ('postgres', 'mysql', 'bigquery', 'snowflake', 'rest')),
  secret_key           text not null,
  schema_cache         jsonb,
  last_introspected_at timestamptz,
  updated_by           uuid references auth.users (id),
  created_at           timestamptz not null default now()
);
create index data_sources_org_idx on ourai.data_sources (org_id);

alter table ourai.blueprint_maps enable row level security;
alter table ourai.data_sources enable row level security;

-- blueprint maps: org members read/write; no path to another org's blueprint.
create policy blueprint_maps_rw on ourai.blueprint_maps
  for all
  using (ourai.is_org_member(org_id))
  with check (ourai.is_org_member(org_id));

-- data sources: org members read/write; cross-org is denied.
create policy data_sources_rw on ourai.data_sources
  for all
  using (ourai.is_org_member(org_id))
  with check (ourai.is_org_member(org_id));

notify pgrst, 'reload schema';

-- Completes the product-workflow pipeline (schema `ourai`): the artifact-
-- producing stages after KPI (Design → Build → QA → Staging), and an in-app
-- feature-flag override store for the admin panel.
--
--   request_stage_artifacts — one row per proposed/edited item for an agentic
--                             stage (design section, build task, QA case,
--                             release-checklist entry). Same agent-proposes /
--                             human-approves gate as `request_kpis`, keyed by
--                             `stage`.
--   feature_flag_overrides  — admin-controlled on/off for a registry flag,
--                             consulted by `isFlagEnabled` ahead of PostHog.
--
-- Also widens `request_stage_runs.stage` to cover the new agentic stages.

-- Artifact output for the design/build/qa/staging stages.
create table ourai.request_stage_artifacts (
  id          uuid primary key default extensions.gen_random_uuid(),
  request_id  uuid not null references ourai.requests (id) on delete cascade,
  stage       text not null check (stage in ('design','build','qa','staging')),
  title       text not null,
  content     text,
  source      text not null default 'agent' check (source in ('agent','human')),
  status      text not null default 'proposed' check (status in ('proposed','accepted','rejected')),
  position    int not null default 0,
  created_by  uuid references auth.users (id),
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index request_stage_artifacts_idx
  on ourai.request_stage_artifacts (request_id, stage, position);

-- Widen the agentic-stage domain to the full pipeline.
alter table ourai.request_stage_runs drop constraint if exists request_stage_runs_stage_check;
alter table ourai.request_stage_runs
  add constraint request_stage_runs_stage_check
  check (stage in ('kpi','design','build','qa','staging'));

-- Admin-controlled feature-flag overrides. One row per registry flag key;
-- absence means "no override" (fall through to PostHog / registry default).
create table ourai.feature_flag_overrides (
  key        text primary key,
  enabled    boolean not null,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

alter table ourai.request_stage_artifacts enable row level security;
alter table ourai.feature_flag_overrides enable row level security;

-- artifacts: same company-membership join as request_kpis (through requests).
create policy request_stage_artifacts_rw on ourai.request_stage_artifacts
  for all
  using (exists (select 1 from ourai.requests r
                 where r.id = request_id and ourai.is_company_member(r.company_id)))
  with check (exists (select 1 from ourai.requests r
                      where r.id = request_id and ourai.is_company_member(r.company_id)));

-- flag overrides: any authenticated user may read (flags are not secret) so the
-- server-side flag evaluation path can resolve them. Writes go through the admin
-- API with the service-role key (gated by the admin email), never the anon key —
-- so there is deliberately no INSERT/UPDATE policy here.
create policy feature_flag_overrides_select on ourai.feature_flag_overrides
  for select using (auth.role() = 'authenticated');

-- Refresh PostgREST's schema cache so the API serves the new tables immediately.
notify pgrst, 'reload schema';

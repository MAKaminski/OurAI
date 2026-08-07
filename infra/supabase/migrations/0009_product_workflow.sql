-- Product workflow pipeline (schema `ourai`). The "(+) Add a Request" front door
-- and the agentic, human-reviewed stages that follow it.
--
--   requests            — the pipeline spine (one row per request), with a
--                         `stage` state machine (see @ourai/shared).
--   request_stage_runs  — one execution of an agentic stage (KPI, later Design):
--                         progress meter + the human-in-the-loop gate
--                         (status 'proposed' → a human 'approved'). Modeled on
--                         `ourai.context_jobs`.
--   request_kpis        — stage-2 output: KPIs proposed by the agent and then
--                         edited/approved by a human.
--
-- All rows are visible/writable only to members of the owning company
-- (`ourai.is_company_member`, from 0002_rls.sql). Nothing here touches `public`.

-- The pipeline spine.
create table ourai.requests (
  id           uuid primary key default extensions.gen_random_uuid(),
  company_id   uuid not null references ourai.companies (id) on delete cascade,
  title        text not null,
  body         text,
  stage        text not null default 'intake'
                 check (stage in ('intake','kpi_review','design','build','qa','staging','done','rejected')),
  priority     text not null default 'normal'
                 check (priority in ('low','normal','high','urgent')),
  acting_role  text,
  submitted_by uuid references auth.users (id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index requests_company_stage_idx on ourai.requests (company_id, stage);

-- One run of an agentic stage against a request (progress + HITL gate).
create table ourai.request_stage_runs (
  id             uuid primary key default extensions.gen_random_uuid(),
  request_id     uuid not null references ourai.requests (id) on delete cascade,
  stage          text not null check (stage in ('kpi','design')),
  status         text not null default 'queued'
                   check (status in ('queued','running','proposed','approved','error')),
  progress       int not null default 0 check (progress between 0 and 100),
  detail         text,
  model_provider text,
  model_id       text,
  cost_usd       numeric(10,4) not null default 0,
  created_by     uuid references auth.users (id),
  started_at     timestamptz,
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);
create index request_stage_runs_request_idx on ourai.request_stage_runs (request_id, created_at desc);

-- Stage-2 output: product KPIs (agent-proposed, human-editable).
create table ourai.request_kpis (
  id          uuid primary key default extensions.gen_random_uuid(),
  request_id  uuid not null references ourai.requests (id) on delete cascade,
  name        text not null,
  target      text not null,
  rationale   text,
  source      text not null default 'agent' check (source in ('agent','human')),
  status      text not null default 'proposed' check (status in ('proposed','accepted','rejected')),
  position    int not null default 0,
  created_by  uuid references auth.users (id),
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index request_kpis_request_idx on ourai.request_kpis (request_id, position);

alter table ourai.requests enable row level security;
alter table ourai.request_stage_runs enable row level security;
alter table ourai.request_kpis enable row level security;

-- requests: full CRUD for members of the owning company.
create policy requests_rw on ourai.requests
  for all
  using (ourai.is_company_member(company_id))
  with check (ourai.is_company_member(company_id));

-- stage runs / kpis: join through requests → company membership.
create policy request_stage_runs_rw on ourai.request_stage_runs
  for all
  using (exists (select 1 from ourai.requests r
                 where r.id = request_id and ourai.is_company_member(r.company_id)))
  with check (exists (select 1 from ourai.requests r
                      where r.id = request_id and ourai.is_company_member(r.company_id)));

create policy request_kpis_rw on ourai.request_kpis
  for all
  using (exists (select 1 from ourai.requests r
                 where r.id = request_id and ourai.is_company_member(r.company_id)))
  with check (exists (select 1 from ourai.requests r
                      where r.id = request_id and ourai.is_company_member(r.company_id)));

-- Companies were scaffolded in 0001/0002 but never received the two fixes that
-- organizations later got (0005/0008). `createCompany` mirrors `createOrg`, so it
-- needs both to work under the user-scoped (anon-key) client:
--
-- 1) The insert-returning RLS race 0008 fixed for `orgs_select`: creating a company
--    reads the row back via insert().select() before the creator's membership row
--    exists, so the SELECT policy must also admit the creator directly.
drop policy if exists companies_select on ourai.companies;
create policy companies_select on ourai.companies
  for select using (ourai.is_company_member(id) or created_by = auth.uid());

-- 2) `company_members` had only a SELECT policy (0002) — no way to insert the owner
--    row. Mirror `org_members_insert` (0005): a user may add themselves (company
--    creation) and members may manage the roster.
drop policy if exists members_insert on ourai.company_members;
create policy members_insert on ourai.company_members
  for insert with check (user_id = auth.uid() or ourai.is_company_member(company_id));

-- Refresh PostgREST's schema cache so the API serves the new tables immediately.
notify pgrst, 'reload schema';

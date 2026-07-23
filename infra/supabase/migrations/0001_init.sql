-- OurAI initial schema.
-- Hierarchy: companies → ideas (intake) → work_items → sessions → events.
-- The append-only `events` log is the shared transcript, audit trail, and
-- replay mechanism all at once.

create extension if not exists "pgcrypto";

-- One company = one GitHub repo. The idea-intake front door.
create table companies (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  github_repo    text not null,                -- "owner/repo"
  default_branch text not null default 'main',
  description    text,
  created_by     uuid not null references auth.users (id),
  created_at     timestamptz not null default now()
);

create table company_members (
  company_id uuid not null references companies (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'dev',      -- cosmetic: product|dev|qa|devops|sales|pm
  color      text not null default '#2563eb',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

-- The intake backlog.
create table ideas (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies (id) on delete cascade,
  title        text not null,
  body         text,
  status       text not null default 'inbox',  -- inbox|triaged|promoted|shipped|rejected
  acting_role  text,                           -- role the submitter acted as (cosmetic)
  submitted_by uuid references auth.users (id),
  created_at   timestamptz not null default now()
);
create index ideas_company_status_idx on ideas (company_id, status);

-- A promoted idea → one branch → one agent session.
create table work_items (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies (id) on delete cascade,
  idea_id      uuid references ideas (id) on delete set null,
  title        text not null,
  branch       text not null,                  -- ourai/<slug>
  status       text not null default 'queued', -- queued|running|awaiting_review|merged|failed|abandoned
  acting_role  text,
  submitted_by uuid references auth.users (id),
  created_at   timestamptz not null default now()
);
create unique index work_items_company_branch_uidx on work_items (company_id, branch);
create index work_items_company_status_idx on work_items (company_id, status);

-- One agent run bound to a work item + its branch.
create table sessions (
  id             uuid primary key default gen_random_uuid(),
  work_item_id   uuid not null references work_items (id) on delete cascade,
  status         text not null default 'queued', -- queued|running|paused|done|error
  model_provider text,
  model_id       text,
  cost_usd       numeric(10, 4) not null default 0,
  started_at     timestamptz,
  ended_at       timestamptz,
  created_at     timestamptz not null default now()
);
create index sessions_work_item_idx on sessions (work_item_id);

-- Append-only transcript. `seq` is monotonic within a session and is the live
-- cursor for getEvents(sinceSeq) + realtime replay. Assigned in-DB (see the
-- trigger below) so concurrent appends never collide.
create table events (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions (id) on delete cascade,
  seq         bigint not null,
  kind        text not null,                   -- message|tool_call|tool_result|diff|status|system
  author_type text not null,                   -- human|agent|system
  author_id   uuid,                            -- nullable (system events)
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);
create unique index events_session_seq_uidx on events (session_id, seq);
create index events_session_created_idx on events (session_id, created_at);

-- Assign a gap-free per-session sequence at insert time.
create or replace function assign_event_seq() returns trigger as $$
begin
  if new.seq is null or new.seq = 0 then
    select coalesce(max(seq), 0) + 1 into new.seq from events where session_id = new.session_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger events_assign_seq
  before insert on events
  for each row
  execute function assign_event_seq();

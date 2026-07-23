-- Row-level security (schema `ourai`): a user can only see/act on rows for
-- companies they belong to. The orchestrator connects with the service-role key
-- and bypasses RLS to write events; the browser uses the anon key and is
-- constrained by these policies.

alter table ourai.companies enable row level security;
alter table ourai.company_members enable row level security;
alter table ourai.ideas enable row level security;
alter table ourai.work_items enable row level security;
alter table ourai.sessions enable row level security;
alter table ourai.events enable row level security;

-- Helper predicate: is auth.uid() a member of the given company?
-- security definer + a pinned search_path so the policy can read the join table
-- safely and only ever resolves objects inside `ourai`/`auth`.
create or replace function ourai.is_company_member(target_company uuid) returns boolean as $$
  select exists (
    select 1 from ourai.company_members m
    where m.company_id = target_company and m.user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = ourai, auth;

-- companies: members can read; the creator row is inserted at create time.
create policy companies_select on ourai.companies
  for select using (ourai.is_company_member(id));
create policy companies_insert on ourai.companies
  for insert with check (created_by = auth.uid());

-- company_members: members can read the roster.
create policy members_select on ourai.company_members
  for select using (ourai.is_company_member(company_id));

-- ideas / work_items: scoped to company membership.
create policy ideas_rw on ourai.ideas
  for all using (ourai.is_company_member(company_id)) with check (ourai.is_company_member(company_id));
create policy work_items_rw on ourai.work_items
  for all using (ourai.is_company_member(company_id)) with check (ourai.is_company_member(company_id));

-- sessions / events: join through work_items → companies.
create policy sessions_select on ourai.sessions
  for select using (
    exists (
      select 1 from ourai.work_items w
      where w.id = sessions.work_item_id and ourai.is_company_member(w.company_id)
    )
  );
create policy events_select on ourai.events
  for select using (
    exists (
      select 1 from ourai.sessions s
      join ourai.work_items w on w.id = s.work_item_id
      where s.id = events.session_id and ourai.is_company_member(w.company_id)
    )
  );

-- Realtime: publish the ourai.events table so subscribeEvents() receives inserts.
-- (Presence uses ephemeral Realtime channels keyed session:<id>, no table.)
alter publication supabase_realtime add table ourai.events;

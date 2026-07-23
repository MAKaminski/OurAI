-- Row-level security: a user can only see/act on rows for companies they belong
-- to. The orchestrator connects with the service-role key and bypasses RLS to
-- write events; the browser uses the anon key and is constrained by these
-- policies.

alter table companies enable row level security;
alter table company_members enable row level security;
alter table ideas enable row level security;
alter table work_items enable row level security;
alter table sessions enable row level security;
alter table events enable row level security;

-- Helper predicate: is auth.uid() a member of the given company?
create or replace function is_company_member(target_company uuid) returns boolean as $$
  select exists (
    select 1 from company_members m
    where m.company_id = target_company and m.user_id = auth.uid()
  );
$$ language sql stable security definer;

-- companies: members can read; the creator row is inserted at create time.
create policy companies_select on companies
  for select using (is_company_member(id));
create policy companies_insert on companies
  for insert with check (created_by = auth.uid());

-- company_members: members can read the roster.
create policy members_select on company_members
  for select using (is_company_member(company_id));

-- ideas / work_items: scoped to company membership.
create policy ideas_rw on ideas
  for all using (is_company_member(company_id)) with check (is_company_member(company_id));
create policy work_items_rw on work_items
  for all using (is_company_member(company_id)) with check (is_company_member(company_id));

-- sessions / events: join through work_items → companies.
create policy sessions_select on sessions
  for select using (
    exists (
      select 1 from work_items w
      where w.id = sessions.work_item_id and is_company_member(w.company_id)
    )
  );
create policy events_select on events
  for select using (
    exists (
      select 1 from sessions s
      join work_items w on w.id = s.work_item_id
      where s.id = events.session_id and is_company_member(w.company_id)
    )
  );

-- Realtime: publish the events table so subscribeEvents() receives inserts.
-- (Presence uses ephemeral Realtime channels keyed session:<id>, no table.)
alter publication supabase_realtime add table events;

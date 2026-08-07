-- Fix: creating an organization failed for every user. Schema `ourai`.
--
-- Two problems this migration addresses:
--
-- 1) RLS ordering bug. `createOrg` inserts the organization and reads it back in
--    a single `insert ... returning` call (PostgREST `.select().single()`). The
--    RETURNING rows are filtered by the SELECT policy, which was
--    `is_org_member(id)` only. At insert time the creator's membership row does
--    NOT exist yet (it is added in the very next statement), so the RETURNING
--    select matched zero rows and the client threw "no rows returned" — the org
--    row was written but the call reported failure. We broaden `orgs_select` so
--    a creator can always see the org they just created, independent of the
--    membership join. Members still see org rows via `is_org_member`.
--
-- 2) Stale PostgREST schema cache. Newly migrated `ourai` tables can be absent
--    from PostgREST's cached schema until it is told to reload, which surfaces
--    to users as a "could not find the table in the schema cache" error. The
--    NOTIFY at the end forces a reload whenever this migration is applied.

drop policy if exists orgs_select on ourai.organizations;
create policy orgs_select on ourai.organizations
  for select using (ourai.is_org_member(id) or created_by = auth.uid());

-- Refresh PostgREST's schema cache so the API can serve every `ourai` table.
notify pgrst, 'reload schema';

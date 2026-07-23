-- OurAI lives in its OWN dedicated Postgres schema, completely isolated from
-- this project's `public` schema. Every OurAI table, function, trigger, index,
-- and policy is created inside `ourai` — nothing OurAI does ever touches
-- `public`. This lets OurAI coexist in a shared Supabase project without any
-- overlap with the other project's data.
create schema if not exists ourai;

-- gen_random_uuid() comes from pgcrypto. On Supabase it is installed in the
-- `extensions` schema; pinning it there (and calling it fully qualified in the
-- migrations) keeps us off `public` entirely. `if not exists` is a no-op when
-- the extension is already present.
create extension if not exists "pgcrypto" with schema extensions;

-- Let the Supabase API roles reach the `ourai` schema (row access is still
-- governed by RLS). Default privileges apply to every object the subsequent
-- migrations create in this schema, so tables/functions/sequences are covered
-- automatically. The `ourai` schema must also be added to the project's
-- "Exposed schemas" in API settings (see docs/DEPLOY.md).
grant usage on schema ourai to anon, authenticated, service_role;
alter default privileges in schema ourai grant all on tables to anon, authenticated, service_role;
alter default privileges in schema ourai grant all on routines to anon, authenticated, service_role;
alter default privileges in schema ourai grant all on sequences to anon, authenticated, service_role;

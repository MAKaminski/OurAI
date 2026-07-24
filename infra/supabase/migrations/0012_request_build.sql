-- Build stage output: the draft Pull Request opened on the company's connected
-- GitHub repo (schema `ourai`). The Build agent generates file changes and opens
-- a draft PR server-side (PAT-based); these columns record the result so the UI
-- can link to it from the request and all later stages. Existing `requests_rw`
-- RLS already covers these columns — no policy change.

alter table ourai.requests add column if not exists pr_url text;
alter table ourai.requests add column if not exists pr_number int;
alter table ourai.requests add column if not exists build_branch text;
alter table ourai.requests add column if not exists build_head_sha text;

notify pgrst, 'reload schema';

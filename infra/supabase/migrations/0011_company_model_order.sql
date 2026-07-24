-- Per-company preferred model-provider order (schema `ourai`).
--
-- The KPI/stage agents try providers in a ranked order and fall through to the
-- next on failure. That order was a hardcoded default (deepseek → kimi →
-- anthropic); this table lets each company override it. Provider *keys* remain
-- in each user's vault (`secrets`); this only decides which provider to try
-- first. RLS scopes a row to members of the owning company.

create table ourai.company_model_preferences (
  company_id     uuid primary key references ourai.companies (id) on delete cascade,
  provider_order text[] not null default '{deepseek,kimi,anthropic}',
  updated_by     uuid references auth.users (id),
  updated_at     timestamptz not null default now()
);

alter table ourai.company_model_preferences enable row level security;

create policy company_model_preferences_rw on ourai.company_model_preferences
  for all
  using (ourai.is_company_member(company_id))
  with check (ourai.is_company_member(company_id));

notify pgrst, 'reload schema';

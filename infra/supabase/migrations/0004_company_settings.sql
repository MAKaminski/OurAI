-- Bring-your-own-keys (BYOK) configuration, scoped per company. Schema `ourai`.
-- Non-sensitive values are stored in `value` (readable). Sensitive values are
-- encrypted by the application (AES-256-GCM) and stored in `encrypted_value`;
-- the plaintext of a sensitive value never touches the database or the client.

create table ourai.company_settings (
  id              uuid primary key default extensions.gen_random_uuid(),
  company_id      uuid not null references ourai.companies (id) on delete cascade,
  key             text not null,
  value           text,           -- plaintext, for non-sensitive settings only
  encrypted_value text,           -- app-encrypted ciphertext, for sensitive settings
  is_sensitive    boolean not null default false,
  updated_by      uuid references auth.users (id),
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (company_id, key),
  -- exactly one storage column is populated, matching is_sensitive
  constraint one_storage check (
    (is_sensitive and encrypted_value is not null and value is null)
    or (not is_sensitive and value is not null and encrypted_value is null)
  )
);
create index company_settings_company_idx on ourai.company_settings (company_id);

-- RLS: only members of the company may touch its settings. The server uses the
-- service-role key (bypasses RLS) to read+decrypt+mask before returning to the
-- client, so raw ciphertext is never needed by the browser.
alter table ourai.company_settings enable row level security;

create policy company_settings_rw on ourai.company_settings
  for all
  using (ourai.is_company_member(company_id))
  with check (ourai.is_company_member(company_id));

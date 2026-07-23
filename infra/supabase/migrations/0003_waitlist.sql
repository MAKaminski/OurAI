-- Pre-signup waitlist capture (public landing page). Schema `ourai`.

create table if not exists ourai.waitlist (
  id         uuid primary key default extensions.gen_random_uuid(),
  email      text not null unique,
  role       text,
  source     text,
  created_at timestamptz not null default now()
);

-- The waitlist is written by the server (service-role key) only; no public
-- read/write. RLS on with no policies = deny all for anon/auth roles.
alter table ourai.waitlist enable row level security;

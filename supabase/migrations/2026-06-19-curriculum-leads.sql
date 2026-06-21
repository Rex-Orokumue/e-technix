-- curriculum_leads: captures email leads from the public /curriculum unlock gate.
-- Only the service-role key (server API routes) may read/write — RLS is enabled
-- with no policies, so the anon/public key has no access.

create table if not exists public.curriculum_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  track_interest text,
  user_agent text,
  referer text,
  created_at timestamptz not null default now()
);

create index if not exists curriculum_leads_email_idx on public.curriculum_leads (email);

alter table public.curriculum_leads enable row level security;
-- No RLS policies: anon/authenticated keys have no access.
-- Grant table privileges to service_role only, so the server API (service-role
-- key) can read/write while public keys cannot.
grant select, insert, update, delete on public.curriculum_leads to service_role;

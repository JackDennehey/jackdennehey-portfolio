create extension if not exists pgcrypto;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 50),
  organization text check (organization is null or char_length(organization) <= 80),
  message text not null check (char_length(message) between 5 and 500),
  original_text text not null,
  normalized_message_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'blocked')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  moderation_reason text,
  submission_fingerprint text not null,
  user_agent_category text
);

create index if not exists guestbook_entries_status_created_at_idx
  on public.guestbook_entries (status, created_at desc);

create index if not exists guestbook_entries_approved_at_idx
  on public.guestbook_entries (approved_at desc)
  where status = 'approved';

create index if not exists guestbook_entries_fingerprint_created_at_idx
  on public.guestbook_entries (submission_fingerprint, created_at desc);

create index if not exists guestbook_entries_message_hash_created_at_idx
  on public.guestbook_entries (normalized_message_hash, created_at desc);

alter table public.guestbook_entries enable row level security;

revoke all on table public.guestbook_entries from anon;
revoke all on table public.guestbook_entries from authenticated;

create or replace view public.guestbook_public_entries as
select
  id,
  display_name,
  organization,
  message,
  approved_at,
  created_at
from public.guestbook_entries
where status = 'approved';

grant select on public.guestbook_public_entries to anon;
grant select on public.guestbook_public_entries to authenticated;

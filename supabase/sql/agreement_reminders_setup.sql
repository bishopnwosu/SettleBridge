-- =====================================================
-- SETTLEBRIDGE: REMINDERS FOR UNSIGNED PROVIDER AGREEMENTS
-- Safe to run more than once.
-- =====================================================


-- 1. KEEP TRACK OF REMINDERS
alter table public.provider_agreements
  add column if not exists reminder_count integer not null default 0,
  add column if not exists last_reminder_at timestamptz,
  add column if not exists reminder_error text;


-- 2. A PRIVATE SECRET FOR THE AUTOMATIC REMINDERS
-- The "private" schema is not reachable from the website or the API.
-- The secret is created once, here, and never leaves the database except
-- inside the daily scheduled call to the reminder function.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secrets (
  name text primary key,
  value text not null,
  created_at timestamptz not null default now()
);

revoke all on private.app_secrets from public, anon, authenticated;

insert into private.app_secrets (name, value)
values (
  'agreement_reminder_secret',
  replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
)
on conflict (name) do nothing;

create or replace function private.reminder_secret_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from private.app_secrets s
     where s.name = 'agreement_reminder_secret'
       and char_length(coalesce(p_secret, '')) >= 40
       and s.value = p_secret
  );
$$;


-- 3. WHICH AGREEMENTS NEED AN AUTOMATIC REMINDER TODAY
-- Reminder 1: 3 days after sending. Reminder 2: 7 days after reminder 1.
-- Reminder 3 (last): 10 days after reminder 2. Signed agreements never get reminders.
create or replace function public.agreements_due_for_reminder(p_secret text)
returns table (
  id uuid,
  reference text,
  version text,
  business_name text,
  contact_name text,
  email text,
  category_name text,
  location text,
  approved_on date,
  reminder_count integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.reminder_secret_ok(p_secret) then
    raise exception 'not_allowed';
  end if;

  return query
    select a.id, a.reference, a.version, a.business_name, a.contact_name, a.email,
           a.category_name, a.location, a.approved_on, a.reminder_count
      from public.provider_agreements a
     where a.status = 'sent'
       and a.email_sent_at is not null
       and a.reminder_count < 3
       and coalesce(a.last_reminder_at, a.sent_at) <= now() - (
             case a.reminder_count
               when 0 then interval '3 days'
               when 1 then interval '7 days'
               else interval '10 days'
             end
           )
     order by a.sent_at
     limit 50;
end;
$$;


-- 4. GIVE AN AGREEMENT A NEW SIGNING LINK FOR A REMINDER
create or replace function public.agreement_reminder_new_link(
  p_secret text,
  p_agreement_id uuid,
  p_token_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.reminder_secret_ok(p_secret) then
    raise exception 'not_allowed';
  end if;

  if p_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_hash';
  end if;

  update public.provider_agreements a
     set token_hash = p_token_hash,
         token_expires_at = now() + interval '30 days'
   where a.id = p_agreement_id
     and a.status = 'sent';

  return found;
end;
$$;


-- 5. RECORD THE RESULT OF A REMINDER EMAIL
create or replace function public.agreement_reminder_record(
  p_secret text,
  p_agreement_id uuid,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.reminder_secret_ok(p_secret) then
    raise exception 'not_allowed';
  end if;

  update public.provider_agreements a
     set reminder_count = a.reminder_count + case when p_error is null then 1 else 0 end,
         last_reminder_at = case when p_error is null then now() else a.last_reminder_at end,
         reminder_error = left(p_error, 500)
   where a.id = p_agreement_id;
end;
$$;

revoke all on function private.reminder_secret_ok(text) from public, anon, authenticated;
revoke all on function public.agreements_due_for_reminder(text) from public;
revoke all on function public.agreement_reminder_new_link(text, uuid, text) from public;
revoke all on function public.agreement_reminder_record(text, uuid, text) from public;

-- The reminder function calls these with the public key, so they must be callable,
-- but they do nothing without the private secret.
grant execute on function public.agreements_due_for_reminder(text) to anon, authenticated;
grant execute on function public.agreement_reminder_new_link(text, uuid, text) to anon, authenticated;
grant execute on function public.agreement_reminder_record(text, uuid, text) to anon, authenticated;

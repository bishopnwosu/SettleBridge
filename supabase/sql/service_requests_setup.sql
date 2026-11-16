-- =====================================================
-- SETTLEBRIDGE: SERVICE REQUESTS FROM NEWCOMERS
-- Visitors can SEND a request. Only admins can READ requests.
-- Safe to run more than once.
-- =====================================================


-- 1. THE REQUESTS TABLE
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid
    references public.providers (id) on delete set null,
  provider_name text not null
    check (char_length(provider_name) <= 150),
  requester_name text not null
    check (char_length(trim(requester_name)) between 2 and 100),
  requester_email text not null
    check (
      char_length(requester_email) <= 254
      and requester_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ),
  requester_phone text
    check (requester_phone is null or char_length(requester_phone) <= 40),
  preferred_contact text not null default 'email'
    check (preferred_contact in ('email', 'phone', 'whatsapp')),
  preferred_date date,
  message text not null
    check (char_length(trim(message)) between 10 and 2000),
  consent boolean not null
    check (consent = true),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'forwarded', 'closed')),
  admin_notes text
    check (admin_notes is null or char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A phone number is needed if the person wants a call or WhatsApp
  constraint service_requests_phone_needed
    check (preferred_contact = 'email' or requester_phone is not null)
);

create index if not exists service_requests_status_idx
  on public.service_requests (status, created_at desc);

create index if not exists service_requests_email_idx
  on public.service_requests (requester_email, created_at desc);


-- 2. CHECKS ON EVERY NEW REQUEST
-- * Visitors cannot set the status or admin notes themselves
-- * The provider must exist and be listed (its real name is copied in)
-- * The preferred date cannot be in the past
-- * Simple spam protection: at most 5 requests per email address per hour
create or replace function public.check_new_service_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  listed_name text;
  recent_count integer;
begin
  new.status := 'new';
  new.admin_notes := null;
  new.created_at := now();
  new.updated_at := now();
  new.requester_email := lower(trim(new.requester_email));
  new.requester_name := trim(new.requester_name);
  new.requester_phone := nullif(trim(coalesce(new.requester_phone, '')), '');

  select p.business_name
    into listed_name
    from public.providers p
   where p.id = new.provider_id
     and p.is_listed = true;

  if listed_name is null then
    raise exception 'provider_not_available';
  end if;

  new.provider_name := listed_name;

  if new.preferred_date is not null and new.preferred_date < current_date then
    raise exception 'date_in_past';
  end if;

  select count(*)
    into recent_count
    from public.service_requests r
   where r.requester_email = new.requester_email
     and r.created_at > now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception 'too_many_requests';
  end if;

  return new;
end;
$$;

drop trigger if exists service_requests_check_new on public.service_requests;

create trigger service_requests_check_new
  before insert on public.service_requests
  for each row execute function public.check_new_service_request();

-- Keep updated_at correct when an admin changes a request
drop trigger if exists service_requests_set_updated_at on public.service_requests;

create trigger service_requests_set_updated_at
  before update on public.service_requests
  for each row execute function public.set_provider_updated_at();


-- 3. SECURITY RULES (ROW LEVEL SECURITY)
alter table public.service_requests enable row level security;

grant insert on public.service_requests to anon, authenticated;
grant select, update, delete on public.service_requests to authenticated;

-- Anyone can SEND a request (only with consent). Nobody but admins can read them.
drop policy if exists "Anyone can send a request" on public.service_requests;
create policy "Anyone can send a request"
  on public.service_requests for insert
  to anon, authenticated
  with check (consent = true);

drop policy if exists "Admins can read requests" on public.service_requests;
create policy "Admins can read requests"
  on public.service_requests for select
  to authenticated
  using (public.is_settlebridge_admin());

drop policy if exists "Admins can update requests" on public.service_requests;
create policy "Admins can update requests"
  on public.service_requests for update
  to authenticated
  using (public.is_settlebridge_admin())
  with check (public.is_settlebridge_admin());

drop policy if exists "Admins can delete requests" on public.service_requests;
create policy "Admins can delete requests"
  on public.service_requests for delete
  to authenticated
  using (public.is_settlebridge_admin());

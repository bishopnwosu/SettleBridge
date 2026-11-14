-- =====================================================
-- SETTLEBRIDGE: PUBLIC PROVIDER PROFILES
-- Creates a public profile automatically when an application is approved.
-- Contact details (email, phone, WhatsApp) are NOT copied: they stay private.
-- Safe to run more than once.
-- =====================================================


-- 1. THE PROVIDERS TABLE (public business information only)
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique
    references public.provider_applications (id) on delete set null,
  business_name text not null
    check (char_length(business_name) between 1 and 150),
  slug text not null unique
    check (char_length(slug) <= 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid
    references public.service_categories (id) on delete set null,
  city text,
  country text,
  description text not null default '',
  languages text,
  service_area text,
  pricing_type text,
  base_price numeric
    check (base_price is null or base_price >= 0),
  is_listed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists providers_listing_idx
  on public.providers (is_listed, category_id, city);


-- 2. WEB ADDRESS FOR EACH PROVIDER
-- "Lisboa Airport Transfers" -> "lisboa-airport-transfers-3f9a1c"
-- (the last 6 characters come from the application id, so addresses never clash)
create or replace function public.make_provider_slug(business_name text, application_id uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(
           nullif(
             trim(both '-' from left(
               regexp_replace(
                 translate(
                   lower(coalesce(business_name, '')),
                   'áàâãäåçéèêëíìîïóòôõöúùûüñ',
                   'aaaaaaceeeeiiiiooooouuuun'
                 ),
                 '[^a-z0-9]+', '-', 'g'
               ),
               80
             )),
             ''
           ),
           'provider'
         )
         || '-' || left(replace(application_id::text, '-', ''), 6);
$$;


-- 3. AUTOMATIC PROFILE WHEN AN APPLICATION IS APPROVED
-- Approved  -> profile created (or shown again if it existed)
-- Changed away from approved -> profile hidden (not deleted)
create or replace function public.sync_provider_from_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.providers (
      application_id, business_name, slug, category_id, city, country,
      description, languages, service_area, pricing_type, base_price, is_listed
    )
    values (
      new.id,
      new.business_name,
      public.make_provider_slug(new.business_name, new.id),
      new.category_id,
      new.city,
      new.country,
      coalesce(new.service_description, ''),
      new.languages,
      new.service_area,
      new.pricing_type,
      new.base_price,
      true
    )
    on conflict (application_id) do update
      set is_listed = true;

  elsif old.status = 'approved' and new.status is distinct from 'approved' then
    update public.providers
       set is_listed = false
     where application_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists provider_applications_sync_provider on public.provider_applications;

create trigger provider_applications_sync_provider
  after update of status on public.provider_applications
  for each row execute function public.sync_provider_from_application();


-- 4. KEEP updated_at CORRECT ON EVERY CHANGE
create or replace function public.set_provider_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists providers_set_updated_at on public.providers;

create trigger providers_set_updated_at
  before update on public.providers
  for each row execute function public.set_provider_updated_at();


-- 5. PROFILES FOR PROVIDERS YOU HAVE ALREADY APPROVED
insert into public.providers (
  application_id, business_name, slug, category_id, city, country,
  description, languages, service_area, pricing_type, base_price, is_listed
)
select
  a.id,
  a.business_name,
  public.make_provider_slug(a.business_name, a.id),
  a.category_id,
  a.city,
  a.country,
  coalesce(a.service_description, ''),
  a.languages,
  a.service_area,
  a.pricing_type,
  a.base_price,
  true
from public.provider_applications a
where a.status = 'approved'
on conflict (application_id) do nothing;


-- 6. SECURITY RULES (ROW LEVEL SECURITY)
alter table public.providers enable row level security;

grant select on public.providers to anon, authenticated;
grant insert, update, delete on public.providers to authenticated;

drop policy if exists "Anyone can see listed providers" on public.providers;
create policy "Anyone can see listed providers"
  on public.providers for select
  to anon, authenticated
  using (is_listed = true);

drop policy if exists "Admins can see all providers" on public.providers;
create policy "Admins can see all providers"
  on public.providers for select
  to authenticated
  using (public.is_settlebridge_admin());

drop policy if exists "Admins can add providers" on public.providers;
create policy "Admins can add providers"
  on public.providers for insert
  to authenticated
  with check (public.is_settlebridge_admin());

drop policy if exists "Admins can edit providers" on public.providers;
create policy "Admins can edit providers"
  on public.providers for update
  to authenticated
  using (public.is_settlebridge_admin())
  with check (public.is_settlebridge_admin());

drop policy if exists "Admins can delete providers" on public.providers;
create policy "Admins can delete providers"
  on public.providers for delete
  to authenticated
  using (public.is_settlebridge_admin());

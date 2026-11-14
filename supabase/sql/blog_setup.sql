-- =====================================================
-- SETTLEBRIDGE BLOG (GUIDES): DATABASE AND IMAGE STORAGE
-- Safe to run more than once.
-- =====================================================


-- 1. THE BLOG POSTS TABLE
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null
    check (char_length(title) between 3 and 150),
  slug text not null unique
    check (char_length(slug) <= 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text
    check (summary is null or char_length(summary) <= 300),
  content text not null default ''
    check (char_length(content) <= 50000),
  category text not null default 'Getting started'
    check (category in ('Getting started', 'Paperwork', 'Housing', 'City guides')),
  cover_image_path text,
  cover_image_alt text
    check (cover_image_alt is null or char_length(cover_image_alt) <= 200),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Makes "newest published posts first" fast
create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);


-- 2. AUTOMATIC DATES
-- updated_at changes on every save.
-- published_at is set the first time a post is published.
create or replace function public.set_blog_post_dates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists blog_posts_set_dates on public.blog_posts;

create trigger blog_posts_set_dates
  before insert or update on public.blog_posts
  for each row execute function public.set_blog_post_dates();


-- 3. SECURITY RULES (ROW LEVEL SECURITY)
alter table public.blog_posts enable row level security;

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

-- Visitors (logged in or not) can read PUBLISHED posts only
drop policy if exists "Anyone can read published posts" on public.blog_posts;
create policy "Anyone can read published posts"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'published');

-- Admins can read every post, including drafts
drop policy if exists "Admins can read all posts" on public.blog_posts;
create policy "Admins can read all posts"
  on public.blog_posts for select
  to authenticated
  using (public.is_settlebridge_admin());

-- Only admins can create, edit or delete posts
drop policy if exists "Admins can create posts" on public.blog_posts;
create policy "Admins can create posts"
  on public.blog_posts for insert
  to authenticated
  with check (public.is_settlebridge_admin());

drop policy if exists "Admins can edit posts" on public.blog_posts;
create policy "Admins can edit posts"
  on public.blog_posts for update
  to authenticated
  using (public.is_settlebridge_admin())
  with check (public.is_settlebridge_admin());

drop policy if exists "Admins can delete posts" on public.blog_posts;
create policy "Admins can delete posts"
  on public.blog_posts for delete
  to authenticated
  using (public.is_settlebridge_admin());


-- 4. COVER IMAGE STORAGE
-- A public "folder" for blog images: anyone can VIEW them,
-- only admins can upload, replace or delete. JPG, PNG or WebP, max 2 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Admins can upload blog images" on storage.objects;
create policy "Admins can upload blog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_settlebridge_admin());

drop policy if exists "Admins can replace blog images" on storage.objects;
create policy "Admins can replace blog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and public.is_settlebridge_admin())
  with check (bucket_id = 'blog-images' and public.is_settlebridge_admin());

drop policy if exists "Admins can delete blog images" on storage.objects;
create policy "Admins can delete blog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.is_settlebridge_admin());

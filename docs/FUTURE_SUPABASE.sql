-- FUTURE / NOT USED IN LOCAL MVP
-- Optional reference when you add Supabase later (Postgres + Storage).
-- See README “Future backend” section.

-- Fragments MVP: public community wall (tighten RLS before production if needed)
-- Run in Supabase Dashboard → SQL → New query

-- 1) Table: collage image URL + JSON meta (mood, style, challenge, title, reflection, etc.)
create table if not exists public.community_fragments (
  id uuid primary key,
  created_at timestamptz not null default now(),
  image_url text not null,
  meta jsonb not null,
  anonymous boolean not null default true
);

comment on table public.community_fragments is 'Shared collage fragments; meta matches app CommunityFragmentMeta';

create index if not exists community_fragments_created_at_idx
  on public.community_fragments (created_at desc);

alter table public.community_fragments enable row level security;

-- Open MVP: anyone can read and insert (no auth). Replace with stricter policies later.
drop policy if exists "community_fragments_select_public" on public.community_fragments;
create policy "community_fragments_select_public"
  on public.community_fragments for select
  to anon, authenticated
  using (true);

drop policy if exists "community_fragments_insert_public" on public.community_fragments;
create policy "community_fragments_insert_public"
  on public.community_fragments for insert
  to anon, authenticated
  with check (true);

-- 2) Storage bucket (public URLs for simple gallery <img/blob> flow)
insert into storage.buckets (id, name, public)
values ('community-collages', 'community-collages', true)
on conflict (id) do update set public = excluded.public;

-- Allow public read of objects
drop policy if exists "community_collages_read" on storage.objects;
create policy "community_collages_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'community-collages');

-- Allow anon + authenticated uploads (MVP). Consider signed uploads + Edge Function later.
drop policy if exists "community_collages_insert" on storage.objects;
create policy "community_collages_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'community-collages');

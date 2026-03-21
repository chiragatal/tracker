create table public.tracker_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  icon text not null default '📋',
  description text not null default '',
  fields jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.tracker_types enable row level security;

create policy "Anyone can view tracker types"
  on public.tracker_types for select
  using (true);

create policy "Authenticated users can create tracker types"
  on public.tracker_types for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Creator can update their tracker types"
  on public.tracker_types for update
  to authenticated
  using (auth.uid() = created_by);

create policy "Creator can delete their tracker types"
  on public.tracker_types for delete
  to authenticated
  using (auth.uid() = created_by);

create index idx_tracker_types_slug on public.tracker_types(slug);
create index idx_tracker_types_created_by on public.tracker_types(created_by);

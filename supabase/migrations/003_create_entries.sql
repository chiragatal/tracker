create table public.entries (
  id uuid default gen_random_uuid() primary key,
  tracker_type_id uuid references public.tracker_types(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  status text not null default 'done' check (status in ('done', 'want_to')),
  data jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.entries enable row level security;

create policy "Users can view their own entries"
  on public.entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create entries"
  on public.entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.entries for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.entries for delete
  to authenticated
  using (auth.uid() = user_id);

create index idx_entries_user on public.entries(user_id);
create index idx_entries_tracker on public.entries(tracker_type_id);
create index idx_entries_status on public.entries(status);
create index idx_entries_created on public.entries(created_at desc);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entries_updated_at
  before update on public.entries
  for each row execute function update_updated_at();

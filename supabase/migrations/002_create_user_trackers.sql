create table public.user_trackers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tracker_type_id uuid references public.tracker_types(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, tracker_type_id)
);

alter table public.user_trackers enable row level security;

create policy "Users can view their own subscriptions"
  on public.user_trackers for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can subscribe to trackers"
  on public.user_trackers for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unsubscribe from trackers"
  on public.user_trackers for delete
  to authenticated
  using (auth.uid() = user_id);

create index idx_user_trackers_user on public.user_trackers(user_id);

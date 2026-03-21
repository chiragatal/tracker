alter table public.entries add column is_public boolean default false;

create policy "Anyone can view public entries"
  on public.entries for select
  using (is_public = true);

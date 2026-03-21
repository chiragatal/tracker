create table public.entry_images (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references public.entries(id) on delete cascade not null,
  url text not null,
  alt_text text,
  position int not null default 0
);

alter table public.entry_images enable row level security;

create policy "Users can view images on their entries"
  on public.entry_images for select
  to authenticated
  using (
    exists (
      select 1 from public.entries
      where entries.id = entry_images.entry_id
      and entries.user_id = auth.uid()
    )
  );

create policy "Users can add images to their entries"
  on public.entry_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.entries
      where entries.id = entry_images.entry_id
      and entries.user_id = auth.uid()
    )
  );

create policy "Users can update images on their entries"
  on public.entry_images for update
  to authenticated
  using (
    exists (
      select 1 from public.entries
      where entries.id = entry_images.entry_id
      and entries.user_id = auth.uid()
    )
  );

create policy "Users can delete images from their entries"
  on public.entry_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.entries
      where entries.id = entry_images.entry_id
      and entries.user_id = auth.uid()
    )
  );

create index idx_entry_images_entry on public.entry_images(entry_id);

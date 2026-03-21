create extension if not exists pg_trgm;

create index idx_entries_title_trgm on public.entries using gin (title gin_trgm_ops);
create index idx_entries_notes_trgm on public.entries using gin (notes gin_trgm_ops);

create or replace function search_entries(
  search_query text,
  p_user_id uuid,
  p_tracker_type_id uuid default null,
  p_status text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  tracker_type_id uuid,
  user_id uuid,
  title text,
  status text,
  data jsonb,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity_score real
)
language sql stable
as $$
  select
    e.id,
    e.tracker_type_id,
    e.user_id,
    e.title,
    e.status,
    e.data,
    e.notes,
    e.created_at,
    e.updated_at,
    greatest(
      similarity(e.title, search_query),
      similarity(coalesce(e.notes, ''), search_query),
      similarity(coalesce(e.data::text, ''), search_query)
    ) as similarity_score
  from public.entries e
  where e.user_id = p_user_id
    and (
      e.title % search_query
      or coalesce(e.notes, '') % search_query
      or e.data::text ilike '%' || search_query || '%'
    )
    and (p_tracker_type_id is null or e.tracker_type_id = p_tracker_type_id)
    and (p_status is null or e.status = p_status)
    and (p_date_from is null or e.created_at >= p_date_from)
    and (p_date_to is null or e.created_at <= p_date_to)
  order by similarity_score desc, e.created_at desc
  limit p_limit
  offset p_offset;
$$;

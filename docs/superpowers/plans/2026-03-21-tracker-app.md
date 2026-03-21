# Tracker App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use the **ui-ux-pro-max** skill for all UI/frontend component work to ensure modern, polished design. Use the **frontend-design** skill when building pages and layouts.

**Goal:** Build a modern multi-user web app for tracking personal experiences (coffee, books, recipes, etc.) with dynamic custom tracker types, search, and image uploads.

**Architecture:** Next.js 15 App Router full-stack app with Supabase for auth + Postgres database, Cloudflare R2 for image storage, Tailwind CSS 4 + shadcn/ui for styling. Dynamic tracker types stored as JSONB field schemas; entries store values against those schemas. Fuzzy search via pg_trgm.

**Tech Stack:** Next.js 15, TypeScript, Supabase (Auth + Postgres + RLS), Cloudflare R2, Tailwind CSS 4, shadcn/ui, Zod, @aws-sdk/client-s3

**Spec:** `docs/superpowers/specs/2026-03-21-tracker-app-design.md`

---

## File Structure

```
tracker/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout with font, metadata, ThemeProvider
│   │   ├── globals.css                         # Tailwind imports + CSS variables
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                      # Centered auth layout
│   │   │   ├── login/page.tsx                  # Login page
│   │   │   └── signup/page.tsx                 # Signup page
│   │   ├── (app)/
│   │   │   ├── layout.tsx                      # App shell: sidebar + topbar + search
│   │   │   ├── dashboard/page.tsx              # Home feed + stats
│   │   │   ├── discover/page.tsx               # "What do you want to track?"
│   │   │   ├── track/[slug]/page.tsx           # Entries list for a tracker type
│   │   │   ├── entry/[id]/page.tsx             # Entry detail
│   │   │   ├── entry/[id]/edit/page.tsx        # Edit entry
│   │   │   ├── new/page.tsx                    # Add new entry (pick tracker + fill form)
│   │   │   ├── search/page.tsx                 # Search results + filters
│   │   │   └── tracker/
│   │   │       ├── new/page.tsx                # Create tracker type (form builder)
│   │   │       └── [slug]/edit/page.tsx        # Edit tracker type
│   │   └── api/
│   │       ├── upload/route.ts                 # Presigned URL generation for R2
│   │       └── search/route.ts                 # Fuzzy search endpoint
│   ├── components/
│   │   ├── ui/                                 # shadcn/ui primitives (button, input, card, etc.)
│   │   ├── forms/
│   │   │   ├── field-registry.ts               # Maps field type string → renderer component
│   │   │   ├── field-renderers/
│   │   │   │   ├── text-field.tsx              # text + long_text
│   │   │   │   ├── number-field.tsx            # number
│   │   │   │   ├── date-field.tsx              # date
│   │   │   │   ├── rating-field.tsx            # rating (1-5 stars)
│   │   │   │   ├── image-field.tsx             # image upload
│   │   │   │   ├── url-field.tsx               # url
│   │   │   │   ├── tags-field.tsx              # tags (multi-value)
│   │   │   │   ├── location-field.tsx          # location (address string)
│   │   │   │   ├── price-field.tsx             # price (amount + currency)
│   │   │   │   ├── duration-field.tsx          # duration (hours + minutes)
│   │   │   │   ├── checkbox-field.tsx          # checkbox
│   │   │   │   └── dropdown-field.tsx          # dropdown (custom options)
│   │   │   ├── dynamic-form.tsx                # Renders form from field schema array
│   │   │   └── form-builder.tsx                # Build/edit tracker type field schemas
│   │   ├── shared/
│   │   │   ├── entity-card.tsx                 # Composable card (entries, trackers, search results)
│   │   │   ├── page-header.tsx                 # Title + description + actions
│   │   │   ├── empty-state.tsx                 # Icon + message + action
│   │   │   ├── status-badge.tsx                # "done" / "want to" badge
│   │   │   ├── image-gallery.tsx               # Upload, display, reorder images
│   │   │   ├── search-bar.tsx                  # Global search input
│   │   │   └── loading-skeleton.tsx            # Reusable skeleton loader
│   │   ├── trackers/
│   │   │   ├── tracker-card.tsx                # Tracker type card with subscribe toggle
│   │   │   └── tracker-grid.tsx                # Grid layout for tracker cards
│   │   ├── entries/
│   │   │   ├── entry-card.tsx                  # Entry card using EntityCard
│   │   │   ├── entry-list.tsx                  # List of entry cards with pagination
│   │   │   └── entry-detail.tsx                # Full entry detail view
│   │   └── layout/
│   │       ├── sidebar.tsx                     # App sidebar with subscribed trackers
│   │       ├── topbar.tsx                      # Top navigation with search + user menu
│   │       └── mobile-nav.tsx                  # Mobile bottom navigation
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Browser Supabase client
│   │   │   ├── server.ts                       # Server-side Supabase client
│   │   │   └── middleware.ts                   # Auth middleware helper
│   │   ├── r2/
│   │   │   └── upload.ts                       # Presigned URL generation + upload helper
│   │   ├── search/
│   │   │   └── query-builder.ts                # Build pg_trgm search queries with filters
│   │   ├── hooks/
│   │   │   ├── use-tracker-types.ts            # Fetch/mutate tracker types
│   │   │   ├── use-user-trackers.ts            # Fetch/mutate user subscriptions
│   │   │   ├── use-entries.ts                  # Fetch/mutate entries
│   │   │   └── use-image-upload.ts             # Image upload hook with progress
│   │   ├── utils.ts                            # cn(), formatDate, slugify, etc.
│   │   └── validations.ts                      # Zod schemas for all data types
│   └── types/
│       ├── database.ts                         # Supabase generated types
│       └── tracker.ts                          # App-level types (FieldDefinition, TrackerType, Entry, etc.)
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_tracker_types.sql        # tracker_types table + RLS
│   │   ├── 002_create_user_trackers.sql        # user_trackers table + RLS
│   │   ├── 003_create_entries.sql              # entries table + RLS
│   │   ├── 004_create_entry_images.sql         # entry_images table + RLS
│   │   ├── 005_enable_pg_trgm.sql             # Enable pg_trgm + search indexes
│   │   └── 006_seed_default_trackers.sql       # Default tracker types (Coffee, Books, Recipes)
│   └── config.toml                             # Supabase local dev config
├── middleware.ts                                # Next.js middleware for auth
├── public/
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.local.example                          # Template for env vars
```

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/utils.ts`, `.env.local.example`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded with Next.js 15, TypeScript, Tailwind, App Router.

- [ ] **Step 2: Install core dependencies**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr zod @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] **Step 3: Install shadcn/ui and initialize**

Run:
```bash
npx shadcn@latest init -d
```

Then install commonly needed components:
```bash
npx shadcn@latest add button input card badge dialog dropdown-menu separator skeleton avatar sheet tabs textarea select label popover calendar command checkbox
```

- [ ] **Step 4: Create .env.local.example**

Create `.env.local.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudflare R2
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=tracker-images
R2_PUBLIC_URL=https://your-r2-public-url
```

- [ ] **Step 5: Configure next.config.ts for R2 images**

Update `next.config.ts` to allow R2 image domains:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Update .gitignore**

Ensure `.gitignore` includes:
```gitignore
.env.local
.env*.local
.superpowers/
```

- [ ] **Step 6: Create utility file**

Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with dependencies and shadcn/ui"
```

---

## Task 2: TypeScript Types & Zod Validations

**Files:**
- Create: `src/types/tracker.ts`, `src/lib/validations.ts`

- [ ] **Step 1: Define app-level types**

Create `src/types/tracker.ts`:
```typescript
export const FIELD_TYPES = [
  "text",
  "long_text",
  "number",
  "date",
  "rating",
  "image",
  "url",
  "tags",
  "location",
  "price",
  "duration",
  "checkbox",
  "dropdown",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for dropdown
}

export interface TrackerType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  fields: FieldDefinition[];
  created_by: string;
  created_at: string;
}

export interface UserTracker {
  id: string;
  user_id: string;
  tracker_type_id: string;
  created_at: string;
  tracker_type?: TrackerType; // joined
}

export type EntryStatus = "done" | "want_to";

export interface Entry {
  id: string;
  tracker_type_id: string;
  user_id: string;
  title: string;
  status: EntryStatus;
  data: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tracker_type?: TrackerType; // joined
  images?: EntryImage[]; // joined
}

export interface EntryImage {
  id: string;
  entry_id: string;
  url: string;
  alt_text: string | null;
  position: number;
}

export interface SearchFilters {
  query: string;
  tracker_type_id?: string;
  status?: EntryStatus;
  date_from?: string;
  date_to?: string;
  tags?: string[];
}
```

- [ ] **Step 2: Define Zod validation schemas**

Create `src/lib/validations.ts`:
```typescript
import { z } from "zod";
import { FIELD_TYPES } from "@/types/tracker";

export const fieldDefinitionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional(),
});

export const trackerTypeSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
  description: z.string().max(500),
  fields: z.array(fieldDefinitionSchema).min(1),
});

export const entrySchema = z.object({
  tracker_type_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: z.enum(["done", "want_to"]),
  data: z.record(z.unknown()),
  notes: z.string().nullable().optional(),
});

export const searchFiltersSchema = z.object({
  query: z.string().min(1),
  tracker_type_id: z.string().uuid().optional(),
  status: z.enum(["done", "want_to"]).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
```

- [ ] **Step 3: Commit**

```bash
git add src/types/ src/lib/validations.ts
git commit -m "feat: add TypeScript types and Zod validation schemas"
```

---

## Task 3: Supabase Setup & Database Migrations

**Files:**
- Create: `supabase/migrations/001_create_tracker_types.sql`, `002_create_user_trackers.sql`, `003_create_entries.sql`, `004_create_entry_images.sql`, `005_enable_pg_trgm.sql`, `006_seed_default_trackers.sql`
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Install Supabase CLI**

Run:
```bash
npm install -D supabase
npx supabase init
```

- [ ] **Step 2: Create tracker_types migration**

Create `supabase/migrations/001_create_tracker_types.sql`:
```sql
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

-- Anyone can read tracker types
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
```

- [ ] **Step 3: Create user_trackers migration**

Create `supabase/migrations/002_create_user_trackers.sql`:
```sql
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
```

- [ ] **Step 4: Create entries migration**

Create `supabase/migrations/003_create_entries.sql`:
```sql
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

-- Auto-update updated_at
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
```

- [ ] **Step 5: Create entry_images migration**

Create `supabase/migrations/004_create_entry_images.sql`:
```sql
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
```

- [ ] **Step 6: Enable pg_trgm for fuzzy search**

Create `supabase/migrations/005_enable_pg_trgm.sql`:
```sql
create extension if not exists pg_trgm;

-- Create GIN indexes for fuzzy search on entries
create index idx_entries_title_trgm on public.entries using gin (title gin_trgm_ops);
create index idx_entries_notes_trgm on public.entries using gin (notes gin_trgm_ops);

-- Search function that searches across title, notes, and JSONB data
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
```

- [ ] **Step 7: Create seed data migration**

Create `supabase/migrations/006_seed_default_trackers.sql`:
```sql
-- Seed default tracker types with a system UUID
-- These are regular tracker_types with no special handling
insert into public.tracker_types (id, name, slug, icon, description, fields, created_by) values
(
  'a0000000-0000-0000-0000-000000000001',
  'Coffee',
  'coffee',
  '☕',
  'Track your coffee experiences — roasters, brew methods, and favorites.',
  '[
    {"key": "roaster", "label": "Roaster", "type": "text", "required": false},
    {"key": "origin", "label": "Origin", "type": "text", "required": false},
    {"key": "brew_method", "label": "Brew Method", "type": "dropdown", "required": false, "options": ["Pour Over", "Espresso", "French Press", "AeroPress", "Cold Brew", "Drip", "Moka Pot"]},
    {"key": "rating", "label": "Rating", "type": "rating", "required": false},
    {"key": "photo", "label": "Photo", "type": "image", "required": false},
    {"key": "price", "label": "Price", "type": "price", "required": false},
    {"key": "tags", "label": "Tags", "type": "tags", "required": false}
  ]'::jsonb,
  null
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Books',
  'books',
  '📚',
  'Track books you have read or want to read.',
  '[
    {"key": "author", "label": "Author", "type": "text", "required": true},
    {"key": "genre", "label": "Genre", "type": "dropdown", "required": false, "options": ["Fiction", "Non-Fiction", "Sci-Fi", "Fantasy", "Mystery", "Biography", "Self-Help", "Technical", "History", "Philosophy"]},
    {"key": "rating", "label": "Rating", "type": "rating", "required": false},
    {"key": "date_finished", "label": "Date Finished", "type": "date", "required": false},
    {"key": "review", "label": "Review", "type": "long_text", "required": false},
    {"key": "cover", "label": "Cover Image", "type": "image", "required": false},
    {"key": "tags", "label": "Tags", "type": "tags", "required": false}
  ]'::jsonb,
  null
),
(
  'a0000000-0000-0000-0000-000000000003',
  'Recipes',
  'recipes',
  '🍳',
  'Track recipes you have cooked or want to try.',
  '[
    {"key": "cuisine", "label": "Cuisine", "type": "dropdown", "required": false, "options": ["Italian", "Mexican", "Indian", "Chinese", "Japanese", "Thai", "French", "American", "Mediterranean", "Korean"]},
    {"key": "prep_time", "label": "Prep Time", "type": "duration", "required": false},
    {"key": "cook_time", "label": "Cook Time", "type": "duration", "required": false},
    {"key": "difficulty", "label": "Difficulty", "type": "dropdown", "required": false, "options": ["Easy", "Medium", "Hard"]},
    {"key": "rating", "label": "Rating", "type": "rating", "required": false},
    {"key": "photo", "label": "Photo", "type": "image", "required": false},
    {"key": "recipe_url", "label": "Recipe URL", "type": "url", "required": false},
    {"key": "tags", "label": "Tags", "type": "tags", "required": false}
  ]'::jsonb,
  null
);
```

- [ ] **Step 8: Create Supabase client helpers**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (except auth pages)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

Create `middleware.ts` (project root):
```typescript
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 9: Commit**

```bash
git add supabase/ src/lib/supabase/ middleware.ts
git commit -m "feat: add Supabase setup, database migrations, RLS policies, and auth middleware"
```

---

## Task 4: Shared UI Components

**Files:**
- Create: `src/components/shared/entity-card.tsx`, `page-header.tsx`, `empty-state.tsx`, `status-badge.tsx`, `loading-skeleton.tsx`, `search-bar.tsx`

> **Note:** Use the **ui-ux-pro-max** skill for designing these components. They should feel modern and polished.

- [ ] **Step 1: Create EntityCard component**

Create `src/components/shared/entity-card.tsx`:
```typescript
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface EntityCardProps {
  href: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  icon?: string;
  badge?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function EntityCard({
  href,
  title,
  subtitle,
  imageUrl,
  icon,
  badge,
  metadata,
  actions,
  className,
  children,
}: EntityCardProps) {
  return (
    <Link href={href} className="block group">
      <Card
        className={cn(
          "overflow-hidden transition-all hover:shadow-md hover:border-primary/20",
          className
        )}
      >
        {imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-xl shrink-0">{icon}</span>}
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge}
            {actions}
          </div>
        </CardHeader>
        {(metadata || children) && (
          <CardContent className="pt-0">
            {metadata}
            {children}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Create PageHeader component**

Create `src/components/shared/page-header.tsx`:
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Create EmptyState component**

Create `src/components/shared/empty-state.tsx`:
```typescript
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create StatusBadge component**

Create `src/components/shared/status-badge.tsx`:
```typescript
import { Badge } from "@/components/ui/badge";
import type { EntryStatus } from "@/types/tracker";

const STATUS_CONFIG: Record<
  EntryStatus,
  { label: string; variant: "default" | "secondary" }
> = {
  done: { label: "Done", variant: "default" },
  want_to: { label: "Want to", variant: "secondary" },
};

export function StatusBadge({ status }: { status: EntryStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

- [ ] **Step 5: Create LoadingSkeleton component**

Create `src/components/shared/loading-skeleton.tsx`:
```typescript
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create SearchBar component**

Create `src/components/shared/search-bar.tsx`:
```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your entries..."
          className="pl-10"
        />
      </div>
    </form>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add shared UI components (EntityCard, PageHeader, EmptyState, StatusBadge, SearchBar)"
```

---

## Task 5: Dynamic Form System

**Files:**
- Create: `src/components/forms/field-registry.ts`, all field renderers in `src/components/forms/field-renderers/`, `src/components/forms/dynamic-form.tsx`, `src/components/forms/form-builder.tsx`
- Create: `src/lib/r2/upload.ts`, `src/app/api/upload/route.ts`, `src/lib/hooks/use-image-upload.ts`
- Create: `src/components/shared/image-gallery.tsx`

> **Note:** This is the core engine of the app. Every field renderer must handle both display and edit modes.

- [ ] **Step 1: Create image upload infrastructure**

Create `src/lib/r2/upload.ts`:
```typescript
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(
  fileType: string,
  folder: string = "uploads"
) {
  const key = `${folder}/${randomUUID()}.${fileType.split("/")[1] || "jpg"}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl, key };
}
```

Create `src/app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePresignedUrl } from "@/lib/r2/upload";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileType } = await request.json();

  if (!fileType || !fileType.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const { uploadUrl, publicUrl } = await generatePresignedUrl(fileType);

  return NextResponse.json({ uploadUrl, publicUrl });
}
```

Create `src/lib/hooks/use-image-upload.ts`:
```typescript
"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  publicUrl: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);

    try {
      // Get presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType: file.type }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, publicUrl } = await res.json();

      // Upload directly to R2
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setProgress(100);
      return { publicUrl };
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress };
}
```

- [ ] **Step 2: Create field registry**

Create `src/components/forms/field-registry.ts`:
```typescript
import type { ComponentType } from "react";
import type { FieldType, FieldDefinition } from "@/types/tracker";

export interface FieldRendererProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}

const registry = new Map<FieldType, ComponentType<FieldRendererProps>>();

export function registerField(
  type: FieldType,
  component: ComponentType<FieldRendererProps>
) {
  registry.set(type, component);
}

export function getFieldRenderer(
  type: FieldType
): ComponentType<FieldRendererProps> | undefined {
  return registry.get(type);
}

export function getAllFieldTypes(): FieldType[] {
  return Array.from(registry.keys());
}
```

- [ ] **Step 3: Create field renderers**

Create each field renderer in `src/components/forms/field-renderers/`. Each file exports a component and registers itself. Example pattern for all renderers:

Create `src/components/forms/field-renderers/text-field.tsx`:
```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registerField, type FieldRendererProps } from "../field-registry";

function TextField({ field, value, onChange, readOnly }: FieldRendererProps) {
  if (readOnly) {
    return <p className="text-sm">{(value as string) || "—"}</p>;
  }

  if (field.type === "long_text") {
    return (
      <Textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        rows={4}
      />
    );
  }

  return (
    <Input
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.label}
    />
  );
}

registerField("text", TextField);
registerField("long_text", TextField);

export { TextField };
```

Create `src/components/forms/field-renderers/number-field.tsx`:
```typescript
"use client";

import { Input } from "@/components/ui/input";
import { registerField, type FieldRendererProps } from "../field-registry";

function NumberField({ field, value, onChange, readOnly }: FieldRendererProps) {
  if (readOnly) {
    return <p className="text-sm">{value != null ? String(value) : "—"}</p>;
  }

  return (
    <Input
      type="number"
      value={value != null ? String(value) : ""}
      onChange={(e) =>
        onChange(e.target.value ? Number(e.target.value) : null)
      }
      placeholder={field.label}
    />
  );
}

registerField("number", NumberField);
export { NumberField };
```

Create `src/components/forms/field-renderers/date-field.tsx`:
```typescript
"use client";

import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { registerField, type FieldRendererProps } from "../field-registry";

function DateField({ field, value, onChange, readOnly }: FieldRendererProps) {
  if (readOnly) {
    return (
      <p className="text-sm">{value ? formatDate(value as string) : "—"}</p>
    );
  }

  return (
    <Input
      type="date"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

registerField("date", DateField);
export { DateField };
```

Create `src/components/forms/field-renderers/rating-field.tsx`:
```typescript
"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { registerField, type FieldRendererProps } from "../field-registry";

function RatingField({ value, onChange, readOnly }: FieldRendererProps) {
  const rating = (value as number) ?? 0;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange(star === rating ? 0 : star)}
          className={cn(
            "transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"
          )}
        >
          <Star
            className={cn(
              "h-5 w-5",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

registerField("rating", RatingField);
export { RatingField };
```

Create `src/components/forms/field-renderers/image-field.tsx`:
```typescript
"use client";

import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { registerField, type FieldRendererProps } from "../field-registry";

function ImageField({ value, onChange, readOnly }: FieldRendererProps) {
  const { upload, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const imageUrl = value as string | null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file);
    onChange(result.publicUrl);
  };

  if (readOnly) {
    return imageUrl ? (
      <div className="relative aspect-video w-full max-w-sm rounded-md overflow-hidden">
        <Image src={imageUrl} alt="" fill className="object-cover" />
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">No image</p>
    );
  }

  return (
    <div className="space-y-2">
      {imageUrl && (
        <div className="relative aspect-video w-full max-w-sm rounded-md overflow-hidden">
          <Image src={imageUrl} alt="" fill className="object-cover" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ImagePlus className="h-4 w-4 mr-2" />
        )}
        {imageUrl ? "Replace" : "Upload"} Image
      </Button>
    </div>
  );
}

registerField("image", ImageField);
export { ImageField };
```

Create `src/components/forms/field-renderers/url-field.tsx`:
```typescript
"use client";

import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { registerField, type FieldRendererProps } from "../field-registry";

function UrlField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const url = value as string;

  if (readOnly) {
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
      >
        {url} <ExternalLink className="h-3 w-3" />
      </a>
    ) : (
      <p className="text-sm">—</p>
    );
  }

  return (
    <Input
      type="url"
      value={url ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`https://...`}
    />
  );
}

registerField("url", UrlField);
export { UrlField };
```

Create `src/components/forms/field-renderers/tags-field.tsx`:
```typescript
"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState, useCallback } from "react";
import { registerField, type FieldRendererProps } from "../field-registry";

function TagsField({ value, onChange, readOnly }: FieldRendererProps) {
  const tags = (value as string[]) ?? [];
  const [input, setInput] = useState("");

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
      }
      setInput("");
    },
    [tags, onChange]
  );

  const removeTag = useCallback(
    (tag: string) => {
      onChange(tags.filter((t) => t !== tag));
    },
    [tags, onChange]
  );

  if (readOnly) {
    return tags.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-sm">—</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
          }
        }}
        placeholder="Add tag and press Enter"
      />
    </div>
  );
}

registerField("tags", TagsField);
export { TagsField };
```

Create `src/components/forms/field-renderers/location-field.tsx`:
```typescript
"use client";

import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { registerField, type FieldRendererProps } from "../field-registry";

function LocationField({
  field,
  value,
  onChange,
  readOnly,
}: FieldRendererProps) {
  if (readOnly) {
    return value ? (
      <p className="text-sm inline-flex items-center gap-1">
        <MapPin className="h-3 w-3" /> {value as string}
      </p>
    ) : (
      <p className="text-sm">—</p>
    );
  }

  return (
    <Input
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. Portland, OR"
    />
  );
}

registerField("location", LocationField);
export { LocationField };
```

Create `src/components/forms/field-renderers/price-field.tsx`:
```typescript
"use client";

import { Input } from "@/components/ui/input";
import { registerField, type FieldRendererProps } from "../field-registry";

interface PriceValue {
  amount: number | null;
  currency: string;
}

function PriceField({ value, onChange, readOnly }: FieldRendererProps) {
  const price = (value as PriceValue) ?? { amount: null, currency: "USD" };

  if (readOnly) {
    return (
      <p className="text-sm">
        {price.amount != null ? `$${price.amount.toFixed(2)}` : "—"}
      </p>
    );
  }

  return (
    <div className="flex gap-2">
      <span className="flex items-center text-muted-foreground text-sm">$</span>
      <Input
        type="number"
        step="0.01"
        value={price.amount != null ? String(price.amount) : ""}
        onChange={(e) =>
          onChange({
            ...price,
            amount: e.target.value ? Number(e.target.value) : null,
          })
        }
        placeholder="0.00"
        className="flex-1"
      />
    </div>
  );
}

registerField("price", PriceField);
export { PriceField };
```

Create `src/components/forms/field-renderers/duration-field.tsx`:
```typescript
"use client";

import { Input } from "@/components/ui/input";
import { registerField, type FieldRendererProps } from "../field-registry";

interface DurationValue {
  hours: number;
  minutes: number;
}

function DurationField({ value, onChange, readOnly }: FieldRendererProps) {
  const duration = (value as DurationValue) ?? { hours: 0, minutes: 0 };

  if (readOnly) {
    if (!duration.hours && !duration.minutes) return <p className="text-sm">—</p>;
    const parts = [];
    if (duration.hours) parts.push(`${duration.hours}h`);
    if (duration.minutes) parts.push(`${duration.minutes}m`);
    return <p className="text-sm">{parts.join(" ")}</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="0"
        value={duration.hours || ""}
        onChange={(e) =>
          onChange({ ...duration, hours: Number(e.target.value) || 0 })
        }
        placeholder="0"
        className="w-20"
      />
      <span className="text-sm text-muted-foreground">h</span>
      <Input
        type="number"
        min="0"
        max="59"
        value={duration.minutes || ""}
        onChange={(e) =>
          onChange({ ...duration, minutes: Number(e.target.value) || 0 })
        }
        placeholder="0"
        className="w-20"
      />
      <span className="text-sm text-muted-foreground">m</span>
    </div>
  );
}

registerField("duration", DurationField);
export { DurationField };
```

Create `src/components/forms/field-renderers/checkbox-field.tsx`:
```typescript
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { registerField, type FieldRendererProps } from "../field-registry";

function CheckboxField({ field, value, onChange, readOnly }: FieldRendererProps) {
  if (readOnly) {
    return <p className="text-sm">{value ? "Yes" : "No"}</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={!!value}
        onCheckedChange={(checked) => onChange(!!checked)}
      />
      <span className="text-sm">{field.label}</span>
    </div>
  );
}

registerField("checkbox", CheckboxField);
export { CheckboxField };
```

Create `src/components/forms/field-renderers/dropdown-field.tsx`:
```typescript
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerField, type FieldRendererProps } from "../field-registry";

function DropdownField({ field, value, onChange, readOnly }: FieldRendererProps) {
  if (readOnly) {
    return <p className="text-sm">{(value as string) || "—"}</p>;
  }

  return (
    <Select value={(value as string) ?? ""} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${field.label}`} />
      </SelectTrigger>
      <SelectContent>
        {(field.options ?? []).map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

registerField("dropdown", DropdownField);
export { DropdownField };
```

Create `src/components/forms/field-renderers/index.ts` (barrel that triggers all registrations):
```typescript
import "./text-field";
import "./number-field";
import "./date-field";
import "./rating-field";
import "./image-field";
import "./url-field";
import "./tags-field";
import "./location-field";
import "./price-field";
import "./duration-field";
import "./checkbox-field";
import "./dropdown-field";
```

- [ ] **Step 4: Create DynamicForm component**

Create `src/components/forms/dynamic-form.tsx`:
```typescript
"use client";

import "@/components/forms/field-renderers";
import { getFieldRenderer } from "./field-registry";
import { Label } from "@/components/ui/label";
import type { FieldDefinition } from "@/types/tracker";

interface DynamicFormProps {
  fields: FieldDefinition[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function DynamicForm({
  fields,
  values,
  onChange,
  readOnly = false,
}: DynamicFormProps) {
  return (
    <div className="space-y-6">
      {fields.map((field) => {
        const Renderer = getFieldRenderer(field.type);
        if (!Renderer) return null;

        return (
          <div key={field.key} className="space-y-2">
            {field.type !== "checkbox" && (
              <Label>
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            )}
            <Renderer
              field={field}
              value={values[field.key]}
              onChange={(val) => onChange({ ...values, [field.key]: val })}
              readOnly={readOnly}
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Create FormBuilder component**

Create `src/components/forms/form-builder.tsx`:
```typescript
"use client";

import "@/components/forms/field-renderers";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { FIELD_TYPES, type FieldDefinition, type FieldType } from "@/types/tracker";

interface FormBuilderProps {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  long_text: "Long Text",
  number: "Number",
  date: "Date",
  rating: "Rating (1-5)",
  image: "Image",
  url: "URL",
  tags: "Tags",
  location: "Location",
  price: "Price",
  duration: "Duration",
  checkbox: "Checkbox",
  dropdown: "Dropdown",
};

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const addField = () => {
    const key = `field_${Date.now()}`;
    onChange([
      ...fields,
      { key, label: "", type: "text", required: false },
    ]);
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    // Auto-generate key from label
    if (updates.label !== undefined) {
      updated[index].key = updates.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    }
    onChange(updated);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <Card key={field.key}>
          <CardContent className="flex items-start gap-3 py-3">
            <div className="flex flex-col gap-1 pt-2">
              <button
                type="button"
                onClick={() => moveField(index, index - 1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      updateField(index, { label: e.target.value })
                    }
                    placeholder="Field label"
                  />
                </div>
                <div className="w-40">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(v) =>
                      updateField(index, { type: v as FieldType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {FIELD_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {field.type === "dropdown" && (
                <DropdownOptionsEditor
                  options={field.options ?? []}
                  onChange={(options) => updateField(index, { options })}
                />
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    updateField(index, { required: !!checked })
                  }
                />
                <span className="text-sm">Required</span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeField(index)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addField} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Field
      </Button>
    </div>
  );
}

function DropdownOptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const [input, setInput] = useState("");

  return (
    <div className="space-y-2">
      <Label className="text-xs">Options</Label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-sm"
          >
            {opt}
            <button
              type="button"
              onClick={() => onChange(options.filter((_, j) => j !== i))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input.trim()) {
              onChange([...options, input.trim()]);
              setInput("");
            }
          }
        }}
        placeholder="Add option and press Enter"
      />
    </div>
  );
}
```

- [ ] **Step 6: Create ImageGallery component**

Create `src/components/shared/image-gallery.tsx`:
```typescript
"use client";

import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import type { EntryImage } from "@/types/tracker";

interface ImageGalleryProps {
  images: EntryImage[];
  onChange?: (images: EntryImage[]) => void;
  readOnly?: boolean;
}

export function ImageGallery({
  images,
  onChange,
  readOnly = false,
}: ImageGalleryProps) {
  const { upload, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onChange) return;

    for (const file of Array.from(files)) {
      const { publicUrl } = await upload(file);
      const newImage: EntryImage = {
        id: crypto.randomUUID(),
        entry_id: "",
        url: publicUrl,
        alt_text: null,
        position: images.length,
      };
      images = [...images, newImage];
      onChange(images);
    }
  };

  const removeImage = (id: string) => {
    onChange?.(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-video rounded-md overflow-hidden">
            <Image src={img.url} alt={img.alt_text ?? ""} fill className="object-cover" />
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-2" />
            )}
            Add Images
          </Button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/forms/ src/components/shared/image-gallery.tsx src/lib/r2/ src/lib/hooks/ src/app/api/upload/
git commit -m "feat: add dynamic form system with field renderers, form builder, and image upload"
```

---

## Task 6: Data Hooks

**Files:**
- Create: `src/lib/hooks/use-tracker-types.ts`, `src/lib/hooks/use-user-trackers.ts`, `src/lib/hooks/use-entries.ts`

- [ ] **Step 1: Create tracker types hook**

Create `src/lib/hooks/use-tracker-types.ts`:
```typescript
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TrackerType } from "@/types/tracker";
import { slugify } from "@/lib/utils";

export function useTrackerTypes() {
  const [trackerTypes, setTrackerTypes] = useState<TrackerType[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tracker_types")
      .select("*")
      .order("name");
    setTrackerTypes((data as TrackerType[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (input: Omit<TrackerType, "id" | "slug" | "created_by" | "created_at">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tracker_types")
        .insert({
          ...input,
          slug: slugify(input.name),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setTrackerTypes((prev) => [...prev, data as TrackerType]);
      return data as TrackerType;
    },
    [supabase]
  );

  return { trackerTypes, loading, refetch: fetch, create };
}

export function useTrackerType(slug: string) {
  const [trackerType, setTrackerType] = useState<TrackerType | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("tracker_types")
        .select("*")
        .eq("slug", slug)
        .single();
      setTrackerType(data as TrackerType | null);
      setLoading(false);
    }
    load();
  }, [slug, supabase]);

  return { trackerType, loading };
}
```

- [ ] **Step 2: Create user trackers hook**

Create `src/lib/hooks/use-user-trackers.ts`:
```typescript
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserTracker, TrackerType } from "@/types/tracker";

export function useUserTrackers() {
  const [userTrackers, setUserTrackers] = useState<UserTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_trackers")
      .select("*, tracker_type:tracker_types(*)")
      .order("created_at");
    setUserTrackers((data as UserTracker[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const subscribe = useCallback(
    async (trackerTypeId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_trackers")
        .insert({ user_id: user.id, tracker_type_id: trackerTypeId });

      if (error) throw error;
      await fetch();
    },
    [supabase, fetch]
  );

  const unsubscribe = useCallback(
    async (trackerTypeId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_trackers")
        .delete()
        .eq("user_id", user.id)
        .eq("tracker_type_id", trackerTypeId);

      if (error) throw error;
      setUserTrackers((prev) =>
        prev.filter((ut) => ut.tracker_type_id !== trackerTypeId)
      );
    },
    [supabase]
  );

  const isSubscribed = useCallback(
    (trackerTypeId: string) =>
      userTrackers.some((ut) => ut.tracker_type_id === trackerTypeId),
    [userTrackers]
  );

  const subscribedTypes: TrackerType[] = userTrackers
    .map((ut) => ut.tracker_type)
    .filter(Boolean) as TrackerType[];

  return {
    userTrackers,
    subscribedTypes,
    loading,
    refetch: fetch,
    subscribe,
    unsubscribe,
    isSubscribed,
  };
}
```

- [ ] **Step 3: Create entries hook**

Create `src/lib/hooks/use-entries.ts`:
```typescript
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Entry, EntryImage } from "@/types/tracker";

interface UseEntriesOptions {
  trackerTypeId?: string;
  status?: "done" | "want_to";
  limit?: number;
}

export function useEntries(options: UseEntriesOptions = {}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("entries")
      .select("*, tracker_type:tracker_types(*), images:entry_images(*)")
      .order("created_at", { ascending: false });

    if (options.trackerTypeId) {
      query = query.eq("tracker_type_id", options.trackerTypeId);
    }
    if (options.status) {
      query = query.eq("status", options.status);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data } = await query;
    setEntries((data as Entry[]) ?? []);
    setLoading(false);
  }, [supabase, options.trackerTypeId, options.status, options.limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (
      input: Omit<Entry, "id" | "user_id" | "created_at" | "updated_at" | "tracker_type" | "images">,
      images?: EntryImage[]
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: entry, error } = await supabase
        .from("entries")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Save images if any
      if (images?.length) {
        await supabase.from("entry_images").insert(
          images.map((img, i) => ({
            entry_id: entry.id,
            url: img.url,
            alt_text: img.alt_text,
            position: i,
          }))
        );
      }

      await fetch();
      return entry as Entry;
    },
    [supabase, fetch]
  );

  const update = useCallback(
    async (
      id: string,
      input: Partial<Pick<Entry, "title" | "status" | "data" | "notes">>,
      images?: EntryImage[]
    ) => {
      const { error } = await supabase
        .from("entries")
        .update(input)
        .eq("id", id);

      if (error) throw error;

      if (images) {
        // Replace images: delete existing, insert new
        await supabase.from("entry_images").delete().eq("entry_id", id);
        if (images.length) {
          await supabase.from("entry_images").insert(
            images.map((img, i) => ({
              entry_id: id,
              url: img.url,
              alt_text: img.alt_text,
              position: i,
            }))
          );
        }
      }

      await fetch();
    },
    [supabase, fetch]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("entries").delete().eq("id", id);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [supabase]
  );

  return { entries, loading, refetch: fetch, create, update, remove };
}

export function useEntry(id: string) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("entries")
        .select("*, tracker_type:tracker_types(*), images:entry_images(*)")
        .eq("id", id)
        .single();
      setEntry(data as Entry | null);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  return { entry, loading };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/hooks/
git commit -m "feat: add data hooks for tracker types, user trackers, and entries"
```

---

## Task 7: App Layout (Sidebar, Topbar, Mobile Nav)

**Files:**
- Create: `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/mobile-nav.tsx`
- Create: `src/app/(app)/layout.tsx`

> **Note:** Use the **ui-ux-pro-max** skill and **frontend-design** skill for this task. The layout is the first thing users see — it must feel modern, clean, and polished.

- [ ] **Step 1: Create Sidebar**

Create `src/components/layout/sidebar.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { Home, Search, Compass, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { subscribedTypes } = useUserTrackers();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-4">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          Tracker
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        <Separator className="my-3" />

        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            My Trackers
          </span>
          <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
            <Link href="/new">
              <Plus className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {subscribedTypes.map((tracker) => (
          <Link
            key={tracker.id}
            href={`/track/${tracker.slug}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === `/track/${tracker.slug}`
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <span>{tracker.icon}</span>
            {tracker.name}
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <Button asChild className="w-full">
          <Link href="/new">
            <Plus className="h-4 w-4 mr-2" /> New Entry
          </Link>
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create Topbar**

Create `src/components/layout/topbar.tsx`:
```typescript
"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export function Topbar() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="md:hidden text-lg font-bold">Tracker</div>
        <SearchBar className="hidden md:block w-full max-w-md" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create MobileNav**

Create `src/components/layout/mobile-nav.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Compass, Plus, Search } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/new", label: "Add", icon: Plus },
  { href: "/search", label: "Search", icon: Search },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="flex items-center justify-around h-16">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create App layout**

Create `src/app/(app)/layout.tsx`:
```typescript
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/app/\(app\)/layout.tsx
git commit -m "feat: add app layout with sidebar, topbar, and mobile navigation"
```

---

## Task 8: Auth Pages (Login & Signup)

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`

> **Note:** Use **ui-ux-pro-max** skill. Auth pages should look clean and welcoming.

- [ ] **Step 1: Create auth layout**

Create `src/app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create login page**

Create `src/app/(auth)/login/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("google")}
          >
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("github")}
          >
            Continue with GitHub
          </Button>
        </div>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 3: Create signup page**

Create `src/app/(auth)/signup/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/discover");
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/discover` },
    });
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm">
          Start tracking the things you love
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("google")}
          >
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("github")}
          >
            Continue with GitHub
          </Button>
        </div>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add auth pages (login, signup) with email and OAuth"
```

---

## Task 9: Discover Page

**Files:**
- Create: `src/app/(app)/discover/page.tsx`
- Create: `src/components/trackers/tracker-card.tsx`, `src/components/trackers/tracker-grid.tsx`

- [ ] **Step 1: Create TrackerCard**

Create `src/components/trackers/tracker-card.tsx`:
```typescript
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import type { TrackerType } from "@/types/tracker";

interface TrackerCardProps {
  tracker: TrackerType;
  subscribed: boolean;
  onToggle: () => void;
}

export function TrackerCard({ tracker, subscribed, onToggle }: TrackerCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tracker.icon}</span>
          <div>
            <h3 className="font-semibold">{tracker.name}</h3>
            <p className="text-sm text-muted-foreground">
              {tracker.fields.length} fields
            </p>
          </div>
        </div>
        <Button
          variant={subscribed ? "secondary" : "default"}
          size="sm"
          onClick={onToggle}
        >
          {subscribed ? (
            <>
              <Check className="h-4 w-4 mr-1" /> Tracking
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" /> Track
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{tracker.description}</p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create TrackerGrid**

Create `src/components/trackers/tracker-grid.tsx`:
```typescript
import type { TrackerType } from "@/types/tracker";
import { TrackerCard } from "./tracker-card";

interface TrackerGridProps {
  trackers: TrackerType[];
  subscribedIds: Set<string>;
  onToggle: (trackerId: string) => void;
}

export function TrackerGrid({
  trackers,
  subscribedIds,
  onToggle,
}: TrackerGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trackers.map((tracker) => (
        <TrackerCard
          key={tracker.id}
          tracker={tracker}
          subscribed={subscribedIds.has(tracker.id)}
          onToggle={() => onToggle(tracker.id)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create Discover page**

Create `src/app/(app)/discover/page.tsx`:
```typescript
"use client";

import { useTrackerTypes } from "@/lib/hooks/use-tracker-types";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { TrackerGrid } from "@/components/trackers/tracker-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo } from "react";

export default function DiscoverPage() {
  const { trackerTypes, loading: loadingTypes } = useTrackerTypes();
  const { userTrackers, loading: loadingTrackers, subscribe, unsubscribe, isSubscribed } =
    useUserTrackers();

  const subscribedIds = useMemo(
    () => new Set(userTrackers.map((ut) => ut.tracker_type_id)),
    [userTrackers]
  );

  const handleToggle = async (trackerId: string) => {
    if (isSubscribed(trackerId)) {
      await unsubscribe(trackerId);
    } else {
      await subscribe(trackerId);
    }
  };

  const loading = loadingTypes || loadingTrackers;

  return (
    <div>
      <PageHeader
        title="What do you want to track?"
        description="Browse available trackers or create your own"
        actions={
          <Button asChild>
            <Link href="/tracker/new">
              <Plus className="h-4 w-4 mr-2" /> Create Tracker
            </Link>
          </Button>
        }
      />

      {loading ? (
        <CardGridSkeleton />
      ) : (
        <TrackerGrid
          trackers={trackerTypes}
          subscribedIds={subscribedIds}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/discover/ src/components/trackers/
git commit -m "feat: add discover page with tracker subscription"
```

---

## Task 10: Create Tracker Type Page (Form Builder)

**Files:**
- Create: `src/app/(app)/tracker/new/page.tsx`, `src/app/(app)/tracker/[slug]/edit/page.tsx`

- [ ] **Step 1: Create new tracker type page**

Create `src/app/(app)/tracker/new/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrackerTypes } from "@/lib/hooks/use-tracker-types";
import { FormBuilder } from "@/components/forms/form-builder";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicForm } from "@/components/forms/dynamic-form";
import type { FieldDefinition } from "@/types/tracker";

export default function NewTrackerPage() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📋");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});

  const { create } = useTrackerTypes();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || fields.length === 0) return;

    setSaving(true);
    try {
      const tracker = await create({ name, icon, description, fields });
      router.push(`/track/${tracker.slug}`);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create a Tracker"
        description="Define what you want to track and its fields"
      />

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-3">
                <div className="w-20">
                  <Label>Icon</Label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="text-center text-2xl"
                    maxLength={4}
                  />
                </div>
                <div className="flex-1">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Coffee, Movies, Workouts"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this tracker for?"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-semibold mb-3">Fields</h2>
            <FormBuilder fields={fields} onChange={setFields} />
          </div>

          <Button type="submit" disabled={saving || !name || fields.length === 0}>
            {saving ? "Creating..." : "Create Tracker"}
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Preview</h2>
          <Card>
            <CardContent className="pt-6">
              {fields.length > 0 ? (
                <DynamicForm
                  fields={fields}
                  values={previewValues}
                  onChange={setPreviewValues}
                />
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Add fields to see a preview
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create edit tracker type page**

Create `src/app/(app)/tracker/[slug]/edit/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrackerType } from "@/lib/hooks/use-tracker-types";
import { createClient } from "@/lib/supabase/client";
import { FormBuilder } from "@/components/forms/form-builder";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import type { FieldDefinition } from "@/types/tracker";

export default function EditTrackerPage() {
  const { slug } = useParams<{ slug: string }>();
  const { trackerType, loading } = useTrackerType(slug);
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasEntries, setHasEntries] = useState(false);

  useEffect(() => {
    if (trackerType) {
      setName(trackerType.name);
      setIcon(trackerType.icon);
      setDescription(trackerType.description);
      setFields(trackerType.fields);

      // Check if tracker has entries (restricts field deletion)
      supabase
        .from("entries")
        .select("id", { count: "exact", head: true })
        .eq("tracker_type_id", trackerType.id)
        .then(({ count }) => setHasEntries((count ?? 0) > 0));
    }
  }, [trackerType, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerType) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("tracker_types")
        .update({ name, icon, description, fields })
        .eq("id", trackerType.id);

      if (error) throw error;
      router.push(`/track/${trackerType.slug}`);
    } catch {
      setSaving(false);
    }
  };

  if (loading) return <CardSkeleton />;
  if (!trackerType) return <p>Tracker not found</p>;

  return (
    <div>
      <PageHeader
        title={`Edit ${trackerType.name}`}
        description={
          hasEntries
            ? "This tracker has entries. You can add new fields or rename labels, but cannot remove existing fields."
            : undefined
        }
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-3">
              <div className="w-20">
                <Label>Icon</Label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="text-center text-2xl"
                  maxLength={4}
                />
              </div>
              <div className="flex-1">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-3">Fields</h2>
          <FormBuilder fields={fields} onChange={setFields} />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/tracker/
git commit -m "feat: add create and edit tracker type pages with form builder"
```

---

## Task 11: New Entry & Entry Detail Pages

**Files:**
- Create: `src/app/(app)/new/page.tsx`, `src/app/(app)/entry/[id]/page.tsx`, `src/app/(app)/entry/[id]/edit/page.tsx`
- Create: `src/components/entries/entry-card.tsx`, `src/components/entries/entry-list.tsx`, `src/components/entries/entry-detail.tsx`

- [ ] **Step 1: Create EntryCard**

Create `src/components/entries/entry-card.tsx`:
```typescript
import { EntityCard } from "@/components/shared/entity-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { Entry } from "@/types/tracker";

export function EntryCard({ entry }: { entry: Entry }) {
  const firstImage = entry.images?.[0]?.url;

  return (
    <EntityCard
      href={`/entry/${entry.id}`}
      title={entry.title}
      subtitle={entry.tracker_type?.name}
      imageUrl={firstImage}
      icon={entry.tracker_type?.icon}
      badge={<StatusBadge status={entry.status} />}
      metadata={
        <p className="text-xs text-muted-foreground">
          {formatDate(entry.created_at)}
        </p>
      }
    />
  );
}
```

- [ ] **Step 2: Create EntryList**

Create `src/components/entries/entry-list.tsx`:
```typescript
import { EntryCard } from "./entry-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Entry } from "@/types/tracker";

interface EntryListProps {
  entries: Entry[];
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}

export function EntryList({
  entries,
  emptyIcon = "📭",
  emptyTitle = "No entries yet",
  emptyDescription = "Start tracking something!",
  emptyActionLabel = "Add Entry",
  emptyActionHref = "/new",
}: EntryListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionHref={emptyActionHref}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create EntryDetail**

Create `src/components/entries/entry-detail.tsx`:
```typescript
"use client";

import { DynamicForm } from "@/components/forms/dynamic-form";
import { ImageGallery } from "@/components/shared/image-gallery";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { Entry } from "@/types/tracker";

export function EntryDetail({ entry }: { entry: Entry }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{entry.tracker_type?.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{entry.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={entry.status} />
            <span className="text-sm text-muted-foreground">
              {entry.tracker_type?.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(entry.created_at)}
            </span>
          </div>
        </div>
      </div>

      {entry.images && entry.images.length > 0 && (
        <ImageGallery images={entry.images} readOnly />
      )}

      {entry.tracker_type && (
        <DynamicForm
          fields={entry.tracker_type.fields}
          values={entry.data}
          onChange={() => {}}
          readOnly
        />
      )}

      {entry.notes && (
        <div>
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create New Entry page**

Create `src/app/(app)/new/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { useEntries } from "@/lib/hooks/use-entries";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import type { EntryImage, EntryStatus, TrackerType } from "@/types/tracker";

export default function NewEntryPage() {
  const searchParams = useSearchParams();
  const preselectedTracker = searchParams.get("tracker");

  const { subscribedTypes, loading } = useUserTrackers();
  const { create } = useEntries();
  const router = useRouter();

  const [selectedTrackerId, setSelectedTrackerId] = useState(preselectedTracker ?? "");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EntryStatus>("done");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<EntryImage[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedTracker = subscribedTypes.find(
    (t) => t.id === selectedTrackerId
  ) as TrackerType | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackerId || !title) return;

    setSaving(true);
    try {
      const entry = await create(
        {
          tracker_type_id: selectedTrackerId,
          title,
          status,
          data,
          notes: notes || null,
        },
        images
      );
      router.push(`/entry/${entry.id}`);
    } catch {
      setSaving(false);
    }
  };

  if (!loading && subscribedTypes.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No trackers yet"
        description="Subscribe to some trackers first"
        actionLabel="Discover Trackers"
        actionHref="/discover"
      />
    );
  }

  return (
    <div>
      <PageHeader title="New Entry" description="Log something you did or want to do" />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Tracker</Label>
              <Select value={selectedTrackerId} onValueChange={(v) => {
                setSelectedTrackerId(v);
                setData({});
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tracker" />
                </SelectTrigger>
                <SelectContent>
                  {subscribedTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you tracking?"
                required
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EntryStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="want_to">Want to</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedTracker && (
          <Card>
            <CardContent className="pt-6">
              <DynamicForm
                fields={selectedTracker.fields}
                values={data}
                onChange={setData}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Images</Label>
              <ImageGallery images={images} onChange={setImages} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving || !selectedTrackerId || !title}>
          {saving ? "Saving..." : "Save Entry"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Create Entry detail page**

Create `src/app/(app)/entry/[id]/page.tsx`:
```typescript
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEntry, useEntries } from "@/lib/hooks/use-entries";
import { EntryDetail } from "@/components/entries/entry-detail";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, CheckCircle } from "lucide-react";

export default function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const { entry, loading } = useEntry(id);
  const { remove, update } = useEntries();
  const router = useRouter();

  const handleDelete = async () => {
    if (!entry) return;
    await remove(entry.id);
    router.push("/dashboard");
  };

  const handleMarkDone = async () => {
    if (!entry) return;
    router.push(`/entry/${entry.id}/edit?markDone=true`);
  };

  if (loading) return <CardSkeleton />;
  if (!entry) return <p>Entry not found</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <div className="flex gap-2">
          {entry.status === "want_to" && (
            <Button size="sm" onClick={handleMarkDone}>
              <CheckCircle className="h-4 w-4 mr-1" /> Mark as Done
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/entry/${entry.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <EntryDetail entry={entry} />
    </div>
  );
}
```

- [ ] **Step 6: Create Edit entry page**

Create `src/app/(app)/entry/[id]/edit/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEntry, useEntries } from "@/lib/hooks/use-entries";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import type { EntryImage, EntryStatus } from "@/types/tracker";

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const markDone = searchParams.get("markDone") === "true";

  const { entry, loading } = useEntry(id);
  const { update } = useEntries();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EntryStatus>("done");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<EntryImage[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setStatus(markDone ? "done" : entry.status);
      setData(entry.data);
      setNotes(entry.notes ?? "");
      setImages(entry.images ?? []);
    }
  }, [entry, markDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await update(id, { title, status, data, notes: notes || null }, images);
      router.push(`/entry/${id}`);
    } catch {
      setSaving(false);
    }
  };

  if (loading) return <CardSkeleton />;
  if (!entry) return <p>Entry not found</p>;

  return (
    <div>
      <PageHeader
        title={markDone ? "Mark as Done" : "Edit Entry"}
        description={markDone ? "Fill in the details now that you've done it!" : undefined}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EntryStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="want_to">Want to</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {entry.tracker_type && (
          <Card>
            <CardContent className="pt-6">
              <DynamicForm
                fields={entry.tracker_type.fields}
                values={data}
                onChange={setData}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Images</Label>
              <ImageGallery images={images} onChange={setImages} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/entries/ src/app/\(app\)/new/ src/app/\(app\)/entry/
git commit -m "feat: add entry components and pages (new, detail, edit)"
```

---

## Task 12: Dashboard Page

**Files:**
- Create: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

Create `src/app/(app)/dashboard/page.tsx`:
```typescript
"use client";

import { useEntries } from "@/lib/hooks/use-entries";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { EntryList } from "@/components/entries/entry-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { entries, loading: loadingEntries } = useEntries({ limit: 20 });
  const { subscribedTypes, loading: loadingTrackers } = useUserTrackers();

  const loading = loadingEntries || loadingTrackers;

  if (!loading && subscribedTypes.length === 0) {
    return (
      <EmptyState
        icon="🚀"
        title="Welcome to Tracker!"
        description="Start by choosing what you want to track"
        actionLabel="Discover Trackers"
        actionHref="/discover"
      />
    );
  }

  // Simple stats
  const thisMonth = entries.filter((e) => {
    const entryDate = new Date(e.created_at);
    const now = new Date();
    return (
      entryDate.getMonth() === now.getMonth() &&
      entryDate.getFullYear() === now.getFullYear() &&
      e.status === "done"
    );
  });

  const statsByTracker = subscribedTypes.map((tracker) => {
    const count = thisMonth.filter(
      (e) => e.tracker_type_id === tracker.id
    ).length;
    return { tracker, count };
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        actions={
          <Button asChild>
            <Link href="/new">
              <Plus className="h-4 w-4 mr-2" /> New Entry
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      {subscribedTypes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {statsByTracker.map(({ tracker, count }) => (
            <Card key={tracker.id}>
              <CardContent className="pt-4 text-center">
                <span className="text-2xl">{tracker.icon}</span>
                <p className="text-2xl font-bold mt-1">{count}</p>
                <p className="text-xs text-muted-foreground">
                  {tracker.name} this month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent entries */}
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      {loading ? (
        <CardGridSkeleton />
      ) : (
        <EntryList entries={entries} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/dashboard/
git commit -m "feat: add dashboard page with stats and recent entries"
```

---

## Task 13: Tracker Entries List Page

**Files:**
- Create: `src/app/(app)/track/[slug]/page.tsx`

- [ ] **Step 1: Create tracker entries page**

Create `src/app/(app)/track/[slug]/page.tsx`:
```typescript
"use client";

import { useParams } from "next/navigation";
import { useTrackerType } from "@/lib/hooks/use-tracker-types";
import { useEntries } from "@/lib/hooks/use-entries";
import { EntryList } from "@/components/entries/entry-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function TrackerEntriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { trackerType, loading: loadingTracker } = useTrackerType(slug);
  const { entries, loading: loadingEntries } = useEntries({
    trackerTypeId: trackerType?.id,
  });

  const loading = loadingTracker || loadingEntries;
  const doneEntries = entries.filter((e) => e.status === "done");
  const wantToEntries = entries.filter((e) => e.status === "want_to");

  if (loadingTracker) return <CardGridSkeleton />;
  if (!trackerType) return <p>Tracker not found</p>;

  return (
    <div>
      <PageHeader
        title={`${trackerType.icon} ${trackerType.name}`}
        description={trackerType.description}
        actions={
          <Button asChild>
            <Link href={`/new?tracker=${trackerType.id}`}>
              <Plus className="h-4 w-4 mr-2" /> Add Entry
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="done">
        <TabsList>
          <TabsTrigger value="done">Done ({doneEntries.length})</TabsTrigger>
          <TabsTrigger value="want_to">
            Want to ({wantToEntries.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="done" className="mt-4">
          {loading ? (
            <CardGridSkeleton />
          ) : (
            <EntryList
              entries={doneEntries}
              emptyTitle="Nothing tracked yet"
              emptyDescription={`Start tracking your ${trackerType.name.toLowerCase()}`}
              emptyActionHref={`/new?tracker=${trackerType.id}`}
            />
          )}
        </TabsContent>
        <TabsContent value="want_to" className="mt-4">
          {loading ? (
            <CardGridSkeleton />
          ) : (
            <EntryList
              entries={wantToEntries}
              emptyIcon="✨"
              emptyTitle="No wishlist items"
              emptyDescription={`Add things you want to try`}
              emptyActionHref={`/new?tracker=${trackerType.id}`}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/track/
git commit -m "feat: add tracker entries list page with done/want-to tabs"
```

---

## Task 14: Search Page

**Files:**
- Create: `src/app/api/search/route.ts`, `src/app/(app)/search/page.tsx`

- [ ] **Step 1: Create search API route**

Create `src/app/api/search/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchFiltersSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const params = {
    query: url.searchParams.get("q") ?? "",
    tracker_type_id: url.searchParams.get("tracker") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    date_from: url.searchParams.get("from") ?? undefined,
    date_to: url.searchParams.get("to") ?? undefined,
  };

  const parsed = searchFiltersSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("search_entries", {
    search_query: parsed.data.query,
    p_user_id: user.id,
    p_tracker_type_id: parsed.data.tracker_type_id ?? null,
    p_status: parsed.data.status ?? null,
    p_date_from: parsed.data.date_from ?? null,
    p_date_to: parsed.data.date_to ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich results with tracker_type and images joins
  const entryIds = (data ?? []).map((e: { id: string }) => e.id);

  const [{ data: trackerTypes }, { data: images }] = await Promise.all([
    supabase.from("tracker_types").select("*"),
    supabase.from("entry_images").select("*").in("entry_id", entryIds),
  ]);

  const trackerMap = new Map((trackerTypes ?? []).map((t: { id: string }) => [t.id, t]));
  const imageMap = new Map<string, typeof images>();
  (images ?? []).forEach((img: { entry_id: string }) => {
    if (!imageMap.has(img.entry_id)) imageMap.set(img.entry_id, []);
    imageMap.get(img.entry_id)!.push(img);
  });

  const results = (data ?? []).map((entry: { id: string; tracker_type_id: string }) => ({
    ...entry,
    tracker_type: trackerMap.get(entry.tracker_type_id) ?? null,
    images: imageMap.get(entry.id) ?? [],
  }));

  return NextResponse.json({ results });
}
```

- [ ] **Step 2: Create search page**

Create `src/app/(app)/search/page.tsx`:
```typescript
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTrackerTypes } from "@/lib/hooks/use-tracker-types";
import { EntryList } from "@/components/entries/entry-list";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Search } from "lucide-react";
import type { Entry } from "@/types/tracker";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const { trackerTypes } = useTrackerTypes();
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackerFilter, setTrackerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const search = useCallback(async () => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ q: query });
    if (trackerFilter) params.set("tracker", trackerFilter);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }, [query, trackerFilter, statusFilter]);

  useEffect(() => {
    search();
  }, [search]);

  return (
    <div>
      <PageHeader title="Search" />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            defaultValue={query}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
              }
            }}
            placeholder="Search your entries..."
            className="pl-10"
          />
        </div>
        <Select value={trackerFilter} onValueChange={setTrackerFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All trackers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All trackers</SelectItem>
            {trackerTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.icon} {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any status</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="want_to">Want to</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <CardGridSkeleton />
      ) : query ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          <EntryList
            entries={results}
            emptyIcon="🔍"
            emptyTitle="No results"
            emptyDescription="Try a different search term or adjust your filters"
          />
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-16">
          Start typing to search your entries
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/search/ src/app/\(app\)/search/
git commit -m "feat: add search page with fuzzy search and filters"
```

---

## Task 15: Root Layout & Global Styles

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tracker — Track the things you love",
  description:
    "A modern app for tracking personal experiences — coffee, books, recipes, and anything else.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Set up root page redirect**

Create `src/app/page.tsx`:
```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: configure root layout, metadata, and dark theme"
```

---

## Task 16: CLAUDE.md & Project Documentation

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

Create `CLAUDE.md`:
```markdown
# Tracker

A modern multi-user web app for tracking personal experiences.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase (Postgres + Auth + RLS)
- **Image Storage:** Cloudflare R2
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Validation:** Zod

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
```

## Project Structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components (ui/, shared/, forms/, entries/, trackers/, layout/)
- `src/lib/` — Utilities, Supabase clients, hooks, validation schemas
- `src/types/` — TypeScript type definitions
- `supabase/migrations/` — Database migrations

## Architecture

- Dynamic tracker types with JSONB field schemas
- Field renderer registry pattern — each field type has one renderer
- `<DynamicForm>` renders any tracker type's form from its field schema
- RLS enforces data isolation per user
- Presigned URL uploads direct to Cloudflare R2

## Conventions

- Reuse components — no duplication. If it appears twice, extract it.
- All data hooks in `src/lib/hooks/`
- shadcn/ui for all primitives
- Zod for all validation
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project structure and conventions"
```

---

## Task 17: Verify Build & Fix Issues

- [ ] **Step 1: Install lucide-react**

Run:
```bash
npm install lucide-react
```

- [ ] **Step 2: Run build**

Run:
```bash
npm run build
```

Expected: Build succeeds. If not, fix TypeScript errors and missing imports.

- [ ] **Step 3: Run dev server and verify pages load**

Run:
```bash
npm run dev
```

Manually test:
- `/login` — renders login form
- `/signup` — renders signup form
- `/dashboard` — redirects to login if not authenticated
- `/discover` — shows tracker types

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors and missing dependencies"
```

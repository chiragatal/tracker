# Tracker App — Design Spec

A modern, multi-user web app for tracking personal experiences — coffees, books, recipes, and anything else. Users subscribe to tracker types, log entries with custom fields, and search across everything they've tracked.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase (Postgres + Auth + Row Level Security)
- **Image Storage:** Cloudflare R2 (S3-compatible, free tier)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Validation:** Zod
- **Hosting:** Vercel (free tier)
- **Cost:** $0 — all services on free tiers

## Data Model

### `tracker_types` — Global tracker templates created by users

| Column       | Type      | Notes                                |
|-------------|-----------|--------------------------------------|
| id          | uuid      | Primary key                          |
| name        | text      | e.g. "Coffee", "Books", "Recipes"    |
| slug        | text      | URL-friendly, unique                 |
| icon        | text      | Emoji or icon name                   |
| description | text      | What this tracker is for             |
| fields      | jsonb     | Array of field definitions           |
| created_by  | uuid      | FK to auth.users                     |
| created_at  | timestamp |                                      |

#### `fields` JSONB structure

```json
[
  { "key": "roaster", "label": "Roaster", "type": "text", "required": false },
  { "key": "rating", "label": "Rating", "type": "rating", "required": true },
  { "key": "brew_method", "label": "Brew Method", "type": "dropdown", "options": ["Pour Over", "Espresso", "French Press"] },
  { "key": "photo", "label": "Photo", "type": "image" }
]
```

**Supported field types:** `text`, `long_text`, `number`, `date`, `rating`, `image`, `url`, `tags`, `location`, `price`, `duration`, `checkbox`, `dropdown`

### `user_trackers` — User subscriptions to tracker types

| Column          | Type      | Notes                              |
|----------------|-----------|-------------------------------------|
| id             | uuid      | Primary key                         |
| user_id        | uuid      | FK to auth.users                    |
| tracker_type_id| uuid      | FK to tracker_types                 |
| created_at     | timestamp |                                     |

Unique constraint on `(user_id, tracker_type_id)`.

### `entries` — Logged items

| Column          | Type      | Notes                                      |
|----------------|-----------|---------------------------------------------|
| id             | uuid      | Primary key                                 |
| tracker_type_id| uuid      | FK to tracker_types                         |
| user_id        | uuid      | FK to auth.users                            |
| title          | text      | Main name/title                             |
| status         | text      | `done` or `want_to`                         |
| data           | jsonb     | Field values matching tracker type's schema |
| notes          | text      | Free-form notes                             |
| created_at     | timestamp |                                             |
| updated_at     | timestamp |                                             |

### `entry_images` — Images linked to entries

| Column   | Type | Notes        |
|----------|------|--------------|
| id       | uuid | Primary key  |
| entry_id | uuid | FK to entries|
| url      | text | R2 URL       |
| alt_text | text | Optional     |
| position | int  | Ordering     |

## Authentication & Authorization

- **Supabase Auth** with email/password + Google and GitHub OAuth
- **Row Level Security (RLS):**
  - `tracker_types` — anyone can read, only creator can edit/delete
  - `user_trackers` — users can only read/write their own subscriptions
  - `entries` — users can only read/write their own entries
  - `entry_images` — users can only access images on their own entries
- **Session handling:** Supabase client SDK manages JWTs. Server-side route protection via Next.js middleware.
- No roles or admin panel. All users are equal.

## Core Features

### Discover & Subscribe ("What do you want to track?")

- Browse all available tracker types (global, created by any user)
- Subscribe/unsubscribe to tracker types
- Create a new tracker type from this page
- **New user onboarding:** After sign-up, land on this page. Must subscribe to at least one tracker before proceeding.

### Tracker Type Creation (Form Builder)

- Name, icon, description
- Add fields: pick a field type, set label, configure options (e.g. dropdown choices), mark required/optional
- Drag to reorder fields
- Preview the form as you build it
- **Editing rules:** Only the creator can edit. Only additive changes allowed on tracker types that have entries (add new fields, rename labels). No deleting fields that have data.

### Entries

- **Add entry:** Pick from subscribed tracker types → fill dynamic form → set status ("done" or "want to")
- **View entry:** Full detail page with all fields, images, notes
- **Edit / Delete:** Only your own entries
- **Convert "want to" to "done":** Opens entry for editing, fill in remaining fields (date, rating, photos, review), status flips to "done"

### Dashboard / Home

- Personal feed — recent entries across all subscribed tracker types, sorted by date
- Quick-add button — prominent, picks tracker type first
- Simple stats — counts like "12 coffees this month", "3 books this year"

### Search

- Global search bar, always accessible
- **Fuzzy text search** via Postgres `pg_trgm` extension across title, notes, tags, and JSONB data fields
- **Filters:** tracker type, status (done/want to), date range, tags
- **Results:** Card-based with thumbnail, title, tracker type badge, date
- **AI-ready:** Architecture supports adding semantic/AI search later

### Image Upload

- Presigned URL flow: client requests upload URL from API → uploads directly to R2 → saves URL to `entry_images`
- Multiple images per entry, drag to reorder
- Client-side resize before upload for thumbnails

## Project Structure

```
tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── (app)/              # Authenticated app pages
│   │   │   ├── dashboard/      # Home feed + stats
│   │   │   ├── discover/       # "What do you want to track?" page
│   │   │   ├── track/[slug]/   # Entries list for a tracker type
│   │   │   ├── entry/[id]/     # Entry detail page
│   │   │   ├── new/            # Add new entry
│   │   │   ├── search/         # Search + filters
│   │   │   └── tracker/new/    # Create new tracker type (form builder)
│   │   ├── api/                # API routes
│   │   │   ├── upload/         # Presigned URL generation for R2
│   │   │   └── search/         # Search endpoint
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Dynamic form renderer + form builder
│   │   ├── entries/            # Entry card, entry list, entry detail
│   │   ├── trackers/           # Tracker type card, subscription toggle
│   │   └── layout/             # Nav, sidebar, search bar
│   ├── lib/
│   │   ├── supabase/           # Supabase client + server helpers
│   │   ├── r2/                 # R2 upload helpers
│   │   ├── search/             # Search query builder
│   │   └── utils.ts            # Shared utilities
│   └── types/                  # TypeScript types
├── supabase/
│   └── migrations/             # SQL migrations
├── public/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Reusability Principles

No code duplication. If it appears twice, it gets extracted.

### Dynamic Form System

- **`<DynamicForm>`** — takes a field schema array, renders the correct inputs. Used for: creating entries, editing entries, converting "want to" → "done", previewing tracker type fields.
- **`<FieldRenderer>`** — one component per field type, registered in a field type registry, looked up by type string. Single source of truth for how each field type renders.
- **`<FormBuilder>`** — for creating/editing tracker types. Reuses `<FieldRenderer>` for previews.

### Shared Components

- **`<EntityCard>`** — one card component that adapts via composition (entry card, tracker type card, search result card)
- **`<PageHeader>`** — consistent page headers with title, description, actions
- **`<EmptyState>`** — reusable empty state with icon, message, action button
- **`<StatusBadge>`** — "done" / "want to" badge
- **`<ImageGallery>`** — upload, display, reorder images. Used in entry form and entry detail.

### Data Layer

- Shared Supabase query hooks (`useEntries`, `useTrackerTypes`, `useUserTrackers`)
- Single `uploadImage` utility for all image uploads
- Single `buildSearchQuery` function for Postgres fuzzy search with filters

## Default Tracker Types (Seed Data)

Seeded as regular `tracker_types` rows — no special handling. Created by a system user or the first user.

1. **Coffee** — fields: roaster, origin, brew method (dropdown), rating, photo, price, tags
2. **Books** — fields: author, genre (dropdown), rating, date finished, review (long text), cover image, tags
3. **Recipes / Cooking** — fields: cuisine (dropdown), prep time (duration), cook time (duration), difficulty (dropdown), rating, photo, tags, recipe URL

Users can modify these or create entirely new tracker types.

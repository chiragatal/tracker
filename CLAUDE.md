# TrackerVault

A modern multi-user web app for tracking personal experiences — coffee, books, recipes, TV shows, and anything else.

**Live:** https://trackervault.vercel.app

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase (Postgres + Auth + RLS)
- **Image Storage:** Cloudflare R2 (S3-compatible)
- **Styling:** Tailwind CSS 4 + shadcn/ui (base-ui variant)
- **Validation:** Zod
- **Hosting:** Vercel (free tier)
- **Testing:** Playwright (e2e)

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run test:e2e     # Run Playwright e2e tests (needs TEST_EMAIL/TEST_PASSWORD env vars)
```

## Deployment

Auto-deploys from GitHub on push to `main`.

```bash
git push origin main   # Triggers Vercel deploy automatically
```

### Infrastructure

| Service | Details |
|---|---|
| Vercel | Scope: chiragatals-projects, auto-deploy from GitHub |
| Supabase | Project ref: yfzuteygsgxuuvamqbxu, Mumbai region |
| Cloudflare R2 | Bucket: tracker-images, Account: 3040695046974b1d02c864adc6e6c0ac |
| GitHub | https://github.com/chiragatal/tracker |

### Database Migrations

```bash
npx supabase db push    # Push pending migrations to Supabase
```

Migration files are in `supabase/migrations/`. There are 8 migrations covering tables, RLS, search, seed data, and the is_public column.

### Email Templates

Custom branded HTML templates are in `supabase/email-templates/`. To update, copy HTML into Supabase Dashboard > Authentication > Email Templates.

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, signup, forgot/reset password, terms, privacy)
│   ├── (app)/               # Authenticated app pages
│   │   ├── dashboard/       # Home — stats, heatmap, chart, recent entries, filters
│   │   ├── discover/        # Browse & subscribe to tracker types
│   │   ├── track/[slug]/    # Entries list for a tracker (with sort, export, import, delete all)
│   │   ├── entry/[id]/      # Entry detail + edit
│   │   ├── new/             # Create new entry (dynamic form from tracker schema)
│   │   ├── tracker/new/     # Create new tracker type (form builder)
│   │   ├── tracker/[slug]/edit/  # Edit tracker type
│   │   ├── search/          # Full-text search with filters
│   │   ├── tags/            # Browse entries by tags
│   │   ├── import/          # Bulk import from JSON
│   │   ├── profile/         # User profile, change password, delete account
│   │   └── about/           # About/help page
│   ├── api/
│   │   ├── upload/          # Image upload (server-side proxy to R2)
│   │   └── search/          # Fuzzy search via pg_trgm + ilike fallback
│   ├── share/[id]/          # Public shared entry view (no auth)
│   └── page.tsx             # Landing page (public)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── shared/              # Reusable: EntityCard, PageHeader, EmptyState, StatusBadge,
│   │                        #   SearchBar, LoadingSkeleton, ImageGallery, EmojiPicker,
│   │                        #   ThemeToggle, ErrorBoundary, ActivityHeatmap, StatsChart
│   ├── forms/               # Dynamic form system
│   │   ├── field-registry   # Maps field type → renderer component
│   │   ├── field-renderers/ # 12 renderers (text, number, date, rating, image, url,
│   │   │                    #   tags, location, price, duration, checkbox, dropdown)
│   │   ├── dynamic-form     # Renders any tracker's form from field schema
│   │   └── form-builder     # UI for creating/editing tracker field schemas
│   ├── entries/             # EntryCard, EntryList, EntryDetail
│   ├── trackers/            # TrackerCard, TrackerGrid
│   └── layout/              # Sidebar, Topbar, MobileNav, KeyboardShortcuts
├── lib/
│   ├── supabase/            # Client (browser), Server, Middleware helpers
│   ├── r2/                  # R2 upload helper (presigned URLs)
│   ├── hooks/               # useTrackerTypes, useUserTrackers, useEntries,
│   │                        #   useImageUpload, useKeyboardShortcuts
│   ├── utils.ts             # cn(), slugify(), formatDate()
│   ├── validations.ts       # Zod schemas
│   └── rate-limit.ts        # In-memory rate limiter
├── types/
│   └── tracker.ts           # FieldType, FieldDefinition, TrackerType, Entry, etc.
├── middleware.ts             # Auth redirect (protects app routes)
tests/
└── e2e/                     # 60+ Playwright tests across 11 files
supabase/
├── migrations/              # 8 SQL migration files
└── email-templates/         # Custom branded email HTML
public/
├── logo.svg                 # App logo (emerald-to-violet gradient + checkmark)
├── favicon.svg              # Browser tab icon
├── manifest.json            # PWA manifest
└── sw.js                    # Service worker for offline support
```

## Architecture

### Dynamic Tracker Types

The core design: tracker types define their fields as a JSONB array. Each field has a key, label, type, required flag, and optional options (for dropdowns). The `<DynamicForm>` component renders any tracker's form from this schema.

**13 field types:** text, long_text, number, date, rating, image, url, tags, location, price, duration, checkbox, dropdown

**No hardcoded entry fields.** When creating a new tracker, sensible defaults are pre-populated (Name, Status, Date, Rating, Notes) but the creator can remove any of them. The entry's `title`, `status`, and `notes` in the database are derived from the data on save.

### Field Renderer Registry

Each field type has a renderer component registered via `registerField(type, Component)`. The barrel import `field-renderers/index.ts` triggers all registrations. `getFieldRenderer(type)` looks up the component at render time.

### Data Flow

1. User creates a tracker type with a field schema (stored as JSONB)
2. User subscribes to the tracker
3. User creates an entry → DynamicForm renders the tracker's fields
4. On save: `title` derived from `name` field, `status` from `status` field, `notes` from long_text field
5. Entry data stored as JSONB in `entries.data`, title/status/notes also stored as top-level columns for efficient querying

### Auth & Security

- Supabase Auth (email/password, no OAuth currently)
- Row Level Security on all tables
- `tracker_types`: anyone can read, only creator can edit/delete
- `entries` / `user_trackers` / `entry_images`: users can only access their own
- `entries.is_public = true`: anyone can read (for share links)
- Auth middleware redirects unauthenticated users to /login
- Public routes: /, /login, /signup, /forgot-password, /reset-password, /terms, /privacy, /share/*

### Image Upload

Server-side proxy to R2 (no CORS issues). Client sends FormData → API route uploads to R2 via S3 SDK → returns public URL. Images are compressed client-side before upload (max 1920px, JPEG 80%).

### Search

Fuzzy search via Postgres `pg_trgm` extension with a `search_entries` RPC function. Falls back to `ilike` substring matching when trigram similarity returns no results. Search API enriches results with tracker_type and images joins.

## Conventions

- **No code duplication.** If it appears twice, extract it.
- **No special handling.** All fields are dynamic. No hardcoded entry fields.
- **shadcn/ui base-ui variant.** Button does NOT support `asChild`. Use `buttonVariants()` on Link elements for button-links.
- **All data hooks** in `src/lib/hooks/`. Use `useMemo(() => createClient(), [])` for stable Supabase references.
- **Toasts** via `import { toast } from "sonner"` for user feedback on actions.
- **Ownership checks** before showing edit/delete buttons (compare `created_by` with current user ID).
- **Zod** for all validation schemas.

## Key Features

| Feature | Details |
|---|---|
| Dynamic trackers | Create any tracker with custom fields, no code changes |
| 13 field types | text, number, date, rating, image, url, tags, location, price, duration, checkbox, dropdown, long_text |
| Search | Fuzzy text search + filters (tracker, status, date) |
| Tags | Browse all entries by tag across trackers |
| Export/Import | JSON export per tracker, bulk import |
| Share | Public links for individual entries |
| Track Again | Duplicate entries with one click |
| Dark/Light mode | Toggle in topbar, persisted in localStorage |
| PWA | Installable on phones, offline static caching |
| Keyboard shortcuts | Cmd+N (new entry), Cmd+F (search) |
| Activity heatmap | GitHub-style contribution graph on dashboard |
| Weekly chart | Bar chart showing entries per week |
| Dashboard filters | Filter recent activity by tracker type |
| Quick add | One-click entry creation per tracker from dashboard |
| Image upload | Server-side R2 proxy with client-side compression |
| Profile | Change password, view stats, delete account |
| Rate limiting | In-memory rate limits on API routes |
| Error boundaries | Graceful crash recovery per page |
| Animations | Fade-in/slide-up on pages and cards |

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

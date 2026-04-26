---
phase: quick
plan: 260426-jqu
subsystem: database
tags: [supabase, postgres, migration, rls, clubs, cache]

requires:
  - phase: v1.1
    provides: clubs scraper and Supabase client code (src/db/supabase.ts)
provides:
  - SQL migration file for clubs table in Supabase
affects: [clubs, api]

tech-stack:
  added: []
  patterns: [supabase-migration-with-rls]

key-files:
  created:
    - supabase/migrations/001_create_clubs_table.sql
  modified: []

key-decisions:
  - "Matched SQLite clubs schema (id INTEGER PK, data JSONB, updated_at TIMESTAMPTZ) for Supabase Postgres"
  - "Enabled RLS with permissive service_role policy, matching the existing players table pattern"

patterns-established:
  - "Supabase migration files stored in supabase/migrations/ with sequential numbering"

requirements-completed: []

duration: 1min
completed: 2026-04-26
---

# Quick Task 260426-jqu: Fix 404 on clubs table query (PGRST205) Summary

**SQL migration for Supabase clubs table with RLS policy, fixing PGRST205 "table not found" error on /api/clubs**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-26T11:15:34Z
- **Completed:** 2026-04-26T11:16:09Z
- **Tasks:** 1 of 2 (Task 2 is a human-action checkpoint)
- **Files created:** 1

## Accomplishments
- Created SQL migration file with clubs table schema matching supabase.ts usage (id INTEGER PK, data JSONB, updated_at TIMESTAMPTZ)
- Included RLS enablement and service_role full access policy (required by Supabase, matches players table pattern)
- Migration file stored at `supabase/migrations/001_create_clubs_table.sql` for documentation and reproducibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SQL migration file for clubs table** - `3675b86` (fix)

**Plan metadata:** (included in final docs commit)

## Files Created/Modified
- `supabase/migrations/001_create_clubs_table.sql` - SQL migration to create clubs cache table with RLS in Supabase

## Decisions Made
- Matched the existing players table pattern for RLS policy (permissive service_role access)
- Used `CREATE TABLE IF NOT EXISTS` for idempotent execution safety

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Pending Human Action

**Task 2 (checkpoint:human-action):** The user must run the migration SQL in the Supabase SQL Editor to create the clubs table in production. Steps:
1. Go to Supabase project dashboard
2. Navigate to SQL Editor
3. Paste contents of `supabase/migrations/001_create_clubs_table.sql`
4. Click "Run"
5. Verify in Table Editor that `clubs` table appears
6. Test: Visit the deployed app, go to Clubs tab, confirm club list loads and caches

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: supabase/migrations/001_create_clubs_table.sql
- FOUND: 260426-jqu-SUMMARY.md
- FOUND: commit 3675b86

---
*Plan: quick/260426-jqu*
*Completed: 2026-04-26*

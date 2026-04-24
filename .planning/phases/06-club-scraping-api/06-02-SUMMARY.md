---
phase: 06-club-scraping-api
plan: 02
subsystem: api
tags: [express, cache, supabase, sqlite, clubs]

# Dependency graph
requires:
  - phase: 06-club-scraping-api plan 01
    provides: scrapeClubList and searchClubPlayers functions, ClubInfo and ClubSearchResult types
provides:
  - Club cache layer (getCachedClubs, upsertClubs, isClubsCacheStale) in db abstraction
  - GET /api/clubs endpoint with 7-day cache TTL and force refresh
  - GET /api/clubs/search endpoint with club validation and age filters
  - clubsRouter Express router registered in dev-server and Netlify function
affects: [07-club-search-ui, frontend]

# Tech tracking
tech-stack:
  added: []
  patterns: [club-cache-7day-ttl, ephemeral-search-no-cache]

key-files:
  created:
    - src/api/routes/clubs.ts
    - tests/api/clubs.test.ts
    - src/dev-server.ts
  modified:
    - src/db/supabase.ts
    - src/db/sqlite.ts
    - src/db/index.ts
    - netlify/functions/api.ts

key-decisions:
  - "Club list cached as single row (id=1) with JSONB/JSON data column — same pattern works for Supabase and SQLite"
  - "Search results are ephemeral (no caching) per D-09 — only club list gets 7-day cache"
  - "dev-server.ts committed to git (was previously local-only) to track router registrations"

patterns-established:
  - "Club cache single-row pattern: id=1 stores full club list as JSON array"
  - "isClubsCacheStale uses 7-day TTL (vs 24h for players) defined in db/index.ts"

requirements-completed: [CSCRP-01, CSCRP-02]

# Metrics
duration: 4min
completed: 2026-04-24
---

# Phase 06 Plan 02: Club Cache & API Routes Summary

**Express router for club list (7-day cached) and club player search (ephemeral) with Supabase/SQLite cache layer and 10 route handler tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-24T12:00:04Z
- **Completed:** 2026-04-24T12:04:35Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Club cache layer added to Supabase, SQLite, and db abstraction with getCachedClubs, upsertClubs, and isClubsCacheStale (7-day TTL)
- clubsRouter Express router serves GET /api/clubs (cached) and GET /api/clubs/search (validates club param, passes age filters)
- Router registered in both dev-server.ts and netlify/functions/api.ts
- 10 route handler tests covering cache freshness, stale cache, force refresh, search validation, age params, and error handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Add club cache functions to database layer** - `9d80f3f` (feat)
2. **Task 2a: Add failing tests for club route handlers** - `8ed1145` (test, TDD RED)
3. **Task 2b: Implement clubs router and register in entry points** - `f9c9f4a` (feat, TDD GREEN)

## Files Created/Modified
- `src/db/supabase.ts` - Added CachedClubsRow interface, getCachedClubs, upsertClubs for Supabase
- `src/db/sqlite.ts` - Added clubs table creation, getCachedClubs with JSON.parse, upsertClubs
- `src/db/index.ts` - Extended with getCachedClubs, upsertClubs forwarding and isClubsCacheStale (7-day TTL)
- `src/api/routes/clubs.ts` - Express router with GET /api/clubs and GET /api/clubs/search
- `netlify/functions/api.ts` - Registered clubsRouter at /api/clubs
- `src/dev-server.ts` - Created with clubsRouter registration (was previously untracked)
- `tests/api/clubs.test.ts` - 10 test cases for club route handlers

## Decisions Made
- Club list cached as single row (id=1) with JSONB/JSON data column for simplicity
- Search results are ephemeral (no caching) per project decision D-09
- dev-server.ts committed to git to track router registrations consistently

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing player test failure (tests/api/player.test.ts mocks supabase.ts directly instead of db/index.ts) - not caused by this plan's changes, documented but not fixed per scope boundary rules.

## User Setup Required

**External services require manual configuration.** The Supabase clubs table must be created via the SQL Editor:

```sql
CREATE TABLE clubs (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Next Phase Readiness
- Club API endpoints are ready for frontend consumption in phase 07 (club search UI)
- GET /api/clubs provides club list for dropdown selector
- GET /api/clubs/search provides player results for search table display
- SQLite fallback works for local development without Supabase

## Self-Check: PASSED

All 7 created/modified files verified on disk. All 3 commits verified in git history.

---
*Phase: 06-club-scraping-api*
*Completed: 2026-04-24*

---
phase: 01-data-pipeline
plan: 02
subsystem: database
tags: [supabase, postgres, jsonb, caching, serverless]

# Dependency graph
requires:
  - phase: 01-data-pipeline/01
    provides: SharedTypes (PlayerData interface used in cache operations)
provides:
  - Supabase client module with getCachedPlayer, isStale, upsertPlayer functions
  - CachedPlayerRow type for cache query results
  - 24-hour cache freshness logic
affects: [01-data-pipeline/03, api, player-route]

# Tech tracking
tech-stack:
  added: [@supabase/supabase-js]
  patterns: [module-scope Supabase client for serverless reuse, JSONB storage with upsert on conflict]

key-files:
  created:
    - src/db/supabase.ts
    - tests/db/cache.test.ts
  modified: []

key-decisions:
  - "Module-scope Supabase client initialization for warm serverless invocation reuse (per D-15)"
  - "Used vi.hoisted() for mock function declarations to handle vitest mock hoisting"

patterns-established:
  - "Supabase mock pattern: vi.hoisted() + vi.mock() with chained method tracking (from/select/eq/single/upsert)"
  - "Cache module exports: supabase client, getCachedPlayer, isStale, upsertPlayer"

requirements-completed: [CACH-01, CACH-02, CACH-03, CACH-04, CACH-05]

# Metrics
duration: 3min
completed: 2026-04-20
---

# Phase 1 Plan 02: Supabase Cache Module Summary

**Supabase caching layer with 24-hour freshness logic, JSONB upsert on player_id conflict, and fully mocked test suite**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-20T06:43:13Z
- **Completed:** 2026-04-20T06:46:38Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 4 (src/db/supabase.ts, tests/db/cache.test.ts, package.json, .gitignore)

## Accomplishments
- Supabase client initialized at module scope for serverless warm invocation reuse
- getCachedPlayer retrieves player data by ID or returns null on cache miss
- isStale evaluates 24-hour freshness threshold using Date.now() comparison
- upsertPlayer stores JSONB data with onConflict resolution on player_id
- All 6 tests pass with fully mocked Supabase client (no real database calls)

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing cache tests** - `f6024fa` (test)
2. **Task 1 (GREEN): Supabase cache implementation** - `a57fdc2` (feat)
3. **.gitignore for build artifacts** - `175f372` (chore)

## Files Created/Modified
- `src/db/supabase.ts` - Supabase client init + cache read/write/staleness functions (exports: supabase, getCachedPlayer, isStale, upsertPlayer, CachedPlayerRow)
- `tests/db/cache.test.ts` - 6 tests covering isStale (2), getCachedPlayer (2), upsertPlayer (2) with mocked Supabase
- `packages/shared/types.ts` - PlayerData type (prerequisite for cache module, shared with Plan 01)
- `package.json` - Project init with @supabase/supabase-js, typescript, vitest dependencies
- `.gitignore` - node_modules, dist, .env, .netlify exclusions

## Decisions Made
- Used `vi.hoisted()` for mock function declarations to work around vitest's automatic mock hoisting behavior
- Module-scope client initialization follows D-15 (REST-based Supabase client, serverless-safe)
- CachedPlayerRow interface exported for type safety in downstream consumers (Plan 03 API route)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed vitest mock hoisting with vi.hoisted()**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** `vi.mock()` factory runs before `const` declarations due to vitest hoisting, causing `ReferenceError: Cannot access 'mockFrom' before initialization`
- **Fix:** Wrapped mock function declarations in `vi.hoisted()` which executes at the hoisted scope level
- **Files modified:** tests/db/cache.test.ts
- **Verification:** All 6 tests pass
- **Committed in:** a57fdc2 (GREEN phase commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary fix for test infrastructure compatibility. No scope creep.

## Issues Encountered
None beyond the mock hoisting fix documented above.

## User Setup Required

**External services require manual configuration.** The plan frontmatter documents Supabase setup:
- Create Supabase project (free tier) at https://supabase.com/dashboard
- Create `players` table: `CREATE TABLE players (player_id INTEGER PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`
- Set environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Known Stubs
None - all functions are fully implemented with real logic (no placeholder data or TODO markers).

## Next Phase Readiness
- Cache module ready for consumption by Plan 03 (API route handler)
- getCachedPlayer and upsertPlayer provide the read/write interface for the cache-first API flow
- isStale provides the freshness check for 24-hour cache policy

## Self-Check: PASSED

- FOUND: src/db/supabase.ts
- FOUND: tests/db/cache.test.ts
- FOUND: 01-02-SUMMARY.md
- FOUND: f6024fa (test RED commit)
- FOUND: a57fdc2 (feat GREEN commit)
- FOUND: 175f372 (chore .gitignore commit)

---
*Phase: 01-data-pipeline*
*Completed: 2026-04-20*

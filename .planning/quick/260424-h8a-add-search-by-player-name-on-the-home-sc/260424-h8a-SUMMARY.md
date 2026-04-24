---
phase: quick
plan: 260424-h8a
subsystem: search
tags: [search, scraping, frontend, backend]
dependency_graph:
  requires: [chess.org.il search page]
  provides: [player name search, search API endpoint]
  affects: [home screen, HeroSearch component]
tech_stack:
  added: []
  patterns: [ASP.NET WebForms scraping (GET+POST), debounced search hook, auto-detect input mode]
key_files:
  created:
    - src/scraper/search.ts
    - client/src/hooks/usePlayerSearch.ts
    - client/src/components/search/SearchResults.tsx
  modified:
    - packages/shared/types.ts
    - src/api/routes/player.ts
    - client/src/components/search/HeroSearch.tsx
decisions:
  - ASP.NET WebForms search via GET (ViewState) + POST (query) pattern, consistent with existing scraper approach
  - 300ms debounce for name search to avoid excessive requests
  - Auto-detect mode: digits = ID submit, Hebrew text = name search dropdown
  - Search route placed before /:id in Express router to prevent route conflict
metrics:
  duration: 2min
  completed: "2026-04-24T09:35:00Z"
---

# Quick Task 260424-h8a: Add Search by Player Name Summary

Player name search on home screen using ASP.NET WebForms scraping of chess.org.il search page with 300ms debounced auto-detect (digits=ID, Hebrew=name search dropdown)

## What Was Done

### Task 1: Backend -- SearchResult type + search scraper + API route
- Added `SearchResult` interface to `packages/shared/types.ts` with id, name, rating, club, grade fields
- Created `src/scraper/search.ts` with `searchPlayers()` function that scrapes chess.org.il's ASP.NET WebForms search page (GET for ViewState, POST with query)
- Added `GET /api/player/search?q=` route to `src/api/routes/player.ts`, placed before `/:id` to avoid route conflict
- Graceful degradation: empty array on any error, minimum 2-char query required
- **Commit:** f9fbff7

### Task 2: Frontend -- usePlayerSearch hook + SearchResults dropdown + HeroSearch integration
- Created `client/src/hooks/usePlayerSearch.ts` with 300ms debounce, AbortController for cancellation, auto-skip for pure-digit queries
- Created `client/src/components/search/SearchResults.tsx` dropdown matching RecentSuggestions visual style, showing name, ID, rating, club per result
- Updated `client/src/components/search/HeroSearch.tsx`: removed `inputMode="numeric"`, removed non-numeric error message, added auto-detect (ID vs name mode), integrated SearchResults dropdown
- Updated placeholder text to indicate both search modes
- **Commit:** 15c4207

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all data paths are fully wired.

## Verification

- Backend TypeScript compiles cleanly (`npx tsc --noEmit`)
- Frontend TypeScript compiles cleanly (`cd client && npx tsc --noEmit`)
- Search route registered before `/:id` to prevent Express matching "search" as an ID parameter

## Self-Check: PASSED

All 6 files verified present. Both commits (f9fbff7, 15c4207) confirmed in git log.

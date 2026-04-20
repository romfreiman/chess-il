---
phase: 02-home-app-shell
plan: 02
subsystem: ui
tags: [react, tailwind, rtl, search, localStorage, hero-search, player-cards]

# Dependency graph
requires:
  - phase: 02-home-app-shell/01
    provides: AppLayout, Navbar, ThemeToggle, routing, test infrastructure, constants
provides:
  - HeroSearch component with numeric validation and navigation
  - RecentSuggestions dropdown from localStorage history
  - useRecentSearches hook managing search history
  - PlayerCard component with name/rating/club and link to /player/:id
  - PlayerGrid component with responsive 2-col/3-col grid
  - EmptyState component with Hebrew prompt
  - HomePage assembling search + conditional grid/empty state
  - SavedPlayer type interface for card data
affects: [03-player-dashboard, 04-persistence, 05-compare]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useRecentSearches hook for localStorage-backed search history
    - Controlled input with numeric validation pattern
    - Conditional render pattern for empty state vs populated grid

key-files:
  created:
    - client/src/components/search/HeroSearch.tsx
    - client/src/components/search/RecentSuggestions.tsx
    - client/src/hooks/useRecentSearches.ts
    - client/src/components/players/PlayerCard.tsx
    - client/src/components/players/PlayerGrid.tsx
    - client/src/components/players/EmptyState.tsx
    - client/src/lib/types.ts
    - client/src/__tests__/HeroSearch.test.tsx
    - client/src/__tests__/PlayerGrid.test.tsx
  modified:
    - client/src/pages/HomePage.tsx
    - client/src/__tests__/routing.test.tsx

key-decisions:
  - "SavedPlayer interface in lib/types.ts as shared type for card components"
  - "Empty savedPlayers array as placeholder until Phase 4 wires localStorage"

patterns-established:
  - "useRecentSearches hook: localStorage-backed state with MAX_RECENT_SEARCHES limit"
  - "PlayerCard: Link-wrapped card pattern with hover border highlight"
  - "Conditional empty state: savedPlayers.length > 0 check for grid vs empty state"

requirements-completed: [SRCH-01, SRCH-02, SRCH-03]

# Metrics
duration: 4min
completed: 2026-04-20
---

# Phase 2 Plan 02: Home Page Content Summary

**Hero search with numeric validation and navigation, saved player card grid with responsive layout, and empty state -- all RTL-compliant with 29 passing tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-20T11:12:35Z
- **Completed:** 2026-04-20T11:17:17Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- HeroSearch with numeric-only input validation, disabled button until valid ID, and navigation to /player/:id on submit
- RecentSuggestions dropdown showing localStorage search history when input is focused with empty query
- PlayerCard/PlayerGrid/EmptyState components ready for Phase 4 saved player wiring
- Full test coverage: 7 HeroSearch tests + 7 PlayerGrid/EmptyState tests, all 29 project tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: HeroSearch, RecentSuggestions, and useRecentSearches hook** - `fba593c` (feat)
2. **Task 2: PlayerCard, PlayerGrid, EmptyState, and HomePage assembly** - `ad54772` (feat)
3. **Task 3: Tests for HeroSearch and PlayerGrid components** - `17f09bb` (test)

## Files Created/Modified
- `client/src/components/search/HeroSearch.tsx` - Large centered search with numeric validation, recent suggestions, and navigation
- `client/src/components/search/RecentSuggestions.tsx` - Recent searches dropdown from localStorage
- `client/src/hooks/useRecentSearches.ts` - Hook managing up to 5 recent search entries in localStorage
- `client/src/components/players/PlayerCard.tsx` - Saved player card with name/rating/club and link to /player/:id
- `client/src/components/players/PlayerGrid.tsx` - Responsive 2-col mobile / 3-col desktop grid
- `client/src/components/players/EmptyState.tsx` - Friendly empty state with search icon and Hebrew prompt
- `client/src/lib/types.ts` - SavedPlayer interface for card component props
- `client/src/pages/HomePage.tsx` - Assembled home page with HeroSearch + conditional grid/empty state
- `client/src/__tests__/HeroSearch.test.tsx` - 7 tests: placeholder, button state, validation, navigation, inputMode
- `client/src/__tests__/PlayerGrid.test.tsx` - 7 tests: EmptyState text, card content, links, grid layout
- `client/src/__tests__/routing.test.tsx` - Updated routing tests for new HomePage content

## Decisions Made
- Created SavedPlayer interface in `client/src/lib/types.ts` as the shared type contract for card components -- Phase 4 will wire real data through this interface
- HomePage uses empty array for savedPlayers, showing EmptyState by default until Phase 4 persistence

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated routing tests for new HomePage content**
- **Found during:** Task 3 (test creation)
- **Issue:** Existing routing tests expected old "דף הבית" placeholder text, but HomePage now renders EmptyState with "חפשו שחקן כדי להתחיל"
- **Fix:** Updated two test assertions in routing.test.tsx to check for the new empty state heading instead of the old placeholder
- **Files modified:** client/src/__tests__/routing.test.tsx
- **Verification:** All 29 tests pass
- **Committed in:** 17f09bb (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary correction -- replacing the placeholder HomePage naturally broke tests referencing old content. No scope creep.

## Issues Encountered
None

## Known Stubs
- `client/src/pages/HomePage.tsx` line 8: `savedPlayers: SavedPlayer[] = []` -- intentional empty array, Phase 4 (PERS-01/02/03) will wire localStorage-backed useSavedPlayers hook

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Home page is fully functional with search navigation and empty state
- PlayerCard and PlayerGrid components accept SavedPlayer[] props, ready for Phase 4 data wiring
- All components use Tailwind logical properties for RTL compliance
- Test infrastructure covers search validation, navigation, card rendering, and grid layout

## Self-Check: PASSED

All 10 created/modified files verified present on disk. All 3 task commits (fba593c, ad54772, 17f09bb) verified in git log.

---
*Phase: 02-home-app-shell*
*Completed: 2026-04-20*

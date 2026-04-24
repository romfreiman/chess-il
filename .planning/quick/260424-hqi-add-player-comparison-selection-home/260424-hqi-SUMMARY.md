---
phase: quick
plan: 260424-hqi
subsystem: ui
tags: [react, react-router, comparison, home-screen]

# Dependency graph
requires:
  - phase: 05-player-comparison
    provides: ComparePage, PlayerPicker, usePlayer hook
  - phase: 04-polish-persistence
    provides: SavedPlayersContext, useSavedPlayers hook
provides:
  - CompareSelector component for home screen quick comparison
  - Query param pre-selection on ComparePage
affects: [home-screen, compare-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Query param pre-selection via useSearchParams for cross-page state transfer"

key-files:
  created:
    - client/src/components/players/CompareSelector.tsx
  modified:
    - client/src/pages/HomePage.tsx
    - client/src/pages/ComparePage.tsx

key-decisions:
  - "Reused PlayerPicker dropdown pattern (exclude-other-selection filter) for consistency"
  - "useSearchParams for URL param reading instead of manual window.location parsing"

patterns-established:
  - "Cross-page navigation with state via query params and useSearchParams"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-04-24
---

# Quick Task 260424-hqi: Add Player Comparison Selection on Home Screen

**CompareSelector with two-player dropdown picker on home screen, navigating to /compare with query param pre-selection**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-24T09:48:51Z
- **Completed:** 2026-04-24T09:50:44Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- CompareSelector component renders below saved players grid when 2+ players are saved
- Two dropdowns with mutual exclusion (selecting player A removes it from player B's list)
- Compare button navigates to /compare?a={id}&b={id} with pre-loaded player data
- ComparePage reads URL query params and auto-selects players on load

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CompareSelector component and wire into HomePage** - `7358346` (feat)
2. **Task 2: Add query param pre-selection to ComparePage** - `f1e4be2` (feat)

## Files Created/Modified
- `client/src/components/players/CompareSelector.tsx` - Two-player picker with compare button for home screen
- `client/src/pages/HomePage.tsx` - Added CompareSelector below PlayerGrid
- `client/src/pages/ComparePage.tsx` - Added useSearchParams for query param pre-selection

## Decisions Made
- Reused the same dropdown styling and exclude-filter pattern from PlayerPicker for visual consistency
- Used useSearchParams hook (React Router) for clean query param reading rather than manual URL parsing
- Used primary brand color (#378ADD) for the compare button to match project color conventions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Home screen now provides a friction-free path to player comparison
- Compare page supports both manual dropdown selection and URL-based pre-selection
- No blockers or concerns

## Self-Check: PASSED

All files and commits verified:
- [x] client/src/components/players/CompareSelector.tsx - FOUND
- [x] client/src/pages/HomePage.tsx - FOUND
- [x] client/src/pages/ComparePage.tsx - FOUND
- [x] Commit 7358346 - FOUND
- [x] Commit f1e4be2 - FOUND
- [x] SUMMARY.md - FOUND

---
*Quick task: 260424-hqi*
*Completed: 2026-04-24*

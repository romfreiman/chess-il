---
phase: 05-player-comparison
plan: 01
subsystem: ui
tags: [react, recharts, typescript, comparison, areachart]

requires:
  - phase: 03-player-dashboard
    provides: usePlayer hook, RatingChart formatMonthYear export, dashboard component patterns
  - phase: 04-polish-persistence
    provides: SavedPlayer type, useSavedPlayersContext, skeleton/error patterns
provides:
  - PlayerPicker dropdown component with mutual exclusion
  - CompareChart dual-line AreaChart with mergeRatingHistories
  - usePlayer empty-ID guard for comparison page support
  - Second mock player fixture (mockPlayerInfoB/mockApiResponseB)
affects: [05-player-comparison]

tech-stack:
  added: []
  patterns:
    - "Per-file vi.mock('recharts') with cloneElement for width/height injection in chart tests"
    - "mergeRatingHistories pure function pattern for date-based data merge with null gaps"
    - "Unique SVG gradient IDs (ratingGradientA/B) to avoid DOM conflicts between charts"

key-files:
  created:
    - client/src/components/compare/PlayerPicker.tsx
    - client/src/components/compare/CompareChart.tsx
    - client/src/__tests__/PlayerPicker.test.tsx
    - client/src/__tests__/CompareChart.test.tsx
  modified:
    - client/src/hooks/usePlayer.ts
    - client/src/test/fixtures/playerData.ts

key-decisions:
  - "usePlayer empty-ID guard: useState(!!id) for loading initial state to avoid flash"
  - "Per-file Recharts mock with React.cloneElement to inject width/height for SVG rendering in jsdom"
  - "CompareChart gradient IDs use A/B suffix to avoid collision with RatingChart's ratingGradient"

patterns-established:
  - "compare/ component directory for all comparison feature components"
  - "mergeRatingHistories as exported pure function for testability"
  - "PlayerPicker with excludeId prop for mutual exclusion pattern"

requirements-completed: [COMP-01, COMP-04]

duration: 6min
completed: 2026-04-23
---

# Phase 05 Plan 01: Comparison Building Blocks Summary

**PlayerPicker dropdown with mutual exclusion, CompareChart dual-line AreaChart with mergeRatingHistories, and usePlayer empty-ID guard**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-23T08:48:09Z
- **Completed:** 2026-04-23T08:54:45Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added empty-ID guard to usePlayer hook so comparison page can call it unconditionally without triggering 404 fetches
- Created PlayerPicker component with saved player dropdown, mutual exclusion filtering, and proper label accessibility
- Created CompareChart component with dual-line AreaChart (blue #378ADD for Player A, purple #A855F7 for Player B), unique gradient IDs, custom two-player tooltip, and connectNulls for gap handling
- Exported mergeRatingHistories pure function that merges two rating histories by date with null values for gaps
- Added second mock player fixture (mockPlayerInfoB with overlapping dates) for comparison test coverage

## Task Commits

Each task was committed atomically:

1. **Task 1: Guard usePlayer, add fixtures, create PlayerPicker** - `76c3c4e` (feat)
2. **Task 2 RED: Failing CompareChart tests** - `6b403ca` (test)
3. **Task 2 GREEN: Implement CompareChart** - `0e4b039` (feat)

## Files Created/Modified
- `client/src/hooks/usePlayer.ts` - Added empty-ID guard and conditional loading initial state
- `client/src/test/fixtures/playerData.ts` - Added mockPlayerInfoB, mockTournamentsB, mockRatingHistoryB, mockApiResponseB
- `client/src/components/compare/PlayerPicker.tsx` - Dropdown selector with mutual exclusion and label accessibility
- `client/src/components/compare/CompareChart.tsx` - Dual-line AreaChart with mergeRatingHistories, gradients, tooltip, legend
- `client/src/__tests__/usePlayer.test.tsx` - Added empty-ID test case
- `client/src/__tests__/PlayerPicker.test.tsx` - 5 tests for rendering, exclusion, onChange
- `client/src/__tests__/CompareChart.test.tsx` - 8 tests for merge logic and component rendering

## Decisions Made
- usePlayer empty-ID guard uses `useState(!!id)` for loading initial state to prevent loading flash when id is empty
- CompareChart test uses per-file vi.mock with React.cloneElement to pass width/height to AreaChart (global setup.ts mock does not inject these, causing SVG not to render)
- Gradient IDs use A/B suffix (ratingGradientA, ratingGradientB) to avoid collision with RatingChart's ratingGradient ID

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CompareChart test mock needed cloneElement for SVG rendering**
- **Found during:** Task 2 (TDD green phase)
- **Issue:** Global ResponsiveContainer mock in setup.ts wraps children in a div but does not inject width/height props to the AreaChart component, so Recharts does not render SVG content (defs, paths, areas) in jsdom
- **Fix:** Added per-file vi.mock('recharts') using React.cloneElement to inject width: 500, height: 300 into the chart child element, matching the pattern used in RatingChart.test.tsx
- **Files modified:** client/src/__tests__/CompareChart.test.tsx
- **Verification:** All 8 CompareChart tests pass including gradient ID and Area element assertions
- **Committed in:** 0e4b039

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix necessary for test infrastructure compatibility. No scope creep.

## Issues Encountered
None - plan executed with one test infrastructure fix as documented above.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all components are fully implemented with no placeholder data or TODO items.

## Next Phase Readiness
- PlayerPicker and CompareChart components are ready for composition in ComparePage (Plan 02)
- usePlayer hook now safely supports empty-ID calls for the comparison page state machine
- Second mock fixture available for ComparePage integration tests
- All 155 tests pass (full suite green)

## Self-Check: PASSED

All 7 created/modified files verified present. All 3 commit hashes verified in git log.

---
*Phase: 05-player-comparison*
*Completed: 2026-04-23*

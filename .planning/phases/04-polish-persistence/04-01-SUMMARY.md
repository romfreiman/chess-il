---
phase: 04-polish-persistence
plan: 01
subsystem: ui
tags: [react, tailwind, skeleton, error-handling, dark-mode, rtl, hebrew]

# Dependency graph
requires:
  - phase: 03-player-dashboard
    provides: Dashboard components (PlayerHeader, MetricCards, RatingChart, WinLossChart, TournamentList)
provides:
  - 5 skeleton loading components matching dashboard layout shapes
  - ErrorState component with differentiated Hebrew error messages and retry
  - Dark mode audit fixes for RatingChart and TournamentList
affects: [04-02, player-page, loading-states, error-handling]

# Tech tracking
tech-stack:
  added: []
  patterns: [skeleton-loader-pattern, error-state-differentiation, dark-mode-audit]

key-files:
  created:
    - client/src/components/dashboard/skeletons/PlayerHeaderSkeleton.tsx
    - client/src/components/dashboard/skeletons/MetricCardsSkeleton.tsx
    - client/src/components/dashboard/skeletons/RatingChartSkeleton.tsx
    - client/src/components/dashboard/skeletons/WinLossChartSkeleton.tsx
    - client/src/components/dashboard/skeletons/TournamentListSkeleton.tsx
    - client/src/components/feedback/ErrorState.tsx
    - client/src/__tests__/ErrorState.test.tsx
  modified:
    - client/src/pages/PlayerPage.tsx
    - client/src/__tests__/PlayerPage.test.tsx
    - client/src/__tests__/routing.test.tsx
    - client/src/components/dashboard/RatingChart.tsx
    - client/src/components/dashboard/TournamentList.tsx

key-decisions:
  - "Skeleton blocks use bg-gray-200 dark:bg-gray-700 rounded animate-pulse as standard pattern"
  - "ErrorState uses unicode escapes for Hebrew strings to maintain consistent encoding"
  - "Error type detection checks for 'not found' (case-insensitive) in error message string"

patterns-established:
  - "Skeleton pattern: bg-gray-200 dark:bg-gray-700 rounded animate-pulse for placeholder blocks"
  - "ErrorState pattern: differentiated error types with Hebrew messages and retry button"
  - "Feedback components in client/src/components/feedback/ directory"

requirements-completed: [UI-03, UI-05, UI-06]

# Metrics
duration: 4min
completed: 2026-04-20
---

# Phase 4 Plan 1: Skeleton Loaders, ErrorState, and Dark Mode Audit Summary

**5 skeleton loading components matching dashboard layout shapes, ErrorState with differentiated Hebrew error messages and retry, and dark mode audit fixes for toggle/pagination buttons**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-20T20:19:26Z
- **Completed:** 2026-04-20T20:23:30Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Created 5 skeleton components (PlayerHeader, MetricCards, RatingChart, WinLossChart, TournamentList) with animate-pulse matching real component layout shapes
- Built ErrorState component with differentiated Hebrew messages for not-found vs network errors and a retry button
- Completed dark mode audit: added dark:hover:text-gray-300 to RatingChart toggle buttons and dark:disabled:text-gray-500 to TournamentList pagination buttons
- Wired skeletons and ErrorState into PlayerPage replacing plain text loading/error states
- Added 7 new ErrorState tests, updated 4 PlayerPage tests, fixed routing test -- 120 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create skeleton components, ErrorState, and dark mode audit** - `c7e8a25` (feat)
2. **Task 2: Wire skeletons and ErrorState into PlayerPage, update tests** - `65af1fb` (feat)

## Files Created/Modified
- `client/src/components/dashboard/skeletons/PlayerHeaderSkeleton.tsx` - Skeleton matching PlayerHeader layout with name, badge, club, FIDE lines
- `client/src/components/dashboard/skeletons/MetricCardsSkeleton.tsx` - 4-card skeleton grid matching MetricCards layout
- `client/src/components/dashboard/skeletons/RatingChartSkeleton.tsx` - Skeleton with header row and 300px chart placeholder
- `client/src/components/dashboard/skeletons/WinLossChartSkeleton.tsx` - Skeleton with 180px donut circle and 3-block legend
- `client/src/components/dashboard/skeletons/TournamentListSkeleton.tsx` - Skeleton with header and 5 row placeholders
- `client/src/components/feedback/ErrorState.tsx` - Inline error display with AlertCircle icon, Hebrew messages, retry button
- `client/src/__tests__/ErrorState.test.tsx` - 7 tests covering both error types, button click, icon render
- `client/src/pages/PlayerPage.tsx` - Skeleton loading state, ErrorState error state with error type detection
- `client/src/__tests__/PlayerPage.test.tsx` - Updated tests for skeletons, error messages, retry functionality
- `client/src/__tests__/routing.test.tsx` - Updated to check skeleton presence instead of old loading text
- `client/src/components/dashboard/RatingChart.tsx` - Added dark:hover:text-gray-300 to inactive toggle buttons
- `client/src/components/dashboard/TournamentList.tsx` - Added dark:disabled:text-gray-500 to pagination buttons

## Decisions Made
- Skeleton blocks use `bg-gray-200 dark:bg-gray-700 rounded animate-pulse` as the standard skeleton pattern
- ErrorState uses unicode escapes for Hebrew strings to maintain encoding consistency
- Error type detection checks error message for 'not found' (case-insensitive) or Hebrew equivalent to differentiate 404 from network errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed routing test expecting old loading text**
- **Found during:** Task 2 (PlayerPage test update)
- **Issue:** routing.test.tsx line 38 expected old loading text "טוען נתוני שחקן" which was removed when skeletons replaced the loading state
- **Fix:** Updated routing test to check for `.animate-pulse` elements instead of text content
- **Files modified:** client/src/__tests__/routing.test.tsx
- **Verification:** All 120 tests pass
- **Committed in:** 65af1fb (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Auto-fix was necessary -- the routing test referenced text that this plan explicitly removed. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Skeleton loading states and error handling complete, ready for Plan 02 (localStorage persistence and save/remove player functionality)
- ErrorState component is reusable for any future error scenarios
- Feedback components directory established at client/src/components/feedback/

## Self-Check: PASSED

All 8 created files verified present. Both task commits (c7e8a25, 65af1fb) verified in git log. 120 tests passing.

---
*Phase: 04-polish-persistence*
*Completed: 2026-04-20*

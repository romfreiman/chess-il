---
phase: quick
plan: 260423-ksl
subsystem: client/hooks
tags: [localStorage, cross-tab-sync, visibility-api, react-hooks]
dependency_graph:
  requires: []
  provides: [cross-tab-saved-players-sync, back-navigation-sync]
  affects: [useSavedPlayers, SavedPlayersContext]
tech_stack:
  added: []
  patterns: [storage-event-listener, visibilitychange-listener, functional-state-updater]
key_files:
  created: []
  modified:
    - client/src/hooks/useSavedPlayers.ts
    - client/src/__tests__/useSavedPlayers.test.ts
decisions:
  - Functional updater with JSON comparison avoids stale closures and unnecessary re-renders
  - Extracted readSavedPlayers helper for reuse between init and visibility handler
metrics:
  duration: 3min
  completed: "2026-04-23"
---

# Quick Task 260423-ksl: Cross-tab and Back-Navigation Sync for Saved Players

Cross-tab sync via storage event and back-navigation refresh via visibilitychange for the useSavedPlayers hook.

## What Changed

The `useSavedPlayers` hook previously read localStorage only once on mount. If a user saved a player in one tab and switched to another, or navigated away and pressed the browser back button, the saved players list was stale.

### Implementation

Added a `useEffect` in `useSavedPlayers.ts` with two event listeners:

1. **`window.addEventListener('storage', ...)`** -- Fires when localStorage is modified in another tab. Filters by `STORAGE_KEYS.savedPlayers` key. Handles `null` newValue (key removal) by resetting to empty array. Parses JSON for valid values.

2. **`document.addEventListener('visibilitychange', ...)`** -- Fires when the tab regains focus (e.g., after back/forward navigation). Re-reads localStorage and compares serialized JSON to current state. Only updates if the value has actually changed, avoiding unnecessary re-renders.

Both listeners are cleaned up on unmount.

Extracted a `readSavedPlayers()` helper function to share localStorage reading logic between the initial state and the visibilitychange handler.

### Files Modified

| File | Change |
|------|--------|
| `client/src/hooks/useSavedPlayers.ts` | Added useEffect with storage + visibilitychange listeners, extracted readSavedPlayers helper |
| `client/src/__tests__/useSavedPlayers.test.ts` | Added 5 tests in new "cross-tab and visibility sync" describe block |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| b865a8a | test | Add failing tests for cross-tab and visibility sync (TDD RED) |
| 71fad44 | feat | Add cross-tab and back-navigation sync to useSavedPlayers (TDD GREEN) |

## Test Results

- **useSavedPlayers tests:** 14 passed (10 existing + 4 new, 1 cleanup test covers addEventListener/removeEventListener)
- **Full test suite:** 168 passed across 19 test files
- **TypeScript:** Pre-existing error in usePlayer.test.tsx (unrelated `global` type), no new errors introduced

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

---
phase: quick
plan: 260424-hyx
subsystem: frontend-comparison
tags: [ux, comparison, player-cards, checkbox]
dependency_graph:
  requires: [PlayerCard, PlayerGrid, HomePage, SavedPlayersContext]
  provides: [checkbox-based-compare-selection, floating-compare-button]
  affects: [compare-flow, home-page]
tech_stack:
  added: []
  patterns: [checkbox-selection-on-cards, floating-action-button, Set-based-selection-state]
key_files:
  created: []
  modified:
    - client/src/components/players/PlayerCard.tsx
    - client/src/components/players/PlayerGrid.tsx
    - client/src/pages/HomePage.tsx
decisions:
  - "Checkbox onClick uses e.preventDefault() + e.stopPropagation() to prevent Link navigation while toggling selection"
  - "Selected card gets blue border ring for visual feedback (ring-1 ring-[#378ADD])"
  - "Selection state uses Set<number> for O(1) has/add/delete operations"
  - "Checkboxes only appear when 2+ saved players exist (showCompareMode guard)"
  - "useEffect cleans up selectedIds when saved players are removed"
metrics:
  duration: 2min
  completed: "2026-04-24T09:58:48Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Quick Plan 260424-hyx: Replace CompareSelector Dropdowns with Card Checkboxes Summary

Checkbox-based player comparison selection directly on saved player cards with floating compare button, replacing dropdown-based CompareSelector UX.

## What Was Done

### Task 1: Add checkbox selection to PlayerCard and wire through PlayerGrid (3c21b17)

**PlayerCard.tsx:**
- Added `isSelected`, `onToggleSelect`, and `selectionDisabled` optional props
- Renders a checkbox in the top-start corner (RTL: top-right) when `onToggleSelect` is provided
- Checkbox uses `accent-[#378ADD]` for primary blue color, `w-5 h-5` for mobile touch target
- Click handler prevents Link navigation via `e.preventDefault()` + `e.stopPropagation()`
- Disabled state (opacity-40, cursor-not-allowed) when 2 others are already selected
- Selected cards get a blue border ring (`border-[#378ADD] ring-1 ring-[#378ADD]`) for visual feedback

**PlayerGrid.tsx:**
- Added `selectedIds` (Set<number>) and `onToggleSelect` optional props
- Passes `isSelected`, `onToggleSelect`, and computed `selectionDisabled` to each PlayerCard

### Task 2: Add selection state and floating compare button to HomePage (5af7f57)

**HomePage.tsx:**
- Added `selectedIds` state using `Set<number>` for efficient selection tracking
- `handleToggleSelect` callback: toggles player in set, enforces max 2 limit
- `useEffect` cleans up selectedIds when saved players are removed (prevents stale selections)
- Only passes compare props to PlayerGrid when `savedPlayers.length >= 2`
- Floating compare button: fixed bottom-center, blue pill, appears when exactly 2 selected
- Button navigates to `/compare?a={id1}&b={id2}` using `useNavigate`
- CompareSelector was already absent from codebase (no deletion needed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Checkbox click navigation prevention**
- **Found during:** Task 1
- **Issue:** Using `onChange` + `onMouseDown(preventDefault)` would prevent the checkbox from toggling. A plain `onClick(stopPropagation)` alone wouldn't prevent the Link's default navigation.
- **Fix:** Used `onClick` with both `e.preventDefault()` (blocks Link navigation) and `e.stopPropagation()` (blocks event bubbling), then manually calls `onToggleSelect` in the click handler instead of relying on `onChange`.
- **Files modified:** client/src/components/players/PlayerCard.tsx
- **Commit:** 3c21b17

## Verification

1. TypeScript compiles without errors (verified from main repo with node_modules)
2. CompareSelector.tsx does not exist -- confirmed absent
3. No remaining imports of CompareSelector anywhere in codebase -- confirmed via grep
4. All key links verified: selectedIds/onToggleSelect flow from HomePage -> PlayerGrid -> PlayerCard

## Known Stubs

None -- all data is wired through props and context.

## Self-Check: PASSED

- All 3 modified files exist on disk
- Both task commits (3c21b17, 5af7f57) verified in git log

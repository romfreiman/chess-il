---
phase: quick
plan: 260423-ksl
type: execute
wave: 1
depends_on: []
files_modified:
  - client/src/hooks/useSavedPlayers.ts
  - client/src/__tests__/useSavedPlayers.test.ts
autonomous: true
must_haves:
  truths:
    - "Saved players list stays in sync across browser tabs"
    - "Saved players list is current after browser back/forward navigation"
  artifacts:
    - path: "client/src/hooks/useSavedPlayers.ts"
      provides: "Cross-tab and back-navigation sync for saved players"
      contains: "storage"
    - path: "client/src/__tests__/useSavedPlayers.test.ts"
      provides: "Tests for storage event and visibility sync"
  key_links:
    - from: "window storage event"
      to: "useSavedPlayers state"
      via: "addEventListener('storage') updating setSavedPlayers"
      pattern: "addEventListener.*storage"
    - from: "document visibilitychange event"
      to: "useSavedPlayers state"
      via: "addEventListener('visibilitychange') re-reading localStorage"
      pattern: "addEventListener.*visibilitychange"
---

<objective>
Sync saved players state across browser tabs and after back/forward navigation.

Purpose: Currently useSavedPlayers reads localStorage only once on mount. When a user saves a player in one tab and switches to another tab, or navigates away and presses the browser back button, the saved players list is stale. This fix adds two sync mechanisms: (1) the `storage` event for cross-tab sync, and (2) `visibilitychange` for re-reading localStorage when the tab regains focus after back/forward navigation.

Output: Updated useSavedPlayers hook with sync listeners, updated tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@client/src/hooks/useSavedPlayers.ts
@client/src/__tests__/useSavedPlayers.test.ts
@client/src/lib/constants.ts
@client/src/context/SavedPlayersContext.tsx
</context>

<interfaces>
<!-- Key types and contracts the executor needs. -->

From client/src/lib/types.ts:
```typescript
export interface SavedPlayer {
  id: number;
  name: string;
  rating: number;
  club: string | null;
  savedAt: string;
}
```

From client/src/lib/constants.ts:
```typescript
export const STORAGE_KEYS = {
  theme: 'theme',
  recentSearches: 'chess-il-recent-searches',
  savedPlayers: 'chess-il-saved-players',
} as const;

export const MAX_SAVED_PLAYERS = 10;
```

From client/src/hooks/useSavedPlayers.ts:
```typescript
export interface UseSavedPlayersResult {
  savedPlayers: SavedPlayer[];
  savePlayer: (player: Omit<SavedPlayer, 'savedAt'>) => boolean;
  removePlayer: (id: number) => void;
  isSaved: (id: number) => boolean;
  isFull: boolean;
}
```
</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add cross-tab and back-navigation sync to useSavedPlayers</name>
  <files>client/src/hooks/useSavedPlayers.ts, client/src/__tests__/useSavedPlayers.test.ts</files>
  <behavior>
    - Test: When a `storage` event fires for key `chess-il-saved-players` with new data, savedPlayers state updates to match the new data
    - Test: When a `storage` event fires for a different key (e.g., `theme`), savedPlayers state does not change
    - Test: When a `storage` event fires with `newValue: null` (key removed), savedPlayers resets to empty array
    - Test: When document becomes visible (`visibilitychange` with `document.visibilityState === 'visible'`), savedPlayers re-reads from localStorage and updates if different
    - Test: Event listeners are cleaned up on unmount (removeEventListener called)
  </behavior>
  <action>
    In useSavedPlayers.ts, add a useEffect that:

    1. Defines a `handleStorageEvent` function that listens for `window` `storage` events. This event fires when localStorage is modified in ANOTHER tab (not the current one). Filter by `e.key === STORAGE_KEYS.savedPlayers`. If `e.newValue` is null, set state to `[]`. Otherwise parse JSON and call `setSavedPlayers`.

    2. Defines a `handleVisibilityChange` function that fires on `document` `visibilitychange`. When `document.visibilityState === 'visible'`, re-read localStorage for the saved players key and compare with current state (use a ref to avoid stale closure). Only call setSavedPlayers if the serialized value differs from current state to avoid unnecessary re-renders.

    3. Add both event listeners. Return a cleanup function that removes both.

    4. Use a `useRef` to keep a serialized snapshot of current savedPlayers (update it in the same places setSavedPlayers is called) so the visibilitychange handler can compare without stale closure issues. Alternatively, use the functional form of setSavedPlayers to access current state.

    Implementation detail: For the visibilitychange handler, use setSavedPlayers with a functional updater: `setSavedPlayers(prev => { const stored = ...; return deepEqual ? prev : stored; })`. This avoids needing a ref. Compare by serializing both to JSON strings.

    Import `useEffect` from React (already partially imported).

    In the test file, add a new describe block `'cross-tab and visibility sync'` with tests for each behavior listed above. Use `window.dispatchEvent(new StorageEvent('storage', { key, newValue }))` to simulate cross-tab events. For visibilitychange, mock `document.visibilityState` via Object.defineProperty and dispatch `new Event('visibilitychange')` on document.
  </action>
  <verify>
    <automated>cd /home/rfreiman/code/chess-il && npx vitest run client/src/__tests__/useSavedPlayers.test.ts</automated>
  </verify>
  <done>
    - All existing tests still pass (no regression)
    - New tests confirm: storage events from other tabs update state, irrelevant storage events are ignored, null newValue resets to empty, visibilitychange re-reads localStorage, cleanup removes listeners on unmount
    - Hook interface (UseSavedPlayersResult) is unchanged -- no breaking changes to consumers
  </done>
</task>

</tasks>

<verification>
- All useSavedPlayers tests pass: `npx vitest run client/src/__tests__/useSavedPlayers.test.ts`
- Full test suite passes: `npx vitest run`
- TypeScript compiles: `cd client && npx tsc --noEmit`
</verification>

<success_criteria>
- Saved players list syncs automatically when modified in another browser tab
- Saved players list refreshes from localStorage when returning to tab via back/forward navigation
- No unnecessary re-renders when localStorage value hasn't changed
- All existing tests pass without modification
- New tests cover cross-tab sync and visibility-based refresh
</success_criteria>

<output>
After completion, create `.planning/quick/260423-ksl-save-saved-players-between-browser-tabs-/260423-ksl-SUMMARY.md`
</output>

# Phase 4: Polish & Persistence - Research

**Researched:** 2026-04-20
**Domain:** React UI polish (skeleton loaders, error states, toast notifications) + localStorage persistence
**Confidence:** HIGH

## Summary

Phase 4 adds three polish layers and one persistence feature to the existing Phase 3 dashboard. The skeleton loaders, error states, and toast notifications are straightforward React components using Tailwind's built-in `animate-pulse` and CSS transitions -- no new dependencies required. The persistence layer (`useSavedPlayers` hook) follows the exact same localStorage pattern established by `useRecentSearches` and `useDarkMode`.

The primary architectural challenge is **cross-component state synchronization**: the `useSavedPlayers` hook must keep `Navbar` (savedCount), `HomePage` (player grid), and `PlayerPage` (save button) in sync. Since the `storage` event only fires across browser tabs (not within the same tab), a React Context provider wrapping all routes is the correct approach. This lifts the hook to `AppLayout` and distributes it via context, matching the existing `useDarkMode` pattern already in `AppLayout`.

**Primary recommendation:** Create a `SavedPlayersProvider` context in `AppLayout` that wraps `<Outlet>`, with a `useSavedPlayersContext` consumer hook. All three consumers (`Navbar`, `HomePage`, `PlayerPage`) read from this single context instance.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use Tailwind's built-in `animate-pulse` with gray placeholder blocks matching component shapes -- no skeleton library dependency
- **D-02:** Create skeleton variants for: PlayerHeader, MetricCards, RatingChart, WinLossChart, TournamentList. Each mimics the real component's layout dimensions
- **D-03:** Skeletons render inside PlayerPage when `loading` is true, replacing the current "טוען נתוני שחקן..." text
- **D-04:** Error state renders inline in the PlayerPage content area (not a separate error page). Shows: error icon, Hebrew message, and a "נסה שוב" (try again) retry button
- **D-05:** Error messages differentiated: "שחקן לא נמצא" for 404, "שגיאה בטעינת נתונים" for network/server errors
- **D-06:** Retry button calls the existing `refresh()` from usePlayer hook
- **D-07:** Save button placed in PlayerHeader component, next to refresh button. Toggle between "שמור" (save) and "שמור ✓" (saved) states
- **D-08:** Create `useSavedPlayers` hook managing localStorage read/write. Returns `{ savedPlayers, savePlayer, removePlayer, isSaved, isFull }`
- **D-09:** localStorage key: `chess-il-saved-players`. Data shape: `Array<{ id: number; name: string; rating: number; savedAt: string }>`
- **D-10:** When save limit (10) is reached, show a toast notification: "ניתן לשמור עד 10 שחקנים" -- non-blocking, auto-dismiss after 3 seconds
- **D-11:** Wire saved players into HomePage's PlayerGrid -- replace the empty placeholder array from Phase 2
- **D-12:** Remove button on each PlayerCard triggers `removePlayer(id)` from the hook
- **D-13:** Audit all Phase 3 dashboard components for complete dark: class coverage. Fix any missing dark mode styles
- **D-14:** Toast notification component must support dark mode

### Claude's Discretion
- Toast component implementation approach (CSS-only vs lightweight library)
- Skeleton animation timing and exact placeholder dimensions
- Error icon choice (lucide-react icon selection)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-03 | Full dark mode support via Tailwind dark: classes | Dark mode audit pattern documented; all Phase 3 components reviewed for dark: class completeness |
| UI-05 | Skeleton loaders display while data is being fetched | Tailwind animate-pulse pattern verified; 5 skeleton component specs from UI-SPEC; existing component dimensions mapped |
| UI-06 | Friendly Hebrew error messages display when player not found or scrape fails | ErrorState component design with error differentiation logic via usePlayer hook error messages; lucide-react AlertCircle icon verified available |
| PERS-01 | User can save/unsave a player from the dashboard page | Save button placement in PlayerHeader documented; useSavedPlayers hook design with Context provider for cross-component sync |
| PERS-02 | Saved players stored in localStorage as array of {id, name, rating} | localStorage pattern from useRecentSearches hook documented; STORAGE_KEYS.savedPlayers and MAX_SAVED_PLAYERS already defined in constants.ts |
| PERS-03 | Maximum 10 saved players enforced | isFull flag in hook + Toast component for limit message; MAX_SAVED_PLAYERS constant already exists (value: 10) |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component framework | Already installed, all patterns established |
| TypeScript | 5.9.3 | Type safety | Already installed |
| Tailwind CSS | 3.4.19 | Styling + animate-pulse + dark mode | Already configured with `darkMode: 'class'` |
| lucide-react | 1.8.0 | Icons (AlertCircle, Bookmark, BookmarkCheck, X) | Already installed; all 4 required icons verified available |
| vitest | 4.1.4 | Test framework | Already configured with jsdom |
| @testing-library/react | 16.3.2 | Component testing | Already installed |

### Supporting
No new dependencies required. All features are implementable with the existing stack.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS-only toast | react-hot-toast | Adds dependency for a single toast message; CSS transitions are sufficient per CONTEXT.md discretion |
| Tailwind animate-pulse | react-loading-skeleton | Adds 15KB dependency; animate-pulse is built into Tailwind and already available |
| React Context for sync | Multiple hook instances | Multiple instances go out of sync within same tab since `storage` event only fires across tabs |

## Architecture Patterns

### Recommended Project Structure (new files only)
```
client/src/
├── components/
│   ├── dashboard/
│   │   └── skeletons/
│   │       ├── PlayerHeaderSkeleton.tsx
│   │       ├── MetricCardsSkeleton.tsx
│   │       ├── RatingChartSkeleton.tsx
│   │       ├── WinLossChartSkeleton.tsx
│   │       └── TournamentListSkeleton.tsx
│   └── feedback/
│       ├── ErrorState.tsx
│       └── Toast.tsx
├── hooks/
│   └── useSavedPlayers.ts
└── context/
    └── SavedPlayersContext.tsx
```

### Pattern 1: SavedPlayers Context Provider (Cross-Component State Sync)

**What:** A React Context that wraps the route tree, holding the `useSavedPlayers` hook's state. Consumer components use a `useSavedPlayersContext()` hook instead of calling the localStorage hook directly.

**When to use:** When multiple components at different positions in the React tree (Navbar, HomePage, PlayerPage) need to read and write the same localStorage-backed state and stay in sync within the same browser tab.

**Why necessary:** The browser `storage` event only fires in OTHER tabs/windows, not in the tab that made the change. If `PlayerPage` calls `savePlayer()` using its own hook instance, `AppLayout`'s hook instance (feeding `Navbar.savedCount`) would NOT re-render. React Context solves this by having a single source of truth.

**Example:**
```typescript
// context/SavedPlayersContext.tsx
import { createContext, useContext, type ReactNode } from 'react';
import { useSavedPlayers, type UseSavedPlayersResult } from '../hooks/useSavedPlayers';

const SavedPlayersContext = createContext<UseSavedPlayersResult | null>(null);

export function SavedPlayersProvider({ children }: { children: ReactNode }) {
  const value = useSavedPlayers();
  return (
    <SavedPlayersContext.Provider value={value}>
      {children}
    </SavedPlayersContext.Provider>
  );
}

export function useSavedPlayersContext(): UseSavedPlayersResult {
  const ctx = useContext(SavedPlayersContext);
  if (!ctx) throw new Error('useSavedPlayersContext must be used within SavedPlayersProvider');
  return ctx;
}
```

```typescript
// hooks/useSavedPlayers.ts — follows useRecentSearches pattern
import { useState, useCallback } from 'react';
import { STORAGE_KEYS, MAX_SAVED_PLAYERS } from '../lib/constants';

export interface SavedPlayerEntry {
  id: number;
  name: string;
  rating: number;
  savedAt: string;
}

export interface UseSavedPlayersResult {
  savedPlayers: SavedPlayerEntry[];
  savePlayer: (player: Omit<SavedPlayerEntry, 'savedAt'>) => void;
  removePlayer: (id: number) => void;
  isSaved: (id: number) => boolean;
  isFull: boolean;
}

export function useSavedPlayers(): UseSavedPlayersResult {
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayerEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.savedPlayers);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const savePlayer = useCallback((player: Omit<SavedPlayerEntry, 'savedAt'>) => {
    setSavedPlayers(prev => {
      if (prev.length >= MAX_SAVED_PLAYERS) return prev;
      if (prev.some(p => p.id === player.id)) return prev;
      const updated = [...prev, { ...player, savedAt: new Date().toISOString() }];
      localStorage.setItem(STORAGE_KEYS.savedPlayers, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removePlayer = useCallback((id: number) => {
    setSavedPlayers(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.savedPlayers, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isSaved = useCallback((id: number) => {
    return savedPlayers.some(p => p.id === id);
  }, [savedPlayers]);

  const isFull = savedPlayers.length >= MAX_SAVED_PLAYERS;

  return { savedPlayers, savePlayer, removePlayer, isSaved, isFull };
}
```

### Pattern 2: Skeleton Components (Tailwind animate-pulse)

**What:** Static placeholder components that mimic the real component's layout shape using `animate-pulse` gray blocks.

**When to use:** When `usePlayer` hook has `loading: true`, render all 5 skeleton components in the same grid layout as the real dashboard.

**Example:**
```typescript
// components/dashboard/skeletons/MetricCardsSkeleton.tsx
export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
        </div>
      ))}
    </div>
  );
}
```

### Pattern 3: Toast with CSS Transitions

**What:** A fixed-position toast notification using React state + CSS transitions for fade-in/fade-out.

**When to use:** Single use case in Phase 4: save limit reached message.

**Implementation approach:**
- The Toast component receives `message`, `visible`, and `onDismiss` props
- Uses `useEffect` with `setTimeout` for 3-second auto-dismiss
- CSS: `transition-all duration-200 ease-out` on `opacity` and `translate-y`
- When `visible` changes from false to true: opacity 0->1, translateY 16px->0
- When auto-dismiss triggers: opacity 1->0, then `onDismiss()` after transition completes

### Pattern 4: Error Differentiation

**What:** The `usePlayer` hook's `error` string contains the error message from the API response. The `ErrorState` component accepts an `error` string prop and differentiates the display.

**Detection logic:**
```typescript
// In PlayerPage.tsx
const isNotFound = error?.toLowerCase().includes('not found') ||
                   error?.includes('לא נמצא');
```

The API backend returns `ApiError.message` which propagates through `usePlayer`. The error text from the server determines which Hebrew message to show. The `ErrorState` component should accept an `errorType: 'not-found' | 'network'` prop computed by `PlayerPage`.

### Anti-Patterns to Avoid
- **Multiple useSavedPlayers hook instances without Context:** Causes state desync within the same tab since localStorage `storage` events don't fire for same-tab changes.
- **Default exports:** Project convention is named exports only.
- **Physical CSS properties (left/right/pl/pr):** Project convention bans these; use logical properties (start/end/ms/me/ps/pe) for RTL safety.
- **Inline conditional logic for complex loading/error branches:** Extract to separate components (skeletons, ErrorState) to keep PlayerPage clean.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pulse animation | Custom CSS keyframes | Tailwind `animate-pulse` | Built-in, no config needed, already in project |
| localStorage JSON parsing | Raw try/catch in each component | `useSavedPlayers` hook pattern from `useRecentSearches` | Established project pattern; centralizes error handling |
| State sync across components | Custom event bus or manual re-renders | React Context + single hook instance | React's built-in mechanism; simpler than custom events |
| Icons | SVG files or icon fonts | lucide-react (AlertCircle, Bookmark, BookmarkCheck, X) | Already installed; tree-shakeable; used throughout project |

**Key insight:** Every building block for this phase already exists in the project. The skeletons use `animate-pulse` (Tailwind built-in), the hook follows `useRecentSearches` pattern, the constants (`STORAGE_KEYS.savedPlayers`, `MAX_SAVED_PLAYERS`) are already defined, and all needed icons are available in lucide-react.

## Common Pitfalls

### Pitfall 1: SavedPlayer Type Mismatch
**What goes wrong:** The existing `SavedPlayer` interface in `lib/types.ts` has `{ id, name, rating, club }` but CONTEXT.md D-09 specifies localStorage shape as `{ id, name, rating, savedAt }`. These are two different shapes.
**Why it happens:** Phase 2 created the `SavedPlayer` type for display purposes (includes `club`), while CONTEXT.md D-09 defines the persistence shape (includes `savedAt`).
**How to avoid:** Either (a) update `SavedPlayer` to include both `club` and `savedAt`, or (b) keep two types: `SavedPlayer` for display and `SavedPlayerEntry` for storage. Option (a) is simpler: add `savedAt: string` to `SavedPlayer` and keep `club` as optional. The `savePlayer` function should capture `club` from `PlayerInfo` when saving.
**Warning signs:** TypeScript errors when trying to pass saved player data to `PlayerCard`.

### Pitfall 2: localStorage State Desync Across Components
**What goes wrong:** When `PlayerPage` saves a player, `Navbar`'s savedCount stays at 0 and `HomePage`'s grid doesn't update.
**Why it happens:** The browser `storage` event only fires in OTHER tabs, not the current tab. Multiple hook instances read the initial localStorage value independently.
**How to avoid:** Use React Context with a single `useSavedPlayers` instance at `AppLayout` level. All consumers use `useSavedPlayersContext()`.
**Warning signs:** Save button toggles correctly on PlayerPage but Navbar compare link stays disabled; HomePage shows empty grid after saving.

### Pitfall 3: Toast Cleanup on Unmount
**What goes wrong:** If the user navigates away while the toast is showing, the `setTimeout` callback fires and tries to update state on an unmounted component (React warning in dev mode).
**Why it happens:** `setTimeout` is not automatically cleaned up when a component unmounts.
**How to avoid:** Return a cleanup function from `useEffect` that calls `clearTimeout`.
**Warning signs:** React "Cannot perform a state update on an unmounted component" warning in console.

### Pitfall 4: Error State Loses Retry Function
**What goes wrong:** `ErrorState` component receives `onRetry` but the function is stale or doesn't trigger a re-fetch.
**Why it happens:** If `refresh` from `usePlayer` is not passed correctly through props.
**How to avoid:** `PlayerPage` passes `refresh` directly as `onRetry` to `ErrorState`. The `useCallback` wrapping in `usePlayer` ensures stable reference.
**Warning signs:** Clicking "נסה שוב" does nothing.

### Pitfall 5: Remove Button Triggers Navigation
**What goes wrong:** Clicking the X remove button on `PlayerCard` navigates to `/player/:id` instead of removing the player.
**Why it happens:** `PlayerCard` is wrapped in a `<Link>` element. The click event bubbles up to the Link.
**How to avoid:** The remove button handler must call `e.preventDefault()` and `e.stopPropagation()` before calling `removePlayer(id)`. This is explicitly called out in the UI-SPEC.
**Warning signs:** Player is removed AND user navigates away from home page.

### Pitfall 6: Skeleton Layout Mismatch
**What goes wrong:** Skeletons render with different dimensions than real components, causing layout shift when data loads.
**Why it happens:** Skeleton container classes don't match the real component's container classes.
**How to avoid:** Copy the outer container classes exactly from each real component. The UI-SPEC specifies exact Tailwind classes for each skeleton.
**Warning signs:** Visible "jump" when loading completes and real components replace skeletons.

### Pitfall 7: Dark Mode Audit Misses Recharts Elements
**What goes wrong:** Charts look correct in light mode but chart grid lines, tooltips, or axis text are invisible in dark mode.
**Why it happens:** Recharts uses inline SVG styles, not Tailwind classes. The `className` approach only works on the CartesianGrid `stroke-*` classes (which the project already handles).
**How to avoid:** Check that all Recharts components with `className` props have dark: variants. The existing code already handles `CartesianGrid` with `stroke-gray-200 dark:stroke-gray-700` and tooltips with `dark:bg-gray-800`. Focus the audit on text colors and borders.
**Warning signs:** Ghost elements in dark mode.

## Code Examples

### Existing Pattern: useRecentSearches (localStorage hook)
```typescript
// Source: client/src/hooks/useRecentSearches.ts
// This is the EXACT pattern to follow for useSavedPlayers
export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.recentSearches);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  // ... useCallback for add/clear operations
}
```

### Existing Pattern: ErrorState Layout (from EmptyState)
```typescript
// Source: client/src/components/players/EmptyState.tsx
// ErrorState should follow this exact centering pattern
<div className="text-center flex flex-col items-center py-12">
  <Search className="h-12 w-12 text-gray-400 dark:text-gray-500" />
  <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-4">...</h2>
  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">...</p>
</div>
```

### Existing Constants (already defined)
```typescript
// Source: client/src/lib/constants.ts
export const STORAGE_KEYS = {
  theme: 'theme',
  recentSearches: 'chess-il-recent-searches',
  savedPlayers: 'chess-il-saved-players',  // <-- already defined
} as const;

export const MAX_SAVED_PLAYERS = 10;  // <-- already defined
```

### PlayerPage Current Loading/Error Branches (replacement targets)
```typescript
// Source: client/src/pages/PlayerPage.tsx lines 13-29
// BEFORE (Phase 3):
if (loading) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-center">
      <p className="text-gray-500 dark:text-gray-400">טוען נתוני שחקן...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-center">
      <p className="text-gray-500 dark:text-gray-400">
        לא הצלחנו לטעון את נתוני השחקן. נסו שוב מאוחר יותר.
      </p>
    </div>
  );
}

// AFTER (Phase 4): replace with skeleton/ErrorState components
```

### AppLayout Integration Point
```typescript
// Source: client/src/components/layout/AppLayout.tsx
// Currently: <Navbar savedCount={0} .../>
// Phase 4: savedCount comes from SavedPlayersContext
export function AppLayout() {
  const { theme, toggle } = useDarkMode();
  // Phase 4 adds: SavedPlayersProvider wrapping Outlet
  // Phase 4 changes: savedCount={savedPlayers.length}
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar savedCount={0} theme={theme} onThemeToggle={toggle} />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
```

### PlayerHeader Save Button Placement
```typescript
// Source: client/src/components/dashboard/PlayerHeader.tsx
// Current: single refresh button at absolute top-4 end-4
// Phase 4: group of 2 buttons (save + refresh) at absolute top-4 end-4 with gap-2
// The button area needs restructuring from a single button to a flex container
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Loading spinner text ("טוען...") | Skeleton loaders matching layout | Phase 4 | Better perceived performance, no layout shift |
| Generic error text | Differentiated error states with retry | Phase 4 | Better UX, actionable error recovery |
| Hardcoded savedCount={0} | Context-driven savedCount | Phase 4 | Navbar compare link becomes functional |
| Empty savedPlayers array | localStorage-backed persistence | Phase 4 | Players persist across browser sessions |

## Open Questions

1. **SavedPlayer type evolution**
   - What we know: Current `SavedPlayer` in `lib/types.ts` has `{ id, name, rating, club }`. CONTEXT.md D-09 specifies storage shape as `{ id, name, rating, savedAt }`.
   - What's unclear: Whether to add `savedAt` to existing `SavedPlayer` or create a separate storage type.
   - Recommendation: Add `savedAt: string` to `SavedPlayer` interface and keep `club`. When saving, capture both rating and club from `PlayerInfo`. This avoids a second type and keeps `PlayerCard` working with the same interface.

2. **PlayerGrid remove button callback threading**
   - What we know: `PlayerGrid` currently just renders `PlayerCard` components. Phase 4 needs `PlayerCard` to call `removePlayer(id)`.
   - What's unclear: How to thread the `removePlayer` callback from context through `PlayerGrid` to `PlayerCard`.
   - Recommendation: `PlayerGrid` receives `onRemove` callback prop. `HomePage` passes it from `useSavedPlayersContext()`. `PlayerCard` receives it as a prop and calls it with `e.preventDefault()` + `e.stopPropagation()`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | `client/vitest.config.ts` |
| Quick run command | `cd client && npx vitest run --reporter=verbose` |
| Full suite command | `cd client && npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-03 | Dark mode audit (existing components have dark: classes) | manual | Visual inspection | N/A -- audit task, not test |
| UI-05 | Skeleton loaders render during loading state | unit | `cd client && npx vitest run src/__tests__/PlayerPage.test.tsx -x` | Existing file needs update |
| UI-06 | Error state shows Hebrew message + retry | unit | `cd client && npx vitest run src/__tests__/PlayerPage.test.tsx -x` | Existing file needs update |
| PERS-01 | Save/unsave player from dashboard | unit | `cd client && npx vitest run src/__tests__/useSavedPlayers.test.ts -x` | Wave 0 |
| PERS-02 | Saved players in localStorage, shown on home page | unit | `cd client && npx vitest run src/__tests__/HomePage.test.tsx -x` | Wave 0 |
| PERS-03 | Max 10 saved players enforced, toast shown | unit | `cd client && npx vitest run src/__tests__/useSavedPlayers.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd client && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd client && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `client/src/__tests__/useSavedPlayers.test.ts` -- covers PERS-01, PERS-02, PERS-03 (hook logic: save, remove, isSaved, isFull, localStorage persistence)
- [ ] `client/src/__tests__/HomePage.test.tsx` -- covers PERS-02 (needs new tests for wired savedPlayers from context)
- [ ] `client/src/__tests__/ErrorState.test.tsx` -- covers UI-06 (error icon, messages, retry button)
- [ ] `client/src/__tests__/Toast.test.tsx` -- covers PERS-03 (auto-dismiss, accessibility)
- [ ] Update `client/src/__tests__/PlayerPage.test.tsx` -- existing file; update loading test to check for skeleton elements instead of "טוען נתוני שחקן..." text; update error test to check for ErrorState component rendering

### Existing Tests That Will Break
The following existing tests will need updates in Phase 4:
- `PlayerPage.test.tsx` line 36: `expect(screen.getByText('טוען נתוני שחקן...')).toBeInTheDocument()` -- this text is being replaced by skeleton components
- `PlayerPage.test.tsx` line 48: `expect(screen.getByText(/לא הצלחנו לטעון/))` -- this text is being replaced by `ErrorState` component with different messages
- `PlayerGrid.test.tsx`: Tests render `PlayerGrid` without an `onRemove` callback; will need updating when `PlayerCard` adds remove button

## Project Constraints (from CLAUDE.md)

- **Tech Stack**: React + TypeScript + Tailwind CSS (frontend) -- no new UI libraries
- **Mobile**: Must work on 375px screens -- skeleton components must be responsive
- **UI Direction**: Full RTL with Hebrew labels -- use logical properties only (ms/me/ps/pe)
- **Colors**: Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending
- **State management**: React hooks + localStorage, no Redux
- **Export style**: Named exports only, no default exports
- **GSD Workflow**: Do not make direct repo edits outside a GSD workflow

## Sources

### Primary (HIGH confidence)
- Codebase inspection: All 12 source files read directly from working tree
- `client/package.json` -- verified all dependencies and versions
- `lucide-react` 1.8.0 -- verified AlertCircle, Bookmark, BookmarkCheck, X icons exist via dynamic import
- `client/src/lib/constants.ts` -- verified STORAGE_KEYS.savedPlayers and MAX_SAVED_PLAYERS pre-exist
- `tailwind.config.js` -- verified `darkMode: 'class'` and custom color tokens

### Secondary (MEDIUM confidence)
- Browser `storage` event behavior (only fires across tabs) -- well-documented MDN behavior, verified against React patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, no new dependencies
- Architecture: HIGH -- Context pattern is standard React; follows existing project patterns (useDarkMode in AppLayout)
- Pitfalls: HIGH -- identified from direct codebase inspection and established React knowledge
- Skeleton specs: HIGH -- dimensions copied from UI-SPEC and real component code

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable; no external dependencies or fast-moving libraries)

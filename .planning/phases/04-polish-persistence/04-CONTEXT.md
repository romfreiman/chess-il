# Phase 4: Polish & Persistence - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers three capabilities: (1) skeleton loading states replacing blank screens during data fetch, (2) friendly Hebrew error messages for failure scenarios, and (3) save/follow players via localStorage with a 10-player limit. It also audits dark mode coverage across all Phase 3 components.

This phase does NOT add new pages, new data fetching, or new visualizations. It polishes existing UI and adds persistence to the home page's saved players feature.

</domain>

<decisions>
## Implementation Decisions

### Skeleton Loaders (UI-05)
- **D-01:** Use Tailwind's built-in `animate-pulse` with gray placeholder blocks matching component shapes — no skeleton library dependency
- **D-02:** Create skeleton variants for: PlayerHeader, MetricCards, RatingChart, WinLossChart, TournamentList. Each mimics the real component's layout dimensions
- **D-03:** Skeletons render inside PlayerPage when `loading` is true, replacing the current "טוען נתוני שחקן..." text

### Error Handling (UI-06)
- **D-04:** Error state renders inline in the PlayerPage content area (not a separate error page). Shows: error icon, Hebrew message, and a "נסה שוב" (try again) retry button
- **D-05:** Error messages differentiated: "שחקן לא נמצא" for 404, "שגיאה בטעינת נתונים" for network/server errors
- **D-06:** Retry button calls the existing `refresh()` from usePlayer hook

### Save/Follow Players (PERS-01, PERS-02, PERS-03)
- **D-07:** Save button placed in PlayerHeader component, next to refresh button. Toggle between "שמור" (save) and "שמור ✓" (saved) states
- **D-08:** Create `useSavedPlayers` hook managing localStorage read/write. Returns `{ savedPlayers, savePlayer, removePlayer, isSaved, isFull }`
- **D-09:** localStorage key: `chess-il-saved-players`. Data shape: `Array<{ id: number; name: string; rating: number; savedAt: string }>`
- **D-10:** When save limit (10) is reached, show a toast notification: "ניתן לשמור עד 10 שחקנים" — non-blocking, auto-dismiss after 3 seconds
- **D-11:** Wire saved players into HomePage's PlayerGrid — replace the empty placeholder array from Phase 2
- **D-12:** Remove button on each PlayerCard triggers `removePlayer(id)` from the hook

### Dark Mode Audit (UI-03)
- **D-13:** Audit all Phase 3 dashboard components for complete dark: class coverage. Fix any missing dark mode styles
- **D-14:** Toast notification component must support dark mode

### Claude's Discretion
- Toast component implementation approach (CSS-only vs lightweight library)
- Skeleton animation timing and exact placeholder dimensions
- Error icon choice (lucide-react icon selection)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Types and Interfaces
- `packages/shared/types.ts` — ApiResponse, PlayerInfo, TournamentEntry types used throughout
- `client/src/lib/types.ts` — SavedPlayer interface (existing from Phase 2)

### Existing Components to Modify
- `client/src/pages/PlayerPage.tsx` — Replace loading/error states with skeletons/error UI
- `client/src/components/dashboard/PlayerHeader.tsx` — Add save button
- `client/src/pages/HomePage.tsx` — Wire savedPlayers from localStorage
- `client/src/components/players/PlayerCard.tsx` — Wire remove button

### Hooks and Patterns
- `client/src/hooks/usePlayer.ts` — Data fetching hook (loading, error, refresh states)
- `client/src/hooks/useDarkMode.ts` — Existing dark mode hook pattern to follow

### Phase 3 Dashboard Components (for skeleton creation)
- `client/src/components/dashboard/MetricCards.tsx`
- `client/src/components/dashboard/RatingChart.tsx`
- `client/src/components/dashboard/WinLossChart.tsx`
- `client/src/components/dashboard/TournamentList.tsx`

### Test Patterns
- `client/src/__tests__/HeroSearch.test.tsx` — Established test pattern
- `client/src/test/fixtures/playerData.ts` — Mock data for tests

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useDarkMode` hook: Pattern for localStorage-backed hooks with state sync
- `PlayerCard.tsx`: Already has structure for saved player display, needs remove button wiring
- `SavedPlayer` interface in `lib/types.ts`: Already defined `{ id, name, rating }` shape
- `COLORS` constants: All theme colors centralized in `lib/constants.ts`
- `animate-pulse` Tailwind class: Available out of the box, no config needed

### Established Patterns
- Card container: `bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4`
- RTL: Logical properties only (ms-/me-/ps-/pe-), physical props banned
- Named function exports, no default exports
- Test pattern: describe/it with @testing-library/react, vitest
- State management: React hooks + localStorage, no Redux

### Integration Points
- `PlayerPage.tsx` loading/error branches: Direct replacement targets
- `HomePage.tsx` savedPlayers array: Currently empty placeholder, ready for hook wiring
- `PlayerHeader.tsx` button area: `absolute top-4 end-4` positioning pattern for action buttons
- `Navbar.tsx` compare link: Already conditionally enabled when savedCount >= 2

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-polish-persistence*
*Context gathered: 2026-04-20*

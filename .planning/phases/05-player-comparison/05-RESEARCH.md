# Phase 5: Player Comparison - Research

**Researched:** 2026-04-23
**Domain:** React component composition, Recharts multi-series charts, responsive tab UI
**Confidence:** HIGH

## Summary

Phase 5 builds a player comparison page at `/compare` that reuses existing dashboard components (`PlayerHeader`, `MetricCards`, skeletons, `ErrorState`) within a two-column desktop / tabbed mobile layout, topped by player picker dropdowns populated from the saved players list. The main new component is a dual-line `CompareChart` using Recharts `AreaChart` with two `Area` series sharing a Y-axis.

The codebase is well-prepared for this phase. All building blocks exist: `usePlayer` hook for data fetching, `useSavedPlayersContext` for the player list, existing dashboard components that accept props and render independently, and established patterns for skeletons, error states, cards, and RTL layout. The `ComparePage.tsx` stub is already wired into the router at `/compare`. The primary implementation work is: (1) a `PlayerPicker` dropdown component, (2) a `CompareHeader` component managing desktop columns vs. mobile tabs, (3) a `CompareChart` component merging two players' rating histories into a dual-series AreaChart, and (4) wiring the full state machine (empty, one-selected, both-loading, partial-loaded, both-loaded, error states) in `ComparePage`.

**Primary recommendation:** Build three new components (`PlayerPicker`, `CompareHeader`, `CompareChart`) in `client/src/components/compare/`, then compose them in the existing `ComparePage` stub. Reuse `usePlayer`, `PlayerHeader`, `MetricCards`, skeletons, and `ErrorState` unchanged. The data merge logic for the chart is a pure function that can be unit tested independently.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Users pick two players from their saved players list. The compare link in the navbar is already gated to 2+ saved players.
- **D-02:** No search inputs on the compare page itself -- players must be saved first.
- **D-03:** Desktop: two columns side by side, each with player header + metric cards. Shared rating chart below spanning full width.
- **D-04:** Mobile (375px): swipe/tab UI to switch between Player A and Player B headers+metrics. Shared chart always visible below.
- **D-05:** No tournament table on the compare page -- too much detail for side-by-side view.
- **D-06:** No W/D/L donut chart -- dropped for simplicity.
- **D-07:** Shared Y-axis -- both players on the same scale.
- **D-08:** Two distinct colored lines (primary blue and a secondary color) to distinguish the players. Each line labeled with the player's name.
- **D-09:** Same chart style as the single-player rating chart (AreaChart with gradient), but two series instead of one.
- **D-10:** No shared tournament detection. Keep it simple.

### Claude's Discretion
- Saved player picker UI (dropdown, list, cards)
- Tab/swipe implementation approach on mobile
- Secondary line color for the second player
- Metric cards layout within each column
- Skeleton and error states (follow Phase 4 patterns)
- Chart tooltip format for two-player view

### Deferred Ideas (OUT OF SCOPE)
- Relative comparison bars (COMP-03 from original requirements) -- user doesn't want competitive comparison
- Shared tournament detection (COMP-05) -- skipped for simplicity
- "vs" label between players (COMP-02) -- doesn't fit the side-by-side concept
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | Compare page shows two players side by side | Two-column desktop layout with PlayerHeader + MetricCards per column; tabbed mobile layout. ComparePage stub exists at `/compare`. PlayerPicker + CompareHeader components. |
| COMP-02 | Header displays both player cards with "vs" between them | **DEFERRED by user.** No "vs" label. Side-by-side headers without competitive framing. |
| COMP-03 | Comparison bars show relative metrics | **DEFERRED by user.** No relative comparison bars. Each player shows their own independent MetricCards. |
| COMP-04 | Combined rating chart shows both players' rating history as overlaid line series | CompareChart with dual Area series on shared AreaChart. Data merge function combines two ratingHistory arrays by date. connectNulls for gaps. Recharts 2.15.4 supports this. |
| COMP-05 | Shared tournaments section lists tournaments where both players participated on same date | **DEFERRED by user.** No shared tournament detection. |
</phase_requirements>

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component framework | Already in use |
| Recharts | 2.15.4 | AreaChart with dual Area series for combined chart | Already in use, supports multi-series, connectNulls |
| Tailwind CSS | 3.4.19 | Responsive layout (grid-cols-2, hidden md:block), tabs, dark mode | Already in use |
| React Router | 6.30.3 | `/compare` route already wired | Already in use |
| lucide-react | 1.8.0 | Icons (if needed for picker or tab UI) | Already in use |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Component testing | Test picker, tab, chart rendering |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Test tab clicks, picker selection |
| vitest | 4.1.4 | Test runner | Run tests via `cd client && npx vitest run` |

### No New Dependencies

This phase requires zero new npm packages. All UI is built with Tailwind utility classes, all charting with Recharts, all data fetching with the existing `usePlayer` hook.

## Architecture Patterns

### New Component Structure
```
client/src/components/compare/
  PlayerPicker.tsx        # Dropdown selector for saved players
  CompareHeader.tsx       # Desktop columns + mobile tabs container
  CompareChart.tsx        # Dual-line AreaChart + legend + tooltip
```

### Pattern 1: Dual usePlayer Calls
**What:** Call `usePlayer(idA)` and `usePlayer(idB)` independently in ComparePage. Each hook manages its own loading/error/data state.
**When to use:** When two players are selected via pickers.
**Example:**
```typescript
// In ComparePage
const [selectedA, setSelectedA] = useState<string>('');
const [selectedB, setSelectedB] = useState<string>('');

// Only fetch when a player is selected
const playerA = usePlayer(selectedA); // returns { data, loading, error, refresh }
const playerB = usePlayer(selectedB);
```
**Key detail:** `usePlayer` currently always fetches on mount (useEffect triggers on `id` change). When `id` is empty string `''`, it will hit `/api/player/` which returns a 404. The ComparePage should conditionally render hooks or handle the empty-ID case. Since React hooks cannot be conditional, the approach is: always call both hooks, but only render content when selection is non-empty. The hook will error for empty IDs, which the page can ignore when no player is selected.

**Recommended approach:** Add a guard to `usePlayer` that skips the fetch when `id` is empty/falsy, returning `{ data: null, loading: false, error: null }` immediately. This is a minor, safe modification.

### Pattern 2: Data Merge for Chart
**What:** Pure function that merges two players' rating histories into a single dataset for the dual-series AreaChart.
**When to use:** When both players have loaded data.
**Example:**
```typescript
interface CompareChartPoint {
  date: string;
  ratingA: number | null;
  ratingB: number | null;
}

function mergeRatingHistories(
  historyA: RatingHistoryEntry[],
  historyB: RatingHistoryEntry[],
): CompareChartPoint[] {
  const dateMap = new Map<string, CompareChartPoint>();

  for (const entry of historyA) {
    dateMap.set(entry.date, { date: entry.date, ratingA: entry.rating, ratingB: null });
  }
  for (const entry of historyB) {
    const existing = dateMap.get(entry.date);
    if (existing) {
      existing.ratingB = entry.rating;
    } else {
      dateMap.set(entry.date, { date: entry.date, ratingA: null, ratingB: entry.rating });
    }
  }

  return [...dateMap.values()].sort((a, b) => a.date.localeCompare(b.date));
}
```

### Pattern 3: Mobile Tab State
**What:** Simple React state toggle for mobile tab switching, not a swipe library.
**When to use:** On screens below 768px (md breakpoint).
**Example:**
```typescript
const [activeTab, setActiveTab] = useState<'a' | 'b'>('a');

// Tab bar (visible on mobile only via md:hidden)
<div className="md:hidden">
  <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist">
    <button
      role="tab"
      aria-selected={activeTab === 'a'}
      className={`flex-1 py-3 text-center text-base ${
        activeTab === 'a'
          ? 'text-primary border-b-[3px] border-primary font-bold'
          : 'text-gray-500 dark:text-gray-400'
      }`}
      onClick={() => setActiveTab('a')}
    >
      {playerAName}
    </button>
    {/* Similar for tab B */}
  </div>
  <div role="tabpanel">
    {activeTab === 'a' ? <PlayerAContent /> : <PlayerBContent />}
  </div>
</div>
```

### Pattern 4: PlayerPicker with Mutual Exclusion
**What:** Native `<select>` dropdown populated from saved players, filtering out the other picker's selection.
**When to use:** Each picker needs to show all saved players except the one already chosen by the other picker.
**Example:**
```typescript
interface PlayerPickerProps {
  label: string;
  selectedId: string;
  excludeId: string;
  savedPlayers: SavedPlayer[];
  onChange: (id: string) => void;
}
```

### Anti-Patterns to Avoid
- **Don't modify RatingChart.tsx:** Create a separate `CompareChart.tsx` rather than adding dual-mode complexity to the existing single-player chart. The UI-SPEC explicitly states "No modification" to RatingChart.
- **Don't use query params for state:** Per D-02 and the interaction contract, player selections are transient. No URL state management needed.
- **Don't add swipe gesture libraries:** Per the UI-SPEC, tab switching is via React state and button clicks, not touch gestures. Keeps dependencies at zero.
- **Don't duplicate gradient IDs:** The existing RatingChart uses `id="ratingGradient"` for its SVG gradient. CompareChart must use unique IDs like `ratingGradientA` and `ratingGradientB` to avoid DOM conflicts if both charts ever appear on the same page.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Player data fetching | Custom fetch logic | `usePlayer(id)` hook | Already handles loading, error, abort, refresh, caching |
| Player header display | Custom header component | `PlayerHeader` component | Already styled, RTL-safe, dark mode complete |
| Metric cards | Custom metric UI | `MetricCards` component | Already computes cumulative change, renders 2x2 grid |
| Loading skeletons | Custom skeleton blocks | `PlayerHeaderSkeleton`, `MetricCardsSkeleton`, `RatingChartSkeleton` | Already match component layouts |
| Error display | Custom error UI | `ErrorState` component | Already handles not-found vs network errors |
| Saved player list | Custom localStorage logic | `useSavedPlayersContext()` | Already provides savedPlayers array, isSaved, etc. |
| Date formatting | Custom date formatter | `formatMonthYear()` from RatingChart.tsx | Already formats dates as Hebrew month + year |
| Chart data from tournaments | Custom rating calculator | `buildChartData()` from RatingChart.tsx | Already handles pending tournaments and rating reconstruction |

**Key insight:** This phase is primarily a composition task. Nearly every visual building block exists. The new work is the composition layer (ComparePage layout + state machine) and the dual-line chart.

## Common Pitfalls

### Pitfall 1: usePlayer with Empty ID
**What goes wrong:** Calling `usePlayer('')` triggers a fetch to `/api/player/` which returns 404, causing an error state before any player is selected.
**Why it happens:** React hooks must be called unconditionally. Both `usePlayer` calls run on every render.
**How to avoid:** Add an early-return guard in `usePlayer`: if `id` is empty/falsy, return `{ data: null, loading: false, error: null, refresh: noop }` without triggering any fetch. This is a small, backward-compatible change.
**Warning signs:** Error flash on initial page load, error state showing before any player is selected.

### Pitfall 2: Duplicate SVG Gradient IDs
**What goes wrong:** If CompareChart uses the same `id="ratingGradient"` as RatingChart, the SVG gradient fill can bleed between charts (browser picks up the first matching ID in the DOM).
**Why it happens:** SVG gradient IDs are global to the document.
**How to avoid:** Use unique gradient IDs: `ratingGradientA` (for player A, primary blue) and `ratingGradientB` (for player B, purple).
**Warning signs:** Chart fill colors appear wrong or flicker.

### Pitfall 3: Y-Axis Domain with Null Values
**What goes wrong:** When using `connectNulls`, the Y-axis domain calculation in Recharts may ignore null values, but if all values for one series are null (edge case where one player has no history), the domain might collapse.
**Why it happens:** Recharts `domain={['dataMin - 50', 'dataMax + 50']}` calculates across all non-null values.
**How to avoid:** Only render the chart when both players have loaded data with at least some rating history entries. Show a chart skeleton or "no data" message otherwise.
**Warning signs:** Chart renders with a collapsed or tiny Y-axis range.

### Pitfall 4: PlayerHeader Save/Refresh Buttons on Compare Page
**What goes wrong:** PlayerHeader includes save/unsave and refresh buttons. On the compare page, the refresh button for each player should re-fetch just that player, and save state should remain functional.
**Why it happens:** PlayerHeader expects `onRefresh`, `isSaved`, `isFull`, `onSave`, `onUnsave` props.
**How to avoid:** Pass the correct per-player props from each `usePlayer` instance and `useSavedPlayersContext`. The existing component API supports this without modification.
**Warning signs:** Clicking refresh on player B refreshes player A, or save state doesn't update.

### Pitfall 5: Mobile Tab Accessibility
**What goes wrong:** Tab UI without proper ARIA attributes fails screen reader navigation.
**Why it happens:** Custom tab implementations often miss `role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"`.
**How to avoid:** Follow the UI-SPEC accessibility contract exactly: `role="tablist"` on container, `role="tab"` and `aria-selected` on each button, `role="tabpanel"` on content div.
**Warning signs:** Screen reader cannot announce tab state or navigate between tabs.

### Pitfall 6: Picker showing all saved players including already-selected
**What goes wrong:** User can select the same player in both pickers, causing a nonsensical comparison.
**Why it happens:** Without mutual exclusion, both `<select>` elements show the full saved players list.
**How to avoid:** Each picker filters out the ID selected in the other picker from its options list.
**Warning signs:** Same player appears in both columns.

## Code Examples

### Dual-Series AreaChart with Recharts
```typescript
// Source: Verified against Recharts 2.15.4 types (installed in project)
<AreaChart data={mergedData}>
  <defs>
    <linearGradient id="ratingGradientA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="ratingGradientB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2} />
      <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
  <XAxis dataKey="date" tickFormatter={formatMonthYear} tick={{ fontSize: 14 }} />
  <YAxis domain={['dataMin - 50', 'dataMax + 50']} tick={{ fontSize: 14 }} />
  <Tooltip content={<CompareChartTooltip playerAName={nameA} playerBName={nameB} />} />
  <Area
    type="monotone"
    dataKey="ratingA"
    stroke={COLORS.primary}
    fill="url(#ratingGradientA)"
    strokeWidth={2}
    dot={{ fill: COLORS.primary, r: 4 }}
    activeDot={{ r: 6 }}
    connectNulls
  />
  <Area
    type="monotone"
    dataKey="ratingB"
    stroke="#A855F7"
    fill="url(#ratingGradientB)"
    strokeWidth={2}
    dot={{ fill: '#A855F7', r: 4 }}
    activeDot={{ r: 6 }}
    connectNulls
  />
</AreaChart>
```

### Reusing formatMonthYear and buildChartData
```typescript
// These functions are exported from RatingChart.tsx and can be imported
import { formatMonthYear, buildChartData } from '../dashboard/RatingChart';
```

### CompareChart Tooltip (two-player)
```typescript
function CompareChartTooltip({ active, payload, playerAName, playerBName }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as CompareChartPoint;
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {formatMonthYear(point.date)}
      </div>
      {point.ratingA !== null && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{playerAName}</span>
          <span className="text-base font-bold text-gray-900 dark:text-gray-50 ms-auto">{point.ratingA}</span>
        </div>
      )}
      {point.ratingB !== null && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A855F7' }} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{playerBName}</span>
          <span className="text-base font-bold text-gray-900 dark:text-gray-50 ms-auto">{point.ratingB}</span>
        </div>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Swipe gesture libraries (react-swipeable) | Simple React state toggle for tabs | Project decision | Zero new dependencies, simpler code |
| Redux/Zustand for shared state | React Context (SavedPlayersContext) | Phase 4 | Already wired, no additional state management needed |
| URL query params (?a=ID1&b=ID2) | Transient component state | User decision | Simpler implementation, selections reset on navigation |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | `client/vitest.config.ts` |
| Quick run command | `cd /home/rfreiman/code/chess-il/client && npx vitest run --reporter=verbose` |
| Full suite command | `cd /home/rfreiman/code/chess-il/client && npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Compare page renders two players side by side | integration | `cd client && npx vitest run src/__tests__/ComparePage.test.tsx -x` | Wave 0 |
| COMP-04 | Combined chart renders with two line series | unit | `cd client && npx vitest run src/__tests__/CompareChart.test.tsx -x` | Wave 0 |
| COMP-04 | mergeRatingHistories produces correct merged data | unit | `cd client && npx vitest run src/__tests__/CompareChart.test.tsx -x` | Wave 0 |
| COMP-01 | PlayerPicker renders saved players and excludes selected | unit | `cd client && npx vitest run src/__tests__/PlayerPicker.test.tsx -x` | Wave 0 |
| COMP-01 | Mobile tab UI switches between players | integration | `cd client && npx vitest run src/__tests__/ComparePage.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd /home/rfreiman/code/chess-il/client && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd /home/rfreiman/code/chess-il/client && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `client/src/__tests__/ComparePage.test.tsx` -- covers COMP-01 (side-by-side layout, tab switching, state machine)
- [ ] `client/src/__tests__/CompareChart.test.tsx` -- covers COMP-04 (dual-series rendering, mergeRatingHistories)
- [ ] `client/src/__tests__/PlayerPicker.test.tsx` -- covers COMP-01 (picker rendering, mutual exclusion)
- [ ] `client/src/test/fixtures/playerData.ts` -- needs a second mock player fixture for comparison tests

### Existing Test Patterns to Follow
- `setup.ts` already mocks `ResponsiveContainer` globally -- CompareChart tests will benefit from this
- `test-utils.tsx` provides `renderWithRouter` for routed component testing
- Fixture data in `test/fixtures/playerData.ts` with `mockPlayerInfo`, `mockTournaments`, `mockRatingHistory`, `mockApiResponse`
- Test files placed in `client/src/__tests__/` directory
- Tests use `render()` from @testing-library/react + `screen` queries
- No need for inline `ResponsiveContainer` mock -- handled by `setup.ts`

## Project Constraints (from CLAUDE.md)

- **Tech Stack**: React + TypeScript + Tailwind CSS + Recharts -- all used, no additions needed
- **Mobile**: Must work on 375px screens -- mobile tab UI addresses this
- **UI Direction**: Full RTL with Hebrew labels -- logical properties (ms-/me-/ps-/pe-) throughout
- **Colors**: Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending; plus Purple (#A855F7) for Player B per UI-SPEC
- **No Redux**: React Context + useState sufficient -- use existing SavedPlayersContext
- **No new dependencies**: Everything needed is already installed
- **GSD Workflow**: All edits through GSD commands

## Open Questions

1. **usePlayer empty-ID behavior**
   - What we know: `usePlayer('')` will attempt to fetch `/api/player/` which will fail with a 404. The hook then sets `error` state.
   - What's unclear: Whether to modify `usePlayer` to handle empty IDs gracefully or handle this entirely in ComparePage by not rendering error UI when no player is selected.
   - Recommendation: Modify `usePlayer` to skip the fetch when `id` is empty. This is a 3-line change that makes the hook more robust for any future caller, not just ComparePage. Add an early-return in the `fetchPlayer` callback: `if (!id) { setLoading(false); return; }`.

2. **Chart data source: ratingHistory vs computed from tournaments**
   - What we know: `RatingChart` already handles both sources -- `ratingHistory` (official ViewState data, 29+ points) takes precedence over `buildChartData()` (computed from tournament changes). The same logic should apply per-player in CompareChart.
   - Recommendation: For each player, use `ratingHistory` if available (length > 0), otherwise fall back to `buildChartData(tournaments, currentRating)`. Then merge the two resolved series.

## Sources

### Primary (HIGH confidence)
- Project source code: `client/src/components/dashboard/RatingChart.tsx` -- existing AreaChart patterns, gradient setup, formatMonthYear
- Project source code: `client/src/hooks/usePlayer.ts` -- data fetching hook interface
- Project source code: `client/src/hooks/useSavedPlayers.ts` -- saved players hook interface
- Project source code: `packages/shared/types.ts` -- RatingHistoryEntry, PlayerInfo, TournamentEntry types
- Recharts installed types: `client/node_modules/recharts/types/cartesian/Area.d.ts` -- verified `connectNulls: boolean` prop
- UI-SPEC: `.planning/phases/05-player-comparison/05-UI-SPEC.md` -- visual contract, component inventory, state machine
- HTML mockup: `.planning/phases/05-player-comparison/mockup.html` -- verified layout with state switching

### Secondary (MEDIUM confidence)
- Phase 3 CONTEXT: `.planning/phases/03-player-dashboard/03-CONTEXT.md` -- established dashboard patterns
- Phase 4 CONTEXT: `.planning/phases/04-polish-persistence/04-CONTEXT.md` -- skeleton/error/persistence patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - zero new dependencies, all libraries already installed and in use
- Architecture: HIGH - component composition follows established Phase 3/4 patterns, all building blocks exist
- Pitfalls: HIGH - identified from direct code reading of usePlayer, RatingChart, and Recharts types

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (30 days - stable codebase, no external API changes expected)

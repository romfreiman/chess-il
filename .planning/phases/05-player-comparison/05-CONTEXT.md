# Phase 5: Player Comparison - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a side-by-side player view at `/compare`. Two players' headers and metrics shown together, with a combined rating history chart overlaying both lines. This is NOT a competitive comparison tool — no relative bars, no shared tournament detection, no "vs" logic. It's a convenience view for looking at two players together.

</domain>

<decisions>
## Implementation Decisions

### Player Selection
- **D-01:** Users pick two players from their saved players list. The compare link in the navbar is already gated to 2+ saved players.
- **D-02:** No search inputs on the compare page itself — players must be saved first.

### Layout
- **D-03:** Desktop: two columns side by side, each with player header + metric cards. Shared rating chart below spanning full width.
- **D-04:** Mobile (375px): swipe/tab UI to switch between Player A and Player B headers+metrics. Shared chart always visible below.
- **D-05:** No tournament table on the compare page — too much detail for side-by-side view. Users can visit individual `/player/:id` pages for that.
- **D-06:** No W/D/L donut chart — dropped for simplicity.

### Combined Rating Chart
- **D-07:** Shared Y-axis — both players on the same scale. Shows absolute rating difference clearly even if one line appears flatter.
- **D-08:** Two distinct colored lines (e.g. primary blue and a secondary color) to distinguish the players. Each line labeled with the player's name.
- **D-09:** Same chart style as the single-player rating chart (AreaChart with gradient), but two series instead of one.

### Shared Tournaments
- **D-10:** No shared tournament detection. Keep it simple.

### Claude's Discretion
- Saved player picker UI (dropdown, list, cards)
- Tab/swipe implementation approach on mobile
- Secondary line color for the second player
- Metric cards layout within each column
- Skeleton and error states (follow Phase 4 patterns)
- Chart tooltip format for two-player view

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, color palette, test player IDs (205001, 210498)
- `.planning/REQUIREMENTS.md` — COMP-01..05 are this phase's original requirements (scope reduced — see decisions)
- `.planning/ROADMAP.md` — Phase 5 description and dependencies

### Phase Dependencies
- `.planning/phases/03-player-dashboard/03-CONTEXT.md` — Dashboard layout decisions (D-01..D-16), chart styling, metric cards
- `.planning/phases/04-polish-persistence/04-CONTEXT.md` — Skeleton/error patterns, saved players hook

### Key Source Files
- `client/src/pages/ComparePage.tsx` — Existing stub, build target
- `client/src/hooks/usePlayer.ts` — Data fetching hook (reuse for both players)
- `client/src/hooks/useSavedPlayers.ts` — Saved players list for picker
- `client/src/components/dashboard/PlayerHeader.tsx` — Reusable header component
- `client/src/components/dashboard/MetricCards.tsx` — Reusable metrics component
- `client/src/components/dashboard/RatingChart.tsx` — Rating chart (needs dual-line variant)
- `client/src/components/layout/Navbar.tsx` — Compare link already wired (enabled when savedCount >= 2)
- `packages/shared/types.ts` — PlayerInfo, TournamentEntry, RatingHistoryEntry types
- `client/src/lib/constants.ts` — COLORS object
- `client/src/context/SavedPlayersContext.tsx` — Saved players context provider

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePlayer` hook: Fetches player data by ID — call twice for two players
- `PlayerHeader` component: Renders name, club, grade, links — reuse directly in each column
- `MetricCards` component: Renders 4 metric cards — reuse directly in each column
- `RatingChart` component: Has AreaChart with gradient and bar toggle — needs modification for dual lines
- `useSavedPlayers` / `SavedPlayersContext`: Provides saved player list for picker
- Skeleton components: `PlayerHeaderSkeleton`, `MetricCardsSkeleton`, `RatingChartSkeleton` — reuse for loading states

### Established Patterns
- Card container: `bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4`
- RTL: Logical properties (ms-/me-/ps-/pe-)
- Dark mode: `dark:` Tailwind classes throughout
- Page layout: `max-w-5xl mx-auto px-4 py-8`
- Data fetching: custom hooks returning `{ data, loading, error, refresh }`

### Integration Points
- `ComparePage.tsx` stub at `/compare` route — ready to build out
- Navbar compare link gates on `savedCount >= 2` — already wired
- `usePlayer` can be called with different IDs for parallel fetching
- `RatingChart` currently takes single `tournaments` + `ratingHistory` — needs new prop for second series

</code_context>

<specifics>
## Specific Ideas

- User explicitly wants side-by-side viewing, NOT competitive comparison — no "vs", no relative metrics
- The combined rating chart with shared Y-axis is the main value-add over just opening two browser tabs
- Swipe/tab on mobile is preferred to make both players accessible without scrolling past one to reach the other

</specifics>

<deferred>
## Deferred Ideas

- Relative comparison bars (COMP-03 from original requirements) — user doesn't want competitive comparison
- Shared tournament detection (COMP-05) — skipped for simplicity
- "מול" (vs) label between players (COMP-02) — doesn't fit the side-by-side concept

</deferred>

---

*Phase: 05-player-comparison*
*Context gathered: 2026-04-23*

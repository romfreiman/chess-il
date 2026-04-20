# Phase 3: Player Dashboard - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a complete, data-rich player dashboard page at `/player/:id`. The page fetches player data from the API and presents it in five sections: header card, metrics row, rating history chart, tournament table, and W/D/L donut chart. This phase builds the core value proposition — the reason users visit the app.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- **D-01:** Section order on mobile: Header → Metrics → Chart → Table → Donut. Natural top-down flow from identity to detail.
- **D-02:** On desktop (768px+), chart and donut sit side-by-side (65%/35%). All other sections stay full-width.
- **D-03:** Metrics display as a 2x2 grid on mobile. Equal-size cards, no hero treatment for any single metric.
- **D-04:** Header card includes a small RefreshCw icon button to trigger force re-scrape (`?force=true`).

### Rating Chart
- **D-05:** Line/bar toggle via small Lucide icon buttons (LineChart / BarChart3) in the chart card header. Active state highlighted with primary color.
- **D-06:** Subtle gradient fill under the line (primary blue fading down). Adds visual weight to trends.
- **D-07:** Rich tooltips on hover: rating value + date + tournament name. Full context at a glance.
- **D-08:** X-axis uses month-year labels (ינו '26, פבר '26). Each tournament is a data point on the line. Readable even with many tournaments.

### Tournament Table
- **D-09:** W/D/L displayed as color-coded number chips — small rounded badges: green for wins, gray for draws, red for losses. Compact and scannable.
- **D-10:** On mobile (375px), each tournament renders as a compact card (not a table row). Stacked vertically. No horizontal scrolling needed.
- **D-11:** Rating change shown as colored number with arrow icon: green ↑+12, red ↓-8. Amber "בהמתנה" badge for pending tournaments. "חדש" badge on most recent.
- **D-12:** Pagination with simple prev/next Hebrew buttons ("הקודם" / "הבא") and page indicator ("עמוד 2 מתוך 5") between them.

### Metric Cards
- **D-13:** All 4 metric cards equal size in 2x2 grid. Rating value naturally prominent as the biggest number.
- **D-14:** Cumulative rating change uses the same colored number + arrow style as tournament rows. Consistent visual language.
- **D-15:** Rating card shows current rating large, expected rating small below ("צפוי: 1490").
- **D-16:** Each metric card has a small Lucide icon for visual identity (TrendingUp, Medal, Calendar, etc.).

### Claude's Discretion
- Specific Lucide icons for each metric card
- Chart height and responsive sizing
- Tournament card internal layout on mobile (info arrangement within each card)
- Donut chart styling details (label placement, center text, segment colors)
- Data fetching hook implementation (custom usePlayer hook pattern)
- Loading placeholder before Phase 4 skeleton loaders
- Error placeholder before Phase 4 error messages
- Component file organization within the dashboard feature folder
- FIDE link display format in header card
- Grade badge styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, color palette, test player IDs (205001, 210498)
- `.planning/REQUIREMENTS.md` — DASH-01..11 are this phase's requirements
- `.planning/ROADMAP.md` — Phase 3 success criteria and dependencies

### Phase Dependencies
- `.planning/phases/02-home-app-shell/02-CONTEXT.md` — Visual style decisions (D-12..D-15): clean aesthetic, Heebo font, card styling, gray background
- `packages/shared/types.ts` — PlayerInfo, TournamentEntry, PlayerData, ApiResponse types
- `client/src/lib/constants.ts` — COLORS (primary, positive, negative, pending), STORAGE_KEYS
- `client/tailwind.config.js` — Custom colors, Heebo font, card border radius

### Existing Components
- `client/src/pages/PlayerPage.tsx` — Current stub with `useParams<{ id: string }>()`, build target
- `client/src/components/layout/AppLayout.tsx` — Layout wrapper
- `client/src/components/players/PlayerCard.tsx` — Existing card pattern (reference for card styling)

### API
- `src/api/routes/player.ts` — GET `/api/player/:id` endpoint, `?force=true` param

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/shared/types.ts` — PlayerInfo (name, id, fideId, club, birthYear, rating, expectedRating, grade, rank, licenseExpiry), TournamentEntry (startDate, updateDate, isPending, tournamentName, tournamentUrl, games, points, performance, wins, losses, draws, ratingChange), ApiResponse
- `client/src/lib/constants.ts` — COLORS object with primary/positive/negative/pending hex values
- `client/tailwind.config.js` — Custom colors (primary, positive, negative, pending) already configured
- `client/src/hooks/useDarkMode.ts` — Dark mode hook pattern (reference for custom hooks)
- Lucide React already installed — icon library for metric cards, arrows, refresh button

### Established Patterns
- Card style: `shadow-sm rounded-xl bg-white dark:bg-gray-800` (from PlayerCard, Phase 2)
- RTL: `text-start`/`text-end`, no physical margin/padding properties
- Dark mode: consistent `dark:` prefix throughout
- Testing: Vitest with @testing-library/react, 32 tests passing

### Integration Points
- `PlayerPage.tsx` stub needs to fetch from `GET /api/player/:id` and render all dashboard sections
- Navigation from HeroSearch already wires to `/player/:id` route
- Recharts needs to be installed (`npm install recharts`) — not yet in client/package.json
- API returns `meta.cached`, `meta.stale` which can inform the refresh button state

</code_context>

<specifics>
## Specific Ideas

- User wants to see it built and iterate — build first, adjust after visual feedback
- Dashboard should feel data-rich but not cluttered — generous whitespace between sections
- Tournament cards on mobile should be self-contained — each card has all info needed without context
- The refresh button in the header card gives power users control over data freshness
- Chart gradient fill adds polish without complexity
- Rich tooltips (rating + date + tournament name) serve as a discovery tool for the rating history

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-player-dashboard*
*Context gathered: 2026-04-20*

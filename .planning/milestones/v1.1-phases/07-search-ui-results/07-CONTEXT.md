# Phase 7: Search UI & Results - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

A new tab on the home page where users search for players by selecting a club and setting a max age, view results in a responsive table/card layout, and select individual or all players via checkboxes. Builds on Phase 6's backend API endpoints.

</domain>

<decisions>
## Implementation Decisions

### Page Layout & Navigation
- **D-01:** Club search lives as a tab on the home page — two tabs ("חיפוש שחקן" / "חיפוש מועדון") switch between player search and club search. No new navbar entry needed.
- **D-02:** Switching to the club search tab replaces the entire page content below the tabs — including saved players grid. Club search gets its own full layout.
- **D-03:** Filters and results on a single view — club dropdown and age filter at the top, results table appears inline below after clicking search. Filters stay visible and editable.
- **D-04:** URL updates with search params for shareability — e.g., `/?tab=clubs&club=6&maxAge=14`. Pre-populates filters and triggers search on page load.

### Club Dropdown
- **D-05:** Combobox with type-to-filter — text input that filters the ~200 club dropdown as user types. Shows matching clubs below. Handles Hebrew text naturally, similar to HeroSearch pattern.
- **D-06:** Single max age input only — labeled "עד גיל" (up to age). No min age filter. User enters a number. API call sets minAge=0 and maxAge to the entered value.
- **D-07:** Age field is a free-text number input — flexible, user types any number. Minimal UI.

### Results Table
- **D-08:** Card list on mobile, table on desktop — below ~640px, each result becomes a compact card (name, rating, age). On desktop, full table with all columns (name, ID, rating, club, age). Follows existing PlayerCard pattern.
- **D-09:** Player name is a clickable link to `/player/:id` — opens in same tab. Consistent with how player names work elsewhere in the app.
- **D-10:** Result count shown above results — text like "נמצאו 42 שחקנים" gives immediate feedback on result set size.

### Selection UX
- **D-11:** Floating action bar at bottom — when 1+ players are selected, a sticky bar appears showing "נבחרו 3 שחקנים" with an export button placeholder (Phase 8 implements export functionality).
- **D-12:** Select-all toggles ALL results at once — no pagination. Results capped at ~250 by the server, one checkbox in the table header.
- **D-13:** Selected rows/cards get subtle highlight — light blue background tint (bg-blue-50 / dark:bg-blue-900/20). Checkbox + visual highlight for clear feedback.

### Claude's Discretion
- Combobox component implementation approach (custom vs lightweight library)
- Tab component styling and transition effects
- Loading skeleton design for club search results
- Error state design for failed searches (Hebrew error messages, consistent with Phase 4 ErrorState pattern)
- Empty state when no results match the filter criteria
- Mobile card layout specifics (which fields, spacing, density)
- Exact breakpoint for table/card switch
- Floating action bar animation and styling details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 6 Backend (Direct Dependency)
- `src/api/routes/clubs.ts` — Express router for `/api/clubs` and `/api/clubs/search` endpoints. Must understand request/response shapes.
- `src/scraper/clubs.ts` — Club scraper module. Context on data extraction and error handling.
- `packages/shared/types.ts` — `ClubInfo` (id, name) and `ClubSearchResult` (id, name, rating, club, birthYear) types used by frontend.

### Existing Frontend Patterns
- `client/src/components/search/HeroSearch.tsx` — Current hero search pattern. Club search tab replaces this when active.
- `client/src/components/search/SearchResults.tsx` — Dropdown search results pattern. Reference for search result display.
- `client/src/components/players/PlayerCard.tsx` — Existing card pattern. Reference for mobile card layout.
- `client/src/components/players/EmptyState.tsx` — Empty state pattern. Reuse for "no results" state.
- `client/src/components/layout/Navbar.tsx` — Current navbar structure. No changes needed (tabs are on home page, not navbar).
- `client/src/App.tsx` — Router config. No new route needed (tabs on existing `/` route).
- `client/src/pages/HomePage.tsx` — Home page layout. Must be modified to add tab switching.

### Hooks & Data Fetching
- `client/src/hooks/usePlayerSearch.ts` — Existing search hook. Reference for club search hook pattern.
- `client/src/hooks/useSavedPlayers.ts` — Saved players hook. Used by player search tab (not club search tab).

### Project Context
- `.planning/REQUIREMENTS.md` — CSRCH-01..04, CRES-01..03 are this phase's requirements
- `.planning/ROADMAP.md` — Phase 7 goal and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HeroSearch.tsx` — Combobox-like pattern (input + dropdown results). Reference for club dropdown implementation.
- `SearchResults.tsx` — Dropdown result list with loading/empty states. Reusable pattern for club dropdown.
- `PlayerCard.tsx` — Card component for player info. Reference for mobile card view of search results.
- `EmptyState.tsx` — Empty state with icon and message. Reusable for "no results" state.
- `usePlayerSearch.ts` — Hook for name-based search with debounced API calls. Pattern for club data fetching hook.
- Lucide React icons used throughout (Search, Home, BarChart3, etc.).

### Established Patterns
- Tailwind CSS with `dark:` variants for dark mode support throughout.
- RTL layout via `dir="rtl"` on root element.
- Forms use `rounded-xl`, `border-gray-300`, `dark:border-gray-600` styling.
- Data fetching hooks return `{ data, loading, error }` pattern.
- Hebrew labels as Unicode strings in JSX.

### Integration Points
- `HomePage.tsx` — Add tab state management and conditionally render player search vs club search.
- `App.tsx` — URL search params (`?tab=clubs&club=X&maxAge=Y`) handled within existing `/` route, no new route needed.
- `/api/clubs` — Fetch club list for dropdown on component mount.
- `/api/clubs/search` — Fetch results when user submits search form.

</code_context>

<specifics>
## Specific Ideas

- Tab switching should feel instant — no page transition, just content swap
- Club dropdown should pre-load club list on tab switch (not on every keystroke)
- Age field should have a reasonable placeholder (e.g., "14") to hint at typical usage
- Floating action bar should match the app's rounded/shadow design language
- Selection state persists within a search session but resets on new search

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-search-ui-results*
*Context gathered: 2026-04-24*

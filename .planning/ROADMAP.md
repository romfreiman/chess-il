# Roadmap: Chess IL Dashboard

## Overview

This roadmap delivers a mobile-first Hebrew dashboard for Israeli Chess Federation player statistics. The journey starts with the data pipeline (scraping chess.org.il and caching in Supabase), builds out the home page and app shell with RTL navigation, then delivers the core player dashboard with charts and tables, adds polish and persistence features, and culminates with the player comparison differentiator. Each phase delivers a coherent, verifiable capability that builds on the previous.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Data Pipeline** - Scrape chess.org.il player data, cache in Supabase, serve via REST API
- [ ] **Phase 2: Home & App Shell** - Search page, RTL layout, routing, navbar, responsive foundation
- [ ] **Phase 3: Player Dashboard** - Full player stats page with header, metrics, charts, and tournament table
- [ ] **Phase 4: Polish & Persistence** - Dark mode, loading states, error handling, save/follow players
- [ ] **Phase 5: Player Comparison** - Side-by-side comparison page with overlay charts and shared tournaments

## Phase Details

### Phase 1: Data Pipeline
**Goal**: Any player's data from chess.org.il can be fetched, cached, and served as structured JSON via a REST endpoint
**Depends on**: Nothing (first phase)
**Requirements**: SCRP-01, SCRP-02, SCRP-03, SCRP-04, SCRP-05, CACH-01, CACH-02, CACH-03, CACH-04, CACH-05, API-01, API-02, API-03
**Success Criteria** (what must be TRUE):
  1. Hitting `GET /api/player/205001` returns structured JSON with Andy Freiman's player info and tournament history
  2. A second request for the same player within 24 hours returns cached data without re-scraping chess.org.il
  3. Requesting a non-existent player ID returns a clear error response (not a crash or HTML)
  4. Adding `?force=true` to the request triggers a fresh scrape even if cached data exists
  5. If chess.org.il is unreachable, stale cached data is returned with a `stale: true` flag
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold, shared types, and scraper (fetch + parse + validate) with tests
- [x] 01-02-PLAN.md — Supabase caching layer (getCachedPlayer, isStale, upsertPlayer) with tests
- [x] 01-03-PLAN.md — Express API route, Netlify Function entry point, full pipeline wiring

### Phase 2: Home & App Shell
**Goal**: Users can navigate the app, search for a player by ID, and see a properly structured RTL Hebrew interface
**Depends on**: Phase 1
**Requirements**: SRCH-01, SRCH-02, SRCH-03, NAV-01, NAV-02, UI-01, UI-02, UI-04, UI-07
**Success Criteria** (what must be TRUE):
  1. User can enter a player ID on the home page and be navigated to that player's dashboard URL (`/player/:id`)
  2. The navbar displays the app name, home link, and dark mode toggle, and renders correctly in RTL
  3. All pages render correctly on a 375px wide screen with no horizontal overflow
  4. Browser back/forward buttons work correctly across all routes (`/`, `/player/:id`, `/compare`)
  5. Home page displays saved player cards (populated in Phase 4) with proper RTL layout
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Scaffold Vite + React + Tailwind frontend, app shell, routing, navbar, dark mode, test infra
- [x] 02-02-PLAN.md — Hero search with validation, recent suggestions, player cards, grid, empty state, HomePage
- [x] 02-03-PLAN.md — UAT gap closure: dark mode icon contrast fix and search validation message

### Phase 3: Player Dashboard
**Goal**: Users see a complete, data-rich dashboard for any player with header info, key metrics, rating chart, tournament table, and win/loss breakdown
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10, DASH-11
**Success Criteria** (what must be TRUE):
  1. Player page shows header card with name, club, birth year, grade badge, and FIDE link
  2. Four metric cards display current rating, national rank, tournament count, and cumulative rating change
  3. Rating history chart renders with data points over time, and user can toggle between line and bar views
  4. Tournament table shows paginated results (10 per page) with color-coded rating changes, pending badges, and clickable tournament links
  5. Win/Draw/Loss donut chart displays aggregate percentages across all tournaments
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Install Recharts, usePlayer hook, mock fixtures, PlayerHeader and MetricCards with tests
- [x] 03-02-PLAN.md — RatingChart (line/bar toggle, gradient, tooltips) and WinLossChart (donut) with tests
- [ ] 03-03-PLAN.md — TournamentList (responsive table/cards, pagination, badges) and PlayerPage wiring

### Phase 4: Polish & Persistence
**Goal**: The app feels polished with dark mode, loading feedback, graceful error handling, and the ability to save and manage followed players
**Depends on**: Phase 3
**Requirements**: UI-03, UI-05, UI-06, PERS-01, PERS-02, PERS-03
**Success Criteria** (what must be TRUE):
  1. User can toggle dark mode and all pages render with correct dark theme colors
  2. Skeleton loaders appear while player data is being fetched (no blank screen or spinner)
  3. When a player is not found or scraping fails, a friendly Hebrew error message is displayed
  4. User can save a player from the dashboard and see them listed on the home page with name, rating, and a remove button
  5. Attempting to save more than 10 players shows a limit message; saved players persist across browser sessions via localStorage
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 04-01-PLAN.md — Skeleton loaders, ErrorState component, dark mode audit, PlayerPage loading/error wiring
- [ ] 04-02-PLAN.md — useSavedPlayers hook, SavedPlayersContext, save/remove buttons, Toast, home page wiring

### Phase 5: Player Comparison
**Goal**: Users can view two players side by side with their own stats and a combined rating history chart overlaying both players' data
**Depends on**: Phase 4
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05
**Success Criteria** (what must be TRUE):
  1. Compare page shows two player pickers from saved players list, rendering selected players side by side
  2. Combined rating chart overlays both players' rating histories as distinguishable line series (blue + purple)
  3. Mobile view provides tab UI to switch between players with chart always visible
  4. Page handles all states: no saved players, one selected, both loading, both loaded, error
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 05-01-PLAN.md — usePlayer empty-ID guard, PlayerPicker, CompareChart with mergeRatingHistories, second mock fixture, tests
- [ ] 05-02-PLAN.md — CompareHeader (desktop columns / mobile tabs), ComparePage full wiring with state machine, integration tests, visual checkpoint

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Pipeline | 1/3 | In Progress | - |
| 2. Home & App Shell | 2/3 | In Progress |  |
| 3. Player Dashboard | 0/3 | Planned    |  |
| 4. Polish & Persistence | 0/2 | Planned | - |
| 5. Player Comparison | 0/2 | Planned | - |

# Requirements: Chess IL Dashboard

**Defined:** 2026-04-19
**Core Value:** Any user can enter a player ID and instantly see a beautiful, data-rich dashboard of that player's chess rating history, tournament results, and performance stats.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Scraping

- [x] **SCRP-01**: Backend can fetch HTML from chess.org.il player page given a player ID
- [x] **SCRP-02**: Scraper extracts player info fields (name, ID, FIDE ID, club, birth year, rating, expected rating, rank, grade, license expiry)
- [x] **SCRP-03**: Scraper extracts tournament history rows (date, update date, tournament name/URL, games, points, performance, result, W/D/L, rating change, pending status)
- [x] **SCRP-04**: Scraper sets custom User-Agent header (`ChessIL-Dashboard/1.0`)
- [x] **SCRP-05**: Scraper returns structured JSON matching defined TypeScript types

### Caching

- [x] **CACH-01**: Scraped player data is stored in Supabase `players` table as JSONB
- [x] **CACH-02**: Cached data is returned if updated within last 24 hours
- [x] **CACH-03**: Stale or missing cache triggers a fresh scrape
- [x] **CACH-04**: If scraping fails, stale cached data is returned with `stale: true` flag
- [x] **CACH-05**: User can force re-scrape ignoring cache via refresh button

### API

- [ ] **API-01**: `GET /api/player/:id` returns player data as JSON
- [ ] **API-02**: API handles invalid/missing player IDs with appropriate error response
- [ ] **API-03**: API is accessible from frontend (same-origin or CORS enabled)

### Search

- [x] **SRCH-01**: Home page displays a search input for entering player ID
- [x] **SRCH-02**: Submitting a player ID navigates to the player dashboard page
- [x] **SRCH-03**: Home page shows list of saved players as clickable cards with name, rating, and remove button

### Dashboard

- [x] **DASH-01**: Player header card shows name, club, birth year, grade badge, and FIDE link (if exists)
- [x] **DASH-02**: Metrics row displays 4 cards: current rating (with expected), national rank, tournament count, cumulative rating change
- [x] **DASH-03**: Rating history line chart shows rating over time with month labels
- [x] **DASH-04**: User can toggle between line chart and bar chart for rating history
- [x] **DASH-05**: Tournament table shows last 10 tournaments with date, name, result chips (W/D/L), and rating change
- [x] **DASH-06**: Tournament table supports pagination (10 per page with prev/next)
- [x] **DASH-07**: Rating change is color-coded: green for positive, red for negative
- [x] **DASH-08**: Pending tournaments show "בהמתנה" amber badge instead of rating change
- [x] **DASH-09**: Most recent tournament shows "חדש" badge
- [x] **DASH-10**: Clicking tournament name opens chess.org.il tournament page in new tab
- [x] **DASH-11**: Win/Draw/Loss donut chart shows aggregate W/D/L across all tournaments with percentages

### Compare

- [ ] **COMP-01**: Compare page shows two players side by side
- [ ] **COMP-02**: Header displays both player cards with "מול" (vs) between them
- [ ] **COMP-03**: Comparison bars show relative metrics (rating, cumulative change, max performance, avg change)
- [ ] **COMP-04**: Combined rating chart shows both players' rating history as overlaid line series
- [ ] **COMP-05**: Shared tournaments section lists tournaments where both players participated on same date

### UI/UX

- [x] **UI-01**: Entire app uses RTL direction (`dir="rtl"`) with Hebrew labels
- [x] **UI-02**: All layouts work on 375px wide screens (mobile-first)
- [ ] **UI-03**: Full dark mode support via Tailwind dark: classes
- [x] **UI-04**: Color scheme uses Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending
- [ ] **UI-05**: Skeleton loaders display while data is being fetched
- [ ] **UI-06**: Friendly Hebrew error messages display when player not found or scrape fails
- [x] **UI-07**: Top navbar with app name "♟ Chess IL", home link, compare link (if 2+ saved), dark mode toggle

### Persistence

- [ ] **PERS-01**: User can save/unsave a player from the dashboard page
- [ ] **PERS-02**: Saved players stored in localStorage as array of `{id, name, rating}`
- [ ] **PERS-03**: Maximum 10 saved players enforced

### Navigation

- [x] **NAV-01**: App has client-side routing with pages: `/`, `/player/:id`, `/compare?a=ID1&b=ID2`
- [x] **NAV-02**: Navigation works with browser back/forward buttons

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Nemesis/client rival tagging based on opponent win/loss patterns
- **ADV-02**: Player name search (requires scraping chess.org.il search pages)
- **ADV-03**: Club leaderboard aggregation
- **ADV-04**: Rating prediction/extrapolation from trend data
- **ADV-05**: Export stats as shareable image

### Notifications

- **NOTF-01**: Alert on rating changes after tournament processing

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Individual game results | Requires ASP.NET `__doPostBack` POST simulation; fragile and complex |
| User authentication / accounts | localStorage sufficient for MVP; auth adds massive complexity |
| Mobile native app | Web-first approach; responsive web serves mobile use case |
| Real-time rating updates | chess.org.il updates ratings periodically, not real-time |
| Push notifications | Requires backend workers and notification infrastructure |
| Server-side saved players | Would require auth; localStorage sufficient for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCRP-01 | Phase 1 | Complete |
| SCRP-02 | Phase 1 | Complete |
| SCRP-03 | Phase 1 | Complete |
| SCRP-04 | Phase 1 | Complete |
| SCRP-05 | Phase 1 | Complete |
| CACH-01 | Phase 1 | Complete |
| CACH-02 | Phase 1 | Complete |
| CACH-03 | Phase 1 | Complete |
| CACH-04 | Phase 1 | Complete |
| CACH-05 | Phase 1 | Complete |
| API-01 | Phase 1 | Pending |
| API-02 | Phase 1 | Pending |
| API-03 | Phase 1 | Pending |
| SRCH-01 | Phase 2 | Complete |
| SRCH-02 | Phase 2 | Complete |
| SRCH-03 | Phase 2 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| UI-01 | Phase 2 | Complete |
| UI-02 | Phase 2 | Complete |
| UI-04 | Phase 2 | Complete |
| UI-07 | Phase 2 | Complete |
| DASH-01 | Phase 3 | Complete |
| DASH-02 | Phase 3 | Complete |
| DASH-03 | Phase 3 | Complete |
| DASH-04 | Phase 3 | Complete |
| DASH-05 | Phase 3 | Complete |
| DASH-06 | Phase 3 | Complete |
| DASH-07 | Phase 3 | Complete |
| DASH-08 | Phase 3 | Complete |
| DASH-09 | Phase 3 | Complete |
| DASH-10 | Phase 3 | Complete |
| DASH-11 | Phase 3 | Complete |
| UI-03 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 4 | Pending |
| PERS-01 | Phase 4 | Pending |
| PERS-02 | Phase 4 | Pending |
| PERS-03 | Phase 4 | Pending |
| COMP-01 | Phase 5 | Pending |
| COMP-02 | Phase 5 | Pending |
| COMP-03 | Phase 5 | Pending |
| COMP-04 | Phase 5 | Pending |
| COMP-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 after roadmap creation*

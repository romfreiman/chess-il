# Feature Landscape: Club Player Search & Export (v1.1)

**Domain:** Chess federation player search dashboard - club/age search and CSV export
**Researched:** 2026-04-24
**Milestone:** v1.1 Club Player Search & Export
**Confidence:** HIGH

## Context

This research focuses exclusively on the NEW features for v1.1. The existing app already has:
- Player ID search and name search on the home page
- Player dashboard (rating chart, metrics, tournament table)
- Saved players with localStorage (max 10)
- Player comparison (side-by-side charts)
- Dark mode, RTL Hebrew, mobile-first responsive layout

The data source (chess.org.il) has been verified to support advanced search with all needed filters. See "Source Site Capabilities" below for details.

## Source Site Capabilities (Verified)

The chess.org.il advanced search (`SearchPlayers.aspx`) was scraped and analyzed. It supports the following filters via ASP.NET WebForms POST:

| Filter | Control ID | Type | Values |
|--------|-----------|------|--------|
| Club | `ClubsDDL` | Dropdown | 200 clubs (value=numeric ID, e.g. `5`=Elitzur Petah Tikva) |
| Age From | `AgeFromTB` | Text input | Integer (minimum age) |
| Age Till | `AgeTillTB` | Text input | Integer (maximum age) |
| Name | `AdvancedSearchNameTextBox` | Text input | Free text |
| Gender | `GenderDDL` | Dropdown | ALL, Male, Female |
| City | `CitiesDDL` | Dropdown | 1146 cities |
| Rating From | `RatingFromTB` | Text input | Integer |
| Rating To | `RatingUptoTB` | Text input | Integer |
| Membership Status | `MembershipStatusDDL` | Dropdown | ALL, Active membership, Expired |
| Player Status | `PlayerStatusDDL` | Dropdown | All, Active, Inactive, Deceased, New, Unrated |
| Country | `CountriesDDL` | Dropdown | ALL, Israel, Foreign |
| Residency | `ForeignDDL` | Dropdown | ALL, Israeli residents, Foreign only |

**Important findings:**
- Results are NOT paginated by chess.org.il -- all matching rows come in one response (up to 250 observed for a club).
- Triggering advanced search requires a two-step POST: first GET page, then POST with `__EVENTTARGET=ctl00$ContentPlaceHolder1$AdvancedSearchLinkButton` to reveal the advanced panel, then POST again with filters and `AdvancedSearchButton`.
- The clubs dropdown has ~200 entries. The club list is embedded in the advanced search page HTML, not in a separate API.
- Results table has 15 columns: #, Name, Player Number, Country, Gender, Tournament Count, Club, FIDE Number, Status, Israeli Rating, FIDE Rating, Grade, Membership, Birth Year, Role.

## Table Stakes

Features that users searching by club/age inherently expect. Missing any of these makes the feature feel broken.

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Club dropdown selector | Primary filter; the whole point of "search by club" | LOW | Scrape club list from advanced search page |
| Age range inputs (min/max) | Coaches/parents search by age group; essential for youth chess | LOW | Two number inputs with validation |
| Search results table | Must display the matched players in a scannable format | MEDIUM | New scraper function for advanced search |
| Player name column with link | Users expect to click through to the player dashboard | LOW | Reuse existing `/player/:id` route |
| Rating column | Primary data point coaches care about | LOW | Direct from scrape results |
| Birth year / age column | Critical when filtering by age range | LOW | Direct from scrape results |
| Loading state during search | Scraping takes 2-5 seconds; user needs feedback | LOW | Existing skeleton/spinner patterns |
| Empty state for no results | Clear messaging when no players match filters | LOW | Existing empty state patterns |
| Error handling | Network/scrape failures need Hebrew error messages | LOW | Existing error handling patterns |

## Differentiators

Features that elevate this beyond a basic search form. Not strictly expected, but make the tool genuinely useful.

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Select-all / individual checkboxes | Batch operations are the primary use case (coaches want to export lists) | MEDIUM | State management for selected IDs |
| CSV export of selected players | Coaches import into spreadsheets for tournament planning, parent communication | MEDIUM | Client-side Blob download with UTF-8 BOM |
| Bulk action toolbar (appears on selection) | Clear UX signal that selection enables actions; follows data table best practices | LOW | Conditional render based on selection count |
| Selection count badge | "3 selected" feedback keeps user oriented during multi-select | LOW | Derived from selection state |
| Click-row-to-toggle-checkbox | Larger hit target on mobile; standard data table UX pattern | LOW | Row click handler |
| Rank column in results | Shows national ranking alongside rating | LOW | Available in scrape results |
| Club name in results | Confirms the filter; useful when searching without club filter | LOW | Available in scrape results |
| Persist club dropdown selection | After export, user might want to adjust age range and search again | LOW | Component state (no localStorage needed) |

## Anti-Features

Features to explicitly NOT build for v1.1. Some are tempting but add complexity without proportional value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Server-side pagination of results | chess.org.il returns all results in one response (max ~250 per club); client-side handling is sufficient | Render all rows; if slow, add client-side virtual scrolling later |
| Multi-club search (search across clubs) | Requires N scrape requests; rate limiting concern; unclear use case | One club at a time; user can change dropdown and search again |
| Saved search queries | Overengineered for v1.1; users do ad-hoc searches | Keep filters in component state only |
| Export to Excel (.xlsx) | Requires xlsx library dependency (~200KB); CSV opens in Excel fine | CSV with UTF-8 BOM for Excel compatibility |
| Print functionality | Niche use case; browser print works adequately | Rely on browser Ctrl+P |
| Column sorting (client-side) | Nice-to-have but adds complexity to the table component | Ship without; add in v1.2 if requested |
| Column customization (show/hide) | Overkill for ~6-8 displayed columns | Show a fixed set of useful columns |
| Full advanced search (gender, city, country, rating range, status) | Scope creep; club + age covers 90% of use cases | Expose only club + age range for v1.1; note other filters exist for future |
| Inline player comparison from results | Existing compare page already handles this well | Link/navigate to compare page |
| Cache search results in Supabase | Search results change frequently; individual player data already cached | Fresh scrape on each search; individual player pages still use 24h cache |
| Add all selected players to saved list | Saved list has 10-player max; bulk add could exceed this easily | Users can click through to player page and save individually |

## Feature Dependencies

```
[Club Search Page] ──new route──> /clubs (or /search/clubs)
  │
  ├── [Club List Scraper] ──requires──> Scrape advanced search page HTML
  │     └── Extract <select> options from ClubsDDL
  │
  ├── [Advanced Search Scraper] ──requires──> ASP.NET form POST sequence
  │     ├── GET search page
  │     ├── POST to reveal advanced panel (AdvancedSearchLinkButton)
  │     └── POST with club + age filters (AdvancedSearchButton)
  │
  ├── [Results Table Component]
  │     ├── [Checkbox Column] ──enables──> [Selection State]
  │     ├── [Select All Header Checkbox] ──controls──> [All Row Checkboxes]
  │     └── [Player Name Link] ──navigates to──> /player/:id (existing)
  │
  ├── [Selection State] ──enables──> [Bulk Action Toolbar]
  │     └── [CSV Export Button]
  │
  └── [CSV Export Utility]
        ├── Columns: Name, ID, Rating, Club, Age/Birth Year, Rank
        └── UTF-8 BOM prefix for Excel/Hebrew compatibility
```

Key ordering insight: The club list scraper and advanced search scraper share the same page (SearchPlayers.aspx), so they should be built together. The API endpoint should handle the two-step PostBack flow internally.

## MVP Recommendation (v1.1 Scope)

### Must Ship

1. **Club dropdown selector** -- populated from scraped club list
2. **Age range inputs** (min age, max age) -- number inputs with basic validation
3. **Search button** -- triggers advanced search scrape
4. **Results table** -- Name (linked), Player Number, Rating, Club, Birth Year, Rank
5. **Checkbox column** with select-all in header
6. **CSV export button** -- exports selected rows (or all if none selected)
7. **New route** -- `/clubs` or similar, accessible from navbar
8. **Loading and error states** -- consistent with existing app patterns

### Defer to v1.2

- Column sorting (click header to sort by rating, age, etc.)
- Additional filters (gender, city, rating range, player status)
- Virtual scrolling for very large result sets
- Export format options (Excel, PDF)

### Future (v2+)

- Cross-club search
- Saved search presets
- Club profile page (aggregate stats for a club)
- Bulk add to saved players

## Feature-to-Phase Mapping Recommendation

| Phase | Features | Rationale |
|-------|----------|-----------|
| Phase 1: Backend Scraping | Club list scraper, advanced search scraper, API endpoints | Foundation; everything depends on data |
| Phase 2: UI & Table | Club search page, dropdown, age inputs, results table, loading/error | Core user-facing functionality |
| Phase 3: Selection & Export | Checkboxes, select-all, bulk toolbar, CSV export with BOM | Value-add built on top of working search |

This ordering ensures each phase delivers a testable increment: Phase 1 = API works, Phase 2 = UI works end-to-end, Phase 3 = export workflow works.

## UX Pattern Decisions

### Filter Panel Layout
Use a horizontal filter bar above the results table (not a sidebar). On mobile (375px), stack filters vertically: club dropdown full-width, then age range inputs side-by-side. A sticky search button at the bottom on mobile. This matches the app's existing stacked-card mobile pattern.

### Checkbox Behavior
- Show checkboxes persistently (not on hover) because this is a mobile-first app -- hover does not exist on touch.
- Row click toggles checkbox for larger hit target.
- Header checkbox = select all / deselect all on current results.
- Show selected count: "X players selected" in the bulk action toolbar.

### CSV Export Trigger
- Button appears in a sticky bottom toolbar when at least 1 row is selected (similar to existing compare FAB button pattern).
- If no rows are explicitly selected, export ALL visible results.
- Filename format: `club-name-YYYY-MM-DD.csv` for clear identification.
- UTF-8 BOM (`\uFEFF`) prefix for Hebrew compatibility in Excel.

### Results Table Columns (Mobile vs Desktop)
| Column | Mobile (375px) | Desktop |
|--------|---------------|---------|
| Checkbox | Yes | Yes |
| Name (linked) | Yes | Yes |
| Rating | Yes | Yes |
| Birth Year | Yes | Yes |
| Player ID | Hidden | Yes |
| Club | Hidden (redundant when filtering by club) | Yes |
| Rank | Hidden | Yes |
| FIDE Rating | Hidden | Yes |

## Competitor Feature Analysis (Club/Batch Search)

| Feature | chess.org.il | FIDE | USCF | Our Approach |
|---------|-------------|------|------|--------------|
| Club filter | Advanced search (hidden) | By federation | By state/region | Prominent dropdown |
| Age filter | Advanced search (hidden) | By birth year | Not available | Min/max age inputs |
| Export | None | TXT/XML download of full lists | None | CSV of selected players |
| Batch selection | None | None | None | Checkboxes + select-all |
| Mobile-friendly | No (desktop-only layout) | No | No | Mobile-first responsive |
| Hebrew interface | Yes (source) | No | No | Full RTL Hebrew |

Our approach is significantly better than existing tools because no chess federation site offers mobile-friendly batch selection with export. Coaches currently copy data by hand or use the desktop-only chess.org.il advanced search.

## Sources

- chess.org.il SearchPlayers.aspx -- directly scraped and analyzed (HIGH confidence)
- [FIDE Advanced Search](https://ratings.fide.com/advseek.phtml) -- feature comparison reference
- [USCF Player Search](https://new.uschess.org/players/search) -- feature comparison reference
- [Bricx Labs: 15 Filter UI Patterns 2026](https://bricxlabs.com/blogs/universal-search-and-filters-ui) -- filter UX patterns
- [Pencil & Paper: Mobile Filter UX](https://www.pencilandpaper.io/articles/ux-pattern-analysis-mobile-filters) -- mobile filter patterns
- [Medium: Check-Boxes on Data Tables](https://medium.com/@levibait/check-boxes-on-data-tables-ded40456f76b) -- checkbox UX patterns
- [Pencil & Paper: Data Table UX](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables) -- table/export best practices
- [PayloadCMS Issue #13929](https://github.com/payloadcms/payload/issues/13929) -- UTF-8 BOM requirement for Hebrew CSV in Excel

---
*Feature research for: Chess IL Dashboard v1.1 - Club Player Search & Export*
*Researched: 2026-04-24*

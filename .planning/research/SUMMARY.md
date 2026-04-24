# Project Research Summary

**Project:** Chess IL Dashboard v1.1 -- Club Player Search & Export
**Domain:** Feature addition to existing chess federation scraping dashboard
**Researched:** 2026-04-24
**Confidence:** HIGH

## Executive Summary

This v1.1 milestone adds club-based player search and CSV export to the existing Chess IL Dashboard. The core challenge is not technology selection -- no new dependencies are needed -- but rather correctly navigating the ASP.NET WebForms 3-step postback flow on chess.org.il's advanced search page. The existing codebase already has proven patterns for 2-step ASP.NET scraping, shared types, React hooks with AbortController, and Cheerio-based HTML parsing. The new feature extends these patterns to a more complex scraping flow (3 HTTP round-trips per search) and adds client-side CSV generation with Hebrew/Excel compatibility.

The recommended approach is a clean vertical slice: build a new `src/scraper/clubs.ts` module (do not extend the existing `search.ts`), expose two new API endpoints (`/api/clubs` and `/api/clubs/search`), and create a self-contained `ClubSearchPage` with local state management. The architecture research confirms that all new code can follow existing patterns -- imperative search hooks, Express routers, and compositional page components. No new React Context, no new npm packages, no database schema changes for search results.

The primary risks are (1) Netlify Function timeouts due to the 3-step scraping flow taking 6-9 seconds against chess.org.il, (2) Hebrew CSV encoding failing silently in Microsoft Excel without a UTF-8 BOM prefix, and (3) hardcoded column indices breaking when the advanced search results table has a different layout than the basic search table. All three risks have clear mitigation strategies documented in the pitfalls research. The pagination question (whether chess.org.il paginates advanced search results) was investigated: results come back in a single response with up to 250 rows, so pagination handling is likely unnecessary but should be verified with large clubs during Phase 1.

## Key Findings

### Recommended Stack

No new dependencies are required. All four new capabilities (club list scraping, advanced search, results table with checkboxes, CSV export) are covered by the existing stack: Cheerio + axios for scraping, React `useState` with `Set<number>` for selection state, and the native Blob API for CSV generation.

**Core technologies (all existing):**
- **Cheerio + axios**: Scrape club list and advanced search results from chess.org.il -- same ASP.NET WebForms pattern already used
- **React useState with Set<number>**: Track checkbox selection state -- no state library needed for ephemeral page-local state
- **Native Blob API + URL.createObjectURL**: Generate and download CSV client-side -- 20 lines of utility code replaces any CSV library
- **Express Router**: Two new endpoints (`/api/clubs`, `/api/clubs/search`) -- follows existing player router pattern

**What NOT to add:** papaparse (36KB, only for reading CSV), react-table (15KB, overkill for one flat table), xlsx/exceljs (200KB+, XLSX not requested), react-query (one endpoint does not justify the dependency), formik (two dropdowns and two inputs).

### Expected Features

**Must have (table stakes):**
- Club dropdown selector populated from scraped club list (~200 clubs)
- Age range inputs (min/max) with basic validation
- Search results table with Name (linked to player dashboard), Rating, Birth Year
- Loading state during 2-5 second scrape, error handling with Hebrew messages
- Empty state for no results

**Should have (differentiators, included in v1.1 scope):**
- Select-all / individual checkboxes for batch operations
- CSV export of selected players with UTF-8 BOM for Excel/Hebrew compatibility
- Bulk action toolbar with selection count badge
- Click-row-to-toggle for mobile-friendly hit targets

**Defer to v1.2+:**
- Column sorting (click header to sort)
- Additional filters (gender, city, rating range, player status)
- Virtual scrolling for large result sets

**Defer to v2+:**
- Cross-club search (multiple clubs at once)
- Saved search presets
- Club profile pages with aggregate stats
- Export to Excel (.xlsx) format

### Architecture Approach

The new feature integrates as a parallel vertical slice alongside existing pages. A new `ClubSearchPage` orchestrates three child components (form, results table, export button) using local `useState` -- no Context or global state needed. The backend adds a new `src/scraper/clubs.ts` module (separate from existing `search.ts`) with two exported functions, and a new Express router mounted at `/api/clubs`. The existing database, caching layer, and player-related code remain untouched.

**Major components:**
1. **Club scraper** (`src/scraper/clubs.ts`) -- 3-step ASP.NET postback flow: GET viewstate, POST to expand advanced panel, POST with filters. Two functions: `scrapeClubList()` and `scrapeClubPlayers()`
2. **API routes** (`src/api/routes/clubs.ts`) -- GET `/api/clubs` (club list) and GET `/api/clubs/search` (search by club + age range). Separate router from player routes
3. **ClubSearchPage** (`client/src/pages/ClubSearchPage.tsx`) -- Orchestrator page with `ClubSearchForm`, `ClubResultsTable`, and `ExportButton` child components
4. **CSV utility** (`client/src/lib/csv.ts`) -- Pure function for client-side CSV generation with BOM prefix and RFC 4180 quoting
5. **Custom hooks** (`useClubList`, `useClubSearch`) -- Fetch-once pattern for clubs, imperative-trigger pattern for search (not auto-debounced)

**New files:** 10 new files, 4 modified files, 0 deleted files. See ARCHITECTURE.md for the complete file listing.

### Critical Pitfalls

1. **ASP.NET 3-step postback flow** -- The advanced search panel does not exist in the initial HTML. A postback must expand it before filter fields are available. Reusing the existing 2-step `searchPlayers()` will silently return unfiltered results. Build a dedicated 3-step function from the start.

2. **Netlify Function timeout** -- The 3-step scraping flow takes 6-9 seconds. With cold starts and geographic latency to Israeli servers, this approaches the 10-second default timeout. Cache the club list separately (single GET, not part of 3-step flow). Set aggressive per-request timeouts. Test in production early.

3. **Hebrew CSV encoding in Excel** -- CSV files without a UTF-8 BOM (`\uFEFF`) display as gibberish in Microsoft Excel on Windows. This is the primary target environment for Israeli users. Always prepend BOM. Must test in actual Excel, not Google Sheets or VS Code.

4. **Column index hardcoding** -- The existing codebase already had a column index bug (commit `e6ae38e`). The advanced search results table may have different column ordering than basic search. Use header-text-based column detection instead of hardcoded indices.

5. **CSV field quoting for Hebrew names** -- Hebrew club names frequently contain `ע"ש` (double-quote characters) and commas. Simple `join(',')` will corrupt CSV structure. Wrap all fields in double quotes and escape embedded quotes per RFC 4180.

## Implications for Roadmap

Based on research, the feature naturally divides into 3 phases following a dependency chain: data layer first, then UI, then export workflow.

### Phase 1: Backend Scraping & API

**Rationale:** Everything depends on data. The 3-step ASP.NET postback flow is the highest-risk technical challenge and must be proven before any UI work begins. This phase also resolves the Netlify timeout risk early.

**Delivers:** Working API endpoints that return club list and search results. Testable with curl/Postman without any frontend.

**Addresses features:** Club list scraping, advanced search scraper, two API endpoints

**Avoids pitfalls:** ASP.NET postback flow (Pitfall 1), Netlify timeout (Pitfall 2), column index drift (Pitfall 10), rate limiting architecture decision (Pitfall 6), club list caching strategy (Pitfall 8)

**Scope:**
- Shared types in `packages/shared/types.ts` (ClubOption, ClubSearchResult, ClubSearchParams)
- `src/scraper/clubs.ts` with `scrapeClubList()` and `scrapeClubPlayers()`
- `src/api/routes/clubs.ts` with GET `/api/clubs` and GET `/api/clubs/search`
- Mount router in `netlify/functions/api.ts`
- Integration test against live chess.org.il

### Phase 2: Search UI & Results Table

**Rationale:** With the API proven and working, the frontend can be built with confidence. The results table with checkboxes is the core user interaction and must handle 100+ rows performantly on mobile. This phase delivers a complete end-to-end search experience.

**Delivers:** Functional club search page accessible from navbar. Users can search by club and age, see results, and click through to player dashboards.

**Addresses features:** Club search page, dropdown, age inputs, results table, loading/error states, select-all/individual checkboxes, selection count

**Avoids pitfalls:** Select-all re-render performance (Pitfall 5) -- use `React.memo` from the start; age calculation ambiguity (Pitfall 7) -- display as approximate age

**Scope:**
- `ClubSearchPage.tsx`, `ClubSearchForm.tsx`, `ClubResultsTable.tsx`
- `useClubList.ts`, `useClubSearch.ts` hooks
- Route addition in `App.tsx`, nav link in `Navbar.tsx`
- Mobile-responsive table with hidden columns at 375px
- `React.memo` on row components from day one

### Phase 3: CSV Export

**Rationale:** Export is the value-add built on top of working search and selection. It has isolated complexity (BOM encoding, field quoting) that is best addressed in a focused phase with explicit Excel testing.

**Delivers:** Complete export workflow -- select players, click export, get a properly formatted Hebrew CSV that opens correctly in Excel.

**Addresses features:** CSV export button, bulk action toolbar, ExportButton component

**Avoids pitfalls:** Hebrew BOM encoding (Pitfall 3), CSV delimiter/quoting (Pitfall 9), CSV formula injection (Security)

**Scope:**
- `client/src/lib/csv.ts` with `generateCSV()` and `downloadCSV()`
- `ExportButton.tsx` component
- UTF-8 BOM prefix, RFC 4180 quoting, formula injection prevention
- Filename format: `chess-il-{clubName}-{date}.csv`
- Verification in Microsoft Excel on Windows

### Phase Ordering Rationale

- **Phase 1 before Phase 2** because the UI cannot be tested without working API endpoints. The 3-step scraping flow is the highest-risk unknown and must be validated first.
- **Phase 2 before Phase 3** because export requires a working results table with selection state. Building export in isolation would need mock data and deferred integration testing.
- **Phases are additive:** Phase 1 delivers a testable API. Phase 2 delivers a usable search page. Phase 3 delivers the export workflow. Each phase is independently deployable and valuable.
- **Parallelism opportunity:** The CSV utility (`csv.ts`) is a pure function with no dependencies on the UI. It could be built and unit-tested during Phase 1 or Phase 2, then wired into the ExportButton in Phase 3.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** The 3-step ASP.NET postback flow should be spiked first. The form field names are documented in the research but should be re-verified at build time. Pagination behavior (whether results beyond 250 require page navigation) needs runtime confirmation with a large club.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Standard React page with hooks, form, and table. All patterns exist in the current codebase (see `usePlayerSearch`, `HomePage`). The only nuance is `React.memo` for table row performance.
- **Phase 3:** Client-side CSV generation is well-documented with clear implementation patterns. The BOM and quoting requirements are fully specified in the research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new dependencies. All technologies are already installed and proven in the codebase. Verified against live chess.org.il on 2026-04-24. |
| Features | HIGH | Feature scope is well-defined. Source site capabilities verified via live scraping. Competitor analysis confirms differentiation. Anti-features explicitly scoped out. |
| Architecture | HIGH | Architecture follows existing codebase patterns exactly. File structure, component boundaries, and data flow are clearly mapped. Build order accounts for dependencies. |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls (ASP.NET flow, BOM encoding, column indices) are well-documented with clear mitigations. The pagination question (Pitfall 4) may not apply -- research found up to 250 rows in a single response with no pagination detected, but this needs confirmation with more clubs. Netlify timeout risk is real but manageable. |

**Overall confidence:** HIGH

### Gaps to Address

- **Pagination behavior:** The advanced search results appear to return all rows (up to 250) in a single response with no GridView pagination. This was observed but not exhaustively tested across all clubs. During Phase 1 implementation, verify with the largest clubs (search with no age filter to maximize results). If pagination is present, implement the iterative ViewState chain described in Pitfall 4.

- **Club list source URL:** STACK.md and ARCHITECTURE.md reference scraping the club list from the advanced search page dropdown (~200 clubs). PITFALLS.md mentions an alternative: `/Clubs/SearchClubs.aspx` which has ~110 clubs in a simple table (single GET, no postback). These may be different lists (200 vs 110). During Phase 1, evaluate which source is more complete and reliable.

- **Netlify Function timeout in production:** Local testing will not reveal timeout issues. The first production deployment of the search endpoint should include timing instrumentation to measure actual 3-step round-trip duration. If consistently above 8 seconds, consider the club list optimization (cache club list to eliminate one round-trip from the search flow).

- **Searchable club dropdown:** The UX pitfalls section recommends a searchable/filterable dropdown (combobox) for the 200-club list. This is not in the current stack research. A native `<select>` works but is a poor UX for 200 items. During Phase 2 planning, decide whether to implement a custom combobox or use a lightweight library like `downshift` (~6KB).

## Sources

### Primary (HIGH confidence)
- chess.org.il SearchPlayers.aspx -- Live tested on 2026-04-24. Form fields, club dropdown, results table structure all verified via actual HTTP requests
- chess.org.il SearchClubs.aspx -- Verified club list page structure (single GET, ~110 clubs)
- Existing codebase (`src/scraper/search.ts`, `src/api/routes/player.ts`, `client/src/hooks/`) -- Validated patterns for reuse
- [MDN Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob) -- Browser-native CSV generation
- Commit `e6ae38e` -- Historical evidence of column index drift in the same codebase

### Secondary (MEDIUM confidence)
- [PayloadCMS Issue #13929](https://github.com/payloadcms/payload/issues/13929) -- Hebrew CSV BOM requirement
- [Netlify Functions timeout guide](https://answers.netlify.com/t/support-guide-why-is-my-function-taking-long-or-timing-out/71689) -- Timeout limits
- [ASP.NET scraping pagination patterns](https://toddhayton.com/2015/05/04/scraping-aspnet-pages-with-ajax-pagination/) -- ViewState chain requirements
- [FIDE Advanced Search](https://ratings.fide.com/advseek.phtml), [USCF Player Search](https://new.uschess.org/players/search) -- Feature comparison references

### Tertiary (LOW confidence)
- Pagination behavior on advanced search -- Observed no pagination on tested clubs, but not exhaustively verified across all 200 clubs. Needs runtime validation.

---
*Research completed: 2026-04-24*
*Ready for roadmap: yes*

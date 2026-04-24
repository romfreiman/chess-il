# Pitfalls Research

**Domain:** Club player search, batch loading, and CSV export for existing chess federation scraping dashboard
**Researched:** 2026-04-24
**Confidence:** MEDIUM-HIGH (existing scraper patterns validated from codebase; ASP.NET advanced search requires runtime exploration; CSV/Hebrew encoding well-documented)

## Critical Pitfalls

### Pitfall 1: ASP.NET Advanced Search Panel Requires Double-Postback to Reveal Form Fields

**What goes wrong:**
The chess.org.il SearchPlayers.aspx page hides the club dropdown, age fields, and other advanced filters behind a "advanced search" link (`ctl00$ContentPlaceHolder1$AdvancedSearchLinkButton`) that triggers a `__doPostBack`. The advanced search form fields do not exist in the initial HTML -- they are rendered server-side only after the postback response. Developers who GET the page, parse the form, and POST a search will find no club or age fields available. The search silently executes with no filters applied, returning incorrect/unfiltered results.

**Why it happens:**
The existing `search.ts` in the codebase already handles the two-step GET-then-POST pattern for name search, so developers assume the same pattern works for advanced search. But advanced search requires a three-step process: (1) GET the page, (2) POST to expand the advanced panel (sending the AdvancedSearchLinkButton event target), (3) parse the expanded form to discover the actual field IDs for club dropdown and age inputs, then (4) POST again with the search criteria. This is a three-roundtrip operation, not two.

**How to avoid:**
- During development, perform the AdvancedSearchLinkButton postback manually and capture the full response HTML. Identify the exact ASP.NET control IDs for the club dropdown (`ctl00$ContentPlaceHolder1$...`), age min/max inputs, and the search button.
- Store these discovered field IDs in a constants file. Document them with comments noting they were extracted from runtime inspection.
- Build a dedicated `searchByClub()` function (not reuse `searchPlayers()`) that performs the three-step flow: GET -> POST (expand panel) -> POST (execute search).
- Cache the ViewState and EventValidation between steps within a single request flow -- each step returns new hidden field values that must be used in the next step.
- Write an integration test that verifies the advanced search panel expansion returns the expected form fields.

**Warning signs:**
- Search returns the same results regardless of club selection
- Form POST returns an empty result set when filters are applied
- `__EVENTVALIDATION` mismatch errors from ASP.NET (the validation token doesn't include the advanced fields because the panel was never expanded)

**Phase to address:**
Phase 1 (Club Search Scraping) -- This is the foundational challenge. Must be solved before any UI work begins. Spike the three-step postback flow first.

---

### Pitfall 2: Netlify Function Timeout on Club Search (10s Default, 26s Max)

**What goes wrong:**
A club search involves: (1) GET SearchPlayers.aspx (~2-3s), (2) POST to expand advanced panel (~2-3s), (3) POST with club filter (~2-3s), total ~6-9s minimum on the happy path. On Netlify's free tier, the default function timeout is 10 seconds. With cold start overhead (1-3s) and geographic latency to Israeli servers, the search routinely times out. Users see a 502 or empty results with no explanation.

**Why it happens:**
The existing single-player scrape (`scrapePlayer()`) usually completes in 3-5s because it's one GET request. The club search triples the number of roundtrips. Developers test locally (fast, no cold start, no geographic latency) and don't encounter timeouts until production deployment.

**How to avoid:**
- Separate the club list from the search. Scrape and cache the club list from `/Clubs/SearchClubs.aspx` (which is a single GET returning ~110 clubs in one page with no pagination). Store it in Supabase with a 24-hour freshness window. Serve it from cache on subsequent requests. This is fast (single GET) and eliminates one source of latency.
- For the player search by club: keep the three-step flow but set aggressive per-request timeouts (5s each, 15s total). If any step fails, return cached results if available or a clear error.
- Consider pre-caching club search results: when a club search completes, cache the result in Supabase keyed by `club_id + age_range`. Subsequent identical searches hit cache.
- Monitor actual response times from chess.org.il in production logs. If consistently above 8s total, evaluate Netlify Background Functions or Edge Functions with SSE for the search endpoint.

**Warning signs:**
- Search requests returning 502 in production but working locally
- Netlify function logs showing timeout at exactly 10s
- Inconsistent behavior: sometimes works (warm function + fast chess.org.il), sometimes doesn't

**Phase to address:**
Phase 1 (Backend API) -- The club list caching and search timeout strategy must be designed before building the API endpoint. Test the three-step round-trip time against chess.org.il early.

---

### Pitfall 3: CSV Export with Hebrew Characters Opens as Gibberish in Excel

**What goes wrong:**
Client-side CSV generation produces a UTF-8 file. When users open it in Microsoft Excel on Windows (the dominant use case for Israeli users), Hebrew text renders as garbled characters (mojibake). Player names like "אנדי פריימן" appear as "×?× ×??×? ×?×?×?×?×?×?". The user blames the dashboard, not Excel.

**Why it happens:**
Excel on Windows defaults to ANSI/Windows-1255 encoding when opening CSV files. It does not auto-detect UTF-8 unless a BOM (Byte Order Mark, `\uFEFF`) is prepended. Developers test by opening the CSV in VS Code, Google Sheets, or a text editor (all of which handle UTF-8 correctly) and assume it works everywhere. The specific issue with Hebrew is worse than Latin-script languages because every character becomes multi-byte gibberish, making the entire file unreadable.

**How to avoid:**
- Always prepend the UTF-8 BOM character (`\uFEFF`) to the CSV content string before creating the Blob:
  ```typescript
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  ```
- Set the filename with a `.csv` extension and include the `charset=utf-8` MIME parameter.
- Test the generated CSV file by opening it directly in Microsoft Excel (not "Import" -- "Open"). Verify Hebrew text displays correctly.
- Add a tooltip or small note next to the export button in Hebrew: "If characters appear garbled, use Data > From Text/CSV in Excel" as a fallback.
- Call `URL.revokeObjectURL()` after download to prevent memory leaks in the SPA.

**Warning signs:**
- Hebrew text appears as `Ã—` sequences or question marks in Excel
- CSV looks correct in Google Sheets but broken in Excel
- Users report "the file is corrupted"

**Phase to address:**
Phase 3 (CSV Export) -- This is a single-point-of-failure for the entire export feature. Must be tested with actual Excel on Windows, not just in-browser validation.

---

### Pitfall 4: Pagination in Search Results -- Missing Players from Large Clubs

**What goes wrong:**
chess.org.il's search results page uses ASP.NET GridView pagination (`__doPostBack` for page navigation). A large club might have 100+ registered players, but the GridView only shows 10-20 per page. The existing `searchPlayers()` function already limits to 10 results and only parses the first page. For the club search feature, returning only the first page silently omits the majority of a club's players. The user selects what they think is "all players from Club X" but it's only 10-20%.

**Why it happens:**
The existing search function was designed for name search where 10 results is usually sufficient. Developers reuse the same parsing logic for club search without considering that club search should return ALL players. ASP.NET GridView pagination requires extracting `__EVENTTARGET` values for page links and making additional POSTs with updated ViewState for each page -- this is significantly more complex than parsing the first page.

**How to avoid:**
- After parsing the first page of results, check for pagination controls (look for a `tr` with class `GridPager` in the results table -- the existing parser already knows to skip this row via `.not('.GridPager')`). Extract the total page count from the pager.
- Implement iterative pagination: for each subsequent page, extract the `__EVENTTARGET` value from the page number link, POST with the current ViewState/EventValidation, and parse the next page.
- Set a hard cap on pages (e.g., 10 pages = ~200 players max) to prevent runaway scraping. Most clubs have 20-80 players.
- Show a progress indicator on the frontend ("Loading page 2 of 5...") if pagination takes multiple seconds.
- Each page request requires the ViewState from the PREVIOUS response -- not the original page load. Failing to update ViewState between pagination steps is the most common cause of `__EVENTVALIDATION` errors.

**Warning signs:**
- Club with 80 known players only showing 10-20 in results
- Pagination links visible in raw HTML but not being followed
- `__EVENTVALIDATION` errors when attempting to load page 2+
- Inconsistent result counts between browser and scraper for the same search

**Phase to address:**
Phase 1 (Search Scraping) -- Pagination support must be designed into the search scraper from the start. The single-page limit of the existing `searchPlayers()` is a known limitation that this feature explicitly needs to overcome.

---

### Pitfall 5: Select-All Checkbox Triggers Full Table Re-render on 100+ Rows

**What goes wrong:**
A naive "select all" checkbox implementation stores selection state as `selectedIds: Set<number>` in a parent component and passes `isSelected` as a prop to each row. When "select all" is clicked, the Set changes, the parent re-renders, and ALL 100+ row components re-render even though each individual row's visual state is trivially changing from unchecked to checked. On mobile (375px, lower-end devices), this causes visible lag (200-500ms) and janky checkbox animation.

**Why it happens:**
React's default rendering behavior is to re-render all children when parent state changes. Developers implement the "obvious" approach (state in parent, props to children) without considering that 100+ simultaneous checkbox state changes is a performance-critical operation on mobile.

**How to avoid:**
- Wrap row components in `React.memo()` to prevent re-renders when props haven't changed.
- Use `useCallback` for the `onToggle` handler so the function reference is stable between renders.
- Pass only `isSelected: boolean` as a prop to each row (not the full `selectedIds` Set). This allows `React.memo` to short-circuit re-renders for rows whose selection state didn't actually change.
- For "select all": update state in a single batch. React 18's automatic batching handles this, but verify it's not being broken by async code or event handlers outside React's scope.
- If the table exceeds 200 rows, consider virtualization with `react-window` or `@tanstack/virtual`. For the expected 100-150 rows per club, this is likely unnecessary but should be kept as an escape hatch.
- Paginate the table UI (20-30 rows per page) regardless of virtualization. This naturally caps the re-render cost and makes the table more usable on mobile.

**Warning signs:**
- Visible delay (>100ms) when clicking "select all" on a full club list
- React DevTools Profiler showing 100+ component renders on a single click
- Checkbox animation stuttering on mobile devices
- Users double-clicking "select all" because the first click appears unresponsive

**Phase to address:**
Phase 2 (Search Results UI) -- When building the table component with checkboxes. Use `React.memo` from the start, not as an optimization afterthought.

---

### Pitfall 6: Rate Limiting -- Scraping 100+ Players' Full Data Hammers chess.org.il

**What goes wrong:**
The user searches for a club, sees 80 players, selects all, and the system attempts to load full player data for each one. If this triggers 80 concurrent scrape requests to chess.org.il (to get ratings, tournament history, etc.), the site may rate-limit or block the dashboard's IP. Even if not blocked, 80 simultaneous requests from one IP to a small Israeli website is poor citizenship and could degrade the site for other users.

**Why it happens:**
The search results already contain basic player info (name, ID, rating, club) directly from the search page. Developers assume they need to scrape each player's individual page to get "full" data. But for the CSV export use case, the search results table already has all the fields needed (name, ID, rating, club, possibly birth year or rank).

**How to avoid:**
- Identify what data the search results table provides. The existing `searchPlayers()` parser already extracts: `id, name, rating, club, grade` from the search results table. For the CSV export, this might be sufficient without ever visiting individual player pages.
- If additional data IS needed (birth year, rank, detailed rating), batch the requests: process 3-5 players at a time with 1-2 second delays between batches. Use a queue pattern, not `Promise.all()` on the entire list.
- Cache results: players found via club search should populate the same Supabase cache used by individual player lookups. If a player was already cached and fresh (<24h), skip the scrape entirely.
- Display a clear progress indicator: "Loading player details: 15 of 80..." so users understand why it's taking time.
- Consider making the "load full details" an opt-in action separate from the CSV export. The basic CSV (from search results data) should be instant; the enriched CSV (with full player data) should be a separate, slower operation.

**Warning signs:**
- chess.org.il starts returning 403 or CAPTCHA pages
- Burst of 100+ requests visible in server logs within seconds
- Users reporting "site is down" because the dashboard exhausted chess.org.il's capacity
- Netlify function hitting concurrent execution limits

**Phase to address:**
Phase 1 (Architecture Decision) -- Decide whether CSV export needs full player data or just search result data. This architectural choice cascades through the entire feature design. Default to using search results data.

---

### Pitfall 7: Age Calculation Edge Cases with Birth Year Only

**What goes wrong:**
chess.org.il stores birth year (e.g., 2015), not full birth date. Age calculation as `currentYear - birthYear` is off by 0-1 years depending on whether the player has had their birthday this year. An age filter for "under 12" could include or exclude borderline players depending on the month. Users running this for tournament registration or team selection get wrong ages for some players, leading to eligibility disputes.

**Why it happens:**
Birth year is the only data available from chess.org.il (confirmed from the existing `PlayerInfo.birthYear: number | null` type in the codebase). Developers implement the simple subtraction and don't document the +/- 1 year ambiguity.

**How to avoid:**
- Display the calculated age with a visual indicator of ambiguity: "11-12" or "~11" instead of "11" or "12".
- For age range filters, include the boundary: if the user filters "under 12", include players whose birth year could make them 11 OR 12 (i.e., `currentYear - birthYear` equals 11 or 12). Document this in the UI: "ages are approximate (based on birth year)".
- In the CSV export, include both the raw birth year column AND the calculated approximate age column, so users can make their own determination.
- Use the Hebrew label "גיל משוער" (approximate age) not just "גיל" (age) throughout the UI.

**Warning signs:**
- Users complaining that a known 11-year-old appears as 12 (or vice versa)
- Age filter excluding players it should include
- Confusion when CSV age doesn't match the player's known age

**Phase to address:**
Phase 2 (UI) -- When building the age filter and display. The ambiguity should be surfaced in the UI design, not hidden.

---

### Pitfall 8: Club List Staleness -- Clubs Created/Renamed After Cache

**What goes wrong:**
The club list is scraped from `/Clubs/SearchClubs.aspx` and cached. If a new club is registered with the Israeli Chess Federation, or an existing club changes its name, the cached list becomes stale. Users searching for a newly registered club don't find it. More subtly, if the cached club name doesn't match the club name in search results (because the site uses slightly different formatting), the UI displays inconsistent names.

**Why it happens:**
Club data changes infrequently (maybe a few times per year), so developers cache aggressively. But the cache invalidation period matters: if it's 24 hours, a new club shows up within a day; if it's "until server restart" or hardcoded, it could be stale for weeks.

**How to avoid:**
- Cache the club list with the same 24-hour freshness window used for player data. The existing `isStale()` function in `db/index.ts` can be reused.
- Store clubs in their own Supabase table (`clubs`) with `club_id`, `name`, `city`, `updated_at`. Upsert on each refresh.
- Add a "refresh club list" mechanism: either a manual button or automatic refresh on page load if stale.
- For the club dropdown, always use the club name from the SEARCH RESULTS (not from the cached club list) when displaying individual players, to avoid name mismatches.

**Warning signs:**
- User reports a club is missing from the dropdown
- Club name in dropdown doesn't match club name in search results
- Club list hasn't changed in weeks despite known changes

**Phase to address:**
Phase 1 (Club List Scraping) -- Build caching with clear freshness semantics from the start. A 24-hour TTL is reasonable.

---

### Pitfall 9: CSV Field Delimiter Conflicts with Hebrew Comma Usage

**What goes wrong:**
Standard CSV uses commas as delimiters. Hebrew text in chess club names, player names, or tournament names may contain commas (e.g., "מועדון שחמט עירוני ת"א ע"ש סול וסיסי מרק" -- and some names contain commas). If fields are not properly quoted in the CSV, the comma in a club name splits the value across multiple columns. The CSV structure is corrupted and every column after the problematic field shifts right.

**Why it happens:**
Developers build CSV with simple string concatenation (`values.join(',')`) without quoting fields that contain commas, newlines, or quote characters.

**How to avoid:**
- Follow RFC 4180: wrap every text field in double quotes. Escape any double quotes within the field by doubling them (`"` becomes `""`).
- Implement a proper `escapeCSVField()` utility:
  ```typescript
  function escapeCSVField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
  ```
- Better yet: wrap ALL fields in double quotes unconditionally. This is slightly more verbose but eliminates edge cases entirely.
- Test with actual club names from chess.org.il that contain quotes (e.g., `ע"ש` is common in Hebrew naming conventions and contains a double-quote character).

**Warning signs:**
- Columns misaligned when opening CSV in Excel
- Player data appearing in wrong columns
- Quote characters (`"`) visible inside cell values in unexpected places

**Phase to address:**
Phase 3 (CSV Export) -- The CSV generation utility must handle quoting correctly from the first implementation.

---

### Pitfall 10: Search Results Table Column Index Drift Across Pages

**What goes wrong:**
The existing `search.ts` parser uses hardcoded column indices to extract data from the results table (e.g., `cells.eq(1)` for name, `cells.eq(6)` for club, `cells.eq(9)` for rating). The advanced search results page may have a different column layout than the basic name search results. Even a single extra column (like a checkbox column, or a "select" column that appears in advanced search mode) shifts all subsequent indices, causing the parser to extract wrong data from wrong columns -- player names in the club field, ratings in the grade field, etc.

**Why it happens:**
The existing parser was built and validated against the basic name search result table. When the same parser is reused for advanced (club) search results, no one re-validates the column indices. The bug manifests as "data looks slightly wrong" rather than a hard error, making it easy to miss.

**How to avoid:**
- Parse the table header row first and build a column-name-to-index mapping dynamically:
  ```typescript
  const headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  const nameCol = headers.indexOf('שם');
  const ratingCol = headers.indexOf('מד כושר');
  ```
- Use this mapping for all cell access instead of hardcoded indices.
- Add a validation step that verifies expected columns exist in the header. If critical columns are missing, throw a descriptive error rather than silently parsing wrong data.
- The existing codebase already experienced this: commit `e6ae38e` fixed "correct club column index in search scraper (6 not 7)" -- the same class of bug will recur with the advanced search results.

**Warning signs:**
- Data appears to be "shifted" -- club names appearing in the rating column
- Parser extracts HTML or links where plain text is expected
- Known player's data doesn't match when found via club search vs. name search

**Phase to address:**
Phase 1 (Search Scraping) -- Build header-based column detection into the new search parser. Do not reuse hardcoded indices from the existing `search.ts`.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reusing `searchPlayers()` for club search | Less code, familiar pattern | Wrong column indices, no pagination, 10-result limit; will need full rewrite | Never -- build a dedicated `searchByClub()` from the start |
| Simple `values.join(',')` CSV generation | Minimal code, fast to implement | Broken CSV for any field containing commas or quotes; `ע"ש` in club names will break it immediately | Never -- proper quoting takes 5 minutes to implement |
| Hardcoding the 110 clubs as a static array | No scraping needed, instant load | Stale within months when clubs are added/renamed/closed | MVP only if club scraping proves unreliable; plan to replace within first month |
| Skipping `React.memo` on table rows | Simpler component structure | 100+ row re-renders on every checkbox change; mobile lag | Never for tables > 20 rows with interactive elements |
| `Promise.all()` for batch player loading | Maximum parallelism, fastest total time | Hammers chess.org.il, risks IP ban, spikes server load | Never -- always use sequential or small-batch processing with delays |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| chess.org.il Advanced Search | Attempting to POST club/age filters without first expanding the advanced panel via postback | Three-step flow: GET page -> POST AdvancedSearchLinkButton -> POST with filters. Each step uses ViewState from previous response. |
| chess.org.il Search Pagination | Reusing the initial page's ViewState for page 2+ requests | Each page response returns a new ViewState that must be used for the NEXT page request. Treat ViewState as session state, not a static token. |
| chess.org.il Club List | Scraping from SearchPlayers.aspx dropdown (requires advanced panel expansion) | Scrape from `/Clubs/SearchClubs.aspx` instead -- single GET, all ~110 clubs in one table, no pagination, no postback needed. |
| CSV Blob download | Creating Blob without UTF-8 BOM; using `text/plain` MIME type | Prepend `\uFEFF` BOM; use `text/csv;charset=utf-8;` MIME type; call `URL.revokeObjectURL()` after download |
| CSV in Excel | Testing CSV in Google Sheets, VS Code, or Mac Preview (all handle UTF-8 correctly) | Must test in Microsoft Excel on Windows -- the primary target for Israeli users. Excel requires BOM for Hebrew. |
| React table with checkboxes | Passing entire `selectedIds` Set as prop to every row | Pass only `isSelected: boolean` per row; keep Set in parent; use `React.memo` on row components |
| Birth year to age | Using `new Date().getFullYear() - birthYear` and displaying as exact age | Display as approximate: "~11" or "11-12"; document ambiguity; include raw birth year in CSV |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading full player data for all 100 search results before displaying table | 30+ second load time; user sees nothing while data loads | Display search results immediately (name, ID, rating from search table); load full data only on demand or for CSV export | Any club with >20 players |
| Three-step postback for every club search request | 6-9 second minimum per search; feels broken compared to existing instant name search | Cache club list separately; cache search results by club+age; serve from cache when fresh | Every club search request; especially on cold starts |
| Client-side CSV generation for 500+ rows with full player data | Browser freeze during Blob creation; memory spike | Cap at reasonable limit (200 players per export); for larger sets, paginate or generate server-side | Unlikely for chess clubs (most are <150) but theoretically possible |
| Un-memoized table rows with checkbox state | Visible lag on "select all" click; checkbox animation drops frames | `React.memo` + `useCallback` + per-row `isSelected` prop | Tables with >30 rows; noticeable at 50+ on mobile |
| Re-fetching club list on every page navigation | Unnecessary network request; flash of empty dropdown | Cache in React state/context; only refetch when stale (check `updated_at` from API response meta) | Every navigation to the club search page |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Not sanitizing player data before CSV export | CSV injection: a malicious player name like `=CMD("calc")` could execute commands when opened in Excel | Prefix fields starting with `=`, `+`, `-`, `@` with a single quote or tab character to prevent formula injection |
| Exposing the full search endpoint without rate limiting | Attacker could enumerate all players in the federation by automating club searches | Rate-limit search endpoint: max 10 searches per minute per IP; return 429 with Retry-After header |
| Including internal IDs or system data in CSV export | Leaking Supabase row IDs, cache timestamps, or scraping metadata | Export only user-facing fields: name, player ID, rating, club, birth year, approximate age, rank |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Club dropdown without search/filter | Users must scroll through 110 Hebrew club names to find theirs; alphabetical ordering may not match user expectation (Hebrew sort order) | Use a searchable/filterable dropdown (combobox pattern) that filters as the user types |
| Showing "0 results" without explanation for the first search | Users don't know they need to select a club first; empty state looks like an error | Show instructional text initially: "Select a club and click search" in Hebrew; only show "0 results" after an actual search |
| CSV filename without Hebrew context | Generic `export.csv` doesn't tell user what club/filter was used | Name file with context: `שחקני_מועדון_רעננה_2026-04-24.csv` (club name + date) |
| Select-all checkbox behavior after filtering | User filters by age, selects all (thinks: "all filtered"), removes filter, still sees all selected -- confused whether "all" means filtered or total | Clear selection when filter changes; or visually distinguish "X of Y selected (filtered)" |
| No loading state between search button click and results display | User clicks search, nothing happens for 3-8 seconds, clicks again, triggers duplicate request | Show skeleton loading state immediately; disable search button during loading; debounce duplicate clicks |
| Age filter with no indication of approximate ages | User sets "max age: 12", expects exactly 12-year-olds, gets some 13-year-olds because birth year math is imprecise | Label filter as "approximate age (by birth year)" in Hebrew; show tooltip explaining the +/- 1 year range |

## "Looks Done But Isn't" Checklist

- [ ] **CSV Hebrew encoding:** Open the exported CSV in Microsoft Excel on Windows (not Google Sheets) -- Hebrew text should be readable without any manual encoding steps
- [ ] **CSV with quotes in names:** Export a club whose name contains `ע"ש` (very common in Hebrew naming) -- the double quote must not break CSV column structure
- [ ] **Club search with pagination:** Search for a large club (find one with 50+ players on chess.org.il) -- verify ALL players appear, not just the first page
- [ ] **Advanced search panel fields:** Verify the club dropdown and age fields are actually present in the expanded panel's HTML -- the field IDs may not be what you expect
- [ ] **Select all + export count:** Select all 80 players, export CSV -- CSV should have exactly 80 data rows plus header, not 10 or 20
- [ ] **Age filter boundary:** A player born in 2014 should appear in both "under 11" and "under 12" searches (because they could be either age depending on birth month)
- [ ] **Empty club search:** Search for a club with 0 registered players -- should show clear "no players found" message in Hebrew, not an error or blank page
- [ ] **Mobile table scrolling:** 100-row table with checkboxes at 375px width -- table should be horizontally scrollable; checkboxes should remain interactive; header should stay visible
- [ ] **CSV formula injection:** Try exporting a player whose name starts with `=` -- the CSV field must be escaped to prevent Excel formula injection
- [ ] **Concurrent searches:** Click search, then quickly change club and click search again -- should cancel previous request, not show stale results from the first search or duplicate rows
- [ ] **Club list cache:** After 24 hours, the club dropdown should refresh automatically -- verify it doesn't serve a stale list indefinitely

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Advanced search postback failure | MEDIUM | Capture raw HTML from chess.org.il in browser DevTools; identify new field IDs; update constants in search scraper; redeploy |
| CSV Hebrew encoding broken in Excel | LOW | Add `\uFEFF` BOM prefix to CSV Blob content; redeploy; no data loss since export is stateless |
| CSV delimiter corruption from unquoted fields | LOW | Implement proper RFC 4180 quoting in `escapeCSVField()`; redeploy; no stored data affected |
| Missing players from unpaginated results | MEDIUM | Add pagination loop to search scraper; re-test with large clubs; may require ViewState/EventValidation chain debugging |
| chess.org.il IP block from over-scraping | HIGH | Contact chess.org.il to request unblock; implement request throttling (2s delay between requests); add per-IP rate limiting; consider respectful crawl-delay |
| Column index drift after site update | LOW | Switch to header-based column detection; re-map columns from header text; redeploy |
| Netlify function timeout on search | MEDIUM | Add search result caching; optimize three-step flow with persistent cookies/session; consider Background Functions |
| Select-all re-render lag | LOW | Add `React.memo` to row components; stabilize callbacks with `useCallback`; re-test on mobile |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Advanced search postback flow | Phase 1 (Club Search Scraping) | Successfully retrieve club dropdown options and execute filtered search; integration test with known club |
| Netlify function timeout on search | Phase 1 (Backend API) | Club search completes within 10s on Netlify; cached search returns in <1s |
| CSV Hebrew encoding (BOM) | Phase 3 (CSV Export) | CSV opens correctly in Microsoft Excel on Windows without manual encoding steps |
| Search result pagination | Phase 1 (Search Scraping) | Large club (50+ players) returns complete result set; row count matches browser |
| Select-all re-render performance | Phase 2 (Search Results UI) | Select-all on 100 rows completes in <100ms; no visible lag on mobile |
| Rate limiting / IP ban risk | Phase 1 (Architecture) | Batch requests throttled to 3-5 concurrent max with 1-2s delay; search results cached |
| Birth year age ambiguity | Phase 2 (UI) | Ages displayed as approximate; filter includes boundary years; birth year raw value in CSV |
| Club list staleness | Phase 1 (Club List Scraping) | Club list cached with 24h TTL; auto-refreshes on stale; new clubs appear within 24h |
| CSV delimiter/quoting | Phase 3 (CSV Export) | Fields with commas, quotes, and Hebrew text properly escaped; tested with `ע"ש` names |
| Column index drift | Phase 1 (Search Scraping) | Column detection uses header text matching, not hardcoded indices; parser throws on missing columns |

## Sources

- [CSV UTF-8 BOM for Excel compatibility](https://github.com/payloadcms/payload/issues/13929) -- Payload CMS issue documenting Hebrew display issues without BOM
- [Making UTF-8 CSV for Excel](https://www.skoumal.com/en/making-utf-8-csv-excel/) -- BOM implementation guide
- [BOM fix guide (2025)](https://splitforge.app/blog/bom-csv-fix-guide/) -- Comprehensive BOM troubleshooting
- [JavaScript CSV Export Encoding (2026)](https://copyprogramming.com/howto/javascript-to-csv-export-encoding-issue) -- Client-side CSV best practices
- [ASP.NET scraping pagination gotchas](https://toddhayton.com/2015/05/04/scraping-aspnet-pages-with-ajax-pagination/) -- ViewState chain requirements
- [Scrapy ViewState scraping tips](https://www.zyte.com/blog/scrapy-tips-from-the-pros-april-2016-edition/) -- ASP.NET form submission patterns
- [Scrapy ASP.NET pagination issue](https://github.com/scrapy/scrapy/issues/3114) -- Community discussion on postback pagination
- [React table re-render performance](https://github.com/tannerlinsley/react-table/issues/1496) -- TanStack Table issue on row selection re-renders
- [Rendering large lists in React](https://blog.logrocket.com/render-large-lists-react-5-methods-examples/) -- Virtualization and optimization strategies
- [Netlify Functions timeouts](https://answers.netlify.com/t/support-guide-why-is-my-function-taking-long-or-timing-out/71689) -- Official support guide on function timeout limits
- [Netlify Background Functions](https://docs.netlify.com/build/functions/background-functions/) -- 15-minute timeout alternative
- [Rate limiting in web scraping (2026)](https://www.scrapehero.com/rate-limiting-in-web-scraping/) -- Best practices for throttling
- [Client-side CSV download using Blob](https://riptutorial.com/javascript/example/24711/client-side-csv-download-using-blob) -- Blob pattern reference
- chess.org.il codebase analysis: existing `search.ts`, `parse.ts`, `fetch.ts`, `supabase.ts` in `/home/rfreiman/code/chess-il/src/` -- validated current scraping patterns
- chess.org.il SearchClubs.aspx: verified ~110 clubs in single-page table (no pagination needed)
- Commit `e6ae38e`: prior column index bug fix -- evidence that hardcoded indices are fragile

---
*Pitfalls research for: Chess IL Dashboard v1.1 -- Club Player Search & CSV Export*
*Researched: 2026-04-24*

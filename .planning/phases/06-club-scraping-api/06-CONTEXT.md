# Phase 6: Club Scraping & API - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend scrapes the full club list and player search results from chess.org.il's advanced search page, serving results via two new REST endpoints: `GET /api/clubs` (club list) and `GET /api/clubs/search` (player search by club and age range). No frontend work in this phase.

</domain>

<decisions>
## Implementation Decisions

### Club List Source
- **D-01:** Scrape the club dropdown from the SearchPlayers.aspx advanced search panel (~200 clubs). This is the same page used for player search, so the postback flow is familiar.
- **D-02:** `GET /api/clubs` is a separate endpoint with its own GET+postback flow to chess.org.il. Club list is independent of player search.
- **D-03:** The 2-step flow for clubs: GET SearchPlayers.aspx to get viewstate, then `__doPostBack` to expand the advanced panel and extract the club `<select>` options.

### Club Data Shape
- **D-04:** Claude's discretion on whether to include city field alongside id and name. If the dropdown `<option>` elements naturally include city grouping, include it; otherwise flat `{id, name}` is sufficient.

### Club List Caching
- **D-05:** Cache clubs in a Supabase table (persistent across Netlify Function cold starts). Guarantees fast responses after first load.
- **D-06:** Weekly TTL (7 days). Re-scrape from chess.org.il if last update was 7+ days ago. Clubs change rarely.
- **D-07:** Support force refresh via `GET /api/clubs?force=true` to bypass cache, consistent with existing player API pattern (Phase 1, D-07).

### Search Endpoint (Not Discussed — Carried Forward)
- **D-08:** `GET /api/clubs/search?club=CLUB_ID&minAge=8&maxAge=14` uses the 3-step ASP.NET postback flow: GET viewstate, expand advanced panel, POST with club and age filters.
- **D-09:** Search results are ephemeral — no caching in Supabase (per STATE.md decision).
- **D-10:** Response shape follows Phase 7 requirements: each result has name, ID, rating, club, and birth year. New shared type needed (distinct from existing `SearchResult`).
- **D-11:** Error responses follow existing pattern: `{ error: string, message: string, statusCode: number }` (Phase 1, D-06).

### Scraping Patterns (Carried Forward from Phase 1)
- **D-12:** Use axios + Cheerio for all scraping. No Puppeteer/Playwright.
- **D-13:** Custom User-Agent: `ChessIL-Dashboard/1.0 (community project)` (Phase 1, D-04).
- **D-14:** Club scraper is a separate module from existing `search.ts` (per STATE.md decision — dedicated 3-step postback flow).

### Claude's Discretion
- Specific Cheerio selectors for club dropdown and search results table (discover by inspecting live HTML)
- Timeout values for the 3-step postback flow (existing search.ts uses 15s)
- Error handling granularity within the club scraper (retry logic, partial failure handling)
- Whether to extract city from club dropdown option text or group labels
- Supabase table schema for clubs cache (table name, columns, indexing)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Scraping Code
- `src/scraper/search.ts` — Existing 2-step ASP.NET postback flow for player name search. Reference for viewstate extraction, form field naming, and response parsing patterns.
- `src/scraper/fetch.ts` — HTTP fetching pattern with User-Agent, timeout, and error handling.
- `src/scraper/parse.ts` — Cheerio HTML parsing patterns for chess.org.il pages.

### API & Types
- `src/api/routes/player.ts` — Existing Express route patterns, error response format, cache-check flow.
- `packages/shared/types.ts` — Existing shared types (SearchResult, ApiError). New club types to be added here.
- `netlify/functions/api.ts` — Netlify Function entry point. New club routes must be registered here.
- `src/dev-server.ts` — Local dev server. New club routes must be registered here too.

### Database
- `src/db/index.ts` — Database abstraction layer (Supabase + SQLite). Club cache functions to be added.
- `src/db/supabase.ts` — Supabase client setup and existing cache functions.
- `src/db/sqlite.ts` — Local SQLite fallback for development.

### Project Context
- `.planning/REQUIREMENTS.md` — CSCRP-01, CSCRP-02 are this phase's requirements
- `.planning/ROADMAP.md` — Phase 6 goal and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/scraper/search.ts` — 2-step ASP.NET postback flow (GET viewstate → POST). Phase 6 extends this to 3 steps (GET → postback to expand → POST with filters). Shared patterns: viewstate extraction, form field construction, axios config.
- `src/db/index.ts` — Database abstraction with `getCachedPlayer`, `isStale`, `upsertPlayer`. Similar functions needed for club cache.
- Error response pattern in `player.ts` — Reusable for club endpoint error handling.

### Established Patterns
- ASP.NET form field names use `ctl00$ContentPlaceHolder1$` prefix (seen in search.ts).
- All scrapers return typed results and degrade gracefully (return `[]` on error for search-like endpoints).
- Express Router pattern: `Router()` → export → mount in dev-server.ts and api.ts.
- 15s axios timeout used in existing scrapers.

### Integration Points
- `src/dev-server.ts` — Add `app.use('/api/clubs', clubRouter)` for local dev.
- `netlify/functions/api.ts` — Add `app.use('/api/clubs', clubRouter)` for production.
- `packages/shared/types.ts` — Add new `ClubInfo` and `ClubSearchResult` types.
- `src/db/index.ts` — Add club cache functions (getCachedClubs, upsertClubs).

</code_context>

<specifics>
## Specific Ideas

- The advanced search page URL is `https://www.chess.org.il/Players/SearchPlayers.aspx` — same as existing name search.
- The advanced panel expansion likely uses `__doPostBack('ctl00$ContentPlaceHolder1$AdvancedSearchLink', '')` or similar.
- Club dropdown is likely `ctl00$ContentPlaceHolder1$ClubList` or similar `<select>` element.
- Age filter fields are likely birth year inputs rather than age inputs — verify during implementation.
- Test with known club IDs to verify scraping works end-to-end.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-club-scraping-api*
*Context gathered: 2026-04-24*

# Phase 1: Data Pipeline - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete data pipeline: scrape chess.org.il player pages, parse structured data with Cheerio, cache in Supabase, and serve via a REST API endpoint. This phase delivers the foundation that all frontend phases depend on.

</domain>

<decisions>
## Implementation Decisions

### Scraping Strategy
- **D-01:** Use content-based selectors (header text, table structure, label text) rather than ASP.NET auto-generated IDs like `ctl00_ContentPlaceHolder1_*`. Fall back to structural position (nth-child) if text matching fails.
- **D-02:** Detect encoding from Content-Type header. Default to UTF-8, fall back to Windows-1255 if Hebrew characters are garbled. Verify encoding on first real scrape of chess.org.il.
- **D-03:** Optional fields (FIDE ID, expected rating, license expiry) return `null` when missing from the page. Scrape fails only if name or rating cannot be extracted — these are the minimum viable fields.
- **D-04:** Custom User-Agent header: `ChessIL-Dashboard/1.0 (community project)`

### API Response Design
- **D-05:** API response shape: `{ player: {...}, tournaments: [...], meta: { cached: boolean, stale: boolean, scrapedAt: string, cachedAt: string } }`
- **D-06:** Error responses: `{ error: string, message: string, statusCode: number }` — e.g., `{ error: "PLAYER_NOT_FOUND", message: "No player found with ID 999999", statusCode: 404 }`
- **D-07:** Force refresh via query parameter: `GET /api/player/:id?force=true` bypasses cache and re-scrapes

### Data Model
- **D-08:** Parse the result string (e.g., "+3-1=0") into separate `wins`, `losses`, `draws` integers at scrape time. Frontend should not need to parse raw result strings.
- **D-09:** Store all dates as ISO 8601 strings (e.g., "2025-03-15"). Parse `dd/MM/yyyy` format from chess.org.il during scraping, not in frontend.
- **D-10:** `isPending` boolean derived from `updateDate === "בעדכון הבא"` during parsing
- **D-11:** `ratingChange` stored as a float (can be positive or negative)

### Project Scaffolding
- **D-12:** Monorepo structure with shared TypeScript types between frontend and backend
- **D-13:** Backend runs as Netlify Functions using `serverless-http` to wrap Express
- **D-14:** Local development via `netlify dev` to simulate production function routing
- **D-15:** Supabase client uses `@supabase/supabase-js` (REST-based, no direct Postgres connections — serverless safe)

### Claude's Discretion
- Specific Cheerio selectors for each field (discover by inspecting live chess.org.il HTML during implementation)
- Error handling granularity within the scraper (retry logic, timeout values)
- Supabase table indexing strategy
- TypeScript type naming conventions
- Test structure and approach

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions, test player IDs (205001, 210498)
- `.planning/REQUIREMENTS.md` — SCRP-01..05, CACH-01..05, API-01..03 are this phase's requirements
- `.planning/research/ARCHITECTURE.md` — System architecture, component boundaries, data flow
- `.planning/research/PITFALLS.md` — Scraping fragility, encoding, serverless connection limits, date parsing pitfalls
- `.planning/research/STACK.md` — Technology choices and versions

### External
- `https://www.chess.org.il/Players/Player.aspx?Id=205001` — Live player page to inspect HTML structure during implementation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established in this phase

### Integration Points
- Shared TypeScript types (PlayerData, TournamentEntry) will be consumed by frontend in Phase 2+
- API endpoint URL pattern (`/api/player/:id`) will be called by frontend API client
- Supabase table schema (`players` table with JSONB `data` column) must be created before API can cache

</code_context>

<specifics>
## Specific Ideas

- Test with real player IDs: 205001 (Andy Freiman, ~1476 rating) and 210498 (Lenny Freiman, ~1253 rating)
- chess.org.il uses ASP.NET WebForms — player pages load via simple GET request, no JavaScript rendering needed
- The `__doPostBack` mechanism for detailed game data is explicitly out of scope — skip it entirely
- Scraper should be a pure function (HTML string in → typed data out) to enable testing with HTML fixture files

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-data-pipeline*
*Context gathered: 2026-04-19*

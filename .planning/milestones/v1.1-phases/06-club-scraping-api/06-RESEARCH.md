# Phase 6: Club Scraping & API - Research

**Researched:** 2026-04-24
**Domain:** ASP.NET WebForms scraping, Express REST API, Supabase caching
**Confidence:** HIGH

## Summary

Phase 6 adds two new backend endpoints (`GET /api/clubs` and `GET /api/clubs/search`) that scrape chess.org.il's SearchPlayers.aspx advanced search panel. Live testing confirms the 3-step ASP.NET postback flow (GET viewstate, expand advanced panel, POST with filters) completes in approximately 500-720ms total -- well within Netlify's 10-second function timeout and posing zero timeout risk.

The existing codebase provides strong patterns to follow: `src/scraper/search.ts` demonstrates the 2-step postback flow (GET + POST), and the new club scraper extends this to 3 steps. The results table uses the same `#ctl00_ContentPlaceHolder1_playersGridView` element as the existing name search, with 15 columns including birth year at index 13. The club dropdown contains exactly 200 clubs with numeric IDs and Hebrew names.

**Primary recommendation:** Build a dedicated `src/scraper/clubs.ts` module implementing the 3-step postback flow, add `ClubInfo` and `ClubSearchResult` types to shared types, cache clubs in a new Supabase `clubs` table with 7-day TTL, and expose via `src/api/routes/clubs.ts` Express router.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Scrape the club dropdown from the SearchPlayers.aspx advanced search panel (~200 clubs)
- **D-02:** `GET /api/clubs` is a separate endpoint with its own GET+postback flow to chess.org.il
- **D-03:** The 2-step flow for clubs: GET SearchPlayers.aspx to get viewstate, then `__doPostBack` to expand the advanced panel and extract the club `<select>` options
- **D-05:** Cache clubs in a Supabase table (persistent across Netlify Function cold starts)
- **D-06:** Weekly TTL (7 days). Re-scrape if last update was 7+ days ago
- **D-07:** Support force refresh via `GET /api/clubs?force=true`
- **D-08:** `GET /api/clubs/search?club=CLUB_ID&minAge=8&maxAge=14` uses the 3-step ASP.NET postback flow
- **D-09:** Search results are ephemeral -- no caching in Supabase
- **D-10:** Response shape: each result has name, ID, rating, club, and birth year. New shared type needed
- **D-11:** Error responses follow existing pattern: `{ error: string, message: string, statusCode: number }`
- **D-12:** Use axios + Cheerio for all scraping. No Puppeteer/Playwright
- **D-13:** Custom User-Agent: `ChessIL-Dashboard/1.0 (community project)`
- **D-14:** Club scraper is a separate module from existing `search.ts`

### Claude's Discretion
- Specific Cheerio selectors for club dropdown and search results table (discover by inspecting live HTML)
- Timeout values for the 3-step postback flow (existing search.ts uses 15s)
- Error handling granularity within the club scraper (retry logic, partial failure handling)
- Whether to extract city from club dropdown option text or group labels
- Supabase table schema for clubs cache (table name, columns, indexing)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CSCRP-01 | Backend scrapes club list from chess.org.il | Club dropdown verified at `#ctl00_ContentPlaceHolder1_ClubsDDL` with 200 options. 2-step flow (GET + postback to expand) confirmed working. Each option has numeric `value` (club ID) and Hebrew text (club name). |
| CSCRP-02 | Backend scrapes player search results using ASP.NET postback flow with club and age filters | 3-step flow verified: GET -> expand advanced panel -> POST with `ClubsDDL`, `AgeFromTB`, `AgeTillTB`. Results appear in `#ctl00_ContentPlaceHolder1_playersGridView` with 15 columns. Total flow takes ~500-720ms. |
</phase_requirements>

## Standard Stack

### Core (Already Installed -- No New Dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| axios | 1.15.1 | HTTP client for 3-step postback flow | Already used in fetch.ts and search.ts |
| cheerio | 1.2.0 | HTML parsing for club dropdown and results table | Already used in parse.ts and search.ts |
| express | 4.22.1 | REST API routing for /api/clubs endpoints | Already used for /api/player routes |
| @supabase/supabase-js | 2.103.3 | Club cache persistence in Supabase | Already used for player cache |
| better-sqlite3 | 12.9.0 | Local dev fallback for club cache | Already used for player cache |

### Testing
| Library | Version | Purpose |
|---------|---------|---------|
| vitest | 4.1.4 | Unit test runner | 
| supertest | 7.2.2 | HTTP endpoint testing |

**Installation:** No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
  scraper/
    clubs.ts          # NEW: 3-step postback flow (scrapeClubList + searchClubPlayers)
    search.ts         # EXISTING: 2-step player name search (unchanged)
    fetch.ts          # EXISTING: HTTP fetch utilities (unchanged)
    parse.ts          # EXISTING: Player page parser (unchanged)
  api/
    routes/
      clubs.ts        # NEW: Express router for /api/clubs and /api/clubs/search
      player.ts       # EXISTING (unchanged)
  db/
    index.ts          # MODIFY: Add club cache functions (getCachedClubs, upsertClubs)
    supabase.ts       # MODIFY: Add clubs table operations
    sqlite.ts         # MODIFY: Add clubs table operations for local dev
packages/
  shared/
    types.ts          # MODIFY: Add ClubInfo, ClubSearchResult types
netlify/
  functions/
    api.ts            # MODIFY: Register clubs router
src/
  dev-server.ts       # MODIFY: Register clubs router
tests/
  scraper/
    clubs.test.ts     # NEW: Unit tests for club scraping
  api/
    clubs.test.ts     # NEW: Route handler tests
  db/
    clubs-cache.test.ts # NEW: Club cache tests
  fixtures/
    search-advanced.html  # NEW: Saved HTML for testing
    search-results.html   # NEW: Saved HTML for testing
```

### Pattern 1: 3-Step ASP.NET Postback Flow
**What:** GET page -> POST to expand hidden panel -> POST with search filters
**When to use:** Accessing the advanced search form which is hidden behind a `__doPostBack` call
**Verified form field names and flow:**

```typescript
// Step 1: GET to obtain initial ViewState (small: ~2,756 chars)
const r1 = await axios.get(SEARCH_URL, { headers, timeout: 15000 });
const $1 = cheerio.load(r1.data);
const vs1 = $1('#__VIEWSTATE').val();
const ev1 = $1('#__EVENTVALIDATION').val();
const vsg1 = $1('#__VIEWSTATEGENERATOR').val();

// Step 2: POST to expand advanced panel (ViewState grows to ~53,372 chars)
const form2 = new URLSearchParams();
form2.append('__EVENTTARGET', 'ctl00$ContentPlaceHolder1$AdvancedSearchLinkButton');
form2.append('__EVENTARGUMENT', '');
form2.append('__VIEWSTATE', vs1);
form2.append('__EVENTVALIDATION', ev1);
form2.append('__VIEWSTATEGENERATOR', vsg1);
form2.append('ctl00$ContentPlaceHolder1$SearchNameBox', '');

// Step 3: POST with search filters
const form3 = new URLSearchParams();
form3.append('__VIEWSTATE', vs2);
form3.append('__EVENTVALIDATION', ev2);
form3.append('__VIEWSTATEGENERATOR', vsg2);
form3.append('__EVENTTARGET', '');
form3.append('__EVENTARGUMENT', '');
form3.append('ctl00$ContentPlaceHolder1$AdvancedSearchNameTextBox', '');
form3.append('ctl00$ContentPlaceHolder1$ClubsDDL', clubId);
form3.append('ctl00$ContentPlaceHolder1$AgeFromTB', String(minAge));
form3.append('ctl00$ContentPlaceHolder1$AgeTillTB', String(maxAge));
// CRITICAL: Must use correct default values for other fields
form3.append('ctl00$ContentPlaceHolder1$GenderDDL', 'ALL');
form3.append('ctl00$ContentPlaceHolder1$CitiesDDL', 'All');       // Note: capital 'A', lowercase 'll'
form3.append('ctl00$ContentPlaceHolder1$RatingFromTB', '');
form3.append('ctl00$ContentPlaceHolder1$RatingUptoTB', '');
form3.append('ctl00$ContentPlaceHolder1$ForeignDDL', 'ALL');
form3.append('ctl00$ContentPlaceHolder1$CountriesDDL', 'ALL');
form3.append('ctl00$ContentPlaceHolder1$MembershipStatusDDL', 'ALL');
form3.append('ctl00$ContentPlaceHolder1$PlayerStatusDDL', '1');   // 1 = active players
form3.append('ctl00$ContentPlaceHolder1$AdvancedSearchButton', '\u05D7\u05D9\u05E4\u05D5\u05E9'); // "חיפוש"
```

### Pattern 2: Club Dropdown Extraction (CSCRP-01)
**What:** Extract club list from the expanded advanced search panel
**After step 2, the dropdown is available:**

```typescript
// Club dropdown selector (verified)
const $2 = cheerio.load(expandResponse.data);
const clubs: ClubInfo[] = [];
$2('#ctl00_ContentPlaceHolder1_ClubsDDL option').each((_, el) => {
  const id = parseInt($2(el).attr('value') || '0', 10);
  const name = $2(el).text().trim();
  if (id > 0) { // Skip "כל המועדונים" (value="0")
    clubs.push({ id, name });
  }
});
// Returns ~199 clubs (200 options minus the "all clubs" default)
```

### Pattern 3: Search Results Table Parsing (CSCRP-02)
**What:** Parse the `playersGridView` table from step 3 results
**Column mapping (verified with live data):**

```typescript
// Results table selector (same as existing name search)
const $3 = cheerio.load(searchResponse.data);
const table = $3('#ctl00_ContentPlaceHolder1_playersGridView');

// Column indices (0-indexed):
// 0: #  (row number)
// 1: שם (name, contains <a> link with Player.aspx?Id=XXXXX)
// 2: מספר שחקן (player number)
// 3: מדינה (country)
// 4: מין (gender)
// 5: מספר תחרויות (tournament count)
// 6: מועדון (club name, contains <a> link with Club.aspx?Id=XX)
// 7: מספר בפיד"ה (FIDE number)
// 8: סטטוס (status)
// 9: מד כושר ישראלי (Israeli rating)
// 10: מד כושר פיד"ה רגיל (FIDE standard rating)
// 11: דרגה (grade)
// 12: כרטיס שחמטאי (license expiry)
// 13: שנת לידה (birth year) <-- KEY FIELD
// 14: תפקיד (role)
```

### Pattern 4: Express Router Registration
**What:** Follow existing pattern from player.ts
**Where to register:**

```typescript
// In netlify/functions/api.ts:
import { clubsRouter } from '../../src/api/routes/clubs.js';
app.use('/api/clubs', clubsRouter);

// In src/dev-server.ts:
import { clubsRouter } from './api/routes/clubs.js';
app.use('/api/clubs', clubsRouter);
```

### Pattern 5: Database Cache with TTL
**What:** Cache clubs in Supabase with 7-day TTL, following existing player cache pattern
**Schema:**

```sql
-- Supabase table
CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,          -- Array of {id, name} objects
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Single row table (clubs list is one dataset)
```

```typescript
// SQLite equivalent for local dev
db.exec(`
  CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
```

### Anti-Patterns to Avoid
- **Sending wrong default values for unused dropdowns:** Using "0" instead of "ALL" for GenderDDL, ForeignDDL, etc. causes HTTP 500 from the ASP.NET server. The correct defaults are verified in the research.
- **Including unchecked checkbox values:** `FreeOnlyCB` and `ManagersOnlyCB` checkboxes must NOT be included in the form POST when unchecked (browser behavior).
- **Caching search results:** Per D-09, search results are ephemeral. Only the club list gets cached.
- **Importing from db/supabase.ts directly in routes:** Use the db/index.ts abstraction layer to support both Supabase and SQLite.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ASP.NET ViewState handling | Custom base64/binary parser | Read `#__VIEWSTATE` value and pass through verbatim | ViewState is opaque; server validates it. Just echo it back. |
| URL encoding of form fields | Manual encoding | `URLSearchParams` (built-in) | Handles Hebrew characters and special chars correctly |
| Club list caching logic | Custom file-based cache | Supabase table + `isStaleClubs()` | Matches existing player cache pattern, survives cold starts |
| HTTP client configuration | Custom fetch wrapper | axios with same config as `search.ts` | Already established pattern with timeout, User-Agent, validateStatus |

**Key insight:** The entire postback flow is just "read hidden fields, echo them back with your filters." No ASP.NET internals need to be understood. The ViewState is opaque -- treat it as a black box string.

## Common Pitfalls

### Pitfall 1: Wrong Default Values for Dropdown Fields
**What goes wrong:** The ASP.NET server returns HTTP 500 (Runtime Error) if form fields are submitted with values not matching EventValidation expectations.
**Why it happens:** Each dropdown has a specific default value ("ALL", "All", "1", etc.) that must be sent. Using "0" or empty string for non-used fields causes validation failure.
**How to avoid:** Use these exact verified defaults:
- `GenderDDL`: `"ALL"` 
- `CitiesDDL`: `"All"` (note capitalization difference)
- `ForeignDDL`: `"ALL"`
- `CountriesDDL`: `"ALL"`
- `MembershipStatusDDL`: `"ALL"`
- `PlayerStatusDDL`: `"1"` (active -- this is the default selected value)
- `ClubsDDL`: `"0"` when searching all clubs
- `RatingFromTB`, `RatingUptoTB`: empty string `""`
**Warning signs:** HTTP 500 response from chess.org.il with "Runtime Error" page.

### Pitfall 2: Age Fields Are Ages, Not Birth Years
**What goes wrong:** Sending birth years (e.g., 2012) instead of ages (e.g., 12) to the age filter fields.
**Why it happens:** The response table contains a "שנת לידה" (birth year) column, which might suggest the filter also uses birth years.
**How to avoid:** The HTML labels are "מגיל" (from age) and "עד גיל" (to age). The API parameters `minAge` and `maxAge` map directly to `AgeFromTB` and `AgeTillTB` -- they accept actual ages.
**Warning signs:** Zero results or unexpected results when filtering.

### Pitfall 3: ViewState Grows After Panel Expansion
**What goes wrong:** The ViewState from step 1 (~2,756 chars) is tiny. After expanding the advanced panel in step 2, it grows to ~53,372 chars, and EventValidation grows to ~29,448 chars. The step 3 POST body becomes very large.
**Why it happens:** ASP.NET ViewState encodes the full form state including all dropdown options.
**How to avoid:** This is normal behavior. Ensure no payload size limits interfere (axios handles this fine). The POST body will be approximately 85KB.
**Warning signs:** Truncated form data, timeouts on very slow connections.

### Pitfall 4: Server-Side Result Cap at 250 Rows
**What goes wrong:** Large clubs or broad age ranges may return more than 250 matching players, but the server only returns the first 250.
**Why it happens:** chess.org.il has a built-in 250-row server-side limit with no pagination mechanism for this endpoint.
**How to avoid:** This is a known limitation documented in REQUIREMENTS.md (Out of Scope: "Server-side pagination beyond 250 rows"). The API should document this limit in its response or documentation.
**Warning signs:** Exactly 250 results returned -- indicates truncation.

### Pitfall 5: Club List Route Must Be Before Catch-All
**What goes wrong:** `GET /api/clubs/search` matches a route like `/api/clubs/:id` if defined after it.
**Why it happens:** Express routes are matched in order. If `/api/clubs/:id` exists, "search" would be captured as an ID.
**How to avoid:** Define `GET /api/clubs/search` route before any parameterized routes. This is the same pattern used in player.ts where `/search` is defined before `/:id`.
**Warning signs:** "search" being interpreted as a club ID parameter.

## Code Examples

### Club Scraper Module Structure
```typescript
// src/scraper/clubs.ts
// Source: Verified against live chess.org.il (2026-04-24)

const SEARCH_URL = 'https://www.chess.org.il/Players/SearchPlayers.aspx';
const USER_AGENT = 'ChessIL-Dashboard/1.0 (community project)';

export async function scrapeClubList(): Promise<ClubInfo[]> {
  // Step 1: GET for initial ViewState
  // Step 2: POST to expand advanced panel via __doPostBack
  // Extract clubs from #ctl00_ContentPlaceHolder1_ClubsDDL option elements
  // Skip option with value="0" (all clubs)
}

export async function searchClubPlayers(
  clubId: number, 
  minAge?: number, 
  maxAge?: number
): Promise<ClubSearchResult[]> {
  // Step 1: GET for initial ViewState
  // Step 2: POST to expand advanced panel
  // Step 3: POST with club + age filters
  // Parse results from #ctl00_ContentPlaceHolder1_playersGridView
  // Return up to 250 results
}
```

### Route Handler Pattern
```typescript
// src/api/routes/clubs.ts
// Following established pattern from player.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiError, ClubInfo, ClubSearchResult } from '../../../packages/shared/types.js';

export const clubsRouter = Router();

// GET /api/clubs - list all clubs (cached)
clubsRouter.get('/', async (req: Request, res: Response) => {
  const forceRefresh = String(req.query.force) === 'true';
  // Check cache (7-day TTL) -> scrape if stale -> return clubs
});

// GET /api/clubs/search - search players by club and age
// MUST be defined before any /:id route
clubsRouter.get('/search', async (req: Request, res: Response) => {
  const clubId = parseInt(req.query.club as string, 10);
  const minAge = req.query.minAge ? parseInt(req.query.minAge as string, 10) : undefined;
  const maxAge = req.query.maxAge ? parseInt(req.query.maxAge as string, 10) : undefined;
  
  // Validate: club is required, ages are optional positive integers
  // Scrape (no caching per D-09)
  // Return results
});
```

### Shared Types
```typescript
// packages/shared/types.ts (additions)

export interface ClubInfo {
  id: number;       // Club numeric ID from dropdown value (e.g., 6, 24, 2414)
  name: string;     // Club Hebrew name (e.g., "אליצור ירושלים")
}

export interface ClubSearchResult {
  id: number;          // Player ID (from column 2 or link href)
  name: string;        // Player name (column 1)
  rating: number | null;  // Israeli rating (column 9)
  club: string;        // Club name (column 6)
  birthYear: number | null;  // Birth year (column 13)
}
```

### Database Cache Functions
```typescript
// src/db/supabase.ts (additions)

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function isClubsCacheStale(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() > SEVEN_DAYS;
}

export async function getCachedClubs(): Promise<{ data: ClubInfo[]; updated_at: string } | null> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', 1)
    .single();
  if (error || !data) return null;
  return data;
}

export async function upsertClubs(clubs: ClubInfo[]): Promise<void> {
  const { error } = await supabase
    .from('clubs')
    .upsert({ id: 1, data: clubs, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) throw error;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 2-step postback (search.ts) | 3-step postback (clubs.ts) | Phase 6 | Need GET + expand panel + POST instead of just GET + POST |

**No deprecations or API changes** -- chess.org.il is a legacy ASP.NET WebForms site that has been stable. The same patterns from Phase 1 still work.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CSCRP-01 | Club list scraping from advanced search dropdown | unit | `npx vitest run tests/scraper/clubs.test.ts -x` | No - Wave 0 |
| CSCRP-01 | GET /api/clubs returns cached or fresh club list | unit | `npx vitest run tests/api/clubs.test.ts -x` | No - Wave 0 |
| CSCRP-01 | Club cache with 7-day TTL in Supabase/SQLite | unit | `npx vitest run tests/db/clubs-cache.test.ts -x` | No - Wave 0 |
| CSCRP-02 | Player search with club + age filters (3-step postback) | unit | `npx vitest run tests/scraper/clubs.test.ts -x` | No - Wave 0 |
| CSCRP-02 | GET /api/clubs/search validates params and returns results | unit | `npx vitest run tests/api/clubs.test.ts -x` | No - Wave 0 |
| CSCRP-02 | Error responses for invalid/missing parameters | unit | `npx vitest run tests/api/clubs.test.ts -x` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/scraper/clubs.test.ts` -- covers CSCRP-01 (club list parsing) and CSCRP-02 (search result parsing)
- [ ] `tests/api/clubs.test.ts` -- covers CSCRP-01 and CSCRP-02 (route handler tests)
- [ ] `tests/db/clubs-cache.test.ts` -- covers CSCRP-01 (club cache operations)
- [ ] `tests/fixtures/search-advanced.html` -- saved HTML fixture of expanded advanced search panel
- [ ] `tests/fixtures/search-results.html` -- saved HTML fixture of search results

## Open Questions

1. **Club dropdown: city information?**
   - What we know: The `<option>` elements contain only `value` (numeric ID) and text (club name). There is no city grouping, `<optgroup>`, or city suffix in the option text.
   - What's unclear: Nothing -- verified. No city data available from this source.
   - Recommendation: Use flat `{id, name}` shape per D-04 fallback. City is not available from the dropdown.

2. **Supabase table creation**
   - What we know: The existing `players` table was created manually in Supabase dashboard. The `clubs` table will need the same.
   - What's unclear: Whether to include table creation SQL in the plan as a manual step.
   - Recommendation: Include SQL migration as documentation. For SQLite, auto-create via `CREATE TABLE IF NOT EXISTS` (same as existing pattern).

## Project Constraints (from CLAUDE.md)

- **Tech Stack:** React + TypeScript + Tailwind CSS + Recharts (frontend), Node.js + Express (backend), Cheerio (scraping), Supabase (database/cache)
- **Deployment:** Netlify hosting (10-second function timeout on free plan)
- **Scraping:** No Puppeteer/Playwright -- use axios + Cheerio only
- **User-Agent:** `ChessIL-Dashboard/1.0 (community project)`
- **GSD Workflow:** All changes must go through GSD commands

## Verified Live Data Reference

**Source URL:** `https://www.chess.org.il/Players/SearchPlayers.aspx`
**Verified:** 2026-04-24 via live HTTP requests

### Timing (verified)
| Step | Description | Time |
|------|-------------|------|
| Step 1 | GET initial page | ~180-190ms |
| Step 2 | POST expand panel | ~140-200ms |
| Step 3 | POST search | ~135-320ms (varies with result count) |
| **Total** | **Full 3-step flow** | **~500-720ms** |

### Form Fields (verified)
| Field Name | Type | Default | Notes |
|------------|------|---------|-------|
| `ctl00$ContentPlaceHolder1$ClubsDDL` | select | `"0"` | 200 options (0 = all clubs) |
| `ctl00$ContentPlaceHolder1$AgeFromTB` | text | `""` | Actual age, not birth year |
| `ctl00$ContentPlaceHolder1$AgeTillTB` | text | `""` | Actual age, not birth year |
| `ctl00$ContentPlaceHolder1$GenderDDL` | select | `"ALL"` | ALL/M/F |
| `ctl00$ContentPlaceHolder1$CitiesDDL` | select | `"All"` | Note lowercase "ll" |
| `ctl00$ContentPlaceHolder1$RatingFromTB` | text | `""` | Israeli rating range |
| `ctl00$ContentPlaceHolder1$RatingUptoTB` | text | `""` | Israeli rating range |
| `ctl00$ContentPlaceHolder1$ForeignDDL` | select | `"ALL"` | ALL/ISR/INT |
| `ctl00$ContentPlaceHolder1$CountriesDDL` | select | `"ALL"` | ALL/ISR/INT |
| `ctl00$ContentPlaceHolder1$MembershipStatusDDL` | select | `"ALL"` | ALL/valid/invalid |
| `ctl00$ContentPlaceHolder1$PlayerStatusDDL` | select | `"1"` | 0=all, 1=active (default), 2=inactive |
| `ctl00$ContentPlaceHolder1$AdvancedSearchButton` | submit | `"חיפוש"` | Hebrew for "search" |
| `ctl00$ContentPlaceHolder1$AdvancedSearchNameTextBox` | text | `""` | Name filter (empty for club search) |
| `ctl00$ContentPlaceHolder1$FreeOnlyCB` | checkbox | unchecked | Do NOT send when unchecked |
| `ctl00$ContentPlaceHolder1$ManagersOnlyCB` | checkbox | unchecked | Do NOT send when unchecked |

### Results Table Columns (verified)
| Index | Hebrew Header | English | How to Extract |
|-------|---------------|---------|----------------|
| 0 | # | Row number | Skip |
| 1 | שם | Name | `.find('a').text()`, href contains `Player.aspx?Id=XXXXX` |
| 2 | מספר שחקן | Player ID | `.text().trim()` |
| 6 | מועדון | Club | `.text().trim()` |
| 9 | מד כושר ישראלי | Israeli Rating | `.text().trim()` -> parseInt |
| 13 | שנת לידה | Birth Year | `.text().trim()` -> parseInt |

### Limits
- Club dropdown: 200 entries (199 real clubs + "all clubs" default)
- Search results: Maximum 250 rows, no server-side pagination
- No pagination mechanism available

## Sources

### Primary (HIGH confidence)
- Live HTTP requests to chess.org.il/Players/SearchPlayers.aspx (2026-04-24) -- verified all form fields, selectors, column indices, timing, and result limits
- Existing codebase: `src/scraper/search.ts`, `src/scraper/fetch.ts`, `src/db/supabase.ts`, `src/api/routes/player.ts` -- established patterns
- `packages/shared/types.ts` -- existing type definitions

### Secondary (MEDIUM confidence)
- [Netlify Functions timeout documentation](https://docs.netlify.com/functions/get-started/) -- 10-second default timeout on free plan
- [Netlify Support Forums](https://answers.netlify.com/t/function-timeout-increase/53881) -- confirms timeout limits

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and proven in Phases 1-5
- Architecture: HIGH - Direct extension of existing patterns (search.ts, player.ts, supabase.ts)
- Pitfalls: HIGH - All pitfalls discovered and verified through live testing (especially the dropdown default values issue that causes HTTP 500)
- Form fields: HIGH - Every field name, selector, and default value verified against live HTML
- Performance: HIGH - Timing measured across multiple live requests

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (chess.org.il is a stable legacy site, unlikely to change)

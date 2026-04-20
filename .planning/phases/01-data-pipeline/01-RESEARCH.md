# Phase 1: Data Pipeline - Research

**Researched:** 2026-04-20
**Domain:** Web scraping (ASP.NET WebForms), caching (Supabase), REST API (Express on Netlify Functions)
**Confidence:** HIGH

## Summary

Phase 1 builds the entire backend data pipeline: fetching HTML from chess.org.il, parsing it with Cheerio into structured TypeScript types, caching parsed data in Supabase with 24-hour freshness, and serving it via an Express REST API wrapped in a Netlify Function. This is a greenfield project with no existing code.

Live inspection of chess.org.il confirmed that the site serves UTF-8 encoded HTML (verified via `Content-Type: text/html; charset=utf-8` header), eliminating the need for manual encoding detection. The player info lives in `div.full-block` lists with Hebrew text labels, and the tournament table uses a standard ASP.NET GridView with server-side pagination via `__doPostBack`. A critical discovery: tournaments are paginated server-side (20 per page), and retrieving all pages requires simulating ASP.NET form postbacks with ViewState. For the MVP, scraping only the first page (20 most recent tournaments) is recommended. Non-existent player IDs return HTTP 500 with a generic ASP.NET "Runtime Error" page (title: "Runtime Error"), requiring detection by status code.

Express 5.x (5.2.1) is now the latest on npm, but the CLAUDE.md locks the project to Express 4.x. This is the correct choice: Express 4.22.1 is the latest 4.x release, and there is a known compatibility concern between Express 5 and `serverless-http` on Netlify (a `TypeError: Cannot set property body` error has been reported in Netlify Functions v2 context). Sticking with Express 4.x avoids this risk entirely.

**Primary recommendation:** Build the scraper as a pure function (HTML string in, typed data out), use Cheerio's `load()` with content-based selectors (Hebrew label text matching), cache full parsed JSONB in Supabase's `players` table, wrap Express 4.x with `serverless-http` for Netlify Functions, and handle the 500-status non-existent-player case explicitly.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use content-based selectors (header text, table structure, label text) rather than ASP.NET auto-generated IDs like `ctl00_ContentPlaceHolder1_*`. Fall back to structural position (nth-child) if text matching fails.
- **D-02:** Detect encoding from Content-Type header. Default to UTF-8, fall back to Windows-1255 if Hebrew characters are garbled. Verify encoding on first real scrape of chess.org.il.
- **D-03:** Optional fields (FIDE ID, expected rating, license expiry) return `null` when missing from the page. Scrape fails only if name or rating cannot be extracted -- these are the minimum viable fields.
- **D-04:** Custom User-Agent header: `ChessIL-Dashboard/1.0 (community project)`
- **D-05:** API response shape: `{ player: {...}, tournaments: [...], meta: { cached: boolean, stale: boolean, scrapedAt: string, cachedAt: string } }`
- **D-06:** Error responses: `{ error: string, message: string, statusCode: number }` -- e.g., `{ error: "PLAYER_NOT_FOUND", message: "No player found with ID 999999", statusCode: 404 }`
- **D-07:** Force refresh via query parameter: `GET /api/player/:id?force=true` bypasses cache and re-scrapes
- **D-08:** Parse the result string (e.g., "+3-1=0") into separate `wins`, `losses`, `draws` integers at scrape time. Frontend should not need to parse raw result strings.
- **D-09:** Store all dates as ISO 8601 strings (e.g., "2025-03-15"). Parse `dd/MM/yyyy` format from chess.org.il during scraping, not in frontend.
- **D-10:** `isPending` boolean derived from `updateDate === "בעדכון הבא"` during parsing
- **D-11:** `ratingChange` stored as a float (can be positive or negative)
- **D-12:** Monorepo structure with shared TypeScript types between frontend and backend
- **D-13:** Backend runs as Netlify Functions using `serverless-http` to wrap Express
- **D-14:** Local development via `netlify dev` to simulate production function routing
- **D-15:** Supabase client uses `@supabase/supabase-js` (REST-based, no direct Postgres connections -- serverless safe)

### Claude's Discretion
- Specific Cheerio selectors for each field (discover by inspecting live chess.org.il HTML during implementation)
- Error handling granularity within the scraper (retry logic, timeout values)
- Supabase table indexing strategy
- TypeScript type naming conventions
- Test structure and approach

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCRP-01 | Backend can fetch HTML from chess.org.il player page given a player ID | Verified: GET `https://www.chess.org.il/Players/Player.aspx?Id={id}` returns UTF-8 HTML (Content-Type header confirmed). Use axios with `responseType: 'text'`, custom User-Agent header. Non-existent IDs return HTTP 500 with "Runtime Error" in title. |
| SCRP-02 | Scraper extracts player info fields (name, ID, FIDE ID, club, birth year, rating, expected rating, rank, grade, license expiry) | Verified: All fields found in `div.full-block ul li` elements with Hebrew text labels. Name in `.p-profile .section-title h2`. Grade in `.p-profile > p` (format: "דרגה שישית"). FIDE ID may have empty link text. Rating is complex: `מד כושר ישראלי<span>: 1476 (צפוי: </span><a>1475</a><span>)</span>`. |
| SCRP-03 | Scraper extracts tournament history rows (date, update date, tournament name/URL, games, points, performance, result, W/D/L, rating change, pending status) | Verified: 8-column table with thead/tbody. 20 rows per page, server-side pagination. Rating change in `<div class="ltr">` wrapper, format `VALUE+`/`VALUE-`. Result in `<div class="ltr">`, format `+W-L=D`. Some cells have `hidden-xs hidden-sm` class (irrelevant to scraper). |
| SCRP-04 | Scraper sets custom User-Agent header | Straightforward: axios config `headers: { 'User-Agent': 'ChessIL-Dashboard/1.0 (community project)' }` |
| SCRP-05 | Scraper returns structured JSON matching defined TypeScript types | Architecture pattern: pure function `parsePlayerPage(html: string): PlayerData`. TypeScript interfaces shared in `packages/shared/types.ts`. |
| CACH-01 | Scraped player data is stored in Supabase `players` table as JSONB | Supabase upsert with `player_id` as primary key, `onConflict: 'player_id'`. Initialize client at module scope for reuse across warm invocations. |
| CACH-02 | Cached data is returned if updated within last 24 hours | Query `updated_at`, compare against `Date.now() - 24*60*60*1000`. |
| CACH-03 | Stale or missing cache triggers a fresh scrape | Cache-miss flow: check DB -> if stale/missing -> scrape -> parse -> validate -> upsert -> return. |
| CACH-04 | If scraping fails, stale cached data is returned with `stale: true` flag | Try-catch around scrape; on failure, return cached data with `meta.stale: true`. If no cache exists, return error. |
| CACH-05 | User can force re-scrape ignoring cache via refresh button | `?force=true` query param skips cache check, goes directly to scrape. |
| API-01 | `GET /api/player/:id` returns player data as JSON | Express route in Netlify Function wrapped with `serverless-http`. Route mounted at `/api/player/:id`. |
| API-02 | API handles invalid/missing player IDs with appropriate error response | Validate ID is positive integer (`/^\d{1,10}$/`). chess.org.il returns 500 for non-existent IDs -- detect and return 404 with structured error. |
| API-03 | API is accessible from frontend (same-origin or CORS enabled) | Same-origin on Netlify (both SPA and functions served from same domain). Add CORS headers for local development via inline middleware. |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Express | 4.22.1 | REST API routing and middleware | CLAUDE.md locks to 4.x; latest 4.x is 4.22.1. Express 5.2.1 exists but has potential serverless-http compatibility issues on Netlify. |
| Cheerio | 1.2.0 | HTML parsing and data extraction | jQuery-like API for server-rendered pages, no browser overhead, built-in encoding detection |
| axios | 1.15.1 | HTTP client for fetching chess.org.il pages | Supports custom headers, response types, timeouts, AbortController |
| @supabase/supabase-js | 2.103.3 | Database client for caching layer | REST-based (PostgREST), no direct Postgres connections, serverless-safe |
| serverless-http | 4.0.0 | Wraps Express for Netlify Functions | Published Sept 2025; uses PassThrough stream internally (v4 change from stub); Netlify recommended approach |
| TypeScript | 5.x | Type safety | Use 5.x (not 6.x -- TypeScript 6.0.3 is current but 5.x is the CLAUDE.md spec). Install with `npm install -D typescript@5` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @netlify/functions | latest | Netlify Functions types and utilities | Function handler typing |
| dotenv | 16.x | Environment variable loading | Local development only (Supabase URL/key) |
| vitest | 4.1.4 | Test framework | Unit tests for parser, integration tests for API |
| supertest | 7.2.2 | HTTP testing for Express routes | API route integration tests |
| @types/express | latest | Express type definitions | TypeScript dev dependency |
| @types/node | latest | Node.js type definitions | TypeScript dev dependency |
| @types/supertest | latest | Supertest type definitions | TypeScript dev dependency |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| axios | Native `fetch` (built into Node 22) | axios has cleaner timeout/abort handling and responseType config; fetch is lighter but more boilerplate |
| Cheerio `load()` | Cheerio `fromURL()` | `fromURL` combines fetch+parse but gives less control over HTTP headers (User-Agent), timeouts, and error handling |
| vitest | jest | vitest is faster, native ESM support, better TypeScript integration |
| Express 4.x | Express 5.x | Express 5 has async error handling improvements but risks serverless-http compatibility issues; CLAUDE.md locks to 4.x |

**Installation:**
```bash
npm install express@4 serverless-http cheerio axios @supabase/supabase-js
npm install -D typescript@5 @types/express @types/node @netlify/functions vitest supertest @types/supertest dotenv
```

**Version verification:** All versions confirmed against npm registry on 2026-04-20. Express pinned to `@4` to prevent accidental upgrade to 5.x. TypeScript pinned to `@5` per CLAUDE.md stack spec. Node.js v22.22.0 available on development machine. Netlify CLI not installed -- must be added.

## Architecture Patterns

### Recommended Project Structure
```
chess-il/
├── packages/
│   └── shared/
│       └── types.ts              # PlayerData, TournamentEntry, ApiResponse types
├── netlify/
│   └── functions/
│       └── api.ts                # Express app wrapped with serverless-http
├── src/
│   ├── api/
│   │   └── routes/
│   │       └── player.ts         # GET /api/player/:id route handler
│   ├── scraper/
│   │   ├── fetch.ts              # HTTP fetcher (axios + User-Agent + timeout)
│   │   ├── parse.ts              # Cheerio HTML parser (pure function)
│   │   ├── validate.ts           # Post-parse data validation
│   │   └── index.ts              # Orchestrator: fetch -> parse -> validate
│   ├── db/
│   │   └── supabase.ts           # Supabase client init + cache read/write
│   └── types/                    # Re-exports from shared (if needed)
├── tests/
│   ├── fixtures/
│   │   ├── player-205001.html    # Saved HTML snapshot for testing
│   │   └── player-210498.html    # Second test player snapshot
│   ├── scraper/
│   │   ├── parse.test.ts         # Parser unit tests against fixtures
│   │   └── fetch.test.ts         # Fetcher tests (mocked HTTP)
│   ├── db/
│   │   └── cache.test.ts         # Cache operation tests (mocked Supabase)
│   └── api/
│       └── player.test.ts        # API route tests (mocked scraper/db)
├── netlify.toml                  # Netlify configuration
├── tsconfig.json
├── vitest.config.ts
├── package.json
├── .env.example                  # Template for Supabase credentials
└── .gitignore
```

### Pattern 1: Pure Scraper Function
**What:** The parser is a pure function that takes an HTML string and returns typed data. No side effects, no network calls.
**When to use:** Always -- this is the core design principle for testability.
**Example:**
```typescript
// src/scraper/parse.ts
import * as cheerio from 'cheerio';
import type { PlayerData, TournamentEntry } from '../../packages/shared/types';

export function parsePlayerPage(html: string): PlayerData {
  const $ = cheerio.load(html);
  
  // Content-based selector: find player name from the h2 inside .p-profile
  const name = $('.p-profile .section-title h2').text().trim();
  
  // Find player info fields by Hebrew label text
  const playerIdText = findFieldByLabel($, 'מספר שחקן:');
  const playerId = parseInt(playerIdText, 10);
  
  // ... extract all fields
  
  if (!name || isNaN(playerId)) {
    throw new Error('Failed to extract minimum required fields (name, ID)');
  }
  
  return { player: { name, id: playerId, /* ... */ }, tournaments, scrapedAt: new Date().toISOString() };
}

function findFieldByLabel($: cheerio.CheerioAPI, label: string): string {
  // Find the <li> whose text starts with the label, extract the <span> value
  const li = $('div.full-block li').filter((_, el) => {
    return $(el).text().trim().startsWith(label);
  });
  return li.find('span').text().trim();
}
```

### Pattern 2: Cache-First API Flow
**What:** Always check Supabase cache first. Only scrape on cache miss or force refresh.
**When to use:** Every API request.
**Example:**
```typescript
// src/api/routes/player.ts
export async function getPlayer(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'INVALID_ID', message: 'Player ID must be a positive integer', statusCode: 400 });
  }
  
  const forceRefresh = req.query.force === 'true';
  
  // 1. Check cache (unless force refresh)
  if (!forceRefresh) {
    const cached = await getCachedPlayer(id);
    if (cached && !isStale(cached.updated_at)) {
      return res.json({
        player: cached.data.player,
        tournaments: cached.data.tournaments,
        meta: { cached: true, stale: false, scrapedAt: cached.data.scrapedAt, cachedAt: cached.updated_at }
      });
    }
  }
  
  // 2. Scrape fresh data
  try {
    const data = await scrapePlayer(id);
    await upsertPlayer(id, data);
    return res.json({
      ...data,
      meta: { cached: false, stale: false, scrapedAt: data.scrapedAt, cachedAt: new Date().toISOString() }
    });
  } catch (scrapeError) {
    // 3. Fallback to stale cache
    const staleCache = await getCachedPlayer(id);
    if (staleCache) {
      return res.json({
        ...staleCache.data,
        meta: { cached: true, stale: true, scrapedAt: staleCache.data.scrapedAt, cachedAt: staleCache.updated_at }
      });
    }
    // 4. No cache, no scrape -- error
    return res.status(404).json({ error: 'PLAYER_NOT_FOUND', message: `No player found with ID ${id}`, statusCode: 404 });
  }
}
```

### Pattern 3: Module-Scope Supabase Client
**What:** Initialize the Supabase client at module scope, outside the handler function.
**When to use:** Always in serverless functions -- enables reuse across warm invocations.
**Example:**
```typescript
// src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialized once, reused across warm invocations
export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Pattern 4: Netlify Function Entry Point
**What:** Wrap Express with serverless-http and export as handler.
**When to use:** The single entry point for all API routes.
**Example:**
```typescript
// netlify/functions/api.ts
import express from 'express';
import serverless from 'serverless-http';
import { playerRouter } from '../../src/api/routes/player';

const app = express();

app.use(express.json());

// Inline CORS middleware (avoid extra dependency)
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api/player', playerRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

export const handler = serverless(app);
```

### Anti-Patterns to Avoid
- **Using ASP.NET auto-generated IDs as selectors:** IDs like `ctl00_ContentPlaceHolder1_PlayerFormView_TournamentsGridView` change when the site developers reorder controls. Use content-based selectors (Hebrew labels, table header text) instead.
- **Creating a new Supabase client per request:** Initialize at module scope for reuse across warm invocations.
- **Storing raw HTML in cache:** Parse at scrape time, store structured JSONB. Raw HTML is 100KB+ per player.
- **Using `new Date()` to parse dd/MM/yyyy dates:** JavaScript's `Date` constructor interprets these as MM/dd/yyyy. Parse manually: split on `/`, construct explicitly.
- **Returning raw HTML fragments in API responses:** Always extract clean text/numbers. Prevents stored XSS.
- **Installing Express 5.x:** CLAUDE.md locks to Express 4.x; there are known `serverless-http` compatibility concerns with Express 5 on Netlify.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing | Custom regex parsers | Cheerio 1.2.0 | Regex for HTML is fragile; Cheerio handles malformed HTML, nested elements, encoding |
| HTTP requests with timeout | Raw `fetch` with manual AbortController | axios with `timeout` config | axios handles timeout, response types, request/response interceptors cleanly |
| Serverless wrapping | Custom Lambda event parsing | serverless-http 4.0.0 | Handles event-to-request conversion, response formatting, edge cases |
| Database connection management | Manual connection pooling | @supabase/supabase-js (REST-based) | REST API eliminates connection pooling concerns in serverless |
| Date parsing for dd/MM/yyyy | Custom ad-hoc inline parsing | Centralized utility function | No library needed, but wrap in a single `parseDateDDMMYYYY()` function to avoid inconsistent parsing across codebase |

**Key insight:** The scraping domain is deceptively simple -- "just parse some HTML" -- but encoding, malformed HTML, selector fragility, and data format assumptions create a minefield. Cheerio handles the HTML complexity; the remaining traps are in data interpretation (date formats, rating change sign format, optional vs missing fields).

## Live HTML Structure Analysis (HIGH confidence -- verified 2026-04-20)

### Key Findings from chess.org.il Inspection

**Encoding:** UTF-8 confirmed via HTTP `Content-Type: text/html; charset=utf-8` response header. No Windows-1255 fallback needed (D-02 simplification).

**Player Info Structure:**
The player info is inside `div.full-block` containers, organized as `<ul><li>` lists with Hebrew text labels:
```html
<div class="full-block clearfix">
  <ul>
    <li>מספר שחקן:<span> 205001</span></li>
    <li>מספר שחקן פיד"ה: <a href="https://ratings.fide.com/profile/2875080" target="_blank">2875080</a><br /></li>
    <li><b>מועדון:</b> <a href="/Clubs/Club.aspx?Id=2355">מועדון השחמט רעננה</a></li>
    <li>תוקף כרטיס שחמטאי<span> 31/12/2026</span></li>
    <li>שנת לידה:<span> 2016</span></li>
  </ul>
</div>
```

**Player Name and Grade:**
```html
<div class="p-profile clearfix">
  <div class="section-title">
    <h2>אנדי פריימן</h2>
  </div>
  <p>דרגה שישית</p>
</div>
```
Note: Grade text includes the word "דרגה" (grade) before the actual grade value. Parse accordingly.

**Rating and Ranking** are in separate `div.full-block` containers:
```html
<!-- Rating block -->
<li>מד כושר ישראלי<span>: 1476 (צפוי: </span><a href="ExpectedRating.aspx?Id=205001">1475</a><span>)</span></li>

<!-- Rank block -->
<li>דירוג בישראל<span>: 2872</span> (<a href="/Players/PlayersRanking.aspx">הרשימה המלאה</a><span>)</span></li>

<!-- Grade block -->
<li>דרגה:<span> שישית</span></li>
```

**Rating Parsing Complexity:** The rating field mixes label text with `<span>` and `<a>` elements. The parser must extract "1476" from `<span>: 1476 (צפוי: </span>` -- the colon, rating number, and parenthetical expected-rating text are all inside the same `<span>`. Regex extraction of the first integer after the colon is the cleanest approach.

**Expected Rating:** Inside an `<a>` tag linking to `ExpectedRating.aspx?Id=...`. Extract the link text.

**FIDE ID Edge Case:** Player 210498 has the FIDE field present but with empty link text:
```html
<li>מספר שחקן פיד"ה: <a href="https://ratings.fide.com/profile/" target="_blank"></a><br /></li>
```
The scraper must check link text is non-empty to determine if a FIDE ID exists. Return `null` if empty.

**Club Field:** Note the `<b>` tag wrapping the label: `<b>מועדון:</b>`. The selector for the label text must account for this.

**Tournament Table Structure:**
- Table ID: `ctl00_ContentPlaceHolder1_PlayerFormView_TournamentsGridView` (but use content-based selector per D-01)
- Has `<thead>` and `<tbody>` sections
- 8 columns:
  1. `תאריך התחלה` (Start Date)
  2. `תאריך עדכון מד כושר` (Update Date)
  3. `תחרות` (Tournament) -- linked
  4. `משחקים` (Games) -- `hidden-xs hidden-sm`
  5. `נקודות` (Points) -- `hidden-xs hidden-sm`
  6. `רמת ביצוע` (Performance) -- `hidden-xs hidden-sm`
  7. `תוצאה` (Result)
  8. `שינוי מד כושר` (Rating Change) -- `hidden-xs hidden-sm`
- 20 rows per page with server-side pagination via `__doPostBack`
- Pagination row has class `GridPager` (last row in tbody)

**Tournament Row HTML:**
```html
<tr>
  <td>27/03/2026</td>
  <td>עדכון 01/04/2026</td>
  <td><a href="../Tournaments/PlayerInTournament.aspx?Id=779490">שישים העיר 27.3 שלישית</a></td>
  <td class="hidden-xs hidden-sm">4</td>
  <td class="hidden-xs hidden-sm">3.0</td>
  <td class="hidden-xs hidden-sm">1671</td>
  <td><div class="ltr">+3-1=0</div></td>
  <td class="hidden-xs hidden-sm">
    <div class="ltr">
      <span style="color:green; ">17.9+</span>
    </div>
  </td>
</tr>
```

**Rating Change Format:**
Values shown as `VALUE+` or `VALUE-` (sign AFTER the number, not before):
- `<span style="color:green; ">17.9+</span>` (positive)
- `<span style="color:red; ">1.7-</span>` (negative)
- `0` (no change, plain text without span, inside `<div class="ltr">`)

The parser must: extract text from the cell's `<div class="ltr">`, trim whitespace, then parse with regex.

**Update Date Formats:**
- Pending: `בעדכון הבא` (literal text, entire cell content)
- Processed: `עדכון DD/MM/YYYY` (e.g., `עדכון 01/04/2026`)

**Result Format:** `+W-L=D` (e.g., `+3-1=0` means 3 wins, 1 loss, 0 draws). Wrapped in `<div class="ltr">`.

**Pending Tournament Edge Case:** When a tournament is pending (update date is `בעדכון הבא`), games/points/performance may all be 0 and the rating change is 0. The scraper should still extract these values normally.

**Non-existent Player:** HTTP 500 response. Response body title is "Runtime Error". Error heading: "Server Error in '/' Application." The parser must check the HTTP status code and detect this pattern.

**Server-Side Tournament Pagination:**
The initial GET returns only page 1 of tournaments (20 rows). Additional pages require `__doPostBack` with ViewState (~37KB). For MVP, scrape only the first page (20 most recent tournaments). Full history would require POST requests with ViewState -- significantly more complex and fragile.

## Common Pitfalls

### Pitfall 1: Rating Change Sign Reversal
**What goes wrong:** The site displays rating changes as `17.9+` or `1.7-` (sign after number). Naive parsing that looks for a leading `+`/`-` will fail, producing `NaN` or incorrect values.
**Why it happens:** This is an Israeli display convention where the sign is shown after the number.
**How to avoid:** Parse with regex: `/^([\d.]+)([+-])$/` -- extract number and trailing sign, then apply sign to float. Handle bare `0` as a special case.
**Warning signs:** All rating changes showing as 0 or NaN.

### Pitfall 2: Empty FIDE ID Field Looks Non-Empty
**What goes wrong:** Players without a FIDE ID still have the `<a>` tag present, just with empty text. The scraper extracts an empty string instead of `null`.
**Why it happens:** ASP.NET WebForms renders all FormView fields, including empty ones.
**How to avoid:** After extracting FIDE ID text, check if it's truthy (non-empty string). Return `null` if empty.
**Warning signs:** FIDE links pointing to `https://ratings.fide.com/profile/` (no ID).

### Pitfall 3: chess.org.il Returns 500 for Non-Existent Players
**What goes wrong:** The scraper expects a 404 for non-existent players but gets a 500 with a generic error page. If not handled, this looks like a server error rather than "player not found."
**Why it happens:** ASP.NET WebForms throws an unhandled exception when the player ID doesn't exist in the database.
**How to avoid:** Use axios with `validateStatus: () => true` to prevent axios from throwing on non-2xx responses. Check for HTTP 500 status AND detect "Runtime Error" in the response body title. Return a user-friendly 404 error.
**Warning signs:** All non-existent player lookups showing as "server error" instead of "player not found."

### Pitfall 4: Only 20 Tournaments Visible Per Page
**What goes wrong:** The scraper extracts only 20 tournaments when the player has 80+. The rating chart shows incomplete history.
**Why it happens:** ASP.NET GridView uses server-side pagination. Additional pages require `__doPostBack` with ViewState.
**How to avoid:** For MVP, accept 20 most recent tournaments. Document this limitation. If full history is needed later, implement ViewState-based POST pagination (significant complexity increase).
**Warning signs:** Tournament count capping at exactly 20 for all players.

### Pitfall 5: Date Parsing as MM/DD/YYYY Instead of DD/MM/YYYY
**What goes wrong:** JavaScript `new Date("23/04/2026")` is invalid. `new Date("04/23/2026")` works but assumes American format. For dates where day <= 12, silently produces wrong dates.
**Why it happens:** Developers pass raw date strings to `new Date()`.
**How to avoid:** Always split on `/` and construct manually: `const [d, m, y] = dateStr.split('/'); return \`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}\`;` Never use `new Date(dateStr)` for date parsing.
**Warning signs:** Dates in January-December appearing in wrong months; dates after the 12th of any month failing to parse.

### Pitfall 6: Express Route Path Mismatch with Netlify Redirect
**What goes wrong:** Routes work locally but return 404 in production because the Netlify redirect strips `/api` but Express expects it, or vice versa.
**Why it happens:** The `netlify.toml` redirect sends `/api/*` to `/.netlify/functions/api/:splat`, and Express route path must match what `:splat` produces.
**How to avoid:** Mount Express routes at `/api/player` (keeping the `/api` prefix). The redirect passes the full path after the match as `:splat`. Test with `netlify dev` from the start. Add a health check at `/api/health` as canary.
**Warning signs:** All routes returning 404 in production; function logs show invocation but Express returns "Cannot GET /..."

### Pitfall 7: Supabase Credentials in Frontend Code or Git
**What goes wrong:** `service_role` key exposed in client-side bundle or committed to repository.
**Why it happens:** Developer uses the same `.env` for both frontend and backend, or commits `.env` to git.
**How to avoid:** Use `service_role` key only in serverless functions (via Netlify environment variables). Add `.env` to `.gitignore` immediately. Create `.env.example` with placeholder values. Never import the Supabase module in frontend code.
**Warning signs:** Supabase dashboard showing unexpected queries from non-server IPs.

### Pitfall 8: Rating Field Parsing Complexity
**What goes wrong:** The rating `<li>` element contains mixed content: `מד כושר ישראלי<span>: 1476 (צפוי: </span><a>1475</a><span>)</span>`. Using `.find('span').text()` gets `: 1476 (צפוי: )` -- a mess of text with the rating buried inside.
**Why it happens:** ASP.NET WebForms nests spans and anchors in non-obvious ways.
**How to avoid:** Extract the span text, then use regex to pull the first integer: `/:\s*(\d+)/`. For expected rating, extract the `<a>` text separately. Test with both player fixtures.
**Warning signs:** Rating returning as NaN or including parenthetical text.

### Pitfall 9: Club Label Uses `<b>` Tag
**What goes wrong:** The club field uses `<b>מועדון:</b>` instead of plain text like other labels. A selector looking for `li` text starting with "מועדון:" fails because the `<b>` tag changes the text extraction behavior.
**Why it happens:** Inconsistent HTML formatting in the chess.org.il template.
**How to avoid:** Use `$(el).text().trim()` which strips tags, or look for the `<b>` element containing the label. Test explicitly with the HTML fixture.
**Warning signs:** Club field always returning null.

## Code Examples

Verified patterns from live HTML inspection:

### Cheerio Selector Strategy for Player Fields
```typescript
// Source: verified against live chess.org.il HTML on 2026-04-20

function parsePlayerInfo($: cheerio.CheerioAPI): PlayerInfo {
  // Player name: inside .p-profile section-title h2
  const name = $('.p-profile .section-title h2').first().text().trim();

  // Grade: paragraph after the name section-title (format: "דרגה שישית")
  const gradeText = $('.p-profile > p').first().text().trim();
  // Remove "דרגה " prefix if present
  const grade = gradeText.replace(/^דרגה\s*/, '');

  // Player info fields: find <li> elements by their Hebrew label text
  const allListItems = $('div.full-block li');

  const playerId = extractByLabel(allListItems, $, 'מספר שחקן:');
  const fideIdLink = findLiByLabel(allListItems, $, 'מספר שחקן פיד"ה:');
  const fideId = fideIdLink.find('a').text().trim() || null;
  const club = findLiByLabel(allListItems, $, 'מועדון:').find('a').text().trim() || null;
  const birthYear = extractByLabel(allListItems, $, 'שנת לידה:');
  const licenseExpiry = extractByLabel(allListItems, $, 'תוקף כרטיס שחמטאי');

  // Rating: complex nested structure
  // HTML: מד כושר ישראלי<span>: 1476 (צפוי: </span><a>1475</a><span>)</span>
  const ratingLi = findLiByLabel(allListItems, $, 'מד כושר ישראלי');
  const ratingSpanText = ratingLi.find('span').first().text();
  const ratingMatch = ratingSpanText.match(/:\s*(\d+)/);
  const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : NaN;
  const expectedRatingText = ratingLi.find('a').text().trim();
  const expectedRating = expectedRatingText ? parseInt(expectedRatingText, 10) : null;

  // Rank: "דירוג בישראל: 2872"
  const rankLi = findLiByLabel(allListItems, $, 'דירוג בישראל');
  const rankSpanText = rankLi.find('span').first().text();
  const rankMatch = rankSpanText.match(/:\s*(\d+)/);
  const rank = rankMatch ? parseInt(rankMatch[1], 10) : null;

  return {
    name,
    id: parseInt(playerId, 10),
    fideId: fideId ? parseInt(fideId, 10) : null,
    club,
    birthYear: birthYear ? parseInt(birthYear, 10) : null,
    rating,
    expectedRating: expectedRating && !isNaN(expectedRating) ? expectedRating : null,
    grade,
    rank,
    licenseExpiry: licenseExpiry ? parseDateDDMMYYYY(licenseExpiry) : null,
  };
}

// Helper: find <li> by label text (handles <b> tags via .text())
function findLiByLabel(items: cheerio.Cheerio, $: cheerio.CheerioAPI, label: string): cheerio.Cheerio {
  return items.filter((_, el) => {
    return $(el).text().trim().startsWith(label);
  }).first();
}

// Helper: extract span text from a labeled <li>
function extractByLabel(items: cheerio.Cheerio, $: cheerio.CheerioAPI, label: string): string {
  const li = findLiByLabel(items, $, label);
  return li.find('span').text().trim();
}
```

### Tournament Row Parsing
```typescript
// Source: verified against live chess.org.il HTML on 2026-04-20

function parseTournamentTable($: cheerio.CheerioAPI): TournamentEntry[] {
  const tournaments: TournamentEntry[] = [];

  // Find tournament table by its header content (content-based selector per D-01)
  const table = $('table').filter((_, el) => {
    const headers = $(el).find('thead th').map((_, th) => $(th).text().trim()).get();
    return headers.includes('תחרות') && headers.includes('תאריך התחלה');
  });

  // Skip GridPager row (pagination controls)
  table.find('tbody tr').not('.GridPager').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 8) return;

    const startDate = cells.eq(0).text().trim();
    const updateDateRaw = cells.eq(1).text().trim();
    const tournamentLink = cells.eq(2).find('a');
    const tournamentName = tournamentLink.text().trim();
    const tournamentUrl = tournamentLink.attr('href') || null;
    const games = parseInt(cells.eq(3).text().trim(), 10);
    const points = parseFloat(cells.eq(4).text().trim());
    const performance = parseInt(cells.eq(5).text().trim(), 10);

    // Result is inside <div class="ltr"> wrapper
    const resultRaw = cells.eq(6).find('div.ltr').text().trim();
    // Rating change is inside <div class="ltr"> wrapper (may contain <span>)
    const ratingChangeRaw = cells.eq(7).find('div.ltr').text().trim();

    // Parse result: "+3-1=0" -> { wins: 3, losses: 1, draws: 0 }
    const { wins, losses, draws } = parseResult(resultRaw);

    // Parse rating change: "17.9+" -> 17.9, "1.7-" -> -1.7, "0" -> 0
    const ratingChange = parseRatingChange(ratingChangeRaw);

    // Parse isPending from update date
    const isPending = updateDateRaw === 'בעדכון הבא';
    const updateDate = isPending ? null : parseDateFromUpdateText(updateDateRaw);

    tournaments.push({
      startDate: parseDateDDMMYYYY(startDate),
      updateDate,
      isPending,
      tournamentName,
      tournamentUrl: tournamentUrl
        ? `https://www.chess.org.il${tournamentUrl.replace('..', '')}`
        : null,
      games,
      points,
      performance,
      wins,
      losses,
      draws,
      ratingChange,
    });
  });

  return tournaments;
}
```

### Rating Change Parser
```typescript
function parseRatingChange(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '0' || trimmed === '') return 0;

  // Format: "17.9+" or "1.7-" (sign after number)
  const match = trimmed.match(/^([\d.]+)([+-])$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  return match[2] === '-' ? -value : value;
}
```

### Result String Parser
```typescript
function parseResult(raw: string): { wins: number; losses: number; draws: number } {
  // Format: "+3-1=0"
  const match = raw.match(/\+(\d+)-(\d+)=(\d+)/);
  if (!match) return { wins: 0, losses: 0, draws: 0 };
  return {
    wins: parseInt(match[1], 10),
    losses: parseInt(match[2], 10),
    draws: parseInt(match[3], 10),
  };
}
```

### Date Parser (DD/MM/YYYY to ISO 8601)
```typescript
function parseDateDDMMYYYY(dateStr: string): string {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return dateStr; // fallback
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseDateFromUpdateText(text: string): string | null {
  // Format: "עדכון DD/MM/YYYY"
  const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (!match) return null;
  return parseDateDDMMYYYY(match[1]);
}
```

### Supabase Cache Operations
```typescript
// Source: Supabase JS v2 documentation (verified 2026-04-20)

import { supabase } from './supabase';

export async function getCachedPlayer(playerId: number) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error || !data) return null;
  return data;
}

export function isStale(updatedAt: string): boolean {
  const cacheAge = Date.now() - new Date(updatedAt).getTime();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  return cacheAge > TWENTY_FOUR_HOURS;
}

export async function upsertPlayer(playerId: number, data: PlayerData) {
  const { error } = await supabase
    .from('players')
    .upsert({
      player_id: playerId,
      data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'player_id' });

  if (error) throw error;
}
```

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  external_node_modules = ["express"]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cheerio pre-1.0 (`cheerio.load()` static) | Cheerio 1.2.0 (`import * as cheerio from 'cheerio'`) | 2024 | Import style changed; `loadBuffer` and `fromURL` added |
| `iconv-lite` for all encoding | Native `TextDecoder` in Node 18+ | 2023 | No third-party dependency needed for encoding (but chess.org.il is UTF-8 anyway) |
| supabase-js v1 `.insert()` returns rows | supabase-js v2 `.upsert()` requires `.select()` to return rows | 2023 | Must chain `.select()` if you need the inserted/updated row back; not needed for void upsert |
| `node-fetch` for HTTP | Native `fetch` in Node 18+ | 2023 | axios still preferred for better timeout/header API |
| Express 4.x only | Express 5.2.1 available (Jan 2025) | 2025 | Breaking changes in request/response objects; use 4.x for serverless-http compatibility |
| serverless-http 3.x (stub-based) | serverless-http 4.0.0 (PassThrough stream) | Sept 2025 | Internal change from stub to PassThrough stream; no intentional breaking changes |

**Deprecated/outdated:**
- Cheerio static `$.load()` pattern is removed in 1.x -- use named import `cheerio.load()`
- `iconv-lite` unnecessary for this project since chess.org.il serves UTF-8
- supabase-js v1 API -- do not reference v1 patterns
- Express 5.x -- do not install; CLAUDE.md locks to 4.x

## Open Questions

1. **Tournament Pagination (20 per page limit)**
   - What we know: The initial GET returns only 20 most recent tournaments. Full history requires `__doPostBack` with ViewState (~37KB POST body). Player 205001 has 5+ pages of tournaments.
   - What's unclear: Whether users will find the 20-tournament limit acceptable for rating charts, or whether full history is expected from day one.
   - Recommendation: Start with 20 most recent (from initial page load). This covers the dashboard table (which shows 10 per page) and provides a reasonable chart. If users request full history, implement ViewState pagination in a future iteration.

2. **Netlify Function Timeout Under Load**
   - What we know: Synchronous functions have a 60-second timeout. chess.org.il response times vary (typically 1-5 seconds from testing).
   - What's unclear: How chess.org.il responds under concurrent load from multiple users. Whether the site rate-limits or blocks repeated requests.
   - Recommendation: Set axios timeout to 15 seconds. If scrape times out, fall back to stale cache. Monitor response times in production.

3. **Supabase Table Design**
   - What we know: Single `players` table with `player_id` (INTEGER PRIMARY KEY), `data` (JSONB), `updated_at` (TIMESTAMPTZ). Primary key on `player_id`.
   - What's unclear: Whether to add an index on `updated_at` for potential future cleanup queries.
   - Recommendation: Start with just the primary key index. Add secondary indexes only if query performance is observed to be poor.

4. **Express 5 / serverless-http Compatibility**
   - What we know: A Netlify forum report from May 2025 shows `TypeError: Cannot set property body` when using serverless-http on Netlify Functions v2. The root cause may be Netlify Functions v2 internals rather than Express 5 specifically.
   - What's unclear: Whether serverless-http 4.0.0 fully resolves this. Express 5 has changed request/response object semantics.
   - Recommendation: Use Express 4.22.1 (CLAUDE.md locks to 4.x). This avoids the issue entirely.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | Yes | v22.22.0 | -- |
| npm | Package management | Yes | 10.9.4 | -- |
| Netlify CLI | Local development (`netlify dev`) | No | -- | Install via `npm install -g netlify-cli` or `npx netlify-cli dev` |
| Supabase account | Database/caching | Unknown | -- | Must create project at supabase.com |
| curl | HTML fixture download | Yes | (system) | -- |

**Missing dependencies with no fallback:**
- Supabase project must be created and credentials obtained before caching can work. API development can proceed with mocked cache.

**Missing dependencies with fallback:**
- Netlify CLI: install with `npm install -g netlify-cli`. Can also use `npx netlify-cli dev` without global install.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 |
| Config file | `vitest.config.ts` (none -- Wave 0 must create) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCRP-01 | Fetch HTML from chess.org.il given player ID | integration | `npx vitest run tests/scraper/fetch.test.ts -t "fetches player page"` | No -- Wave 0 |
| SCRP-02 | Extract player info fields from HTML | unit | `npx vitest run tests/scraper/parse.test.ts -t "extracts player info"` | No -- Wave 0 |
| SCRP-03 | Extract tournament history rows | unit | `npx vitest run tests/scraper/parse.test.ts -t "extracts tournaments"` | No -- Wave 0 |
| SCRP-04 | Custom User-Agent header set | unit | `npx vitest run tests/scraper/fetch.test.ts -t "sets user agent"` | No -- Wave 0 |
| SCRP-05 | Returns structured JSON matching types | unit | `npx vitest run tests/scraper/parse.test.ts -t "returns typed data"` | No -- Wave 0 |
| CACH-01 | Stores data in Supabase JSONB | integration | `npx vitest run tests/db/cache.test.ts -t "upserts player data"` | No -- Wave 0 |
| CACH-02 | Returns cached data if within 24h | unit | `npx vitest run tests/db/cache.test.ts -t "returns fresh cache"` | No -- Wave 0 |
| CACH-03 | Stale cache triggers fresh scrape | integration | `npx vitest run tests/api/player.test.ts -t "scrapes on stale cache"` | No -- Wave 0 |
| CACH-04 | Failed scrape returns stale data with stale flag | integration | `npx vitest run tests/api/player.test.ts -t "returns stale on failure"` | No -- Wave 0 |
| CACH-05 | Force=true bypasses cache | integration | `npx vitest run tests/api/player.test.ts -t "force refresh"` | No -- Wave 0 |
| API-01 | GET /api/player/:id returns JSON | integration | `npx vitest run tests/api/player.test.ts -t "returns player data"` | No -- Wave 0 |
| API-02 | Invalid player ID returns error | unit | `npx vitest run tests/api/player.test.ts -t "rejects invalid id"` | No -- Wave 0 |
| API-03 | API accessible from frontend (CORS) | integration | `npx vitest run tests/api/player.test.ts -t "cors headers"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- test framework configuration
- [ ] `tests/fixtures/player-205001.html` -- saved HTML snapshot for player 205001
- [ ] `tests/fixtures/player-210498.html` -- saved HTML snapshot for player 210498
- [ ] `tests/scraper/parse.test.ts` -- parser unit tests against HTML fixtures
- [ ] `tests/scraper/fetch.test.ts` -- fetcher tests (mocked HTTP)
- [ ] `tests/db/cache.test.ts` -- cache operation tests (mocked Supabase)
- [ ] `tests/api/player.test.ts` -- API route integration tests
- [ ] Framework install: `npm install -D vitest`

## Project Constraints (from CLAUDE.md)

- **GSD Workflow Enforcement:** Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.
- **Tech Stack (locked):** React + TypeScript + Tailwind CSS + Recharts (frontend), Node.js + Express (backend), Cheerio (scraping), Supabase (database/cache)
- **Express version (locked):** 4.x -- do not use Express 5.x
- **Deployment (locked):** Netlify hosting
- **Scraping Rate:** Max once per player per 24 hours
- No conventions established yet -- patterns established in this phase become the standard.

## Sources

### Primary (HIGH confidence)
- **Live chess.org.il inspection** -- Fetched `https://www.chess.org.il/Players/Player.aspx?Id=205001`, `?Id=210498`, and `?Id=999999` on 2026-04-20. Verified encoding (UTF-8 via Content-Type header), HTML structure, field locations, tournament table format with `<div class="ltr">` wrappers, pagination via `__doPostBack`, error response (HTTP 500 with "Runtime Error" title) for invalid IDs.
- **npm registry** -- Verified current package versions on 2026-04-20: cheerio 1.2.0, express 4.22.1 (latest 4.x) / 5.2.1 (latest overall), axios 1.15.1, @supabase/supabase-js 2.103.3, serverless-http 4.0.0, typescript 6.0.3, vitest 4.1.4, supertest 7.2.2, cors 2.8.6.
- [Netlify Express setup guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/) -- File structure, netlify.toml config, serverless-http wrapping pattern (verified July 2025 update)
- [Netlify Functions overview](https://docs.netlify.com/build/functions/overview/) -- 60s sync timeout, 1024MB memory, 6MB payload limit, us-east-2 region
- [Supabase JS upsert docs](https://supabase.com/docs/reference/javascript/upsert) -- v2 upsert API, onConflict parameter, `.select()` chaining

### Secondary (MEDIUM confidence)
- [Cheerio 1.0 release blog](https://cheerio.js.org/blog/cheerio-1.0/) -- `loadBuffer`, `fromURL`, `extract()` method capabilities
- [Cheerio loading docs](https://cheerio.js.org/docs/basics/loading/) -- `load()`, `loadBuffer()`, encoding sniffing
- [serverless-http GitHub](https://github.com/dougmoscrop/serverless-http) -- v4.0.0 uses PassThrough stream internally, no intentional breaking changes
- [Netlify forum: serverless-http compatibility](https://answers.netlify.com/t/serverless-http-doesnt-work-on-netlify-function/148616) -- TypeError with body getter, may be Netlify Functions v2 issue

### Tertiary (LOW confidence)
- Community patterns for ASP.NET ViewState pagination -- no authoritative source found for the specific `__doPostBack` simulation approach from Node.js

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified against npm registry, versions current, patterns verified against official docs
- Architecture: HIGH -- live HTML inspection confirmed all assumptions, file structure follows Netlify official guide
- Pitfalls: HIGH -- encoding verified as UTF-8 (simplifies D-02), HTML structure inspected in detail, error behavior tested, rating change and result formats confirmed
- Tournament pagination: MEDIUM -- first page (20 tournaments) confirmed working, full pagination via ViewState untested
- Express/serverless-http compatibility: HIGH -- pinning to Express 4.x avoids all known issues

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable stack, but chess.org.il HTML structure could change without notice)

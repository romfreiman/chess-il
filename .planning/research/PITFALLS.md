# Pitfalls Research

**Domain:** Web scraping dashboard (ASP.NET WebForms source, Hebrew/RTL UI, serverless deployment)
**Researched:** 2026-04-19
**Confidence:** MEDIUM-HIGH (Netlify docs verified; ASP.NET/Hebrew/Recharts based on deep training data; chess.org.il specifics need runtime validation)

## Critical Pitfalls

### Pitfall 1: ASP.NET WebForms HTML Structure Changes Silently Break Scraper

**What goes wrong:**
ASP.NET WebForms generates HTML with server-generated IDs like `ctl00_ContentPlaceHolder1_GridView1` that change when the site developers reorder controls, add panels, or upgrade the framework version. Selectors that rely on these auto-generated IDs break without warning. Additionally, ViewState bloat means the HTML payload can be unexpectedly large (100KB+ of ViewState alone), and table structures use nested `<table>` elements rather than semantic HTML.

**Why it happens:**
Developers write Cheerio selectors that are either too specific (matching exact ASP.NET control IDs) or too loose (matching any table). ASP.NET WebForms is a legacy framework where the HTML output is a side effect of server control hierarchy, not a stable contract.

**How to avoid:**
- Use structural selectors based on content patterns, not IDs: select tables by their header text content (e.g., find the `<table>` whose first row contains the Hebrew column header for "tournament name") rather than by `#ctl00_ContentPlaceHolder1_GridView1`.
- Build a "scraper health check" that validates expected structure on each scrape: verify the page has the expected number of sections, the player name field exists, the rating table has expected columns.
- Store a snapshot of the raw HTML for the test players (205001, 210498) in the test suite. Compare structural fingerprint (number of tables, header texts) against the snapshot in CI.
- Design the parser with a clear separation: `fetcher` (gets HTML) -> `parser` (extracts data) -> `normalizer` (shapes data). The parser should throw descriptive errors when structure expectations fail, not return partial/corrupt data silently.

**Warning signs:**
- Scraper returns data for some players but not others (structure varies by player state)
- Fields return `null` or empty strings that previously had values
- Player name or rating appears as a raw HTML fragment instead of clean text
- Health check endpoint returns structural mismatch warnings

**Phase to address:**
Phase 1 (Scraping foundation) -- Build the parser with structural validation from day one. Snapshot tests should be part of the initial scraper implementation, not added later.

---

### Pitfall 2: Hebrew Text Encoding Corruption (Mojibake)

**What goes wrong:**
chess.org.il may serve pages in Windows-1255 or ISO-8859-8 encoding (common for older Israeli sites) rather than UTF-8. Cheerio defaults to UTF-8 decoding. If the encoding is wrong, Hebrew characters become garbled mojibake (sequences of `\xd7` bytes or Latin gibberish instead of readable Hebrew). This corruption propagates into Supabase, the API response, and the UI -- and once bad data is cached, it stays bad for 24 hours.

**Why it happens:**
Developers assume all modern sites use UTF-8. ASP.NET WebForms sites from the mid-2000s often use the system's default encoding, which for Israeli servers is Windows-1255. The `<meta charset>` tag may be missing, incorrect, or overridden by the HTTP `Content-Type` header. Node.js `fetch` does not automatically decode non-UTF-8 responses correctly.

**How to avoid:**
- Inspect the actual HTTP response headers (`Content-Type: text/html; charset=...`) and the HTML `<meta>` tag during initial development. Log both.
- If the site uses Windows-1255: fetch the response as a binary `ArrayBuffer`, then decode with `TextDecoder('windows-1255')` before passing to Cheerio.
- Add a validation step in the parser that checks if extracted Hebrew text contains valid Hebrew Unicode characters (range U+0590 to U+05FF). If the extracted player name has no characters in this range, the encoding is wrong.
- Write a test with known Hebrew text from the test players (e.g., player 205001's name should contain specific Hebrew characters).

**Warning signs:**
- Player names display as question marks, boxes, or Latin gibberish
- Database contains entries with byte sequences like `\xd7\xa2` visible in text fields
- Hebrew text renders correctly in the browser but incorrectly in API JSON responses (or vice versa)

**Phase to address:**
Phase 1 (Scraping foundation) -- This must be the very first thing validated when building the scraper. Get one player page, verify the encoding, and lock in the decode pipeline before building any parsing logic.

---

### Pitfall 3: Netlify Functions Timeout on Slow Scrapes

**What goes wrong:**
Netlify Functions have a 60-second execution limit for synchronous functions (verified from Netlify docs). If chess.org.il is slow to respond (which older ASP.NET WebForms sites often are due to ViewState processing, server load, or geographic latency from Netlify's US-east-2 region to an Israeli server), the function times out. The user sees a generic 502 error with no useful feedback.

**Why it happens:**
Developers build the API endpoint as: receive request -> scrape site -> parse -> cache -> respond, all synchronously. The chess.org.il server response time is unpredictable -- it could be 2 seconds or 15 seconds. Add in Cheerio parsing of a large HTML page, database write to Supabase, and the 60 seconds evaporates quickly. Cold starts on Netlify Functions add 1-3 seconds on top.

**How to avoid:**
- Implement an aggressive timeout on the outbound fetch to chess.org.il (e.g., 15 seconds). If it times out, return cached data if available (stale data fallback, which is already in requirements), or return a clear error.
- Separate the "serve cached data" path (fast, <1 second) from the "scrape fresh data" path. The API should check cache first and return immediately if fresh. Only scrape if cache is stale.
- If a scrape is in progress for a given player, subsequent requests for the same player should wait for the in-progress scrape rather than launching parallel scrapes (request deduplication).
- Set the `AbortController` timeout explicitly on the fetch call to chess.org.il.
- Consider using Netlify Background Functions for the scrape operation: return a 202 immediately to the client, scrape in the background (15-minute limit), and have the client poll or use the stale data.

**Warning signs:**
- Intermittent 502 errors on the `/api/player/:id` endpoint
- Response times >10 seconds on cache misses
- Multiple simultaneous scrapes for the same player visible in logs

**Phase to address:**
Phase 1 (API/scraping) and Phase 3 (deployment) -- The timeout handling and cache-first pattern must be built into the API from the start. The background function pattern can be evaluated during deployment setup.

---

### Pitfall 4: RTL Layout Breaks in Charts and Comparison Views

**What goes wrong:**
Recharts (and most charting libraries) are designed for LTR layouts. In an RTL context: the Y-axis appears on the wrong side, tooltips are mis-positioned, the rating chart's time axis runs backwards (newest on left instead of right), axis labels overlap or get cut off, and the comparison page's side-by-side layout reverses unexpectedly. The app "looks right" in the developer's quick check but is actually confusing for Hebrew-reading users.

**Why it happens:**
Setting `dir="rtl"` on the document or a container affects CSS layout (flexbox, grid) but Recharts renders to SVG, which ignores CSS `direction`. Developers add `dir="rtl"` globally and assume everything adapts. Charts need explicit configuration: `reversed` prop on axes, manual tooltip positioning, explicit axis orientation.

**How to avoid:**
- Do NOT apply `dir="rtl"` to chart containers. Wrap charts in a `dir="ltr"` container and handle Hebrew labels explicitly. Charts should render left-to-right (time axis: oldest left, newest right) because this is the universal convention for time-series data, even in RTL interfaces.
- For the rating chart: use `XAxis` with `reversed={false}` explicitly. Format date labels in Hebrew but keep the axis direction LTR.
- For tooltips: test positioning on narrow screens (375px). Recharts tooltips can overflow the viewport on mobile when the chart is near the edge.
- For the comparison page: use CSS Logical Properties (`margin-inline-start`, `padding-inline-end`) instead of `margin-left`/`padding-right` for the layout around charts, but keep the chart internals LTR.
- For the donut/pie chart: labels and legends need explicit RTL text alignment but the chart itself renders correctly in any direction.

**Warning signs:**
- Rating chart appears to show ratings going backwards in time
- Tooltip appears off-screen or overlapping chart content on mobile
- Comparison page columns swap unexpectedly when switching between LTR and RTL contexts
- Chart axis labels (Hebrew month names) are cut off or overlap

**Phase to address:**
Phase 2 (Dashboard UI) -- When implementing the rating chart and comparison views. This needs a dedicated "RTL chart rendering" spike before building all chart components.

---

### Pitfall 5: Supabase Connection Exhaustion in Serverless Context

**What goes wrong:**
Each Netlify Function invocation creates a new Supabase client instance. If the client opens a direct Postgres connection (instead of using the REST API), each invocation opens a new connection. Under moderate load (10+ concurrent users), Supabase's connection pool gets exhausted. New requests fail with "too many connections" errors.

**Why it happens:**
In a traditional server, you create one database client on startup and reuse it. In serverless, each function invocation is potentially a cold start with a fresh runtime. Developers copy server-side Supabase patterns into serverless functions without adapting for the ephemeral execution model.

**How to avoid:**
- Use the Supabase JavaScript client (`@supabase/supabase-js`) which communicates via the PostgREST API (HTTP), not direct Postgres connections. This is the default and correct approach for serverless. Never use `pg` or `postgres` npm packages directly in Netlify Functions.
- Initialize the Supabase client outside the handler function so it can be reused across warm invocations:
  ```typescript
  // Good: initialized once, reused across warm invocations
  const supabase = createClient(url, key);
  export const handler = async (event) => { ... };
  ```
- On the free tier, keep queries simple (single table reads/writes, no complex joins) to minimize response time and connection holding.

**Warning signs:**
- Intermittent "connection refused" or "too many clients" errors in function logs
- API responses that work locally but fail in production under any load
- Supabase dashboard showing connection count near the limit

**Phase to address:**
Phase 1 (Database/caching setup) -- Correct client initialization pattern must be established when first connecting to Supabase.

---

### Pitfall 6: Scraper Returns Stale/Partial Data Without Detection

**What goes wrong:**
chess.org.il may return unexpected responses that look like valid HTML but contain no useful data: a login redirect page, an error page with a Hebrew error message, a page for a non-existent player ID, or a page with fewer tournaments than expected because the site is under maintenance. The scraper parses this "successfully" (no errors) but stores garbage data in the cache, which then persists for 24 hours.

**Why it happens:**
Developers test with valid player IDs and assume all responses follow the same structure. They don't handle the "looks like HTML but isn't the player page" scenario. ASP.NET WebForms sites often return 200 status codes even for error states (the error is rendered inside the page template).

**How to avoid:**
- After parsing, validate the extracted data against minimum expectations: player name is non-empty, player ID matches the requested ID, rating is a number between 0 and 3000, tournament list is an array (even if empty).
- Check for known error indicators in the HTML: look for specific Hebrew error strings that the site displays for invalid player IDs.
- Compare the extracted tournament count against the previously cached count. If it drops by >50%, log a warning (possible partial page load) but still cache the new data (the tournaments might have genuinely been removed).
- Never cache data that fails validation. Return the stale cached version instead, with a flag indicating the refresh failed.
- The API response should include metadata: `{ data: {...}, meta: { cached: true, cachedAt: "...", stale: true } }` so the frontend can show "showing cached data from X hours ago" when appropriate.

**Warning signs:**
- Player ratings suddenly showing as 0 or NaN
- Tournament count dropping to 0 for players who previously had many tournaments
- Cached data containing HTML fragments or error messages as field values

**Phase to address:**
Phase 1 (Scraping) -- Validation must be built into the parser, not bolted on later. The stale-data-fallback requirement in PROJECT.md directly addresses this, but the validation logic is the critical implementation detail.

---

### Pitfall 7: Express on Netlify Routing Misconfiguration

**What goes wrong:**
The entire Express app runs as a single Netlify Function. The `netlify.toml` redirect rule (`/api/* -> /.netlify/functions/api/:splat`) must exactly match the Express route mounting. If there's a mismatch -- for example, Express mounts routes at `/` but the redirect sends `/api/player/123` as `/player/123` -- routes return 404. This is especially confusing because it works perfectly in local development (where Express runs as a real server) but breaks in production.

**Why it happens:**
The local development experience (Express running on `localhost:3001`) is fundamentally different from the production deployment (Express wrapped in `serverless-http` behind a URL rewrite). Developers build and test locally, deploy, and discover routing is broken. The Netlify Functions logs may not clearly show what URL the function received.

**How to avoid:**
- Decide the route structure upfront and document it: Express routes at `/api/player/:id` map to Netlify function at `/.netlify/functions/api/player/:id` via the rewrite rule.
- Use `netlify dev` for local development from the start, not a standalone Express server. This simulates the production URL rewriting locally.
- In the Express app, mount the router at the same path prefix that the rewrite rule produces. Test with a simple health check endpoint first: `GET /api/health` should return 200.
- Add the redirect configuration from day one (verified from Netlify docs):
  ```toml
  [[redirects]]
  force = true
  from = "/api/*"
  status = 200
  to = "/.netlify/functions/api/:splat"
  ```

**Warning signs:**
- All API routes return 404 in production but work locally
- Netlify Function logs show the function being invoked but Express returns "Cannot GET /..."
- CORS errors in the browser (the redirect isn't catching OPTIONS requests)

**Phase to address:**
Phase 1 (API structure) + Phase 3 (Deployment) -- The Express app route prefix must be designed with the Netlify rewrite in mind from the start.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding CSS selectors for ASP.NET element IDs | Faster initial scraper development | Brittle; any site update breaks the scraper silently | Never -- use content-based selectors from the start |
| Storing raw HTML in Supabase instead of parsed data | Simpler cache implementation, can re-parse later | JSONB storage bloat (100KB+ per player), slower queries, re-parsing is never actually implemented | Never -- parse on scrape, store structured data |
| Using `margin-left`/`padding-right` instead of CSS Logical Properties | Familiar syntax, works in quick testing | Every layout value is backwards in RTL; fixing later means touching every component | Never in an RTL-first project -- use logical properties from the first component |
| Skipping loading/error states | Faster feature development | Users see blank screens during scrapes, broken layouts on errors; fixing later requires touching every data-fetching component | Only for internal prototyping; must be added before any user testing |
| Single global error handler instead of granular error types | Less boilerplate | Cannot distinguish "player not found" from "site down" from "encoding error"; users get unhelpful error messages | MVP only if time-constrained, but plan to refactor in Phase 2 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| chess.org.il scraping | Not setting a User-Agent header, causing the site to block requests (returns 403 or a CAPTCHA page) | Set a descriptive User-Agent header: `Chess-IL-Dashboard/1.0 (community project)`. Be a good citizen. |
| chess.org.il scraping | Fetching the page as UTF-8 text without checking the actual encoding | Fetch as binary buffer first, detect encoding from headers/meta tags, then decode with the correct `TextDecoder` |
| chess.org.il scraping | Parsing dates as MM/DD/YYYY (American format) when the site uses DD/MM/YYYY (Israeli format) | Split on `/` and construct dates explicitly: `new Date(year, month - 1, day)`. Never pass raw date strings to `new Date()`. |
| Supabase | Using the `service_role` key in client-side code or committing it to the repo | Use `anon` key in the client, `service_role` only in serverless functions, store in Netlify environment variables |
| Supabase | Creating a new client instance inside every function handler | Initialize the client at module scope (outside the handler) for reuse across warm invocations |
| Netlify Functions | Testing locally with `node server.js` instead of `netlify dev` | Always use `netlify dev` to simulate the production environment, including URL rewrites and function invocation |
| Recharts | Assuming `dir="rtl"` on a parent element will flip chart axes | Charts render in SVG; explicitly configure axis orientation and wrap chart containers in `dir="ltr"` |
| localStorage | Using `JSON.parse(localStorage.getItem(...))` without a try/catch | localStorage can be disabled, full, or contain corrupt data; always wrap in try/catch with a fallback |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Scraping chess.org.il on every page load instead of serving cached data | 5-15 second load times, timeout errors, excessive load on chess.org.il | Cache-first architecture: always serve from Supabase, scrape only when cache is stale (24h) | First user to hit a stale or uncached player; every user if cache logic is broken |
| Not paginating tournament data in the API response | Large JSON payloads for players with 100+ tournaments causing slow renders and memory pressure on mobile | Frontend-side pagination from full cached dataset; keep initial render to 10 rows | Players with 50+ tournaments; mobile devices with limited memory |
| Recharts re-rendering full chart on every state change | Janky chart animations, dropped frames on mobile, visible lag when switching between players | Memoize chart data with `useMemo`, use `React.memo` on chart wrapper components, avoid putting chart data in frequently-updated state | Any interaction that triggers a parent re-render (e.g., tab switching, dark mode toggle) |
| Cold start + scrape + DB write all in one request | First request after idle period takes 15-20 seconds (cold start + slow scrape + DB round trip) | Return stale cache immediately while refreshing in background; pre-warm with a scheduled health check ping | After 15+ minutes of no traffic (typical cold start window) |
| Fetching and parsing full ViewState with every scrape | ViewState can be 100KB+ of base64; fetching it wastes bandwidth and parsing time | Cheerio will parse it fine but do not try to store or process ViewState; skip over form elements and go straight to data tables | Every scrape; especially noticeable on slow connections |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing Supabase `service_role` key in frontend code or git repo | Full read/write access to the entire database; data deletion, injection of fake player data | Store in Netlify environment variables only; use `anon` key with Row Level Security for any client-side Supabase calls; add `.env` to `.gitignore` immediately |
| Not validating/sanitizing the player ID parameter | Server-Side Request Forgery (SSRF) if the player ID is used to construct the scraping URL without validation; attacker could make the server request arbitrary URLs | Validate that player ID is a positive integer (regex: `/^\d{1,10}$/`); reject any non-numeric input before constructing the URL |
| Reflecting scraped HTML content in API responses without sanitization | Stored XSS if chess.org.il content contains malicious scripts (unlikely but possible if the site is compromised) | Parse and extract only expected data fields (strings, numbers); never pass raw HTML through to the frontend |
| Not rate-limiting the force-refresh endpoint | An attacker (or overeager user) can trigger unlimited scrapes, potentially getting the dashboard's IP blocked by chess.org.il | Rate-limit force refresh to 1 per player per hour per client; implement server-side rate tracking in Supabase (last_forced_refresh timestamp) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing a spinner for 10+ seconds during initial scrape with no progress feedback | Users think the app is broken and leave; mobile users on slow connections abandon after 3 seconds | Show skeleton loading states immediately; if data takes >3s, show a message like "Fetching data from chess.org.il..." in Hebrew |
| Rating chart with no data labels or context | Users see a line going up and down but cannot quickly tell current vs. peak rating | Add annotation marks for peak/lowest rating; show the current rating prominently in the header card so the chart provides context, not the only readout |
| Truncating Hebrew text in small containers | Mid-word truncation in Hebrew is more jarring than in English; RTL ellipsis positioning is inconsistent across browsers | Use `text-overflow: ellipsis` with `direction: rtl` tested on actual Hebrew content; prefer wrapping over truncation for player names |
| Error messages in English in an otherwise Hebrew interface | Breaks the experience; non-English-speaking users cannot understand what went wrong | All user-facing strings in Hebrew, including error messages; maintain a Hebrew string constants file; log technical errors to console in English |
| Comparison page without clear visual hierarchy | Two players side-by-side with identical formatting; hard to tell which stats are better at a glance | Use the project's color system: green (#639922) highlight for the player with the better stat in each row, red (#E24B4A) for the lower value |
| Numbers displayed without `dir="ltr"` inside Hebrew text | Negative rating changes like "-7.2" render with the minus sign in the wrong position due to RTL reordering | Wrap all numeric values (ratings, rating changes, scores) in `<span dir="ltr">` or use `unicode-bidi: isolate` to prevent bidirectional text algorithm from reordering characters |

## "Looks Done But Isn't" Checklist

- [ ] **Scraper encoding:** Test with a player whose name contains Hebrew characters -- verify they render as actual Hebrew in the database and API response, not as byte sequences or question marks
- [ ] **RTL layout on mobile:** Test at exactly 375px width -- components that fit at 400px may overlap at 375px; RTL + flexbox wrapping creates unique layout breaks where items wrap to the wrong side
- [ ] **Empty state handling:** What does the dashboard show for a player with 0 tournaments? The chart, table, and donut all need empty states with Hebrew messages, not blank containers or JS errors
- [ ] **Force refresh during active scrape:** If user clicks "refresh" while a scrape is already in progress, does it launch a duplicate scrape? Must deduplicate concurrent requests for the same player
- [ ] **10 saved players at limit:** What happens when a user tries to save an 11th player? Must show a clear Hebrew message, not silently fail or throw a console error
- [ ] **First-ever player lookup:** First request for a never-before-seen player ID has no cache -- the "cache miss -> scrape -> store -> respond" flow is the longest codepath and the one most likely to timeout on Netlify
- [ ] **Date format parsing:** Tournament dates from chess.org.il are in DD/MM/YYYY (Israeli format) -- parsing them as MM/DD/YYYY silently produces wrong dates for days 1-12 of each month
- [ ] **Rating chart with single data point:** A player with only 1 tournament has 1 data point -- Recharts renders a dot, not a line; this may look broken to users without an explanatory message
- [ ] **Dark mode chart colors:** Chart colors that look good on white backgrounds may be invisible or hard to read on dark backgrounds; test the blue (#378ADD), green (#639922), and red (#E24B4A) on both
- [ ] **CORS on Netlify:** The API function must return proper CORS headers (`Access-Control-Allow-Origin`); Netlify does not add these automatically for function responses; preflight OPTIONS requests must also be handled
- [ ] **Invalid player ID:** What does the API return for a player ID that doesn't exist on chess.org.il? Must return a clear 404 with Hebrew message, not a 500 from a failed parse

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hebrew encoding corruption in cached data | LOW | Flush the Supabase cache (delete all rows or add a cache version column), fix the encoding in the scraper, let data re-populate organically as users visit player pages |
| ASP.NET selector breakage after site update | MEDIUM | Fetch a fresh HTML sample from chess.org.il, compare against stored snapshot, update selectors in parser, re-run snapshot tests, flush affected cache entries |
| Netlify routing misconfiguration | LOW | Compare `netlify.toml` redirects against Express route definitions; add logging to show the actual URL received by the function; test with `netlify dev`; redeploy |
| Supabase connection exhaustion | LOW | Verify using `@supabase/supabase-js` (REST-based, no direct connections), move client initialization to module scope, redeploy |
| RTL chart rendering issues | MEDIUM | Wrap chart containers in `dir="ltr"`, reconfigure axis orientation, test on mobile at 375px; may require reworking chart component props across all chart components |
| Cached garbage data from failed scrapes | LOW | Add validation to the parser, run a cleanup query against Supabase (DELETE WHERE player_name IS NULL OR rating < 0 OR rating > 3000), redeploy with validation |
| Timeout cascade from slow chess.org.il | MEDIUM | Add AbortController with 15s timeout on outbound fetch, implement stale-while-revalidate pattern, evaluate Netlify Background Functions for async scraping |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| ASP.NET selector brittleness | Phase 1 (Scraping) | Snapshot tests pass; structural validator detects and reports missing fields with descriptive errors |
| Hebrew encoding corruption | Phase 1 (Scraping) | Test player names render as valid Hebrew Unicode (U+0590-U+05FF range); automated test with known player names |
| Netlify function timeout | Phase 1 (API) + Phase 3 (Deploy) | Cache-miss request completes in <30s; cache-hit in <1s; timeout produces user-friendly error, not 502 |
| RTL chart rendering | Phase 2 (Dashboard UI) | Visual review of charts at 375px in RTL mode; time axis reads left-to-right; tooltips stay within viewport |
| Supabase connection pattern | Phase 1 (Database) | Client initialized at module scope; imports `@supabase/supabase-js` only (no `pg` package) |
| Stale/partial data caching | Phase 1 (Scraping) | Parser rejects invalid data; API returns last-good cached data with `stale: true` flag when scrape fails |
| Express/Netlify routing | Phase 1 (API structure) + Phase 3 (Deploy) | Health check endpoint (`GET /api/health`) returns 200 on production Netlify URL |
| Player ID validation | Phase 1 (API) | Non-numeric player IDs return 400 error; URL construction only uses validated integer IDs |
| Date format parsing | Phase 1 (Scraping) | Tournament dates parsed as DD/MM/YYYY; automated test verifies known tournament dates match expected values |
| Dark mode chart colors | Phase 2 (Dashboard UI) | Charts visually tested in both light and dark mode; all data series are distinguishable in both |
| Empty/edge case UI states | Phase 2 (Dashboard UI) | 0-tournament player, 1-tournament player, and 100+ tournament player all render without errors |
| localStorage edge cases | Phase 2 (Dashboard UI) | 11th save attempt shows Hebrew message; corrupt localStorage gracefully resets to empty array |
| Bidi text reordering | Phase 2 (Dashboard UI) | Negative numbers display correctly inside Hebrew text; rating changes show minus sign in correct position |
| CORS configuration | Phase 3 (Deploy) | Frontend on Netlify domain can call API endpoints; OPTIONS preflight returns correct headers |

## Sources

- Netlify Functions documentation: https://docs.netlify.com/functions/overview/ (verified -- 60s sync timeout, 6MB payload limit, 1024MB memory)
- Netlify Express deployment guide: https://docs.netlify.com/frameworks/express/ (verified -- serverless-http wrapping, redirect configuration, netlify.toml setup)
- ASP.NET WebForms scraping patterns: training data (MEDIUM confidence -- WebForms ID generation patterns are well-documented but chess.org.il specifics need runtime validation)
- Hebrew encoding (Windows-1255 vs UTF-8): training data (HIGH confidence -- this is a well-known and extensively documented encoding issue for Israeli websites)
- Recharts RTL behavior: training data (MEDIUM confidence -- SVG ignoring CSS direction is a known behavior, but specific Recharts prop configuration should be verified against current docs)
- Supabase serverless patterns: training data (HIGH confidence -- PostgREST vs direct connection distinction is core to Supabase architecture and well-documented)
- RTL CSS Logical Properties: training data (HIGH confidence -- W3C specification, widely supported in modern browsers)
- Unicode bidirectional algorithm: training data (HIGH confidence -- Unicode standard, well-documented behavior with numbers in RTL contexts)

---
*Pitfalls research for: Chess IL Dashboard -- web scraping ASP.NET WebForms + Hebrew RTL dashboard on Netlify*
*Researched: 2026-04-19*

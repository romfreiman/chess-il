# Pitfalls Research

**Domain:** Chess stats dashboard with web scraping
**Researched:** 2026-04-19
**Confidence:** HIGH

## Critical Pitfalls

### 1. ASP.NET WebForms HTML Structure Changes

**Risk:** HIGH
**Phase:** 1 (Scraping Engine)

chess.org.il uses ASP.NET WebForms which generates IDs like `ctl00_ContentPlaceHolder1_GridView1`. These IDs can change when the site is updated.

**Warning signs:**
- Scraper returns null/undefined for fields that previously worked
- HTML element IDs or class names change between site versions

**Prevention strategy:**
- Parse by semantic structure (table position, header text) rather than specific element IDs
- Use multiple selector strategies with fallbacks
- Include a "scraper health check" that validates expected fields are present
- Log warnings when optional fields are missing
- Test with real player pages during development (IDs 205001, 210498)

### 2. Hebrew/RTL Text Handling

**Risk:** MEDIUM
**Phase:** 2 (Core Frontend)

Hebrew text mixed with numbers (ratings, dates) creates bidirectional text issues. A rating change of "-7.2" next to Hebrew text can render in wrong order.

**Warning signs:**
- Numbers appearing on wrong side of text
- Dates rendering backwards
- Chart axis labels misaligned

**Prevention strategy:**
- Use `dir="rtl"` on root element
- Wrap numeric values in `<span dir="ltr">` when embedded in Hebrew text
- Test all number displays (ratings, dates, scores) in both LTR and RTL contexts
- Use `unicode-bidi: isolate` for mixed-direction content
- Recharts may need explicit RTL configuration for axis labels

### 3. Supabase Connection from Netlify Functions

**Risk:** MEDIUM
**Phase:** 1 (Setup)

Netlify Functions are serverless — each invocation may create a new database connection. Supabase has connection limits on free tier.

**Warning signs:**
- "Too many connections" errors under load
- Intermittent database timeouts
- Slow cold starts

**Prevention strategy:**
- Use `@supabase/supabase-js` client (uses REST API, not direct Postgres connections)
- Do NOT use `pg` or direct connection strings in serverless functions
- Supabase JS client goes through PostgREST, which handles connection pooling server-side
- Keep function execution time short (read cache → return, or scrape → write → return)

### 4. Scraping Rate Limiting / Blocking

**Risk:** MEDIUM
**Phase:** 1 (Scraping Engine)

chess.org.il may block or rate-limit automated requests, especially from cloud IP ranges (Netlify Functions).

**Warning signs:**
- HTTP 403/429 responses
- HTML responses that are login pages or CAPTCHA
- Timeouts on previously working requests

**Prevention strategy:**
- Set custom User-Agent: `ChessIL-Dashboard/1.0 (community project)`
- Enforce 24-hour cache window strictly (never scrape more than once per player per day)
- Implement graceful degradation: return stale cached data when scrape fails
- Add `stale: true` flag to response so frontend can show indicator
- Consider adding request delay/backoff if multiple players are fetched in quick succession

### 5. Netlify Functions + Express Compatibility

**Risk:** MEDIUM
**Phase:** 1 (Setup)

Express apps need adaptation to run as Netlify Functions. The `serverless-http` wrapper or `@netlify/functions` adapter is required.

**Warning signs:**
- Routes not matching in production
- Request/response objects missing properties
- CORS issues only in production (not local dev)

**Prevention strategy:**
- Use `serverless-http` to wrap Express app for Netlify Functions
- Test with `netlify dev` locally (simulates production environment)
- Keep route structure simple: single `/api/player/:id` endpoint
- Avoid Express middleware that depends on persistent state (sessions, etc.)

### 6. Recharts RTL Chart Rendering

**Risk:** MEDIUM
**Phase:** 2 (Core Frontend)

Recharts doesn't have native RTL support. Charts may render left-to-right even in an RTL page, which is actually correct for time-series (older → newer, left → right) but confusing for Hebrew axis labels.

**Warning signs:**
- X-axis labels overlap or render incorrectly
- Tooltip appears on wrong side
- Chart doesn't visually match RTL page flow

**Prevention strategy:**
- Keep charts LTR for time-series data (this is standard even in RTL interfaces)
- Hebrew month labels on x-axis should work fine as isolated text
- Wrap chart container with `dir="ltr"` to prevent RTL layout issues
- Test tooltip positioning on mobile (may overflow on narrow screens)

### 7. Tournament Date Parsing

**Risk:** LOW
**Phase:** 1 (Scraping)

chess.org.il uses `dd/MM/yyyy` date format. JavaScript's `Date` constructor interprets dates differently based on locale.

**Warning signs:**
- Dates showing wrong month (month/day swap)
- Invalid dates for Hebrew month names
- Chart X-axis dates in wrong order

**Prevention strategy:**
- Parse dates manually: split on `/` and construct explicitly
- Do NOT use `new Date(dateString)` — it's locale-dependent
- Store dates as ISO 8601 strings in the database
- Use a light date library (date-fns) only if needed for chart formatting

### 8. localStorage Limits and Data Integrity

**Risk:** LOW
**Phase:** 3 (Enhanced Features)

Saved players in localStorage could accumulate stale data. Users clearing browser data lose all saved players.

**Warning signs:**
- Saved players showing outdated ratings
- localStorage quota exceeded (unlikely with max 10 players)
- Lost data after browser cleanup

**Prevention strategy:**
- Store minimal data: `{ id, name, rating }` per saved player
- Max 10 saved players (prevent unbounded growth)
- Refresh saved player data when dashboard loads (update name/rating from API response)
- Show graceful empty state when no saved players exist

### 9. Monorepo Build Configuration

**Risk:** LOW
**Phase:** 1 (Setup)

Netlify needs to build both the React frontend and the serverless functions from the same repo.

**Warning signs:**
- Build succeeds locally but fails on Netlify
- Functions not found in production
- Wrong Node.js version on Netlify

**Prevention strategy:**
- Use `netlify.toml` to configure:
  - `[build] command = "npm run build"`
  - `[build] publish = "dist"` (Vite output)
  - `[functions] directory = "netlify/functions"`
- Set Node.js version in `netlify.toml` or `.node-version`
- Use `netlify dev` for local development to match production behavior

## Pitfall Priority for Roadmap

| Pitfall | Phase | Severity | Mitigation Effort |
|---------|-------|----------|-------------------|
| ASP.NET HTML structure | Phase 1 | HIGH | MEDIUM |
| Supabase serverless connections | Phase 1 | MEDIUM | LOW |
| Netlify + Express compatibility | Phase 1 | MEDIUM | LOW |
| Scraping rate limiting | Phase 1 | MEDIUM | LOW |
| Date parsing | Phase 1 | LOW | LOW |
| Hebrew/RTL text | Phase 2 | MEDIUM | MEDIUM |
| Recharts RTL | Phase 2 | MEDIUM | LOW |
| localStorage limits | Phase 3 | LOW | LOW |
| Monorepo build config | Phase 1 | LOW | LOW |

---
*Pitfalls research for: chess stats dashboard*
*Researched: 2026-04-19*

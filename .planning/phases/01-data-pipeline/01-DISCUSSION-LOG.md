# Phase 1: Data Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 01-data-pipeline
**Areas discussed:** Scraping strategy, API response design, Data model shape, Project scaffolding
**Mode:** Auto (all decisions auto-selected from recommended defaults)

---

## Scraping Strategy

### Q1: How should the scraper handle chess.org.il's ASP.NET HTML?

| Option | Description | Selected |
|--------|-------------|----------|
| Content-based selectors with structural fallbacks | Parse by header text, label text, table structure — resilient to ID changes | ✓ |
| ASP.NET ID-based selectors | Use `ctl00_ContentPlaceHolder1_*` IDs — fast but brittle | |
| Regex-based extraction | Pattern match on HTML — no DOM parsing needed | |

**User's choice:** Content-based selectors with structural fallbacks (auto-selected)
**Notes:** ASP.NET WebForms auto-generates IDs that can change on site updates. Content-based selectors are more resilient.

### Q2: How to handle Hebrew encoding?

| Option | Description | Selected |
|--------|-------------|----------|
| Detect from Content-Type, default UTF-8, fallback Windows-1255 | Adaptive approach that handles both cases | ✓ |
| Assume UTF-8 only | Modern default, may break on legacy sites | |
| Assume Windows-1255 only | Legacy Hebrew encoding, may break if site modernizes | |

**User's choice:** Detect from Content-Type header (auto-selected)
**Notes:** chess.org.il may use either encoding. Runtime detection is safest.

### Q3: What happens when a field is missing from the page?

| Option | Description | Selected |
|--------|-------------|----------|
| Return null for optional, fail on name/rating | Graceful degradation for optional data | ✓ |
| Fail on any missing field | Strict — catches HTML changes early | |
| Return defaults for everything | Never fails but may show wrong data | |

**User's choice:** Return null for optional fields (auto-selected)

---

## API Response Design

### Q4: What shape should the API response take?

| Option | Description | Selected |
|--------|-------------|----------|
| `{ player, tournaments, meta }` structure | Clean separation with cache metadata | ✓ |
| Flat object with all fields | Simple but no structure | |
| Nested with pagination metadata | Over-engineered for single player | |

**User's choice:** Structured with player, tournaments, and meta keys (auto-selected)

### Q5: How should errors be returned?

| Option | Description | Selected |
|--------|-------------|----------|
| JSON with error/message/statusCode | Standard REST error format | ✓ |
| HTTP status code only | Minimal but hard to debug | |
| Error wrapped in data envelope | Consistent shape but verbose | |

**User's choice:** Standard JSON error object (auto-selected)

---

## Data Model Shape

### Q6: How should tournament results be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| Parse into wins/draws/losses integers at scrape time | Frontend-friendly, no parsing needed | ✓ |
| Keep raw result string | Preserves source format, frontend parses | |

**User's choice:** Parse at scrape time (auto-selected)

### Q7: Store dates as strings or Date objects?

| Option | Description | Selected |
|--------|-------------|----------|
| ISO 8601 strings | No timezone issues, JSON-safe | ✓ |
| Unix timestamps | Compact but less readable | |
| Original format (dd/MM/yyyy) | Requires frontend parsing | |

**User's choice:** ISO 8601 strings (auto-selected)

---

## Project Scaffolding

### Q8: What project structure?

| Option | Description | Selected |
|--------|-------------|----------|
| Monorepo with shared types | One repo, shared TypeScript types between frontend and backend | ✓ |
| Separate frontend/backend repos | Clear boundaries but duplicate types | |

**User's choice:** Monorepo (auto-selected)

### Q9: Development workflow?

| Option | Description | Selected |
|--------|-------------|----------|
| `netlify dev` for local development | Simulates production function routing | ✓ |
| Separate dev servers for frontend and backend | More control but diverges from production | |

**User's choice:** netlify dev (auto-selected)

---

## Claude's Discretion

- Specific Cheerio selectors (discovered during implementation)
- Error handling granularity (retry logic, timeouts)
- Supabase table indexing
- TypeScript type naming conventions
- Test structure and approach

## Deferred Ideas

None — discussion stayed within phase scope

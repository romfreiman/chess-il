# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Club Player Search & Export

**Shipped:** 2026-04-25
**Phases:** 3 | **Plans:** 6 | **Tasks:** 11

### What Was Built
- Club scraper handling ASP.NET 3-step postback flow (GET viewstate, expand panel, POST filters)
- Express API routes for club list (7-day cached) and player search (ephemeral)
- Searchable club dropdown with ARIA combobox, age range filters, loading states
- Responsive results display: desktop table + mobile cards with checkbox selection
- Tab-based HomePage integrating player search and club search with URL state
- Client-side CSV export with UTF-8 BOM encoding for Hebrew Excel compatibility

### What Worked
- **Velocity was excellent**: 6 plans across 3 phases completed in ~2 days (~18 min total execution)
- **Existing patterns carried forward well**: same scraper architecture (Cheerio + axios), same caching pattern (Supabase + SQLite), same component structure
- **Shared helpers extracted early**: `extractViewState` and `expandAdvancedPanel` avoided duplication between club list and player search scrapers
- **URL state as single source of truth**: `useSearchParams` for tab switching and club search filters prevented state sync bugs
- **No new dependencies needed**: entire v1.1 built with existing stack

### What Was Inefficient
- **v1.0 was never formally archived**: required completing v1.1 without a clean v1.0 baseline. v1.0 audit showed tech debt (stale test mocks, Nyquist gaps) that was never addressed
- **Phase 8 skipped research**: CSV export was simple enough that research was unnecessary, but this left a Nyquist validation gap
- **Backend test suite has stale mocks**: 4/10 backend tests still fail from Phase 1 mock path drift (tests mock `../../src/db/supabase.js` but production uses `../../db/index.js`)

### Patterns Established
- **Ephemeral vs cached data**: search results are ephemeral (no caching), club list is cached (7-day TTL) — clear policy for when to cache
- **Client-side export via Blob API**: no server-side generation needed for CSV
- **Tab-based page composition**: HomePage uses URL-driven tabs to host multiple search interfaces
- **Selection state resets on new search**: prevents stale selections from prior search results

### Key Lessons
1. ASP.NET WebForms scraping via Cheerio is viable for server-rendered pages with postback flows — no need for browser automation
2. BOM-prefixed UTF-8 (`﻿`) is essential for Hebrew CSV files to render correctly in Excel
3. Club search approaches Netlify Function timeout limits (6-9 seconds for 3-step flow) — pagination or larger clubs may need optimization
4. RFC 4180 escaping (double-quote wrapping, comma/quote handling) is non-trivial and worth extracting as a pure utility function

### Cost Observations
- Sessions: ~4 (context, research/plan, execute phases 6-7, execute phase 8)
- Total execution: ~18 minutes across 6 plans
- Average: ~3 min/plan — faster than v1.0 average of ~4.5 min/plan

---

## Cross-Milestone Trends

| Metric | v1.0 MVP | v1.1 Club Search |
|--------|----------|------------------|
| Phases | 5 | 3 |
| Plans | 13 | 6 |
| Tasks | ~26 | 11 |
| Avg/plan | ~4.5 min | ~3 min |
| LOC (source) | ~2,500 | ~2,039 |
| Test count | 163 frontend | +30 (club routes) |

**Trend:** Plan execution speed is improving as patterns stabilize. v1.1 plans averaged 3 min vs v1.0's 4.5 min.

---

*Updated: 2026-04-25 after v1.1 milestone*

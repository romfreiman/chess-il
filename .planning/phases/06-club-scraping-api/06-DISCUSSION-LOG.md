# Phase 6: Club Scraping & API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 06-club-scraping-api
**Areas discussed:** Club list source, Club list caching

---

## Club List Source

### Q1: Where should we scrape the club list from?

| Option | Description | Selected |
|--------|-------------|----------|
| Advanced search dropdown (Recommended) | Scrape the club dropdown from SearchPlayers.aspx advanced search panel. ~200 clubs. Same page used for player search. | ✓ |
| SearchClubs.aspx page | Dedicated clubs listing page (~110 clubs). Separate scrape target, may not include all clubs. | |
| You decide | Claude picks the source with the most complete list. | |

**User's choice:** Advanced search dropdown (Recommended)
**Notes:** None

### Q2: Should the club scrape be a separate endpoint or piggyback on player search?

| Option | Description | Selected |
|--------|-------------|----------|
| Separate endpoint (Recommended) | GET /api/clubs does its own GET+postback. Keeps club list independent. Can be cached separately. | ✓ |
| Combined flow | First call to /api/clubs/search fetches clubs AND runs the search. Fewer requests but couples operations. | |
| You decide | Claude picks based on caching and performance tradeoffs. | |

**User's choice:** Separate endpoint (Recommended)
**Notes:** None

### Q3: Should the API return clubs with city grouping?

| Option | Description | Selected |
|--------|-------------|----------|
| Just id and name | Simple flat list. Phase 7 uses a searchable dropdown — flat list is sufficient. | |
| Include city | Add city field. Enables grouping in dropdown or "Club (City)" format. | |
| You decide | Claude picks based on what the dropdown needs. | ✓ |

**User's choice:** You decide
**Notes:** Claude's discretion — include city if naturally available in the HTML structure.

---

## Club List Caching

### Q4: How should the club list be cached?

| Option | Description | Selected |
|--------|-------------|----------|
| In-memory with TTL (Recommended) | Cache in module-level variable with 24h TTL. Simple, no DB dependency. | |
| Supabase table | Store clubs in Supabase. Persistent across cold starts. Guarantees fast responses. | ✓ |
| No caching | Fetch fresh every time. Simplest but adds 2-3s latency. | |
| You decide | Claude picks balanced approach. | |

**User's choice:** Supabase table
**Notes:** None

### Q5: How often should the cached club list be refreshed?

| Option | Description | Selected |
|--------|-------------|----------|
| Weekly (Recommended) | Re-scrape if last update was 7+ days ago. Clubs change rarely. | ✓ |
| Daily | Re-scrape if last update was 24+ hours ago. Same cadence as player data. | |
| Manual only | Only refresh via force parameter. Never auto-refreshes. | |
| You decide | Claude picks reasonable TTL. | |

**User's choice:** Weekly (Recommended)
**Notes:** None

---

## Claude's Discretion

- Club data shape: Whether to include city field alongside id and name (depends on HTML structure)
- Specific Cheerio selectors for club dropdown and search results
- Timeout values for the 3-step postback flow
- Error handling granularity in club scraper
- Supabase table schema details for clubs cache

## Deferred Ideas

None — discussion stayed within phase scope

## Areas Not Discussed (User Skipped)

- **Search response shape** — Carried forward from requirements (name, ID, rating, club, birth year)
- **Timeout strategy** — Left to Claude's discretion (existing pattern uses 15s)

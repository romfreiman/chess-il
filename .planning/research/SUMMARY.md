# Research Summary: Chess IL Dashboard

**Domain:** Chess player statistics dashboard (Israeli federation, OTB)
**Researched:** 2026-04-19
**Overall confidence:** MEDIUM

## Executive Summary

The Chess IL Dashboard fills a clear gap in the Israeli chess ecosystem. chess.org.il has the data but presents it through a dated ASP.NET WebForms interface with no analytics, no charts, no comparison tools, and no mobile optimization. Meanwhile, platforms like chess.com and lichess offer excellent analytics but only for online play -- they have no access to Israeli federation OTB ratings and tournament data. There is no existing product that presents Israeli OTB chess data with modern analytics.

The data extraction challenge is the core technical risk. chess.org.il has no API, so HTML scraping with Cheerio is the only option. The good news is that player profile pages load via simple GET requests, making the primary data accessible without the complexity of ASP.NET postback form manipulation. The bad news is that deeper data (individual game results, opponent information) requires `__doPostBack` POST requests which are fragile and complex -- these should be deferred.

Feature-wise, the product's table stakes are clear: player search, rating display, rating history chart, tournament table, and aggregate stats. The key differentiator is the player comparison feature with shared tournament detection -- no existing tool in this ecosystem offers this. Anti-features are equally clear: game-level data scraping, user authentication, real-time notifications, and leaderboards all add disproportionate complexity relative to their value at this stage.

The target audience (Israeli chess players, parents of youth players, club members) knows their player IDs and wants quick answers to simple questions: "What's my current rating?", "Am I improving?", "How do I compare to my club mate?" The MVP should nail these three questions.

## Key Findings

**Stack:** React + TypeScript + Tailwind + Recharts frontend, Node/Express + Cheerio backend, Supabase cache. Well-scoped and appropriate.
**Architecture:** Scrape-cache-serve pipeline with 24h freshness. Simple and effective for the data access constraints.
**Critical pitfall:** Scraping fragility -- chess.org.il HTML structure changes will break the parser. Need robust selectors and graceful degradation.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Scraping + API Foundation** - Build the data pipeline first since every feature depends on it
   - Addresses: Player search, scraping, caching, API endpoint
   - Avoids: Building UI against mock data that doesn't match real scrape output

2. **Core Dashboard UI** - Player profile page with all stats visualizations
   - Addresses: Header card, metrics row, rating chart, tournament table, W/D/L donut
   - Avoids: Premature comparison features before single-player view is solid

3. **Polish + Persistence** - Save players, dark mode, loading states, error handling
   - Addresses: Save/follow, dark mode, skeleton loaders, Hebrew error messages
   - Avoids: Adding comparison before core experience is complete

4. **Comparison + Advanced** - Side-by-side player comparison
   - Addresses: Compare page, overlay chart, shared tournament detection
   - Avoids: This is the highest-complexity differentiator; build on proven foundation

**Phase ordering rationale:**
- Scraping must come first -- it's the foundation everything depends on
- Single-player dashboard before comparison -- validate data display works before doubling complexity
- Polish features (dark mode, save) can weave into any phase but shouldn't block core functionality
- Comparison is the differentiator but also the most complex -- build last on a stable base

**Research flags for phases:**
- Phase 1 (Scraping): Needs careful research on chess.org.il HTML structure, selector stability, error patterns
- Phase 2 (Dashboard UI): Standard patterns, Recharts is well-documented
- Phase 4 (Comparison): May need research on date alignment logic for shared tournament detection

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Stack is specified in PROJECT.md; appropriate for the problem. No live verification of library versions. |
| Features | MEDIUM | Feature landscape based on training data knowledge of chess.com/lichess/FIDE. Core features are stable across these platforms. |
| Architecture | MEDIUM | Scrape-cache-serve is standard for API-less data sources. chess.org.il specifics from project docs. |
| Pitfalls | MEDIUM | Scraping fragility is a well-known risk. Specific chess.org.il failure modes not yet observed. |

## Gaps to Address

- Live verification of chess.org.il HTML structure and selector patterns (needed during Phase 1)
- Actual scrape response times and reliability (will inform cache strategy refinement)
- Real mobile testing on 375px screens (design phase concern)
- Whether chess.org.il rate-limits or blocks after repeated access (operational risk)
- Recharts RTL support specifics (chart axis direction, label positioning)

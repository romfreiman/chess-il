# Chess IL Dashboard

## What This Is

A modern, mobile-first web dashboard for viewing Israeli Chess Federation player statistics. It scrapes player data from chess.org.il (which has no public API), caches it in Supabase, and presents rich stats, charts, and comparison tools in a clean RTL Hebrew interface.

## Core Value

Any user can enter a player ID and instantly see a beautiful, data-rich dashboard of that player's chess rating history, tournament results, and performance stats.

## Requirements

### Validated

- [x] Home page with player ID search and saved players list — Validated in Phase 2: Home & App Shell
- [x] RTL Hebrew interface throughout — Validated in Phase 2: Home & App Shell
- [x] Mobile-first responsive design (375px minimum) — Validated in Phase 2: Home & App Shell
- [x] Dark mode support — Validated in Phase 2: Home & App Shell

### Active

- [ ] Scrape chess.org.il player pages and extract structured data (player info + tournament history)
- [ ] Cache scraped data in Supabase with 24-hour freshness window
- [ ] Serve player data via REST API (`GET /api/player/:id`)
- [ ] Player dashboard with header card, metrics row, rating chart, tournament table, and win/loss donut
- [ ] Compare page for side-by-side player comparison
- [ ] Save/follow players via localStorage (max 10)
- [ ] Tournament table pagination (10 per page)
- [ ] Force refresh button to re-scrape ignoring cache
- [ ] Skeleton loading states and Hebrew error messages
- [ ] Stale data fallback when scraping fails

### Out of Scope

- Detailed game history (requires ASP.NET `__doPostBack` POST requests) — too complex for v1
- User authentication / server-side accounts — localStorage sufficient for MVP
- Mobile native app — web-first approach
- Nemesis/client rival tagging — future feature, requires opponent data parsing
- Real-time notifications — not needed for stats dashboard

## Context

- chess.org.il is an ASP.NET WebForms site with Hebrew RTL layout
- Player pages load via GET at `chess.org.il/Players/Player.aspx?Id={id}`
- No public API exists; HTML scraping is the only data access method
- The scraper must use a custom User-Agent header to avoid blocks
- Rate limiting: max one scrape per player per 24 hours
- Test players: 205001 (Andy Freiman, ~1476 rating), 210498 (Lenny Freiman, ~1253 rating)

## Constraints

- **Tech Stack**: React + TypeScript + Tailwind CSS + Recharts (frontend), Node.js + Express (backend), Cheerio (scraping), Supabase (database/cache)
- **Deployment**: Netlify hosting
- **Scraping Rate**: Max once per player per 24 hours
- **UI Direction**: Full RTL with Hebrew labels
- **Mobile**: Must work on 375px screens
- **Colors**: Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cheerio over Puppeteer for scraping | Player pages load via GET, no JS rendering needed; Cheerio is lighter and faster | — Pending |
| Supabase for caching | Provides managed Postgres with JSONB support; simple setup | — Pending |
| localStorage for saved players | No auth complexity for MVP; user preferences are device-local | — Pending |
| Skip __doPostBack data | Detailed game history requires complex ASP.NET form simulation; not worth the effort for v1 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-20 after Phase 3 completion — player dashboard with all data visualization components built*

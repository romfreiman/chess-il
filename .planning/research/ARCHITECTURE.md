# Architecture Research

**Domain:** Chess stats dashboard with web scraping
**Researched:** 2026-04-19
**Confidence:** HIGH

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                  Netlify CDN                     │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ React SPA    │  │ Netlify Functions        │  │
│  │ (Static)     │──│ ┌─────────────────────┐  │  │
│  │              │  │ │ /api/player/:id      │  │  │
│  │ - Search     │  │ │ Express Router       │  │  │
│  │ - Dashboard  │  │ │   ├─ Cache Check     │  │  │
│  │ - Compare    │  │ │   ├─ Scraper         │  │  │
│  └──────────────┘  │ │   └─ Data Transform  │  │  │
│                    │ └─────────────────────┘  │  │
│                    └─────────────────────────┘  │
└─────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │     Supabase        │
              │  players (JSONB)    │
              └─────────────────────┘
                         │ (on cache miss)
                         ▼
              ┌─────────────────────┐
              │   chess.org.il      │
              │  Player.aspx?Id=X   │
              └─────────────────────┘
```

## Component Boundaries

### 1. Frontend (React SPA)

**Responsibility:** UI rendering, client-side routing, localStorage, API calls

**Structure:**
```
src/
├── pages/           # Home, PlayerDashboard, Compare
├── components/      # PlayerHeader, MetricsRow, RatingChart, TournamentTable, WinLossDonut
├── hooks/           # usePlayer, useSavedPlayers
├── lib/             # api client, types
└── App.tsx          # Router setup
```

### 2. Backend (Netlify Functions)

**Responsibility:** API routing, cache management, scraping, data transformation

**Structure:**
```
netlify/functions/
└── api.ts           # Express-wrapped Netlify Function
    ├── routes/      # player.ts
    ├── scraper/     # fetch.ts, parse.ts, transform.ts
    └── db/          # supabase.ts
```

### 3. Scraper Module

**Input:** player ID → **Output:** structured PlayerData object
- Custom User-Agent header
- Rate limited by cache layer (24h per player)

### 4. Database (Supabase)

```sql
players (
  player_id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ
)
```

## Data Flow

### Cache Hit (~100ms)
```
Browser → GET /api/player/:id → Supabase (fresh) → Return cached JSON
```

### Cache Miss (~1-3s)
```
Browser → GET /api/player/:id → Supabase (stale) → Scrape chess.org.il → Parse → Upsert → Return JSON
```

### Scrape Failure (graceful degradation)
```
Browser → GET /api/player/:id → Supabase (stale) → Scrape FAILS → Return stale data + { stale: true }
```

## Suggested Build Order

```
Phase 1: Project Setup + Scraping Engine
  → Initialize monorepo, scraper, Supabase, API endpoint
Phase 2: Core Frontend
  → Search, dashboard (header, metrics, chart, table, donut), RTL/Hebrew
Phase 3: Enhanced Features
  → Saved players, dark mode, compare page
Phase 4: Polish + Deploy
  → Loading/error states, mobile optimization, Netlify deployment
```

**Why this order:** Data pipeline first (everything depends on it) → core UI → enhanced features → polish.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo | Share TypeScript types; simpler deployment |
| Netlify Functions | No server management; same-origin eliminates CORS |
| JSONB cache | Flexible schema; simpler than normalized tables |
| Cache-then-scrape | Rate limit protection; fast reads; graceful degradation |
| Client-only state | No auth needed; localStorage sufficient |

---
*Architecture research for: chess stats dashboard*
*Researched: 2026-04-19*

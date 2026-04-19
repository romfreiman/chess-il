# Stack Research

**Domain:** Chess stats dashboard with web scraping
**Researched:** 2026-04-19
**Confidence:** HIGH

## Recommended Stack

### Frontend

| Technology | Version | Rationale | Confidence |
|-----------|---------|-----------|------------|
| React | 18.x | Mature ecosystem, excellent charting library support | HIGH |
| TypeScript | 5.x | Type safety for complex data structures (player stats, tournament history) | HIGH |
| Tailwind CSS | 3.x | Built-in RTL support via `dir="rtl"`, dark mode via `dark:` classes | HIGH |
| Recharts | 2.x | React-native charting, supports LineChart, PieChart, BarChart | HIGH |
| React Router | 6.x | Client-side routing for `/`, `/player/:id`, `/compare` | HIGH |
| Vite | 5.x | Fast dev server, excellent TypeScript support | HIGH |

### Backend

| Technology | Version | Rationale | Confidence |
|-----------|---------|-----------|------------|
| Node.js | 20.x LTS | Matches frontend JS ecosystem, good for I/O-bound scraping | HIGH |
| Express | 4.x | Lightweight, sufficient for simple REST API | HIGH |
| Cheerio | 1.x | Fast HTML parsing without browser overhead, perfect for server-rendered ASP.NET pages | HIGH |
| axios | Latest | HTTP client for scraping chess.org.il | HIGH |

### Database / Cache

| Technology | Rationale | Confidence |
|-----------|-----------|------------|
| Supabase (Postgres) | Managed Postgres with JSONB for flexible player data, free tier sufficient for MVP | HIGH |

### Deployment

| Technology | Rationale | Confidence |
|-----------|-----------|------------|
| Netlify | Frontend static hosting + Netlify Functions for backend API | HIGH |

## What NOT to Use

| Technology | Why Not |
|-----------|---------|
| Puppeteer/Playwright | chess.org.il pages are server-rendered HTML, no JS execution needed; adds 50MB+ dependency |
| Next.js | Overkill; no SSR/SSG needs since data comes from API |
| MongoDB | No advantage over Postgres JSONB; Supabase provides managed Postgres |
| Redux | App state is simple; React Context + useState sufficient |

## Deployment Architecture

```
Netlify
├── Static site (React build)
└── Netlify Functions (Express API)
    └── Supabase (Postgres)
        └── Scrapes chess.org.il on cache miss
```

Netlify Functions wrap the Express API as serverless functions. Same-origin eliminates CORS issues.

## Key Considerations

1. **Netlify Functions cold start**: First request after idle may take 1-3s
2. **Supabase JS client**: Uses REST API (PostgREST), not direct Postgres connections — avoids connection limits
3. **CORS**: Same-origin on Netlify eliminates CORS entirely
4. **Monorepo**: Single repo with `/client` and `/netlify/functions` directories

---
*Stack research for: chess stats dashboard*
*Researched: 2026-04-19*

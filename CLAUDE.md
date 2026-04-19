<!-- GSD:project-start source:PROJECT.md -->
## Project

**Chess IL Dashboard**

A modern, mobile-first web dashboard for viewing Israeli Chess Federation player statistics. It scrapes player data from chess.org.il (which has no public API), caches it in Supabase, and presents rich stats, charts, and comparison tools in a clean RTL Hebrew interface.

**Core Value:** Any user can enter a player ID and instantly see a beautiful, data-rich dashboard of that player's chess rating history, tournament results, and performance stats.

### Constraints

- **Tech Stack**: React + TypeScript + Tailwind CSS + Recharts (frontend), Node.js + Express (backend), Cheerio (scraping), Supabase (database/cache)
- **Deployment**: Netlify hosting
- **Scraping Rate**: Max once per player per 24 hours
- **UI Direction**: Full RTL with Hebrew labels
- **Mobile**: Must work on 375px screens
- **Colors**: Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
## Key Considerations
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

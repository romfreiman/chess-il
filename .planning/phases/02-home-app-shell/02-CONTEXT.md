# Phase 2: Home & App Shell - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the frontend foundation: a React + Vite + Tailwind app with RTL Hebrew layout, client-side routing, a navbar, and a home page with hero search and saved player cards. This phase establishes the app shell that all subsequent frontend phases build on.

</domain>

<decisions>
## Implementation Decisions

### Search Experience
- **D-01:** Hero search — large, centered search input dominating the home page (Google-style). This is the primary action on the page.
- **D-02:** Client-side validation prevents submission of non-numeric or empty input. Search button disabled until valid numeric ID is entered.
- **D-03:** Recent player suggestions dropdown under the search input, showing recently searched player IDs/names from localStorage history. Quick re-access to previously viewed players.
- **D-04:** Search button labeled "חפש" (Search) in Hebrew.

### Home Page Layout
- **D-05:** Below the hero search, a grid of saved player cards — 2 columns on mobile, 3 on desktop. Clear visual separation between search and saved players sections.
- **D-06:** Empty state shows a friendly prompt with illustration/icon and text like "חפשו שחקן כדי להתחיל" (search a player to begin). Warm and inviting.
- **D-07:** Each saved player card shows: player name, current rating, and club name. Enough context to identify the player at a glance.

### Navbar & Navigation
- **D-08:** Sticky navbar — fixed at the top of the viewport at all times for quick access to navigation and dark mode toggle.
- **D-09:** All navbar items always visible on mobile (375px). No hamburger menu — the navbar has few enough items (home, compare, dark toggle) to fit.
- **D-10:** Dark mode toggle uses sun/moon icon button. Compact and universally understood.
- **D-11:** Compare link always visible in navbar but grayed out/disabled until 2+ players are saved. Teaches users the feature exists.

### Visual Style
- **D-12:** Clean & modern aesthetic — generous whitespace, subtle shadows, rounded corners (8-12px). Calm and focused feel.
- **D-13:** Hebrew font: Heebo from Google Fonts. Modern, clean sans-serif with great readability.
- **D-14:** Card style: subtle shadow (shadow-sm), rounded-xl corners, white background on gray. Elegant and understated.
- **D-15:** Light gray background (bg-gray-50) for the page body. White cards pop against the gray.

### Claude's Discretion
- Frontend project scaffold specifics (Vite config, Tailwind config, PostCSS setup)
- React Router route structure and layout components
- Search input placeholder text and exact Hebrew wording
- Recent suggestions dropdown implementation approach (localStorage key structure, max items)
- Icon library choice for sun/moon toggle and other UI icons
- Exact spacing/padding values within the design system
- Component file organization (flat vs. nested directories)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, color palette, test player IDs
- `.planning/REQUIREMENTS.md` — SRCH-01..03, NAV-01..02, UI-01, UI-02, UI-04, UI-07 are this phase's requirements
- `.planning/ROADMAP.md` — Phase 2 success criteria and dependencies

### Phase 1 Context
- `.planning/phases/01-data-pipeline/01-CONTEXT.md` — API response shapes (D-05, D-06), monorepo structure (D-12), Netlify Functions setup (D-13)
- `packages/shared/types.ts` — PlayerInfo, TournamentEntry, PlayerData, ApiResponse, ApiError types

### Configuration
- `netlify.toml` — Existing API redirect rules, build config
- `package.json` — Current dependencies (backend only), scripts
- `tsconfig.json` — TypeScript config (will need frontend adjustments)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/shared/types.ts` — PlayerInfo, TournamentEntry, ApiResponse, ApiError types ready to import in frontend
- `netlify.toml` — API redirect rules already configured (`/api/*` → `/.netlify/functions/api/:splat`)

### Established Patterns
- Monorepo structure with `packages/shared/` for cross-boundary types
- Backend in `src/api/`, `src/db/`, `src/scraper/`
- Vitest for testing with verbose reporter
- ES modules (`"type": "module"` in package.json)

### Integration Points
- Frontend must call `GET /api/player/:id` (defined in Phase 1)
- Frontend types import from `packages/shared/types.ts`
- Netlify build needs to handle both frontend (Vite) and backend (Functions) build steps
- `netlify dev` serves both frontend dev server and API functions locally

</code_context>

<specifics>
## Specific Ideas

- Hero search should feel like the centerpiece of the home page — big, prominent, impossible to miss
- Recent suggestions from localStorage give returning users quick access without needing to remember IDs
- Saved player cards need to be ready for Phase 4 persistence — the card component and grid layout exist now, populated later
- Heebo font from Google Fonts for all Hebrew text — clean and widely used in Israeli web products
- The app should feel calm and professional, not cluttered — generous whitespace, subtle shadows

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-home-app-shell*
*Context gathered: 2026-04-20*

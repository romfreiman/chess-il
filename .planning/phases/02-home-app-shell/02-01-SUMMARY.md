---
phase: 02-home-app-shell
plan: 01
subsystem: ui
tags: [react, vite, tailwind, react-router, dark-mode, rtl, vitest, testing-library]

# Dependency graph
requires:
  - phase: 01-data-pipeline
    provides: shared types (PlayerInfo, ApiResponse) in packages/shared/types.ts
provides:
  - Vite + React 18 + TypeScript frontend scaffold in client/
  - Tailwind CSS 3 with project color tokens (primary, positive, negative, pending)
  - Client-side routing with createBrowserRouter (/, /player/:id, /compare)
  - Sticky navbar with home, compare (disabled), and dark mode toggle
  - Dark mode with localStorage persistence and FOUC prevention
  - RTL/Hebrew HTML entry point with Heebo font
  - Vitest + Testing Library + jsdom test infrastructure
  - renderWithRouter test utility
  - Updated netlify.toml for frontend build and SPA fallback
affects: [02-home-app-shell, 03-player-dashboard, 04-persistence, 05-compare]

# Tech tracking
tech-stack:
  added: [react@18, react-dom@18, react-router-dom@6, vite@5, tailwindcss@3, "@fontsource/heebo", lucide-react, "@vitejs/plugin-react@4", "@testing-library/react", "@testing-library/jest-dom", "@testing-library/user-event", jsdom, postcss, autoprefixer]
  patterns: [createBrowserRouter layout route, useDarkMode hook with localStorage, Tailwind logical properties for RTL, FOUC prevention inline script]

key-files:
  created:
    - client/package.json
    - client/index.html
    - client/vite.config.ts
    - client/tailwind.config.js
    - client/postcss.config.js
    - client/tsconfig.json
    - client/vitest.config.ts
    - client/src/main.tsx
    - client/src/App.tsx
    - client/src/index.css
    - client/src/lib/constants.ts
    - client/src/hooks/useDarkMode.ts
    - client/src/components/layout/AppLayout.tsx
    - client/src/components/layout/Navbar.tsx
    - client/src/components/layout/ThemeToggle.tsx
    - client/src/pages/HomePage.tsx
    - client/src/pages/PlayerPage.tsx
    - client/src/pages/ComparePage.tsx
    - client/src/test/setup.ts
    - client/src/test/test-utils.tsx
    - client/src/__tests__/routing.test.tsx
    - client/src/__tests__/Navbar.test.tsx
    - client/src/__tests__/AppLayout.test.tsx
  modified:
    - netlify.toml
    - .gitignore

key-decisions:
  - "Separate client/package.json for frontend deps, keeping backend deps in root"
  - "createBrowserRouter at module scope (not inside component) per React Router 6 best practice"
  - "useDarkMode hook at AppLayout level, props drilled to Navbar/ThemeToggle"
  - "savedCount hardcoded to 0 for Phase 2; Phase 4 wires localStorage"
  - "vitest/globals types added to tsconfig to fix tsc compilation of test files"

patterns-established:
  - "RTL-safe components: use ms-/me-/ps-/pe- logical properties, never ml-/mr-/pl-/pr-"
  - "Layout route pattern: AppLayout renders Navbar + Outlet, all pages are children"
  - "Dark mode: FOUC prevention script in index.html head + useDarkMode hook + Tailwind darkMode: class"
  - "Test pattern: createMemoryRouter with full route config for routing tests, renderWithRouter for component tests"
  - "Color tokens: defined in both tailwind.config.js (classes) and constants.ts (programmatic use)"

requirements-completed: [NAV-01, NAV-02, UI-01, UI-02, UI-04, UI-07]

# Metrics
duration: 5min
completed: 2026-04-20
---

# Phase 2 Plan 01: App Shell Summary

**Vite + React 18 + Tailwind CSS frontend scaffold with RTL Hebrew layout, createBrowserRouter routing, sticky navbar with dark mode toggle, and 15-test suite using Vitest + Testing Library**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-20T11:03:09Z
- **Completed:** 2026-04-20T11:08:27Z
- **Tasks:** 3
- **Files modified:** 25

## Accomplishments
- Complete Vite + React + Tailwind frontend scaffold in client/ with all config files
- Three-route SPA (/, /player/:id, /compare) with sticky navbar, dark mode, RTL Hebrew
- Full test infrastructure with 15 passing tests covering routing, navbar states, and layout
- Netlify build config updated for frontend with SPA fallback after API redirect

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold client directory** - `f03e3cd` (feat)
2. **Task 2: App shell components** - `cd91142` (feat)
3. **Task 3: Tests for routing, navbar, layout** - `610c6aa` (test)
4. **Deviation fix: vitest globals types** - `71f9f51` (fix)

## Files Created/Modified
- `client/package.json` - Frontend package with React, Vite, Tailwind deps
- `client/index.html` - RTL HTML entry with FOUC prevention script
- `client/vite.config.ts` - Vite config with @shared alias and API proxy
- `client/tailwind.config.js` - Tailwind with project colors, Heebo font, dark mode
- `client/postcss.config.js` - PostCSS with Tailwind and Autoprefixer
- `client/tsconfig.json` - Frontend TypeScript config with vitest/globals types
- `client/vitest.config.ts` - Vitest config with jsdom, testing-library setup
- `client/src/main.tsx` - React entry point with Heebo font imports
- `client/src/App.tsx` - createBrowserRouter with layout route and three pages
- `client/src/index.css` - Tailwind directives and base Heebo font
- `client/src/lib/constants.ts` - Color tokens, localStorage keys, limits
- `client/src/hooks/useDarkMode.ts` - Dark mode hook with localStorage persistence
- `client/src/components/layout/AppLayout.tsx` - Layout wrapper with Navbar and Outlet
- `client/src/components/layout/Navbar.tsx` - Sticky navbar with home, compare, theme toggle
- `client/src/components/layout/ThemeToggle.tsx` - Sun/Moon icon toggle button
- `client/src/pages/HomePage.tsx` - Placeholder home page
- `client/src/pages/PlayerPage.tsx` - Placeholder player page with useParams
- `client/src/pages/ComparePage.tsx` - Placeholder compare page
- `client/src/test/setup.ts` - Testing Library jest-dom setup
- `client/src/test/test-utils.tsx` - renderWithRouter utility
- `client/src/__tests__/routing.test.tsx` - 4 routing tests
- `client/src/__tests__/Navbar.test.tsx` - 7 navbar tests
- `client/src/__tests__/AppLayout.test.tsx` - 4 layout tests
- `netlify.toml` - Updated build command and publish dir, added SPA fallback
- `.gitignore` - Added *.tsbuildinfo

## Decisions Made
- Separate `client/package.json` keeps frontend and backend dependency trees clean
- `createBrowserRouter` at module scope prevents re-creation on every render
- `useDarkMode` hook lives at AppLayout level; theme/toggle drilled via props
- `savedCount` hardcoded to 0 (compare link disabled); Phase 4 wires localStorage
- Added `vitest/globals` to tsconfig types to fix tsc compilation of test files

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed tsc build failure on test files missing vitest globals**
- **Found during:** Task 3 (tests)
- **Issue:** `tsc -b` failed because `describe`, `it`, `expect`, `vi` globals were not recognized -- tsconfig lacked vitest type declarations
- **Fix:** Added `"types": ["vitest/globals"]` to `client/tsconfig.json` compilerOptions
- **Files modified:** `client/tsconfig.json`
- **Verification:** `npm run build` (tsc -b && vite build) exits 0
- **Committed in:** `71f9f51`

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential for build correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- App shell is complete and ready for Plan 02 (HeroSearch, PlayerGrid, EmptyState)
- All three routes render placeholder pages that subsequent plans will fill
- Test infrastructure is ready for additional component tests
- Navbar compare link is disabled; will be enabled when Phase 4 wires savedPlayers localStorage

## Self-Check: PASSED

All 25 created/modified files verified present. All 4 commits (f03e3cd, cd91142, 610c6aa, 71f9f51) verified in git log.

---
*Phase: 02-home-app-shell*
*Completed: 2026-04-20*

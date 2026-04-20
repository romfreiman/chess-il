# Phase 2: Home & App Shell - Research

**Researched:** 2026-04-20
**Domain:** React SPA scaffold, RTL layout, client-side routing, Vite build integration with Netlify
**Confidence:** HIGH

## Summary

This phase establishes the entire frontend foundation for the Chess IL Dashboard: a Vite-powered React 18 + TypeScript SPA with Tailwind CSS 3 for styling, React Router 6 for client-side routing, and a sticky navbar with dark mode toggle. The app must render fully in RTL Hebrew using the Heebo font, work on 375px mobile screens, and deploy alongside the existing Netlify Functions backend.

The existing project has a backend-only setup (Express + Netlify Functions in `netlify/functions/api.ts`, backend source in `src/`, shared types in `packages/shared/types.ts`). The frontend needs its own directory (`src/frontend/` or a dedicated `client/` path), its own Vite config, and adjustments to `netlify.toml` to build the Vite frontend AND serve the SPA fallback redirect alongside the existing API proxy. The critical integration challenge is configuring the build pipeline so Netlify builds the Vite frontend (publish `dist/`) while still bundling the serverless functions.

**Primary recommendation:** Scaffold the frontend under a `client/` directory with its own `vite.config.ts`, `index.html`, and `tailwind.config.js`. Update `netlify.toml` to build the Vite frontend (`cd client && npm run build`) and publish `client/dist/`. Add a SPA fallback redirect AFTER the existing API redirect. Use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) for automatic RTL support.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Hero search -- large, centered search input dominating the home page (Google-style). This is the primary action on the page.
- **D-02:** Client-side validation prevents submission of non-numeric or empty input. Search button disabled until valid numeric ID is entered.
- **D-03:** Recent player suggestions dropdown under the search input, showing recently searched player IDs/names from localStorage history. Quick re-access to previously viewed players.
- **D-04:** Search button labeled "חפש" (Search) in Hebrew.
- **D-05:** Below the hero search, a grid of saved player cards -- 2 columns on mobile, 3 on desktop. Clear visual separation between search and saved players sections.
- **D-06:** Empty state shows a friendly prompt with illustration/icon and text like "חפשו שחקן כדי להתחיל" (search a player to begin). Warm and inviting.
- **D-07:** Each saved player card shows: player name, current rating, and club name. Enough context to identify the player at a glance.
- **D-08:** Sticky navbar -- fixed at the top of the viewport at all times for quick access to navigation and dark mode toggle.
- **D-09:** All navbar items always visible on mobile (375px). No hamburger menu -- the navbar has few enough items (home, compare, dark toggle) to fit.
- **D-10:** Dark mode toggle uses sun/moon icon button. Compact and universally understood.
- **D-11:** Compare link always visible in navbar but grayed out/disabled until 2+ players are saved. Teaches users the feature exists.
- **D-12:** Clean & modern aesthetic -- generous whitespace, subtle shadows, rounded corners (8-12px). Calm and focused feel.
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SRCH-01 | Home page displays a search input for entering player ID | Hero search pattern (D-01), Vite+React scaffold, input validation pattern |
| SRCH-02 | Submitting a player ID navigates to the player dashboard page | React Router 6 `useNavigate()` hook, route structure `/player/:id` |
| SRCH-03 | Home page shows list of saved players as clickable cards with name, rating, and remove button | Card grid component (D-05, D-07), PlayerInfo type from shared types, localStorage interface |
| NAV-01 | App has client-side routing: `/`, `/player/:id`, `/compare?a=ID1&b=ID2` | React Router 6 `createBrowserRouter`, layout routes with `<Outlet/>`, Netlify SPA redirect |
| NAV-02 | Navigation works with browser back/forward buttons | `createBrowserRouter` uses DOM History API natively, SPA redirect ensures direct URL access works |
| UI-01 | Entire app uses RTL direction (`dir="rtl"`) with Hebrew labels | Tailwind logical properties (ms-, me-, ps-, pe-), `dir="rtl"` on `<html>`, Heebo font |
| UI-02 | All layouts work on 375px wide screens (mobile-first) | Tailwind responsive breakpoints (mobile-first), 2-col grid on mobile / 3-col on desktop |
| UI-04 | Color scheme: Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending | Tailwind `extend.colors` in config |
| UI-07 | Top navbar with app name "Chess IL", home link, compare link (if 2+ saved), dark mode toggle | Sticky navbar (D-08), Lucide icons for toggle (D-10), disabled compare link (D-11) |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.3.1 | UI framework | Locked in PROJECT.md as React 18.x |
| react-dom | 18.3.1 | DOM renderer | Pairs with React 18 |
| react-router-dom | 6.30.3 | Client-side routing | Locked as React Router 6.x; `createBrowserRouter` is the recommended API |
| vite | 5.4.21 | Build tool / dev server | Locked as Vite 5.x; fast HMR, native TS support |
| @vitejs/plugin-react | 4.7.0 | Vite React integration | Official Vite plugin for React JSX transform |
| tailwindcss | 3.4.19 | Utility-first CSS | Locked as Tailwind 3.x; built-in RTL logical properties since v3.3 |
| postcss | 8.5.10 | CSS processing | Required by Tailwind CSS 3.x |
| autoprefixer | 10.5.0 | Vendor prefix automation | Standard companion to Tailwind/PostCSS |
| typescript | 5.9.3 | Type safety | Already in project; frontend shares types via `packages/shared/` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fontsource/heebo | 5.2.8 | Self-hosted Heebo Hebrew font | Import in entry file; no external CDN dependency |
| lucide-react | 1.8.0 | Icon library (sun, moon, home, search, etc.) | Tree-shakable SVG icons; 1000+ icons, clean aesthetic matching D-12 |

### Dev Dependencies

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | React component testing | Testing rendered output, user interactions |
| @testing-library/jest-dom | 6.9.1 | Custom DOM matchers | `toBeInTheDocument()`, `toHaveClass()` etc. |
| @testing-library/user-event | 14.6.1 | Simulate user interactions | Click, type, tab in tests |
| jsdom | 29.0.2 | DOM environment for tests | Vitest `environment: 'jsdom'` |
| @types/react | 18.x (latest 18) | React type definitions | TypeScript support |
| @types/react-dom | 18.x (latest 18) | ReactDOM type definitions | TypeScript support |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| lucide-react | heroicons/react | Heroicons has only 316 icons vs 1000+; Lucide has better coverage for this project's needs |
| lucide-react | react-icons | react-icons bundles multiple icon sets; larger install, less consistent styling |
| @fontsource/heebo | Google Fonts CDN `<link>` | CDN adds external dependency, render-blocking request, privacy concern |
| Tailwind logical properties | tailwindcss-rtl plugin | Plugin adds complexity; logical properties are built-in since Tailwind 3.3 |

**Installation (frontend):**
```bash
# From client/ directory
npm install react@18 react-dom@18 react-router-dom@6 @fontsource/heebo lucide-react
npm install -D vite@5 @vitejs/plugin-react@4 tailwindcss@3 postcss autoprefixer typescript @types/react@18 @types/react-dom@18 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Version verification:** All versions verified against npm registry on 2026-04-20. React 18.3.1 is latest React 18.x; Tailwind 3.4.19 is latest 3.x; Vite 5.4.21 is latest 5.x; React Router 6.30.3 is latest 6.x.

## Architecture Patterns

### Recommended Project Structure

```
chess-il/
├── client/                     # Frontend Vite app (NEW)
│   ├── index.html              # Vite entry HTML
│   ├── package.json            # Frontend-only deps
│   ├── vite.config.ts          # Vite config with @shared alias
│   ├── tailwind.config.js      # Tailwind config with custom colors
│   ├── postcss.config.js       # PostCSS config
│   ├── tsconfig.json           # Frontend TS config extending root
│   ├── public/                 # Static assets
│   └── src/
│       ├── main.tsx            # React entry point
│       ├── App.tsx             # Router provider + layout
│       ├── index.css           # Tailwind directives + font imports
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.tsx           # Sticky navbar (D-08)
│       │   │   ├── AppLayout.tsx        # Layout wrapper with Outlet
│       │   │   └── ThemeToggle.tsx      # Dark mode sun/moon toggle (D-10)
│       │   ├── search/
│       │   │   ├── HeroSearch.tsx       # Large centered search (D-01)
│       │   │   └── RecentSuggestions.tsx # localStorage dropdown (D-03)
│       │   └── players/
│       │       ├── PlayerCard.tsx       # Saved player card (D-07, D-14)
│       │       ├── PlayerGrid.tsx       # Card grid layout (D-05)
│       │       └── EmptyState.tsx       # Empty state prompt (D-06)
│       ├── pages/
│       │   ├── HomePage.tsx             # Hero search + saved grid
│       │   ├── PlayerPage.tsx           # Placeholder for Phase 3
│       │   └── ComparePage.tsx          # Placeholder for Phase 5
│       ├── hooks/
│       │   ├── useDarkMode.ts           # Dark mode state + localStorage
│       │   └── useRecentSearches.ts     # Recent search history
│       └── lib/
│           └── constants.ts             # Color values, localStorage keys
├── src/                        # Backend (existing, unchanged)
├── packages/shared/types.ts    # Shared types (existing)
├── netlify/functions/api.ts    # API function (existing)
├── netlify.toml                # Updated: Vite build + SPA redirect
├── package.json                # Root package.json (backend deps)
└── vitest.config.ts            # Backend tests (existing)
```

### Pattern 1: createBrowserRouter with Layout Route

**What:** Define all routes using `createBrowserRouter` with a shared layout component that renders the navbar and provides `<Outlet/>` for page content.
**When to use:** Always -- this is the recommended React Router 6 pattern.

```typescript
// client/src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { PlayerPage } from './pages/PlayerPage';
import { ComparePage } from './pages/ComparePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'player/:id', element: <PlayerPage /> },
      { path: 'compare', element: <ComparePage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
```

```typescript
// client/src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16"> {/* offset for sticky navbar */}
        <Outlet />
      </main>
    </div>
  );
}
```

### Pattern 2: Dark Mode with localStorage Persistence

**What:** `useDarkMode` hook manages theme state, persists to localStorage, and adds/removes the `dark` class on `<html>`.
**When to use:** For the dark mode toggle (D-10).

```typescript
// client/src/hooks/useDarkMode.ts
import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return { theme, toggle };
}
```

**FOUC prevention:** Add inline script in `index.html` `<head>` before React loads:
```html
<script>
  if (localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

### Pattern 3: RTL with Tailwind Logical Properties

**What:** Use Tailwind's logical property utilities (`ms-`, `me-`, `ps-`, `pe-`, `rounded-s-`, `rounded-e-`, `start-`, `end-`) instead of physical `ml-`, `mr-`, `pl-`, `pr-` etc. Combined with `dir="rtl"` on `<html>`, these auto-flip for RTL.
**When to use:** Every margin, padding, border-radius, and position that should respect text direction.

```html
<!-- Instead of: -->
<div class="ml-4 pr-2 rounded-l-lg text-left">

<!-- Use logical properties: -->
<div class="ms-4 pe-2 rounded-s-lg text-start">
```

**Available logical utilities (Tailwind 3.3+):**
- `ms-*` / `me-*` -- margin-inline-start / margin-inline-end
- `ps-*` / `pe-*` -- padding-inline-start / padding-inline-end
- `rounded-s-*` / `rounded-e-*` -- border-radius start/end
- `start-*` / `end-*` -- inset-inline-start / inset-inline-end
- `text-start` / `text-end` -- text-align start/end
- `border-s-*` / `border-e-*` -- border-inline-start / border-inline-end

### Pattern 4: Hero Search with Validation

**What:** Controlled input with numeric-only validation. Search button disabled until input is a valid positive integer.
**When to use:** Home page hero search (D-01, D-02).

```typescript
// client/src/components/search/HeroSearch.tsx
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const isValid = /^\d+$/.test(query) && parseInt(query, 10) > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) navigate(`/player/${query}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-md mx-auto">
      <input
        type="text"
        inputMode="numeric"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="הזינו מספר שחקן"
        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 text-lg text-start
                   focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
        dir="rtl"
      />
      <button
        type="submit"
        disabled={!isValid}
        className="px-6 py-3 rounded-xl bg-[#378ADD] text-white font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-blue-600 transition-colors"
      >
        <Search className="inline-block me-2 h-5 w-5" />
        חפש
      </button>
    </form>
  );
}
```

### Anti-Patterns to Avoid
- **Physical CSS properties for directional layout:** Never use `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` in an RTL app. Use logical equivalents (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`).
- **Router inside a component:** The `createBrowserRouter` call must be at module scope, not inside a React component. Creating it inside a component re-creates the router on every render, losing state.
- **Hardcoded colors instead of Tailwind config:** Define project colors (`#378ADD`, `#639922`, `#E24B4A`, `#EF9F27`) in `tailwind.config.js` `extend.colors`, then use `bg-primary`, `text-positive`, etc.
- **Google Fonts CDN link in production:** Use `@fontsource/heebo` for self-hosted font. CDN adds a render-blocking external request and privacy concern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side routing | Custom history management | react-router-dom 6 `createBrowserRouter` | Handles history API, URL parsing, nested layouts, code splitting |
| RTL layout flipping | Manual CSS `direction` + mirror classes | Tailwind logical properties (ms-, me-, ps-, pe-) | Automatic bidirectional support, no duplication |
| Dark mode persistence | Custom theme context + manual DOM manipulation | `useDarkMode` hook + Tailwind `darkMode: 'class'` | Well-established pattern, 5 lines of code, FOUC-free |
| Icon rendering | Inline SVGs or custom icon component | lucide-react | Tree-shakable, consistent sizing, TypeScript typed |
| Font loading | Manual @font-face + font file management | @fontsource/heebo | npm install + one import line, handles all formats/weights |
| Input validation feedback | Custom regex engine | HTML `inputMode="numeric"` + simple `/^\d+$/` test | Browser-native numeric keyboard on mobile, minimal JS |

**Key insight:** This phase is foundational scaffold work. Every piece has a well-established community solution. The value is in correct assembly and configuration, not novel implementation.

## Common Pitfalls

### Pitfall 1: Netlify SPA Redirect Order
**What goes wrong:** Adding a `/* -> /index.html` redirect BEFORE the `/api/*` redirect causes API calls to return `index.html` instead of proxying to the function.
**Why it happens:** Netlify processes redirects top-to-bottom and uses the first match.
**How to avoid:** Place the `/api/*` redirect FIRST with `force = true`, then the SPA `/*` fallback SECOND without `force` (so static assets like JS/CSS are served directly).
**Warning signs:** API calls return HTML instead of JSON; 200 status but wrong content type.

### Pitfall 2: Vite Build Output vs Netlify Publish Directory
**What goes wrong:** Netlify publishes the wrong directory, serving backend dist instead of Vite frontend dist.
**Why it happens:** The existing `netlify.toml` has `publish = "dist"` which is the TypeScript backend output. Vite also outputs to `dist/` by default.
**How to avoid:** Configure Vite `build.outDir` to output to a specific path (e.g., `client/dist`), and update `netlify.toml` `publish` to match. Or if frontend is in `client/`, set `publish = "client/dist"`.
**Warning signs:** Deployed site shows blank page or 404 for all routes.

### Pitfall 3: Missing `dir="rtl"` on Root Element
**What goes wrong:** Tailwind logical properties have no effect. Layout renders LTR.
**Why it happens:** Logical properties like `ms-4` resolve based on the computed `direction` property, which defaults to LTR. Without `dir="rtl"` on `<html>`, they behave identically to `ml-4`.
**How to avoid:** Set `dir="rtl"` and `lang="he"` on the `<html>` element in `index.html`.
**Warning signs:** Hebrew text renders correctly (Unicode handles this) but spacing/padding is visually wrong.

### Pitfall 4: Dark Mode Flash of Unstyled Content (FOUC)
**What goes wrong:** Page loads in light mode briefly, then flashes to dark mode when React hydrates.
**Why it happens:** React's `useEffect` runs after paint. If dark mode class is only applied in a hook, there's a visible flash.
**How to avoid:** Add an inline `<script>` in `<head>` of `index.html` (before any CSS/JS loads) that reads `localStorage.theme` and applies the `dark` class immediately.
**Warning signs:** Brief white flash on page load in dark mode.

### Pitfall 5: Physical Tailwind Classes Leaking In
**What goes wrong:** Some UI elements don't flip correctly in RTL; inconsistent spacing.
**Why it happens:** Developer uses `ml-4` instead of `ms-4` out of habit. Works in testing if tested LTR, breaks in RTL.
**How to avoid:** Establish a lint rule or code review convention: no `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` in component code. Always use logical equivalents.
**Warning signs:** Asymmetric padding visible when viewing RTL layout.

### Pitfall 6: TypeScript Path Aliases Not Resolving in Vite
**What goes wrong:** Imports from `@shared/types` fail at build time even though they work in the IDE.
**Why it happens:** TypeScript `paths` in `tsconfig.json` only affect type resolution. Vite needs a matching `resolve.alias` in `vite.config.ts`.
**How to avoid:** Configure both `tsconfig.json` `paths` AND `vite.config.ts` `resolve.alias` to point to `packages/shared/`.
**Warning signs:** Build fails with "Cannot find module '@shared/types'" despite IDE showing no errors.

## Code Examples

### Vite Configuration for Frontend

```typescript
// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../packages/shared'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888', // netlify dev port
        changeOrigin: true,
      },
    },
  },
});
```

### Tailwind Configuration with Project Colors

```javascript
// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#378ADD',
        positive: '#639922',
        negative: '#E24B4A',
        pending: '#EF9F27',
      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px', // D-12: 8-12px rounded corners
      },
    },
  },
  plugins: [],
};
```

### PostCSS Configuration

```javascript
// client/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Entry CSS with Tailwind Directives and Font

```css
/* client/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Heebo', sans-serif;
  }
}
```

### Entry HTML with RTL, FOUC Prevention, and Lang

```html
<!-- client/index.html -->
<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chess IL - לוח שחמט ישראלי</title>
    <script>
      if (localStorage.theme === 'dark' ||
          (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Updated netlify.toml

```toml
[build]
  command = "cd client && npm install && npm run build"
  publish = "client/dist"

[functions]
  external_node_modules = ["express"]
  node_bundler = "esbuild"

# API proxy -- MUST come before SPA fallback
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true

# SPA fallback -- catch-all for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Navbar Component

```typescript
// client/src/components/layout/Navbar.tsx
import { Link } from 'react-router-dom';
import { Home, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  savedCount: number; // number of saved players
}

export function Navbar({ savedCount }: NavbarProps) {
  const compareDisabled = savedCount < 2;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-white dark:bg-gray-800
                     border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <span>&#9823;</span>
          <span>Chess IL</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Home className="h-5 w-5" />
          </Link>
          <Link
            to="/compare"
            className={`p-2 rounded-lg ${
              compareDisabled
                ? 'opacity-40 cursor-not-allowed pointer-events-none'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-disabled={compareDisabled}
            tabIndex={compareDisabled ? -1 : undefined}
          >
            <BarChart3 className="h-5 w-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind `rtl:` / `ltr:` modifiers (manual) | Logical properties (ms-, me-, ps-, pe-) | Tailwind 3.3 (March 2023) | Write once, works in both directions automatically |
| `<BrowserRouter>` + `<Routes>` | `createBrowserRouter` + `RouterProvider` | React Router 6.4 (Sept 2022) | Data loading APIs, better error boundaries, layout routes |
| Google Fonts CDN `<link>` | @fontsource self-hosted imports | Fontsource 5.x (2023) | No external requests, better performance, privacy |
| Custom toggle + CSS variables for dark mode | Tailwind `darkMode: 'class'` + localStorage | Tailwind 3.0 (Dec 2021) | Built-in `dark:` prefix, one-line setup |

**Deprecated/outdated:**
- `<BrowserRouter>` direct usage: Still works but `createBrowserRouter` is the recommended pattern for new projects
- `tailwindcss-rtl` plugin: Unnecessary since Tailwind 3.3 added built-in logical properties
- React 18 `ReactDOM.render()`: Use `createRoot()` instead

## Open Questions

1. **Frontend package management: monorepo or standalone?**
   - What we know: The project uses npm (not pnpm) with a flat structure. Backend deps are in root `package.json`. `packages/shared/` exists for shared types.
   - What's unclear: Should `client/` have its own `package.json` or should we add frontend deps to root?
   - Recommendation: Use a separate `package.json` in `client/` to keep frontend and backend dependency trees clean. This aligns with Netlify's subdirectory build pattern and avoids installing React in the backend. The `@shared` alias bridges the gap for shared types.

2. **Dev workflow: netlify dev vs vite dev?**
   - What we know: `netlify dev` proxies both frontend and backend. `vite dev` only serves frontend.
   - What's unclear: Whether `netlify dev` correctly proxies to a Vite dev server in a subdirectory setup.
   - Recommendation: Use `vite dev` from `client/` with proxy config for `/api` during development. Use `netlify dev` for full-stack integration testing.

3. **Saved players data source for this phase**
   - What we know: SRCH-03 requires showing saved player cards. Persistence (PERS-01, PERS-02, PERS-03) is Phase 4.
   - What's unclear: What data populates cards in Phase 2?
   - Recommendation: Build the card component and grid, but use an empty array or hardcoded mock data. The component accepts a `SavedPlayer[]` prop. Phase 4 wires up localStorage.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite build, npm | Yes | 22.22.0 | -- |
| npm | Package management | Yes | 10.9.4 | -- |
| npx | Scaffolding | Yes | 10.9.4 | -- |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

All required tools are available. Vite, React, Tailwind, and all frontend dependencies are installed via npm -- no system-level tools needed beyond Node.js.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (already installed) |
| Config file | `vitest.config.ts` (exists -- needs frontend environment addition) |
| Quick run command | `cd client && npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` (root, runs all tests) |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | Search input renders on home page | unit | `cd client && npx vitest run src/__tests__/HeroSearch.test.tsx -x` | Wave 0 |
| SRCH-02 | Valid ID submission navigates to /player/:id | unit | `cd client && npx vitest run src/__tests__/HeroSearch.test.tsx -x` | Wave 0 |
| SRCH-03 | Saved player cards render in grid | unit | `cd client && npx vitest run src/__tests__/PlayerGrid.test.tsx -x` | Wave 0 |
| NAV-01 | Routes render correct pages for /, /player/:id, /compare | unit | `cd client && npx vitest run src/__tests__/routing.test.tsx -x` | Wave 0 |
| NAV-02 | Browser navigation works (history) | unit | `cd client && npx vitest run src/__tests__/routing.test.tsx -x` | Wave 0 |
| UI-01 | Root element has dir="rtl" and lang="he" | unit | `cd client && npx vitest run src/__tests__/AppLayout.test.tsx -x` | Wave 0 |
| UI-02 | No horizontal overflow at 375px | manual-only | Visual inspection with browser DevTools | -- |
| UI-04 | Color tokens present in Tailwind config | unit | `cd client && npx vitest run src/__tests__/tailwind.test.ts -x` | Wave 0 |
| UI-07 | Navbar renders with correct elements | unit | `cd client && npx vitest run src/__tests__/Navbar.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd client && npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose` (full project)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `client/src/__tests__/HeroSearch.test.tsx` -- covers SRCH-01, SRCH-02
- [ ] `client/src/__tests__/PlayerGrid.test.tsx` -- covers SRCH-03
- [ ] `client/src/__tests__/routing.test.tsx` -- covers NAV-01, NAV-02
- [ ] `client/src/__tests__/AppLayout.test.tsx` -- covers UI-01
- [ ] `client/src/__tests__/Navbar.test.tsx` -- covers UI-07
- [ ] Vitest config update: add `environment: 'jsdom'` for frontend test files
- [ ] Frontend test dependencies: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`

## Project Constraints (from CLAUDE.md)

- **Tech Stack**: React + TypeScript + Tailwind CSS + Recharts (frontend). This phase uses all except Recharts.
- **Deployment**: Netlify hosting. Must configure `netlify.toml` for Vite build + SPA routing.
- **UI Direction**: Full RTL with Hebrew labels. `dir="rtl"` on `<html>`, Tailwind logical properties.
- **Mobile**: Must work on 375px screens. Mobile-first responsive design.
- **Colors**: Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending. Define in Tailwind config.
- **No Redux**: Use React Context + useState for state management.
- **No Next.js**: Plain Vite SPA.
- **GSD Workflow**: All file changes through GSD commands.

## Sources

### Primary (HIGH confidence)
- npm registry -- verified all package versions via `npm view` on 2026-04-20
- [Tailwind CSS Dark Mode docs](https://tailwindcss.com/docs/dark-mode) -- `darkMode: 'class'` strategy
- [Tailwind CSS v3.0 announcement](https://tailwindcss.com/blog/tailwindcss-v3) -- RTL modifiers
- [React Router Route API](https://reactrouter.com/api/components/Route) -- `createBrowserRouter` layout pattern
- [Netlify Redirects docs](https://docs.netlify.com/manage/routing/redirects/overview/) -- redirect processing order
- [Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) -- build/deploy config
- [Lucide React docs](https://lucide.dev/guide/packages/lucide-react) -- icon usage patterns
- [@fontsource/heebo](https://www.npmjs.com/package/@fontsource/heebo) -- self-hosted font package

### Secondary (MEDIUM confidence)
- [Flowbite RTL guide](https://flowbite.com/docs/customize/rtl/) -- logical properties best practices, verified against Tailwind docs
- [Netlify community: API proxy + SPA fallback](https://answers.netlify.com/t/achieving-client-side-routing-and-api-forwarding-in-netlify-toml/52649) -- redirect ordering pattern

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions locked in PROJECT.md, verified against npm registry
- Architecture: HIGH -- standard React + Vite + Tailwind patterns with well-documented practices
- Pitfalls: HIGH -- common, well-documented issues with clear prevention strategies
- Netlify integration: MEDIUM -- redirect ordering and build config have edge cases, may need runtime testing

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable stack, 30-day validity)

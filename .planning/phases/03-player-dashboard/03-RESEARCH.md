# Phase 3: Player Dashboard - Research

**Researched:** 2026-04-20
**Domain:** React data dashboard with Recharts, RTL Hebrew UI, responsive layout
**Confidence:** HIGH

## Summary

Phase 3 builds the core value proposition of the app: a data-rich player dashboard at `/player/:id`. The work is entirely frontend -- fetching data from the existing `GET /api/player/:id` endpoint and rendering it across five sections: header card, metrics row, rating history chart, tournament table, and W/D/L donut chart.

The critical new dependency is **Recharts** (not yet installed). The rest builds on established patterns from Phase 2: Tailwind card styling, RTL logical properties, dark mode classes, Lucide icons, and Heebo font. The main complexity is the responsive layout (mobile cards vs desktop table for tournaments, side-by-side chart/donut on desktop) and Recharts configuration for RTL-friendly charts with rich tooltips and gradient fills.

**Primary recommendation:** Install `recharts@2.15.4` (latest 2.x, proven stable with React 18), build a `usePlayer` data-fetching hook following the existing hook pattern, then implement each dashboard section as a separate component in a `components/dashboard/` folder.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Section order on mobile: Header -> Metrics -> Chart -> Table -> Donut
- **D-02:** On desktop (768px+), chart and donut sit side-by-side (65%/35%). All other sections full-width.
- **D-03:** Metrics display as 2x2 grid on mobile. Equal-size cards, no hero treatment.
- **D-04:** Header card includes RefreshCw icon button to trigger force re-scrape (`?force=true`).
- **D-05:** Line/bar toggle via Lucide icon buttons (LineChart / BarChart3) in chart card header. Active state highlighted with primary color.
- **D-06:** Subtle gradient fill under the line (primary blue fading down).
- **D-07:** Rich tooltips on hover: rating value + date + tournament name.
- **D-08:** X-axis uses month-year Hebrew labels (e.g., "ינו '26"). Each tournament is a data point.
- **D-09:** W/D/L displayed as color-coded number chips (green wins, gray draws, red losses).
- **D-10:** On mobile (375px), each tournament renders as a compact card, not a table row. No horizontal scrolling.
- **D-11:** Rating change shown as colored number with arrow icon. Amber badge for pending. "New" badge on most recent.
- **D-12:** Pagination with Hebrew prev/next buttons and page indicator.
- **D-13:** All 4 metric cards equal size in 2x2 grid.
- **D-14:** Cumulative rating change uses same colored arrow style as tournament rows.
- **D-15:** Rating card shows current rating large, expected rating small below.
- **D-16:** Each metric card has a small Lucide icon for visual identity.

### Claude's Discretion
- Specific Lucide icons for each metric card
- Chart height and responsive sizing
- Tournament card internal layout on mobile
- Donut chart styling details (label placement, center text, segment colors)
- Data fetching hook implementation (custom usePlayer hook pattern)
- Loading placeholder before Phase 4 skeleton loaders
- Error placeholder before Phase 4 error messages
- Component file organization within the dashboard feature folder
- FIDE link display format in header card
- Grade badge styling

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Player header card shows name, club, birth year, grade badge, FIDE link | PlayerInfo type has all fields; Lucide ExternalLink for FIDE; grade badge uses Tailwind rounded pill |
| DASH-02 | Metrics row displays 4 cards: current rating (with expected), national rank, tournament count, cumulative rating change | PlayerInfo has rating/expectedRating/rank; tournaments.length for count; sum ratingChange for cumulative |
| DASH-03 | Rating history line chart with month labels | Recharts LineChart + XAxis with Hebrew month formatter; data from tournaments sorted by startDate |
| DASH-04 | Toggle between line and bar chart | State toggle controlling which Recharts component renders; shared data/axes |
| DASH-05 | Tournament table shows last 10 with date, name, W/D/L chips, rating change | TournamentEntry type has all fields; pagination state for 10-per-page |
| DASH-06 | Pagination (10 per page with prev/next) | Simple currentPage state; Math.ceil(total/10) for page count |
| DASH-07 | Rating change color-coded: green positive, red negative | Tailwind text-positive / text-negative classes already configured |
| DASH-08 | Pending tournaments show amber badge | TournamentEntry.isPending flag; Tailwind bg-pending/10 text-pending badge |
| DASH-09 | Most recent tournament shows "new" badge | Index 0 of sorted-by-date tournaments gets the badge |
| DASH-10 | Clicking tournament name opens chess.org.il page | TournamentEntry.tournamentUrl; `<a target="_blank" rel="noopener noreferrer">` |
| DASH-11 | W/D/L donut chart with percentages | Recharts PieChart with three segments; aggregate wins/draws/losses across all tournaments |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 2.15.4 | LineChart, BarChart, PieChart (donut) | Already specified in project stack; React-native charting; latest stable 2.x |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.8.0 (installed) | Icons: TrendingUp, Medal, Calendar, ArrowUpDown, RefreshCw, LineChart, BarChart3, ExternalLink, ChevronRight, ChevronLeft | All metric card icons, chart toggle, header buttons |
| react-router-dom | 6.30.3 (installed) | useParams for player ID extraction | Already wired in PlayerPage stub |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Victory, Chart.js/react-chartjs-2 | Recharts is the locked project decision; best React integration |
| Custom fetch | TanStack Query | Overkill for single-endpoint fetch; Phase 4 adds skeleton loaders where query caching might help but not needed now |

**Installation:**
```bash
cd client && npm install recharts@2.15.4
```

**Version verification:** Recharts 2.15.4 is latest 2.x as of 2026-04-20 (confirmed via npm registry). React 18 compatible.

## Architecture Patterns

### Recommended Project Structure
```
client/src/
  components/
    dashboard/
      PlayerHeader.tsx        # DASH-01: name, club, birth year, grade, FIDE, refresh
      MetricCards.tsx          # DASH-02: 2x2 grid of 4 metric cards
      RatingChart.tsx          # DASH-03, DASH-04: line/bar chart with toggle
      TournamentList.tsx       # DASH-05-10: paginated table/cards with all badges
      WinLossChart.tsx         # DASH-11: donut chart
  hooks/
    usePlayer.ts              # Data fetching hook for /api/player/:id
  pages/
    PlayerPage.tsx             # Orchestrator: calls usePlayer, renders sections
```

### Pattern 1: usePlayer Data Fetching Hook
**What:** Custom hook encapsulating fetch, loading, error, and refresh states for player data.
**When to use:** PlayerPage calls this hook with the player ID from route params.
**Example:**
```typescript
// Follows existing hook patterns (useDarkMode, useRecentSearches)
import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, ApiError } from '@shared/types';

interface UsePlayerResult {
  data: ApiResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePlayer(id: string): UsePlayerResult {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayer = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/player/${id}${force ? '?force=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err: ApiError = await res.json();
        throw new Error(err.message);
      }
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPlayer(); }, [fetchPlayer]);

  const refresh = useCallback(() => fetchPlayer(true), [fetchPlayer]);

  return { data, loading, error, refresh };
}
```

### Pattern 2: Recharts RTL-Safe Chart
**What:** Recharts renders SVG and is direction-agnostic, but axis labels and tooltips need Hebrew formatting.
**When to use:** RatingChart and WinLossChart components.
**Example:**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Hebrew month abbreviations for X-axis
const HEBREW_MONTHS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${HEBREW_MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

// Use AreaChart for gradient fill under line (D-06)
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={chartData}>
    <defs>
      <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="date" tickFormatter={formatDateLabel} />
    <YAxis domain={['dataMin - 50', 'dataMax + 50']} />
    <Tooltip content={<CustomTooltip />} />
    <Area type="monotone" dataKey="rating" stroke="#378ADD" fill="url(#ratingGradient)" strokeWidth={2} />
  </AreaChart>
</ResponsiveContainer>
```

### Pattern 3: Responsive Tournament Display (Table vs Cards)
**What:** Desktop shows table rows; mobile shows stacked cards. Uses Tailwind `hidden md:block` / `block md:hidden`.
**When to use:** TournamentList component.
**Example:**
```typescript
// Desktop table (hidden on mobile)
<div className="hidden md:block">
  <table className="w-full">...</table>
</div>
// Mobile cards (hidden on desktop)
<div className="block md:hidden space-y-3">
  {tournaments.map(t => <TournamentCard key={...} tournament={t} />)}
</div>
```

### Pattern 4: Card Styling (Established)
**What:** Consistent card appearance from Phase 2.
```typescript
// Standard card wrapper
className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
// With border on hover (interactive cards)
className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-transparent hover:border-primary transition-colors"
```

### Anti-Patterns to Avoid
- **Physical CSS properties in RTL layout:** Use `ms-`/`me-`/`ps-`/`pe-` (logical), never `ml-`/`mr-`/`pl-`/`pr-` (physical). Phase 2 decision.
- **Recharts with CSS transforms for RTL:** Recharts SVG rendering is direction-neutral. Do NOT flip the chart. Just format labels in Hebrew.
- **Fetching in useEffect without cleanup:** Use AbortController or ignore stale responses when player ID changes rapidly.
- **Direct window.fetch in components:** Keep in the hook, components stay presentation-only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Charts/graphs | Custom SVG/Canvas rendering | Recharts LineChart, BarChart, PieChart | Tooltips, responsiveness, animations, accessibility all handled |
| Gradient fill under line | Custom SVG defs | Recharts AreaChart with linearGradient defs | Built-in support, just needs defs block |
| Responsive chart sizing | Manual resize listeners | Recharts ResponsiveContainer | Handles window resize, container queries automatically |
| Icon system | Custom SVGs or icon fonts | lucide-react | Tree-shakeable, consistent, already installed |

**Key insight:** Recharts handles all chart complexity (responsive sizing, tooltips, animations, SVG rendering). The only custom work is data transformation (tournaments array to chart data points) and Hebrew label formatting.

## Common Pitfalls

### Pitfall 1: Recharts in JSDOM (Test Environment)
**What goes wrong:** Recharts uses SVG and measures DOM elements. In jsdom, `getBoundingClientRect` returns zeros, causing ResponsiveContainer to render nothing.
**Why it happens:** jsdom has no layout engine.
**How to avoid:** Mock ResponsiveContainer in tests or test chart components at the data-transformation level, not the rendering level. Alternatively, set explicit width/height in test renders.
**Warning signs:** Empty chart renders in tests; zero-width container errors.

### Pitfall 2: AreaChart vs LineChart for Gradient
**What goes wrong:** Using LineChart and trying to add fill gradient does not work -- Line component does not support `fill`.
**Why it happens:** LineChart draws strokes only; AreaChart draws filled regions.
**How to avoid:** Use AreaChart with `<Area>` component for the gradient fill (D-06). For bar toggle (D-04), switch to BarChart component entirely.
**Warning signs:** Gradient not appearing under line.

### Pitfall 3: Tournament Data Ordering
**What goes wrong:** Charts show data in wrong chronological order or most recent tournament is not correctly identified.
**Why it happens:** API returns tournaments in the order scraped from the page (newest first), but charts need chronological (oldest first).
**How to avoid:** Sort tournaments by `startDate` ascending for charts. Use original order (newest first) for tournament list. Index 0 of the original array is the most recent (for "new" badge).
**Warning signs:** Chart line going backwards; "new" badge on wrong tournament.

### Pitfall 4: Cumulative Rating Change Calculation
**What goes wrong:** Including pending tournaments in the cumulative change calculation.
**Why it happens:** Pending tournaments have `ratingChange: 0` but could be confused with actual zero-change tournaments.
**How to avoid:** Filter by `!isPending` when summing `ratingChange` for the cumulative metric.
**Warning signs:** Cumulative change not matching visual inspection of tournament changes.

### Pitfall 5: Pagination State Reset on Player Change
**What goes wrong:** Navigating to a different player keeps the old pagination page.
**Why it happens:** Pagination state persists across player ID changes.
**How to avoid:** Reset `currentPage` to 1 in a `useEffect` that depends on the player ID.
**Warning signs:** "Page 3 of 2" shown after switching to a player with fewer tournaments.

### Pitfall 6: Vite Proxy for API Calls
**What goes wrong:** Frontend fetch to `/api/player/:id` fails in dev because Vite serves on a different port than the backend.
**Why it happens:** No proxy configured for `/api` routes.
**How to avoid:** Verify Vite config has a proxy for `/api` to the backend server, or use full URL in development. Check existing `vite.config.ts` for proxy setup.
**Warning signs:** 404 or CORS errors on API calls during local development.

## Code Examples

### Hebrew Month Formatter for Chart X-Axis
```typescript
const HEBREW_MONTHS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return `${HEBREW_MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}
```

### Rating Change Badge Component
```typescript
import { TrendingUp, TrendingDown } from 'lucide-react';

function RatingChangeBadge({ change, isPending }: { change: number; isPending: boolean }) {
  if (isPending) {
    return <span className="text-xs font-medium bg-pending/10 text-pending px-2 py-0.5 rounded-full">בהמתנה</span>;
  }
  const isPositive = change > 0;
  const colorClass = isPositive ? 'text-positive' : change < 0 ? 'text-negative' : 'text-gray-500 dark:text-gray-400';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${colorClass}`}>
      {change !== 0 && <Icon className="w-3.5 h-3.5" />}
      {isPositive ? '+' : ''}{change}
    </span>
  );
}
```

### W/D/L Number Chips
```typescript
function WDLChips({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-xs font-bold bg-positive/10 text-positive px-1.5 py-0.5 rounded">{wins}</span>
      <span className="text-xs font-bold bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{draws}</span>
      <span className="text-xs font-bold bg-negative/10 text-negative px-1.5 py-0.5 rounded">{losses}</span>
    </div>
  );
}
```

### Donut Chart (PieChart with inner radius)
```typescript
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { COLORS } from '../lib/constants';

const DONUT_COLORS = [COLORS.positive, '#9CA3AF', COLORS.negative]; // green, gray, red

function WinLossChart({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const data = [
    { name: 'ניצחונות', value: wins },
    { name: 'תיקו', value: draws },
    { name: 'הפסדים', value: losses },
  ];
  const total = wins + draws + losses;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Data Transformation for Chart
```typescript
import type { TournamentEntry } from '@shared/types';

interface ChartDataPoint {
  date: string;
  rating: number;
  tournament: string;
}

function buildChartData(tournaments: TournamentEntry[], currentRating: number): ChartDataPoint[] {
  // Sort chronologically (oldest first) for chart
  const sorted = [...tournaments].sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  // Build cumulative rating from changes (work backwards from current rating)
  let rating = currentRating;
  const points: ChartDataPoint[] = [];
  
  // Calculate starting rating by subtracting all changes
  for (const t of sorted.slice().reverse()) {
    if (!t.isPending) rating -= t.ratingChange;
  }
  
  // Now walk forward, accumulating
  let runningRating = rating;
  for (const t of sorted) {
    if (!t.isPending) runningRating += t.ratingChange;
    points.push({
      date: t.startDate,
      rating: Math.round(runningRating),
      tournament: t.tournamentName,
    });
  }
  return points;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts 2.x | Recharts 3.x (alpha/beta) | Late 2025 | 3.x exists but is not stable; stick with 2.15.4 for production |
| Victory Charts | Recharts | N/A | Project decision: Recharts is locked |

**Deprecated/outdated:**
- Recharts `<Legend>` with `wrapperStyle` -- use `content` prop for custom legend rendering instead

## Open Questions

1. **Vite dev proxy configuration**
   - What we know: Frontend runs on Vite dev server, backend on Express. API calls to `/api/player/:id` need proxying.
   - What's unclear: Whether vite.config.ts already has a proxy for `/api`.
   - Recommendation: Check vite.config.ts during implementation; if no proxy, add one pointing to backend port.

2. **Chart data reconstruction accuracy**
   - What we know: API provides current rating and per-tournament ratingChange. Historical ratings must be reconstructed by walking changes backwards.
   - What's unclear: Whether pending tournaments should appear on the chart (they have ratingChange: 0).
   - Recommendation: Include pending tournaments on chart at their projected (unchanged) rating; visually distinguish with a different dot style or skip them.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | `client/vitest.config.ts` (exists, jsdom environment) |
| Quick run command | `cd client && npx vitest run --reporter=verbose` |
| Full suite command | `cd client && npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Header shows name, club, birth year, grade, FIDE link | unit | `cd client && npx vitest run src/__tests__/PlayerHeader.test.tsx -x` | Wave 0 |
| DASH-02 | 4 metric cards with correct values | unit | `cd client && npx vitest run src/__tests__/MetricCards.test.tsx -x` | Wave 0 |
| DASH-03 | Rating chart renders with data | unit | `cd client && npx vitest run src/__tests__/RatingChart.test.tsx -x` | Wave 0 |
| DASH-04 | Line/bar toggle works | unit | `cd client && npx vitest run src/__tests__/RatingChart.test.tsx -x` | Wave 0 |
| DASH-05 | Tournament list shows 10 items | unit | `cd client && npx vitest run src/__tests__/TournamentList.test.tsx -x` | Wave 0 |
| DASH-06 | Pagination prev/next works | unit | `cd client && npx vitest run src/__tests__/TournamentList.test.tsx -x` | Wave 0 |
| DASH-07 | Rating change color coding | unit | `cd client && npx vitest run src/__tests__/TournamentList.test.tsx -x` | Wave 0 |
| DASH-08 | Pending badge renders | unit | `cd client && npx vitest run src/__tests__/TournamentList.test.tsx -x` | Wave 0 |
| DASH-09 | New badge on most recent | unit | `cd client && npx vitest run src/__tests__/TournamentList.test.tsx -x` | Wave 0 |
| DASH-10 | Tournament link opens in new tab | unit | `cd client && npx vitest run src/__tests__/TournamentList.test.tsx -x` | Wave 0 |
| DASH-11 | Donut chart renders W/D/L | unit | `cd client && npx vitest run src/__tests__/WinLossChart.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd client && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd client && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `client/src/__tests__/PlayerHeader.test.tsx` -- covers DASH-01
- [ ] `client/src/__tests__/MetricCards.test.tsx` -- covers DASH-02
- [ ] `client/src/__tests__/RatingChart.test.tsx` -- covers DASH-03, DASH-04 (mock ResponsiveContainer)
- [ ] `client/src/__tests__/TournamentList.test.tsx` -- covers DASH-05 through DASH-10
- [ ] `client/src/__tests__/WinLossChart.test.tsx` -- covers DASH-11 (mock ResponsiveContainer)
- [ ] `client/src/__tests__/usePlayer.test.tsx` -- covers data fetching hook
- [ ] Recharts ResponsiveContainer mock in test setup (jsdom has no layout engine)

## Project Constraints (from CLAUDE.md)

- **Tech Stack:** React + TypeScript + Tailwind CSS + Recharts (frontend) -- all apply to this phase
- **RTL:** Full RTL with Hebrew labels -- all text must be Hebrew, use logical CSS properties
- **Mobile:** Must work on 375px screens -- all components must be tested at this width
- **Colors:** Blue (#378ADD) primary, Green (#639922) positive, Red (#E24B4A) negative, Amber (#EF9F27) pending -- use Tailwind custom colors
- **No Redux:** React Context + useState sufficient
- **No Next.js, Puppeteer, MongoDB** -- not relevant to this phase but noted
- **GSD Workflow:** All edits through GSD commands
- **Conventions:** RTL-safe logical properties (ms-/me-/ps-/pe-), dark: prefix classes, card style `shadow-sm rounded-xl bg-white dark:bg-gray-800`

## Sources

### Primary (HIGH confidence)
- Project codebase: `packages/shared/types.ts`, `client/src/lib/constants.ts`, `client/tailwind.config.js`, `client/package.json` -- verified types, colors, installed deps
- npm registry: `npm view recharts version` -- confirmed 2.15.4 latest 2.x, 3.8.1 latest overall
- Existing patterns: `client/src/hooks/useDarkMode.ts`, `client/src/components/players/PlayerCard.tsx` -- card and hook patterns

### Secondary (MEDIUM confidence)
- Recharts API knowledge: LineChart, AreaChart, BarChart, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, defs/linearGradient -- standard Recharts 2.x API, well-established

### Tertiary (LOW confidence)
- Recharts jsdom testing workaround (ResponsiveContainer mock) -- common community pattern, needs validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Recharts 2.x is locked decision, version verified via npm
- Architecture: HIGH -- follows established Phase 2 patterns with clear component decomposition
- Pitfalls: HIGH -- well-known Recharts/jsdom issues and RTL considerations documented from codebase analysis

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable stack, no fast-moving dependencies)

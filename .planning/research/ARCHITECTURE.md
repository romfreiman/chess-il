# Architecture Patterns

**Domain:** Club Player Search & Export integration into Chess IL Dashboard
**Researched:** 2026-04-24

## Current Architecture Snapshot

Before describing the integration, here is the existing system structure that new features must fit into.

### Existing Layers

```
Browser (React SPA)
  |
  |-- React Router 6 (createBrowserRouter)
  |     / -> HomePage
  |     /player/:id -> PlayerPage
  |     /compare -> ComparePage
  |
  |-- Components: search/, dashboard/, compare/, players/, feedback/, layout/
  |-- Hooks: usePlayer, usePlayerSearch, useSavedPlayers, useDarkMode, useRecentSearches
  |-- Context: SavedPlayersContext (localStorage-backed)
  |-- Shared types: packages/shared/types.ts
  |
  v
Netlify Proxy (/api/* -> /.netlify/functions/api/:splat)
  |
  v
Express App (netlify/functions/api.ts)
  |-- /api/player/search?q=... -> searchPlayers() scraper
  |-- /api/player/:id -> scrapePlayer() + DB cache
  |-- /api/health
  |
  v
Scraper (src/scraper/)
  |-- fetch.ts: HTTP GET via axios
  |-- parse.ts: cheerio HTML parsing
  |-- search.ts: ASP.NET WebForms 2-step (GET viewstate, POST search)
  |-- validate.ts: data validation
  |
  v
DB Cache (src/db/)
  |-- Supabase (production) or SQLite (development)
  |-- 24-hour staleness window
```

### Key Existing Patterns

| Pattern | Implementation | Location |
|---------|---------------|----------|
| ASP.NET scraping | GET for viewstate, POST with form fields | `src/scraper/search.ts` |
| Data fetching hooks | useState + useEffect + AbortController + debounce | `client/src/hooks/usePlayer*.ts` |
| Shared types | Single `packages/shared/types.ts` used by both frontend and backend | `packages/shared/types.ts` |
| API routing | Express Router mounted at `/api/player` | `src/api/routes/player.ts` |
| Component structure | Page -> compositional components, props down | `client/src/pages/*.tsx` |
| State management | React Context + localStorage, no Redux | `client/src/context/` |
| Error handling | Graceful degradation, empty arrays on failure | `src/scraper/search.ts` |

---

## Recommended Architecture for New Features

### High-Level Data Flow

```
ClubSearchPage (new page)
  |
  |-- useClubList() hook        --> GET /api/clubs            --> scrapeClubList()
  |-- useClubSearch() hook      --> GET /api/clubs/search?... --> scrapeClubPlayers()
  |
  |-- ClubSearchForm component  (club dropdown + age range inputs)
  |-- ClubResultsTable component (selectable rows with checkboxes)
  |-- ExportButton component    (CSV generation from selected rows)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **ClubSearchPage** (page) | Orchestrates search state, results, and selection | ClubSearchForm, ClubResultsTable, ExportButton |
| **ClubSearchForm** | Club dropdown + age range + search button | ClubSearchPage (via callbacks) |
| **ClubResultsTable** | Renders player rows with checkboxes, select-all | ClubSearchPage (via callbacks) |
| **ExportButton** | Generates and downloads CSV from selected players | ClubSearchPage (reads selection state) |
| **useClubList** (hook) | Fetches club list from API, caches in state | `/api/clubs` endpoint |
| **useClubSearch** (hook) | Fetches search results with abort/loading pattern | `/api/clubs/search` endpoint |

### New vs Modified Files

#### New Files (Backend)

| File | Purpose |
|------|---------|
| `src/scraper/clubs.ts` | Scrape club list and club player search from chess.org.il |
| `src/api/routes/clubs.ts` | Express Router for `/api/clubs` and `/api/clubs/search` |

#### New Files (Frontend)

| File | Purpose |
|------|---------|
| `client/src/pages/ClubSearchPage.tsx` | New page component |
| `client/src/components/clubs/ClubSearchForm.tsx` | Search form with club dropdown + age inputs |
| `client/src/components/clubs/ClubResultsTable.tsx` | Results table with checkboxes |
| `client/src/components/clubs/ExportButton.tsx` | CSV export button |
| `client/src/hooks/useClubList.ts` | Fetch club list |
| `client/src/hooks/useClubSearch.ts` | Fetch club search results |
| `client/src/lib/csv.ts` | CSV generation utility (pure function) |

#### Modified Files

| File | Change |
|------|--------|
| `packages/shared/types.ts` | Add `ClubOption`, `ClubSearchResult`, `ClubSearchParams` types |
| `client/src/App.tsx` | Add `/clubs` route |
| `client/src/components/layout/Navbar.tsx` | Add "Club Search" nav link |
| `netlify/functions/api.ts` | Mount `clubsRouter` at `/api/clubs` |

#### No Changes Needed

| File | Why |
|------|-----|
| `src/scraper/search.ts` | Existing name search is independent; club search is a separate scraper |
| `src/db/*` | Club search results are not cached (live scrape each time) |
| `client/src/context/*` | Club search has no persistent state; selection is page-local |
| `client/src/hooks/usePlayer*.ts` | Existing player hooks remain untouched |

---

## Detailed Component Design

### 1. Backend: Club Scraper (`src/scraper/clubs.ts`)

The chess.org.il advanced search requires a **3-step ASP.NET WebForms flow**:

```
Step 1: GET SearchPlayers.aspx
        -> Extract __VIEWSTATE, __EVENTVALIDATION, __VIEWSTATEGENERATOR

Step 2: POST with __EVENTTARGET = AdvancedSearchLinkButton
        -> Opens advanced panel, returns new ViewState + club dropdown options

Step 3: POST with ClubsDDL + AgeFromTB + AgeTillTB + AdvancedSearchButton
        -> Returns results in #ctl00_ContentPlaceHolder1_playersGridView
```

**Verified form field names** (from live page inspection on 2026-04-24):

| Field | ASP.NET Name | Values |
|-------|-------------|--------|
| Club dropdown | `ctl00$ContentPlaceHolder1$ClubsDDL` | `0` = all, integer = specific club ID |
| Age from | `ctl00$ContentPlaceHolder1$AgeFromTB` | Integer or empty |
| Age to | `ctl00$ContentPlaceHolder1$AgeTillTB` | Integer or empty |
| Gender | `ctl00$ContentPlaceHolder1$GenderDDL` | `ALL`, `זכר`, `נקבה` |
| Player status | `ctl00$ContentPlaceHolder1$PlayerStatusDDL` | `1` = active (default) |
| Search button | `ctl00$ContentPlaceHolder1$AdvancedSearchButton` | `חיפוש` |

**Default values for unused filters** (must be sent to avoid validation errors):

```typescript
const ADVANCED_SEARCH_DEFAULTS = {
  'ctl00$ContentPlaceHolder1$GenderDDL': 'ALL',
  'ctl00$ContentPlaceHolder1$CitiesDDL': 'All',    // Note: capital-A "All"
  'ctl00$ContentPlaceHolder1$ForeignDDL': 'ALL',
  'ctl00$ContentPlaceHolder1$CountriesDDL': 'ALL',
  'ctl00$ContentPlaceHolder1$MembershipStatusDDL': 'ALL',
  'ctl00$ContentPlaceHolder1$PlayerStatusDDL': '1', // Active players
};
```

**Results table columns** (same `#ctl00_ContentPlaceHolder1_playersGridView` grid as name search, verified):

| Index | Header | Content |
|-------|--------|---------|
| 0 | # | Row number |
| 1 | שם | Player name (with `<a>` link containing `?Id=...`) |
| 2 | מספר שחקן | Player ID number |
| 3 | מדינה | Country (may include `(זר)` for foreigners) |
| 4 | מין | Gender |
| 5 | מספר תחרויות | Tournament count |
| 6 | מועדון | Club name (may contain newlines with secondary club) |
| 7 | מספר בפיד"ה | FIDE number |
| 8 | סטטוס | Status (פעיל/לא פעיל) |
| 9 | מד כושר ישראלי | Israeli rating |
| 10 | מד כושר פיד"ה רגיל | FIDE standard rating |
| 11 | דרגה | Grade/title |
| 12 | כרטיס שחמטאי | License expiry date (dd/MM/yyyy) |
| 13 | שנת לידה | Birth year |
| 14 | תפקיד | Role (usually empty) |

**Club dropdown** has ~200 options. Value `0` = "all clubs" (כל המועדונים). Other values are integer IDs.

**Result set size:** Up to 250 rows returned per search (observed server-side limit at exactly 250 rows). No ASP.NET GridPager pagination detected on the advanced search results, meaning all rows come back in a single response.

```typescript
// src/scraper/clubs.ts - Two exported functions

export async function scrapeClubList(): Promise<ClubOption[]>
// Steps 1+2 only. Extract <option> elements from the ClubsDDL select.
// Returns: [{ id: 24, name: '"בית הלוחם" תל אביב' }, ...]
// Excludes the "כל המועדונים" option (id: 0).

export async function scrapeClubPlayers(params: ClubSearchParams): Promise<ClubSearchResult[]>
// Steps 1+2+3. Full advanced search flow.
// Returns parsed table rows (up to 250).
```

### 2. Backend: API Routes (`src/api/routes/clubs.ts`)

```typescript
// GET /api/clubs
// Returns: ClubOption[]
// No params needed.

// GET /api/clubs/search?club=24&ageFrom=8&ageTo=14
// Returns: ClubSearchResult[]
// All params optional. At least club or age range should be provided.
```

**Why a separate router, not extending playerRouter:**

- Different domain concern (club search vs individual player data)
- Different scraping flow (3-step vs 2-step)
- No caching layer needed (live results, no 24h staleness)
- Clean separation in `netlify/functions/api.ts`: `app.use('/api/clubs', clubsRouter)`

### 3. Shared Types (`packages/shared/types.ts`)

```typescript
// Add to existing types file:

export interface ClubOption {
  id: number;    // dropdown value (e.g., 24)
  name: string;  // display name (e.g., '"בית הלוחם" תל אביב')
}

export interface ClubSearchParams {
  clubId?: number;   // 0 or omitted = all clubs
  ageFrom?: number;  // minimum age
  ageTo?: number;    // maximum age
}

export interface ClubSearchResult {
  rowNumber: number;
  id: number;          // Player ID (from link href or column 2)
  name: string;
  country: string;
  gender: string;
  tournamentCount: number;
  club: string;
  fideNumber: number | null;
  status: string;
  rating: number | null;       // Israeli rating
  fideRating: number | null;
  grade: string | null;
  licenseExpiry: string | null; // ISO 8601 or null
  birthYear: number | null;
}
```

### 4. Frontend: Page Component

```
ClubSearchPage
  |
  |-- state: clubId, ageFrom, ageTo (search params)
  |-- state: selectedIds (Set<number>)
  |-- useClubList() -> clubs[]
  |-- useClubSearch() -> results[], loading, error, search()
  |
  |-- <ClubSearchForm>
  |     props: clubs, clubId, ageFrom, ageTo, onSearch, loading
  |     Renders: <select> for club, two <input> for ages, <button> search
  |
  |-- <ClubResultsTable>
  |     props: results, selectedIds, onToggle, onToggleAll
  |     Renders: <table> with checkbox column
  |     Shows: name, ID, rating, club, birth year, grade
  |
  |-- <ExportButton>
  |     props: results (filtered to selectedIds), disabled
  |     onClick: generates CSV, triggers download
```

**State management approach:** All state lives in ClubSearchPage via useState. No Context needed because:
- Selection state is ephemeral (page-local, not persisted)
- No other page needs access to club search results
- This matches how HomePage already manages compare selection with local useState

### 5. Frontend: Hooks

**useClubList** - Fetch-once pattern (clubs rarely change during a session):

```typescript
// Fetches GET /api/clubs on mount
// Returns { clubs: ClubOption[], loading: boolean, error: string | null }
// No refetch needed; clubs are static within a session
```

**useClubSearch** - Imperative triggered search (not auto-debounced):

```typescript
// Returns { results, loading, error, search(params) }
// The search() function is called when user clicks the button
// Uses AbortController pattern from existing hooks
```

This differs from `usePlayerSearch` intentionally: name search needs debounce because users type character-by-character. Club search is a form submission -- the user fills all fields, then clicks search.

### 6. Frontend: CSV Export (`client/src/lib/csv.ts`)

Pure client-side generation. No server round-trip needed.

```typescript
export function generateCSV(players: ClubSearchResult[]): string
// Columns: Name, ID, Rating, Club, Birth Year, Grade
// Hebrew column headers
// BOM prefix (\uFEFF) for Excel Hebrew support
// Returns CSV string

export function downloadCSV(csv: string, filename: string): void
// Creates Blob with type text/csv;charset=utf-8
// Temporary <a> element, triggers download
// Filename format: "chess-il-{clubName}-{date}.csv"
```

**Why client-side, not server-side:**
- Data is already in the browser (fetched from API)
- No processing needed beyond formatting
- Avoids an extra API round-trip
- Works offline once data is loaded
- Standard pattern for export-from-table features

---

## Data Flow Diagram

```
User Action                Frontend                    API                      chess.org.il
-----------                --------                    ---                      ------------

Page Load          useClubList() fires
                   GET /api/clubs ---------> clubsRouter.get('/')
                                             scrapeClubList() ---------> GET SearchPlayers.aspx
                                                                         POST AdvancedSearchLink
                                             parse dropdown <---------- HTML with <select>
                   clubs[] <----------------- ClubOption[]

Fill Form          local state updates
Click Search       useClubSearch.search()
                   GET /api/clubs/search
                     ?club=24&ageFrom=8
                     &ageTo=14 -----------> clubsRouter.get('/search')
                                            scrapeClubPlayers() -------> GET SearchPlayers.aspx
                                                                         POST AdvancedSearchLink
                                                                         POST with filters
                                            parse table <-------------- HTML with <table>
                   results[] <------------- ClubSearchResult[]

Check boxes        selectedIds state
Click Export       generateCSV(selected)
                   downloadCSV() -> browser download
```

---

## Patterns to Follow

### Pattern 1: ASP.NET 3-Step Scraping

**What:** GET for viewstate, POST to open advanced panel, POST to search.

**When:** Any interaction with the chess.org.il advanced search page.

**Example structure:**

```typescript
async function scrapeClubPlayers(params: ClubSearchParams): Promise<ClubSearchResult[]> {
  try {
    // Step 1: GET initial viewstate
    const page = await axios.get(SEARCH_URL, { headers, timeout: 15000, responseType: 'text', validateStatus: () => true });
    const $1 = cheerio.load(page.data);
    const vs1 = $1('#__VIEWSTATE').val() as string;
    const ev1 = $1('#__EVENTVALIDATION').val() as string;
    const vsg1 = $1('#__VIEWSTATEGENERATOR').val() as string;

    // Step 2: POST to open advanced panel
    const advForm = new URLSearchParams();
    advForm.append('__VIEWSTATE', vs1);
    advForm.append('__EVENTVALIDATION', ev1);
    if (vsg1) advForm.append('__VIEWSTATEGENERATOR', vsg1);
    advForm.append('__EVENTTARGET', 'ctl00$ContentPlaceHolder1$AdvancedSearchLinkButton');
    advForm.append('__EVENTARGUMENT', '');
    const adv = await axios.post(SEARCH_URL, advForm.toString(), { headers: postHeaders, ... });
    const $2 = cheerio.load(adv.data);

    // Step 3: POST with search filters
    const searchForm = buildSearchForm($2, params);
    const results = await axios.post(SEARCH_URL, searchForm.toString(), { headers: postHeaders, ... });
    const $3 = cheerio.load(results.data);

    return parseResultsTable($3);
  } catch {
    return []; // Graceful degradation, matching existing pattern
  }
}
```

### Pattern 2: Imperative Search Hook (vs Debounced)

**What:** A hook that exposes a `search()` function rather than auto-fetching on input change.

**When:** Form-based search where user fills multiple fields before submitting.

**Why:** Club search has 3 filter fields. Auto-fetching on each field change would fire 3 API calls (each taking ~3 seconds). The user expects to fill the form, then click search once.

```typescript
function useClubSearch() {
  const [results, setResults] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (params: ClubSearchParams) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (params.clubId) qs.set('club', String(params.clubId));
      if (params.ageFrom) qs.set('ageFrom', String(params.ageFrom));
      if (params.ageTo) qs.set('ageTo', String(params.ageTo));
      const res = await fetch(`/api/clubs/search?${qs}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Search failed');
      setResults(await res.json());
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'שגיאה בחיפוש');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
```

### Pattern 3: Client-Side CSV with BOM

**What:** Generate CSV in the browser with a BOM prefix for Hebrew/Excel compatibility.

**When:** Exporting tabular data that will be opened in Excel with Hebrew text.

```typescript
function generateCSV(players: ClubSearchResult[]): string {
  const BOM = '\uFEFF';
  const headers = ['שם', 'מספר שחקן', 'מד כושר', 'מועדון', 'שנת לידה', 'דרגה'];
  const rows = players.map(p => [
    p.name, p.id, p.rating ?? '', p.club, p.birthYear ?? '', p.grade ?? ''
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  return BOM + [headers.join(','), ...rows].join('\n');
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Caching Club Search Results in DB

**What:** Storing club search results in Supabase/SQLite like player data.

**Why bad:** Club search results are a live query against chess.org.il. Caching them would show stale rosters. Unlike individual player data (which changes slowly and benefits from 24h cache), club membership changes frequently (players transfer, new registrations happen).

**Instead:** Scrape fresh on each search request. The 3-step scraping takes ~2-3 seconds, which is acceptable for a form-submit interaction.

### Anti-Pattern 2: Reusing the Existing `searchPlayers()` Function

**What:** Trying to extend `src/scraper/search.ts` to handle club search.

**Why bad:** The existing `search.ts` does a 2-step flow (GET + POST with name query to the simple search panel). Club search requires a 3-step flow (GET + POST to open advanced panel + POST with filters). The form fields, viewstate, and parsing logic are different. Merging them creates a confusing conditional function with two distinct code paths sharing nothing but the URL.

**Instead:** Create `src/scraper/clubs.ts` as a new module. Both use the same underlying axios + cheerio patterns but are independent. The `search.ts` module stays clean for name search.

### Anti-Pattern 3: Global State for Selection

**What:** Using React Context or a global store for the checkbox selection state.

**Why bad:** Selection state is ephemeral -- it only matters on the ClubSearchPage while the user is selecting players for export. No other page needs it. Adding it to Context creates unnecessary re-renders across the app.

**Instead:** Use `useState<Set<number>>` in ClubSearchPage, exactly like HomePage already manages compare selection with local state.

### Anti-Pattern 4: Server-Side CSV Generation

**What:** Adding an API endpoint like `POST /api/clubs/export` that returns a CSV file.

**Why bad:** The data is already in the browser. Sending it back to the server to format as CSV wastes bandwidth and adds latency. It also means the server needs to re-scrape or receive the full data back.

**Instead:** Pure client-side CSV generation. The `csv.ts` utility is a pure function with no side effects, easy to unit test.

---

## Scalability Considerations

| Concern | Current (MVP) | At Scale |
|---------|--------------|----------|
| Club list freshness | Fetch on every page load (~2s for 3-step flow) | Cache in-memory on server with TTL (1 hour). Club list changes rarely. |
| Search response time | 3 HTTP round-trips to chess.org.il (~2-3s total) | Acceptable for form submission UX. Could optimize by combining steps 1+2 if club list is cached. |
| Result set size | Max ~250 rows per search (chess.org.il server limit) | Sufficient. Clubs rarely have >250 active players in an age range. |
| CSV size | Max ~250 rows, ~10KB | Well within browser memory. |
| Concurrent users | Netlify Functions scale automatically | Each search is stateless and independent. |

---

## Routing Integration

Current routes:

```typescript
{ path: '/', element: <HomePage /> },
{ path: 'player/:id', element: <PlayerPage /> },
{ path: 'compare', element: <ComparePage /> },
```

Add:

```typescript
{ path: 'clubs', element: <ClubSearchPage /> },
```

Navbar gets a new link (use `Users` icon from lucide-react, consistent with existing icon style):

```tsx
<Link to="/clubs" aria-label="חיפוש לפי מועדון">
  <Users className="h-5 w-5" />
</Link>
```

---

## API Endpoint Registration

In `netlify/functions/api.ts`, add one line:

```typescript
import { clubsRouter } from '../../src/api/routes/clubs.js';
// ...existing code...
app.use('/api/clubs', clubsRouter);
```

The Netlify redirect rule (`/api/* -> /.netlify/functions/api/:splat`) already covers all `/api/` paths. No `netlify.toml` changes needed.

---

## File Structure Summary

```
src/
  api/
    routes/
      player.ts          (existing, no changes)
      clubs.ts            (NEW)
  scraper/
    clubs.ts              (NEW)
    search.ts             (existing, no changes)
    fetch.ts              (existing, no changes)
    parse.ts              (existing, no changes)
    ...
  db/                     (existing, no changes needed)

client/src/
  pages/
    ClubSearchPage.tsx    (NEW)
    HomePage.tsx          (existing, no changes)
    PlayerPage.tsx        (existing, no changes)
    ComparePage.tsx       (existing, no changes)
  components/
    clubs/                (NEW directory)
      ClubSearchForm.tsx  (NEW)
      ClubResultsTable.tsx (NEW)
      ExportButton.tsx    (NEW)
    layout/
      Navbar.tsx          (MODIFY: add clubs nav link)
    ...                   (existing, no changes)
  hooks/
    useClubList.ts        (NEW)
    useClubSearch.ts      (NEW)
    usePlayer.ts          (existing, no changes)
    ...
  lib/
    csv.ts                (NEW)
    constants.ts          (existing, no changes)
    types.ts              (existing, no changes)

packages/shared/
  types.ts                (MODIFY: add ClubOption, ClubSearchResult, ClubSearchParams)

netlify/functions/
  api.ts                  (MODIFY: mount clubsRouter)

tests/
  scraper/
    clubs.test.ts         (NEW)
```

---

## Build Order (Dependency-Aware)

This order ensures each step can be tested independently:

1. **Shared types first** - `ClubOption`, `ClubSearchResult`, `ClubSearchParams` in `packages/shared/types.ts`. Everything depends on these.

2. **Club scraper** - `src/scraper/clubs.ts` with `scrapeClubList()` and `scrapeClubPlayers()`. Can be tested with a simple Node script or vitest against live chess.org.il.

3. **API routes** - `src/api/routes/clubs.ts` exposing `/api/clubs` and `/api/clubs/search`. Mount in `netlify/functions/api.ts`. Testable with curl against dev server.

4. **Frontend hooks** - `useClubList` and `useClubSearch`. These call the API endpoints from step 3.

5. **CSV utility** - `client/src/lib/csv.ts`. Pure function, easy unit test. Can be built in parallel with step 4.

6. **UI components** - `ClubSearchForm`, `ClubResultsTable`, `ExportButton`. These consume hook data from step 4 and CSV utility from step 5.

7. **Page + routing** - `ClubSearchPage` wires everything together. Add route to `App.tsx`, add nav link to `Navbar.tsx`.

**Parallelism:** Steps 4 and 5 can be done in parallel. Steps 2 and 5 can also be done in parallel (scraper and CSV utility are independent of each other).

## Sources

- Live inspection of https://www.chess.org.il/Players/SearchPlayers.aspx (verified 2026-04-24)
- ASP.NET form field names, default values, and result columns confirmed via automated scraping tests
- Existing codebase patterns: `src/scraper/search.ts`, `client/src/hooks/usePlayerSearch.ts`, `src/api/routes/player.ts`

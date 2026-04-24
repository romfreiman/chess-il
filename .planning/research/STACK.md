# Stack Research: Club Player Search & Export (v1.1)

**Domain:** Feature additions to existing Chess IL Dashboard
**Researched:** 2026-04-24
**Confidence:** HIGH

## Scope

This research covers ONLY the new libraries and patterns needed for v1.1 (Club Player Search & Export). The existing stack (React 18, TypeScript, Tailwind, Cheerio, Express, Supabase, Vite, Netlify) is validated and not re-evaluated.

## Key Finding: No New Dependencies Required

All four new capabilities can be built with the existing stack. No new npm packages are needed.

### Rationale by Feature

| Feature | Implementation | Why No New Library |
|---------|---------------|-------------------|
| Club list scraping | Cheerio + axios (existing) | Same ASP.NET WebForms pattern already used in `search.ts`; club dropdown is in the advanced search HTML |
| Advanced search (club + age) | Cheerio + axios (existing) | 3-step POST flow (GET viewstate, open advanced panel, submit search) -- same `__doPostBack` pattern |
| Results table with checkboxes | React useState (existing) | Simple array of selected IDs; no complex state management needed |
| CSV export | Native Blob + URL.createObjectURL | Browser-native API, universally supported, ~20 lines of utility code |

## Scraping: Verified Form Fields

The advanced search on chess.org.il requires a 3-step ASP.NET WebForms interaction (verified via live testing on 2026-04-24):

### Step 1: GET the search page
Retrieves `__VIEWSTATE`, `__EVENTVALIDATION`, `__VIEWSTATEGENERATOR`.

### Step 2: POST to open advanced search panel
```
__EVENTTARGET: ctl00$ContentPlaceHolder1$AdvancedSearchLinkButton
```
This returns a new page with the advanced form fields and updated viewstate tokens.

### Step 3: POST the advanced search form
Key fields (all verified):

| Field Name | Type | Purpose |
|-----------|------|---------|
| `ctl00$ContentPlaceHolder1$ClubsDDL` | select | Club filter (200 options, value `0` = all) |
| `ctl00$ContentPlaceHolder1$AgeFromTB` | text | Minimum age |
| `ctl00$ContentPlaceHolder1$AgeTillTB` | text | Maximum age |
| `ctl00$ContentPlaceHolder1$AdvancedSearchButton` | submit | Trigger search (value: `חיפוש`) |
| `ctl00$ContentPlaceHolder1$AdvancedSearchNameTextBox` | text | Name filter (can be empty) |
| `ctl00$ContentPlaceHolder1$GenderDDL` | select | Default: `ALL` |
| `ctl00$ContentPlaceHolder1$CitiesDDL` | select | Default: `All` |
| `ctl00$ContentPlaceHolder1$ForeignDDL` | select | Default: `ALL` |
| `ctl00$ContentPlaceHolder1$CountriesDDL` | select | Default: `ALL` |
| `ctl00$ContentPlaceHolder1$MembershipStatusDDL` | select | Default: `ALL` |
| `ctl00$ContentPlaceHolder1$PlayerStatusDDL` | select | Default: `0` |
| `ctl00$ContentPlaceHolder1$RatingFromTB` | text | Optional rating range |
| `ctl00$ContentPlaceHolder1$RatingUptoTB` | text | Optional rating range |

### Results Table Structure

The search returns `#ctl00_ContentPlaceHolder1_playersGridView` with the same table ID as the simple search. Maximum 250 result rows. Column mapping (0-indexed):

| Index | Header (Hebrew) | Field | Use in CSV |
|-------|-----------------|-------|------------|
| 0 | # | Row number | No |
| 1 | שם | Player name (with link containing player ID) | Yes |
| 2 | מספר שחקן | Player number | Yes |
| 3 | מדינה | Country | No (mostly ISR) |
| 4 | מין | Gender | No |
| 5 | מספר תחרויות | Tournament count | No |
| 6 | מועדון | Club name | Yes |
| 7 | מספר בפיד"ה | FIDE number | No |
| 8 | סטטוס | Status (active/inactive) | No |
| 9 | מד כושר ישראלי | Israeli rating | Yes |
| 10 | מד כושר פיד"ה רגיל | FIDE rating | No |
| 11 | דרגה | Grade/title | Yes |
| 12 | כרטיס שחמטאי | Membership card | No |
| 13 | שנת לידה | Birth year | Yes |
| 14 | תפקיד | Role | No |

### Club List (200 clubs)

The club dropdown contains 200 options (value `0` = "all clubs"). Club values are numeric IDs. The list is pre-populated in the advanced search HTML -- no separate scrape endpoint needed. The list can be extracted from the step-2 response and cached.

## CSV Export: Native Browser API

Use the Blob API with `URL.createObjectURL()`. No library needed.

### Critical: Hebrew/RTL Handling

CSV files with Hebrew text MUST include a UTF-8 BOM (`\uFEFF`) at the start of the file. Without it, Excel (the most common CSV consumer) will display Hebrew as gibberish. This is a well-documented issue with non-Latin scripts in CSV.

### Implementation Pattern

```typescript
function downloadCSV(rows: Record<string, string | number>[], filename: string): void {
  const BOM = '\uFEFF';
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(key => {
        const val = String(row[key] ?? '');
        // Escape values containing commas, quotes, or newlines
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    )
  ];
  const csvString = BOM + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Why Not a Library

| Library | Why Not |
|---------|---------|
| `papaparse` | 36KB gzipped; only needed for CSV *parsing* (reading), not generation |
| `json-to-csv-export` | 2KB but adds a dependency for ~20 lines of code; has open issues with Hebrew BOM |
| `csv-stringify` | Node.js-focused; overkill for simple flat data |
| `xlsx` / `exceljs` | 200KB+; Excel format not requested; CSV is sufficient |

## Results Table with Checkboxes: React State

### Pattern

```typescript
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

// Select all / deselect all
const toggleSelectAll = () => {
  if (selectedIds.size === results.length) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(results.map(r => r.id)));
  }
};

// Toggle individual
const togglePlayer = (id: number) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};
```

No state management library needed. A `Set<number>` tracked in `useState` handles select-all, deselect-all, and individual toggles efficiently.

## New API Endpoints

Two new Express routes needed (add to existing router or new router):

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/clubs` | GET | Return list of clubs (id + name) | `{ clubs: Array<{id: number, name: string}> }` |
| `/api/clubs/search` | GET | Search players by club + age | `{ players: Array<ClubSearchResult> }` |

Query params for `/api/clubs/search`:
- `clubId` (required) -- numeric club ID from dropdown
- `ageFrom` (optional) -- minimum age
- `ageTo` (optional) -- maximum age

## New Shared Types

```typescript
export interface ClubInfo {
  id: number;
  name: string;
}

export interface ClubSearchResult {
  id: number;           // player ID
  name: string;         // player name
  club: string;         // club name
  rating: number | null; // Israeli rating
  grade: string | null;  // grade/title
  birthYear: number | null;
  age: number | null;    // computed from birthYear
}
```

## Existing Stack -- Confirmed Versions

These are already installed and should NOT be changed:

### Backend (`package.json`)
| Package | Current Version | Role in v1.1 |
|---------|----------------|--------------|
| cheerio | ^1.2.0 | Parse club list + search results HTML |
| axios | ^1.15.1 | HTTP requests to chess.org.il |
| express | ^4.22.1 | New routes: `/api/clubs`, `/api/clubs/search` |
| @supabase/supabase-js | ^2.103.3 | Not needed for v1.1 (no caching of search results) |

### Frontend (`client/package.json`)
| Package | Current Version | Role in v1.1 |
|---------|----------------|--------------|
| react | ^18.3.1 | Club search page, results table, checkbox state |
| react-router-dom | ^6.30.3 | New route: `/clubs` |
| tailwindcss | ^3.4.19 | Table styling, checkbox styling, responsive layout |
| lucide-react | ^1.8.0 | Download icon for CSV button, search icon, filter icon |

## Installation

```bash
# No new packages needed.
# All capabilities are covered by existing dependencies + browser APIs.
```

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `papaparse` | Only needed for CSV parsing (reading), not generation; 36KB | Native Blob API |
| `xlsx` / `exceljs` | Massive bundle (200KB+); XLSX not requested | CSV via Blob |
| `react-table` / `@tanstack/react-table` | Overkill for a single flat table with checkboxes; adds 15KB+ | Plain `<table>` with Tailwind |
| `react-checkbox-tree` | Not a tree structure; flat list of players | `<input type="checkbox">` |
| `@reduxjs/toolkit` | No shared state across pages needed | React `useState` with `Set<number>` |
| `react-query` / `@tanstack/react-query` | Only one search endpoint; existing fetch pattern is fine | Custom hook with `useState` + `useEffect` |
| `formik` / `react-hook-form` | Two dropdowns and two number inputs do not justify a form library | Controlled components |

## Caching Considerations

### Club List
The club list (200 items) changes rarely. Options:
1. **Server-side cache** -- scrape once per 24h, store in Supabase (consistent with player cache pattern)
2. **In-memory cache** -- store in Express process memory with TTL (simpler, sufficient for Netlify Functions)
3. **Client-side cache** -- cache in localStorage after first fetch (simplest)

**Recommendation:** Option 2 (in-memory with 24h TTL) for the API endpoint, with client-side caching in the React component via `useState`. Club lists do not change frequently enough to warrant Supabase storage.

**Caveat for Netlify Functions:** Netlify Functions are stateless -- in-memory cache only persists for the duration of a single function invocation (warm container reuse is not guaranteed). For true persistence, use Supabase or return the club list from the same POST that fetches search results, avoiding a separate cache altogether.

### Search Results
Search results should NOT be cached -- they are ephemeral queries. Each search hits chess.org.il directly. The 3-step POST flow means each search requires ~3 sequential HTTP requests, so expect 1-3 second response times.

## Sources

- chess.org.il/Players/SearchPlayers.aspx -- Live tested on 2026-04-24. Advanced search form fields, club dropdown (200 options), results table structure (15 columns, max 250 rows) all verified via actual HTTP requests. **HIGH confidence.**
- [MDN Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob) -- Browser-native CSV generation. **HIGH confidence.**
- [GitHub: payload/issues/13929](https://github.com/payloadcms/payload/issues/13929) -- Hebrew CSV BOM requirement confirmed. **HIGH confidence.**
- [GitHub: json-to-csv-export/issues/38](https://github.com/coston/json-to-csv-export/issues/38) -- Hebrew BOM issue in CSV libraries confirms native approach is safer. **HIGH confidence.**
- Existing codebase (`src/scraper/search.ts`) -- Existing ASP.NET WebForms scraping pattern verified as reusable. **HIGH confidence.**

---
*Stack research for: Chess IL Dashboard v1.1 -- Club Player Search & Export*
*Researched: 2026-04-24*

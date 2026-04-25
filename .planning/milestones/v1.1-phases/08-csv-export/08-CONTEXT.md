# Phase 8: CSV Export - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Export selected club search results to a CSV file that opens correctly in Microsoft Excel with Hebrew characters. Client-side generation via Blob API. Enables the existing disabled export button in ClubFloatingBar.

</domain>

<decisions>
## Implementation Decisions

### Export Trigger
- **D-01:** Keep current FloatingBar design — export button appears only when 1+ players are selected. No always-visible export button.
- **D-02:** Export button exports only the selected players. "Export all" is achieved by user clicking select-all first, then export.
- **D-03:** Enable the currently disabled "ייצוא CSV" button in ClubFloatingBar by wiring it to the export function.

### CSV Columns
- **D-04:** Export all fields: name, player ID, rating, club, age, rank. Hebrew column headers: שם, מספר שחקן, דירוג, מועדון, גיל, מיקום.
- **D-05:** Age is calculated at export time: current year minus birthYear.
- **D-06:** Rank is the row position in the results list (1, 2, 3...) based on the order displayed in the table.

### CSV Encoding
- **D-07:** UTF-8 with BOM (byte order mark) prefix so Microsoft Excel recognizes Hebrew characters correctly.
- **D-08:** RFC 4180 compliance — fields containing commas, double quotes, or newlines are properly escaped.

### Download Details
- **D-09:** Filename format: `{clubname}-{date}-{time}.csv` — e.g., `אליצור-ירושלים-2026-04-25-1430.csv`. Uses the selected club name from the search form.
- **D-10:** No toast or feedback after export — browser's native download notification is sufficient.
- **D-11:** Client-side generation via Blob API — no server-side CSV generation (v1.1 roadmap decision).

### Claude's Discretion
- CSV generation utility function design (standalone function vs hook)
- How to pass the selected results data and club name to the export function
- Edge case handling for null rating or null birthYear values in CSV output
- Time format in filename (24h vs timestamp)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Direct Dependencies (Phase 7)
- `client/src/components/clubs/ClubFloatingBar.tsx` — Current disabled export button. Must be enabled and wired to export function.
- `client/src/components/clubs/ClubResultsTable.tsx` — Desktop results table with selection state. Source of selected player data.
- `client/src/components/clubs/ClubResultsCards.tsx` — Mobile results cards with selection state.
- `client/src/pages/HomePage.tsx` — Manages `selected` state (`Set<number>`) and renders ClubFloatingBar. Export function needs access to results array and selected IDs.

### Types
- `packages/shared/types.ts` — `ClubSearchResult` type: `{ id, name, rating, club, birthYear }`. The data shape for CSV rows.

### Hooks
- `client/src/hooks/useClubSearch.ts` — Returns search results. Export function needs the results array from this hook.

### Project Context
- `.planning/REQUIREMENTS.md` — EXPORT-01, EXPORT-02, EXPORT-03 are this phase's requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ClubFloatingBar.tsx` — Already has the Download icon (lucide-react) and disabled button UI. Just needs `onClick` handler and removal of `disabled`/`opacity-50` classes.
- `ClubResultsTable.tsx` — Has `sortResults` function that determines display order. Rank should match this sorted order.
- HomePage's `selected` state (`Set<number>`) — Already tracks which player IDs are selected.

### Established Patterns
- Lucide React icons used throughout — `Download` icon already imported in ClubFloatingBar.
- No existing file download pattern in the codebase — this is the first download feature.
- RTL layout and Hebrew strings used as Unicode in JSX throughout.

### Integration Points
- `ClubFloatingBar` — Add `onExport` callback prop, wire to export utility function.
- `HomePage.tsx` — Pass export handler to ClubFloatingBar. Needs access to both `results` array (from useClubSearch) and `selected` set to filter and export.
- Results sort order — Export should respect the current table sort order (ClubResultsTable sorts locally). May need to lift sort state or pass sorted results to export.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-csv-export*
*Context gathered: 2026-04-25*

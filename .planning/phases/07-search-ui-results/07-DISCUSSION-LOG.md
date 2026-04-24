# Phase 7: Search UI & Results - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 07-search-ui-results
**Areas discussed:** Page layout & nav, Club dropdown, Results table, Selection UX

---

## Page Layout & Nav

### Where should the club search page live?

| Option | Description | Selected |
|--------|-------------|----------|
| Top-level /clubs route | New route at /clubs with a dedicated navbar icon | |
| Tab on home page | Toggle/tabs on home page: 'Player Search' \| 'Club Search' | ✓ |
| Nested /search/clubs route | Under a /search parent with potential for /search/players later | |

**User's choice:** Tab on home page
**Notes:** None

### How should the tabs work?

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs above search area | Two tabs above hero search area, saved players grid stays visible below both | |
| Tabs replace entire page content | Switching to club search replaces everything below tabs including saved players | ✓ |
| You decide | Claude chooses the best tab layout approach | |

**User's choice:** Tabs replace entire page content
**Notes:** None

### Filters and results layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single view | Filters at top, results table below inline. Filters stay visible and editable | ✓ |
| Two-step flow | Step 1: pick club + age. Step 2: results page | |
| You decide | Claude picks based on mobile UX | |

**User's choice:** Single view
**Notes:** None

### URL behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, shareable URL | Update URL with search params, bookmarkable/shareable | ✓ |
| No, state only | Keep URL as / regardless | |
| You decide | Claude decides | |

**User's choice:** Yes, shareable URL
**Notes:** None

---

## Club Dropdown

### Club selector interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Combobox with type-to-filter | Text input that filters dropdown as user types | ✓ |
| Plain HTML select | Standard select dropdown with all ~200 options | |
| You decide | Claude picks best approach for Hebrew RTL and mobile | |

**User's choice:** Combobox with type-to-filter
**Notes:** None

### Age filter design

| Option | Description | Selected |
|--------|-------------|----------|
| Age inputs (min/max age) | User enters age range, app converts to birth years | |
| Birth year inputs | User enters birth year range directly | |
| You decide | Claude picks | |

**User's choice:** Just up to certain age, no need for min
**Notes:** User wants a single max age input only — no min age filter needed. Simplifies the UI significantly.

### Age input type

| Option | Description | Selected |
|--------|-------------|----------|
| Number input | Simple number input labeled 'עד גיל' (up to age) | ✓ |
| Preset dropdown | Dropdown with common cutoffs: 8, 10, 12, 14, 16, 18 | |
| You decide | Claude picks | |

**User's choice:** Number input
**Notes:** None

---

## Results Table

### Mobile responsive behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Responsive table with horizontal scroll | Standard table that scrolls horizontally on small screens | |
| Card list on mobile, table on desktop | Below ~640px each result becomes a compact card | ✓ |
| Always cards | Card-based layout at all breakpoints | |
| You decide | Claude picks | |

**User's choice:** Card list on mobile, table on desktop
**Notes:** None

### Row click behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, name is a link | Player name is a clickable link to /player/:id, same tab | ✓ |
| Yes, but opens in new tab | Player name links in new tab | |
| No navigation | Results are purely for selection/export | |

**User's choice:** Yes, name is a link (same tab)
**Notes:** None

### Result count display

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, show count above results | Text like 'נמצאו 42 שחקנים' above the table | ✓ |
| No count needed | Let the table speak for itself | |
| You decide | Claude decides | |

**User's choice:** Yes, show count above results
**Notes:** None

---

## Selection UX

### Selection feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Floating action bar | Sticky bar at bottom with count and export button when 1+ selected | ✓ |
| Inline count above table | Selection count shown next to results count text | |
| You decide | Claude picks | |

**User's choice:** Floating action bar
**Notes:** None

### Select-all behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Select all results at once | Select-all toggles ALL results, no pagination | ✓ |
| Add pagination with per-page select | Paginate results, select-all applies to current page only | |
| You decide | Claude decides | |

**User's choice:** Select all results at once
**Notes:** None

### Row highlight

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, subtle highlight | Selected rows get light blue background tint | ✓ |
| Checkbox only | Just checkbox state changes, no row highlighting | |
| You decide | Claude picks | |

**User's choice:** Yes, subtle highlight
**Notes:** None

---

## Claude's Discretion

- Combobox component implementation approach (custom vs lightweight library)
- Tab component styling and transition effects
- Loading skeleton design for club search results
- Error state design for failed searches
- Empty state when no results match
- Mobile card layout specifics
- Exact breakpoint for table/card switch
- Floating action bar animation and styling

## Deferred Ideas

None — discussion stayed within phase scope

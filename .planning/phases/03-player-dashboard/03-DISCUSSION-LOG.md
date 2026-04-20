# Phase 3: Player Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 03-player-dashboard
**Areas discussed:** Dashboard layout, Rating chart style, Tournament table design, Metric cards emphasis

---

## Dashboard Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Header → Metrics → Chart → Table → Donut | Natural top-down flow: identity first, then summary numbers, then detailed visuals. Donut last as supplementary. | ✓ |
| Header → Metrics → Chart → Donut → Table | Chart and donut grouped together as visual section, table at bottom as reference data. | |
| Header → Chart → Metrics → Table → Donut | Chart gets prime real estate right after header. Metrics are secondary. | |

**User's choice:** Header → Metrics → Chart → Table → Donut
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Chart + Donut side by side | Rating chart takes ~65% width, donut takes ~35%. Efficient use of wide space. | ✓ |
| All full-width, just wider | Same single-column layout, max-width container. Simple, consistent with mobile. | |
| You decide | Claude picks the best responsive breakpoints | |

**User's choice:** Chart + Donut side by side
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| 2x2 grid | Two rows of two cards. Compact, all visible at once without scrolling. | ✓ |
| Horizontal scroll strip | Single row that scrolls horizontally. Each card gets more space but requires swiping. | |
| Stacked list (1 per row) | Full-width cards stacked vertically. Most readable but takes more vertical space. | |

**User's choice:** 2x2 grid
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, small refresh icon in header | Subtle RefreshCw icon in the header card corner. Triggers force re-scrape. | ✓ |
| Defer to Phase 4 | Phase 4 handles polish features. Keep dashboard focused on display. | |
| You decide | Claude determines the best UX for refresh | |

**User's choice:** Yes, small refresh icon in header
**Notes:** None

---

## Rating Chart Style

| Option | Description | Selected |
|--------|-------------|----------|
| Small icon buttons above chart | Two compact icon buttons (LineChart / BarChart3) in the chart card header. Active state highlighted. | ✓ |
| Tab-style text buttons | "קווי" / "עמודות" text tabs above the chart. More explicit but takes more space. | |
| You decide | Claude picks the best toggle pattern | |

**User's choice:** Small icon buttons above chart
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, subtle gradient fill | Light primary-blue gradient fading down from the line. Adds visual weight. | ✓ |
| Line only, no fill | Clean line on a white/dark background. Minimalist. | |
| You decide | Claude picks based on the overall aesthetic | |

**User's choice:** Yes, subtle gradient fill
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Rating + date + tournament name | Rich tooltip with full context at a glance. | ✓ |
| Rating + date only | Simpler tooltip, less cluttered. | |
| No tooltips | Data points read from axis labels. Cleaner but less interactive. | |

**User's choice:** Rating + date + tournament name
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Month-year labels, dots per tournament | X-axis shows month abbreviations. Each tournament is a dot on the line. | ✓ |
| Every tournament date labeled | Each data point has its exact date on the axis. Can get crowded. | |
| You decide | Claude picks the best axis labeling strategy | |

**User's choice:** Month-year labels, dots per tournament
**Notes:** None

---

## Tournament Table Design

| Option | Description | Selected |
|--------|-------------|----------|
| Color-coded number chips | Small rounded badges: green for wins, gray for draws, red for losses. Compact, scannable. | ✓ |
| Text format: 3/1/0 | Simple W/D/L as slash-separated numbers. Minimal. | |
| Mini colored bar segments | Tiny stacked horizontal bar showing W/D/L proportions. | |

**User's choice:** Color-coded number chips
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Card-based list on mobile | Each tournament becomes a compact card. Stacked vertically. No horizontal scroll. | ✓ |
| Horizontal scroll table | Keep table format but allow horizontal scrolling. | |
| Simplified table with fewer columns | Hide some columns on mobile. Show only name, date, W/D/L, rating change. | |

**User's choice:** Card-based list on mobile
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| +12 / -8 with color + arrow icon | Green text with ↑ for positive, red with ↓ for negative. Amber "בהמתנה" for pending. | ✓ |
| +12 / -8 with color only, no arrows | Just colored text. Simpler, relies on +/- sign. | |
| You decide | Claude picks the best visual treatment | |

**User's choice:** +12 / -8 with color + arrow icon
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Simple prev/next buttons with page indicator | "הקודם" / "הבא" buttons with "עמוד 2 מתוך 5" text between them. | ✓ |
| Numbered page buttons | Row of page number buttons: 1 2 3 4 5. Direct access to any page. | |
| Load more button | Single "טען עוד" button at the bottom. Progressive loading. | |

**User's choice:** Simple prev/next buttons with page indicator
**Notes:** None

---

## Metric Cards Emphasis

| Option | Description | Selected |
|--------|-------------|----------|
| All equal size in 2x2 grid | Uniform cards, same size. The rating value is naturally prominent. | ✓ |
| Rating card larger (spans full width) | Current rating card takes full width on top, other 3 below. | |
| You decide | Claude picks the best visual hierarchy | |

**User's choice:** All equal size in 2x2 grid
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Colored number with arrow | Green ↑+45 or Red ↓-12. Consistent with tournament rating change styling. | ✓ |
| Number with small sparkline | Cumulative change number plus a tiny trend line. More visual but more complex. | |
| You decide | Claude picks the best representation | |

**User's choice:** Colored number with arrow
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Current rating large, expected small below | Big "1476" as primary, small "צפוי: 1490" underneath. Clear hierarchy. | ✓ |
| Current only | Just the current rating. Expected shown elsewhere or not at all. | |
| Both same size side by side | "1476 / 1490" equally prominent. More data-dense. | |

**User's choice:** Current rating large, expected small below
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, small Lucide icon per card | Subtle icon in the card corner. Adds visual identity. Uses existing Lucide library. | ✓ |
| No icons, text labels only | Just Hebrew text labels above the number. Cleaner but less scannable. | |
| You decide | Claude picks whether icons add value or clutter | |

**User's choice:** Yes, small Lucide icon per card
**Notes:** None

---

## Additional Notes

User requested a visual preview of the dashboard mockup. After seeing the ASCII mockup description, preferred to see it built first and iterate from there ("I need to see it built first"). Context captured with the understanding that adjustments may follow after initial implementation.

## Claude's Discretion

- Specific Lucide icons for each metric card
- Chart height and responsive sizing
- Tournament card internal layout on mobile
- Donut chart styling details
- Data fetching hook implementation
- Loading/error placeholders (pre-Phase 4)
- Component file organization
- FIDE link display format
- Grade badge styling

## Deferred Ideas

None — discussion stayed within phase scope

# Phase 5: Player Comparison - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 05-player-comparison
**Areas discussed:** Player selection, Comparison layout, Combined rating chart, Shared tournaments

---

## Scope Clarification

User clarified that this is NOT a competitive comparison — just side-by-side viewing of two players.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, just side by side | Two full dashboards next to each other, no comparison logic | |
| Mostly, but some differences | Side by side, but with some simplifications or additions | ✓ |

**User's choice:** Mostly, but some differences
**Notes:** User was asked what differences — Claude suggested dropping tournament table and donut, keeping header+metrics+shared chart. User agreed.

---

## Direction

| Option | Description | Selected |
|--------|-------------|----------|
| Two header+metrics columns, shared chart, no table/donut | Drop tournament table and donut for simplicity | ✓ |
| Keep the donuts too | Add two W/D/L donuts side by side | |
| Even simpler | Just two header+metrics columns, no chart | |

**User's choice:** Two header+metrics columns, one shared rating chart
**Notes:** None

---

## Player Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Pick from saved players | Show saved players list, user taps two | ✓ |
| URL params only | /compare?a=ID1&b=ID2, no picker UI | |
| Two search inputs | Two player ID search boxes on compare page | |

**User's choice:** Pick from saved players
**Notes:** Compare link already requires 2+ saved players

---

## Mobile Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Stack vertically | Player A on top, Player B below, chart at bottom | |
| Swipe between | Swipe/tab to switch between players, chart always visible | ✓ |
| You decide | Claude picks best mobile layout | |

**User's choice:** Swipe between
**Notes:** None

---

## Combined Chart Y-Axis

| Option | Description | Selected |
|--------|-------------|----------|
| Shared Y-axis | Same scale, shows absolute gap | ✓ |
| Dual Y-axis | Each player gets own scale, shows trends better | |
| You decide | Claude picks based on data | |

**User's choice:** Shared Y-axis
**Notes:** None

---

## Shared Tournaments

| Option | Description | Selected |
|--------|-------------|----------|
| Skip it | No shared tournament detection | ✓ |
| Light mention | Badge/dot on chart where both played same date | |

**User's choice:** Skip it
**Notes:** None

---

## Claude's Discretion

- Saved player picker UI approach
- Tab/swipe implementation on mobile
- Secondary line color for second player
- Metric cards layout within each column
- Skeleton and error states
- Chart tooltip format for two-player view

## Deferred Ideas

- Relative comparison bars (COMP-03)
- Shared tournament detection (COMP-05)
- "מול" (vs) label (COMP-02)

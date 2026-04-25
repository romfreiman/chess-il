# Phase 8: CSV Export - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 08-csv-export
**Areas discussed:** Export trigger, CSV columns, Download details

---

## Export Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Smart single button | FloatingBar shows whenever results exist. Exports selected if any, otherwise all. Label changes dynamically. | |
| Always-visible export button | Separate export button above results table (exports all) + FloatingBar button (exports selected). | |
| Two buttons in floating bar | FloatingBar always shows with both "Export selected" and "Export all" buttons. | |

**User's choice:** Keep current design — one button that appears once players are selected to export.
**Notes:** User rejected all proposed options in favor of the simplest approach: keep the existing FloatingBar behavior (appears only with selection), just enable the button. "Export all" is achieved via select-all + export.

---

## CSV Columns

| Option | Description | Selected |
|--------|-------------|----------|
| Calculate age + row rank | Age = current year - birthYear. Rank = row position. Hebrew headers. | ✓ |
| Skip rank, calculate age | Drop rank (arbitrary server order). Export: name, ID, rating, club, age. | |
| You decide | Claude decides column set and headers. | |

**User's choice:** Export all fields.
**Notes:** User wants all columns including rank. Confirmed Hebrew headers: שם, מספר שחקן, דירוג, מועדון, גיל, מיקום.

### Follow-up: Column Headers Language

| Option | Description | Selected |
|--------|-------------|----------|
| Hebrew headers | שם, מספר שחקן, דירוג, מועדון, גיל, מיקום | ✓ |
| English headers | Name, Player ID, Rating, Club, Age, Rank | |

**User's choice:** Hebrew headers
**Notes:** Consistent with the Hebrew UI.

---

## Download Details

### Filename

| Option | Description | Selected |
|--------|-------------|----------|
| Club name + date | e.g., אליצור-ירושלים-2026-04-25.csv | |
| Generic name | e.g., chess-il-export.csv or שחקנים.csv | |
| You decide | Claude picks naming convention | |

**User's choice:** clubname-date-time.csv
**Notes:** User specified time should be included alongside date in the filename.

### Post-Export Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| No feedback | Browser download notification is sufficient | ✓ |
| Brief toast | Show "הקובץ יורד" toast for 2-3 seconds | |
| You decide | Claude decides based on UX flow | |

**User's choice:** No feedback
**Notes:** None.

---

## Claude's Discretion

- CSV generation utility function design
- How to pass selected results data and club name to export function
- Edge case handling for null values
- Time format in filename

## Deferred Ideas

None — discussion stayed within phase scope

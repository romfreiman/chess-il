---
status: partial
phase: 08-csv-export
source: [08-VERIFICATION.md]
started: 2026-04-25T08:12:00Z
updated: 2026-04-25T08:12:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. CSV Download Triggers Correctly
expected: Navigate to /?tab=clubs, search a club, select 2-3 players, click "ייצוא CSV" button. A .csv file downloads with the club name and timestamp in the filename (e.g., "מכבי-ירושלים-2026-04-25-1430.csv").
result: [pending]

### 2. Hebrew Characters Display Correctly in Excel
expected: Open the downloaded CSV file in Microsoft Excel. Hebrew column headers and player names display correctly without mojibake. Columns: name, player ID, rating, club, age, rank.
result: [pending]

### 3. Select-All Then Export Produces Complete Results
expected: Click the select-all checkbox in the results table header, then click "ייצוא CSV". CSV contains all search result rows, not just a subset.
result: [pending]

### 4. Export Button Visual States
expected: Hover over the export button, click it, tab-focus to it. Hover shows white/20 background, active shows white/30, focus shows ring-2 outline. Smooth transition.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

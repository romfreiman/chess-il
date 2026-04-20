---
status: complete
phase: 02-home-app-shell
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-04-20T11:30:00Z
updated: 2026-04-20T11:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. App Loads in Browser
expected: Navigate to http://localhost:5173/. The app renders without errors — you see a page with a navbar at the top and a search input area below. No blank screen, no console errors.
result: pass

### 2. RTL Hebrew Layout
expected: The entire page renders right-to-left. The navbar items flow from right to left (app name on the right side). Hebrew text like "חפשו שחקן כדי להתחיל" displays correctly. The Heebo font is loaded (text looks clean, not fallback serif/sans-serif).
result: pass

### 3. Sticky Navbar
expected: The navbar stays fixed at the top of the screen. It shows the app name "שחמט IL", a home link, a "השוואה" compare link (grayed out / disabled), and a sun/moon dark mode toggle icon. All items are visible on mobile — no hamburger menu.
result: skipped
reason: User on different network, cannot test mobile

### 4. Dark Mode Toggle
expected: Click the sun/moon icon in the navbar. The page switches between light and dark themes (background goes dark, text goes light, or vice versa). Refresh the page — the theme persists (doesn't reset to default). No flash of wrong theme on reload.
result: pass

### 5. Route Navigation
expected: Navigate to http://localhost:5173/player/12345 — you see a player page (may be placeholder). Navigate to http://localhost:5173/compare — you see a compare page. Use browser back button to return to home. Forward button works too. All three routes render without errors.
result: issue
reported: "the icons on the dark theme are too dark and almost invisible"
severity: major

### 6. Hero Search Input
expected: On the home page, there's a large, centered search input. It has placeholder text prompting for a player ID. Type "abc" — the characters should either be rejected or the search button remains disabled. Type "12345" — the input accepts it and the search button becomes enabled.
result: issue
reported: "better to add alert that only numeric number is accepted"
severity: minor

### 7. Search Button and Navigation
expected: With a valid numeric ID (e.g., "205001") in the search input, the "חפש" button is enabled. Click it — you're navigated to /player/205001. The URL bar shows the new route. With an empty or non-numeric input, the button should be disabled (not clickable).
result: pass

### 8. Empty State Display
expected: On the home page (with no saved players), below the search input you see an empty state message with a search icon and Hebrew text like "חפשו שחקן כדי להתחיל". No broken layout or missing elements.
result: pass

### 9. Mobile Responsive (375px)
expected: Resize the browser to 375px width (or use DevTools mobile view). The entire page fits without horizontal scrollbar. The navbar items are all visible. The search input doesn't overflow. Text is readable, nothing is cut off.
result: skipped
reason: User on different network, cannot test mobile

## Summary

total: 9
passed: 5
issues: 2
pending: 0
skipped: 2
blocked: 0

## Gaps

- truth: "Icons in dark mode should be clearly visible with sufficient contrast"
  status: failed
  reason: "User reported: the icons on the dark theme are too dark and almost invisible"
  severity: major
  test: 5
  artifacts: []
  missing: []
- truth: "Non-numeric input should show a validation message to the user"
  status: failed
  reason: "User reported: better to add alert that only numeric number is accepted"
  severity: minor
  test: 6
  artifacts: []
  missing: []

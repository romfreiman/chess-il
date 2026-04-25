# Milestones

## v1.1 Club Player Search & Export (Shipped: 2026-04-25)

**Phases completed:** 3 phases, 6 plans, 11 tasks

**Key accomplishments:**

- Club scraper with 2-step dropdown extraction and 3-step player search using ASP.NET postback flows, plus ClubInfo/ClubSearchResult shared types
- Express router for club list (7-day cached) and club player search (ephemeral) with Supabase/SQLite cache layer and 10 route handler tests
- Club search data hooks (useClubList/useClubSearch) and form components (ClubCombobox/ClubSearchForm) with ARIA combobox, Hebrew substring filtering, and responsive layout
- Desktop table and mobile cards with select-all/indeterminate checkboxes, empty states with Hebrew copy, and floating action bar with selection count
- Tab-based HomePage wiring all club search components with URL state, selection management, and navbar link
- Client-side CSV export with UTF-8 BOM encoding, RFC 4180 escaping, Hebrew column headers, and Blob download wired to ClubFloatingBar

---

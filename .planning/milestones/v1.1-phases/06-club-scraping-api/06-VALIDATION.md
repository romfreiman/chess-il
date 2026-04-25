---
phase: 6
slug: club-scraping-api
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-24
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | CSCRP-01, CSCRP-02 | unit | `npx vitest run tests/scraper/clubs.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 0 | CSCRP-01 | unit | `npx vitest run tests/db/clubs-cache.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 0 | CSCRP-01, CSCRP-02 | unit | `npx vitest run tests/api/clubs.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | CSCRP-01 | unit | `npx vitest run tests/scraper/clubs.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 1 | CSCRP-01 | unit | `npx vitest run tests/db/clubs-cache.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 1 | CSCRP-02 | unit | `npx vitest run tests/scraper/clubs.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 1 | CSCRP-02 | unit | `npx vitest run tests/api/clubs.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/scraper/clubs.test.ts` — stubs for CSCRP-01 (club list parsing) and CSCRP-02 (search result parsing)
- [ ] `tests/api/clubs.test.ts` — stubs for CSCRP-01 and CSCRP-02 (route handler tests)
- [ ] `tests/db/clubs-cache.test.ts` — stubs for CSCRP-01 (club cache operations)
- [ ] `tests/fixtures/search-advanced.html` — saved HTML fixture of expanded advanced search panel
- [ ] `tests/fixtures/search-results.html` — saved HTML fixture of search results

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 3-step postback completes within Netlify timeout | CSCRP-02 | Requires live chess.org.il connection | Run `curl` against deployed function, verify response < 10s |
| Club list matches chess.org.il dropdown | CSCRP-01 | Requires live comparison | Compare API response count with site dropdown option count |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

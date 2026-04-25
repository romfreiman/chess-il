---
phase: 7
slug: search-ui-results
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-24
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.4 |
| **Config file** | `client/vitest.config.ts` |
| **Quick run command** | `cd client && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd client && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd client && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd client && npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | CSRCH-01 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CSRCH-02 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CSRCH-03 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CSRCH-04 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CRES-01 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CRES-02 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | CRES-03 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/__tests__/ClubSearch.test.tsx` — stubs for CSRCH-01..04
- [ ] `client/src/__tests__/ClubResults.test.tsx` — stubs for CRES-01..03
- [ ] Test utilities/fixtures for mock club data and search results

*Existing Vitest + React Testing Library infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile card layout at 375px | CRES-03 | Visual layout verification | Resize browser to 375px, verify cards render correctly |
| RTL text alignment | CSRCH-01 | Visual RTL rendering | Check Hebrew labels align right, form controls flow RTL |
| Floating action bar animation | CRES-02 | Visual animation quality | Select players, verify bar appears smoothly at bottom |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

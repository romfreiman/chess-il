---
phase: 2
slug: home-app-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `client/vitest.config.ts` (Wave 0 creates) |
| **Quick run command** | `cd client && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd client && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd client && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd client && npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | UI-01, UI-02 | config | `cd client && npx vite build` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | NAV-01 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | UI-04 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | SRCH-01, SRCH-02 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | SRCH-03 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | NAV-02 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | UI-07 | unit | `cd client && npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/vitest.config.ts` — Vitest configuration for frontend tests
- [ ] `client/src/test/setup.ts` — Test setup with jsdom and testing-library
- [ ] `client/src/test/test-utils.tsx` — Custom render with Router + providers
- [ ] `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` — Test dependencies

*Wave 0 plan must install framework and create stubs before any test-dependent tasks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RTL layout renders correctly on 375px | UI-01 | Visual layout cannot be fully verified by unit tests | Open in browser at 375px width, verify no horizontal overflow |
| Dark mode toggle no FOUC | UI-07 | Flash of unstyled content is a timing/visual issue | Toggle dark mode, refresh page, verify no flash of wrong theme |
| Browser back/forward navigation | NAV-02 | Router history behavior requires real browser | Navigate home→player→home using back button |

*These require browser/visual verification during execution.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

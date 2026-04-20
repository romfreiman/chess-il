---
phase: 4
slug: polish-persistence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.4 + @testing-library/react 16.3.2 |
| **Config file** | `client/vitest.config.ts` |
| **Quick run command** | `cd client && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd client && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

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
| 04-01-01 | 01 | 0 | PERS-01, PERS-02, PERS-03 | unit | `cd client && npx vitest run src/__tests__/useSavedPlayers.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | PERS-02 | unit | `cd client && npx vitest run src/__tests__/HomePage.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 0 | UI-06 | unit | `cd client && npx vitest run src/__tests__/ErrorState.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 0 | PERS-03 | unit | `cd client && npx vitest run src/__tests__/Toast.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-xx-xx | xx | 1 | UI-05 | unit | `cd client && npx vitest run src/__tests__/PlayerPage.test.tsx -x` | ✅ (needs update) | ⬜ pending |
| 04-xx-xx | xx | 1 | UI-06 | unit | `cd client && npx vitest run src/__tests__/PlayerPage.test.tsx -x` | ✅ (needs update) | ⬜ pending |
| 04-xx-xx | xx | 2 | UI-03 | manual | Visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/__tests__/useSavedPlayers.test.ts` — stubs for PERS-01, PERS-02, PERS-03 (hook logic: save, remove, isSaved, isFull, localStorage persistence)
- [ ] `client/src/__tests__/HomePage.test.tsx` — new tests for wired savedPlayers from context (PERS-02)
- [ ] `client/src/__tests__/ErrorState.test.tsx` — covers UI-06 (error icon, messages, retry button)
- [ ] `client/src/__tests__/Toast.test.tsx` — covers PERS-03 (auto-dismiss, accessibility)
- [ ] Update `client/src/__tests__/PlayerPage.test.tsx` — update loading test for skeleton elements; update error test for ErrorState component

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode audit of all Phase 3 components | UI-03 | Visual correctness of color coverage across themes | Toggle dark mode, inspect each component for missing dark: classes |
| Skeleton loader visual fidelity | UI-05 | Animation smoothness and dimension matching | Navigate to player page, observe skeleton during load |
| RTL layout correctness | UI-03, UI-05, UI-06 | Visual alignment in RTL context | Check all new components render correctly in RTL |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

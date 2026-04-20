---
phase: 1
slug: data-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SCRP-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | SCRP-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | SCRP-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | SCRP-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | SCRP-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | CACH-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | CACH-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | CACH-03 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 2 | CACH-04 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-05 | 02 | 2 | CACH-05 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | API-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 3 | API-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 3 | API-03 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` — install test framework (devDependency)
- [ ] `tests/scraper.test.ts` — stubs for SCRP-01 through SCRP-05
- [ ] `tests/cache.test.ts` — stubs for CACH-01 through CACH-05
- [ ] `tests/api.test.ts` — stubs for API-01 through API-03
- [ ] `vitest.config.ts` — vitest configuration

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live scrape from chess.org.il | SCRP-01 | External dependency | Run `curl localhost:3000/api/player/205001` and verify JSON response |
| Stale cache fallback when site down | CACH-05 | Requires network failure simulation | Block chess.org.il, request cached player, verify `stale: true` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

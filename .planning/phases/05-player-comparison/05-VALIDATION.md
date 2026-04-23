---
phase: 5
slug: player-comparison
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (if exists) or vite.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | COMP-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | COMP-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | COMP-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 1 | COMP-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-01-05 | 01 | 1 | COMP-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test framework setup (vitest) — if not already configured
- [ ] Test stubs for COMP-01 through COMP-05

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Side-by-side layout renders correctly on mobile (375px) | COMP-01 | Visual layout verification | Open /compare on 375px viewport, verify tabbed layout |
| RTL direction renders correctly for Hebrew labels | COMP-01 | RTL visual check | Verify all text aligns right, chart labels readable |
| Comparison bars show correct proportions visually | COMP-02 | Visual proportions | Compare bar widths match expected ratios |
| Dual-series chart legends are distinguishable | COMP-03 | Color/visual distinction | Verify two series have distinct colors and labels |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

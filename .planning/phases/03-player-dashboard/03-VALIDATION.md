---
phase: 3
slug: player-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts or "none — Wave 0 installs" |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | DASH-01 | visual | manual | N/A | ⬜ pending |
| TBD | TBD | TBD | DASH-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DASH-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DASH-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DASH-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DASH-06 | visual | manual | N/A | ⬜ pending |
| TBD | TBD | TBD | DASH-07 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DASH-08 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DASH-09 | visual | manual | N/A | ⬜ pending |
| TBD | TBD | TBD | DASH-10 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | DASH-11 | visual | manual | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test framework setup (vitest if not already configured)
- [ ] Test utilities for React component rendering (RTL)
- [ ] Mock data fixtures for player API responses

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RTL layout renders correctly | DASH-01 | Visual direction validation | Open player page, verify right-to-left text flow |
| Rating chart interactions | DASH-06 | Chart hover/toggle UX | Toggle between line/bar views, hover data points |
| Color-coded rating changes | DASH-09 | Visual color verification | Check green/red colors on positive/negative changes |
| Donut chart percentages | DASH-11 | Visual chart rendering | Verify W/D/L segments with correct percentages |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

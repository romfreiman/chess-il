# Phase 4: Polish & Persistence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 04-polish-persistence
**Areas discussed:** Skeleton loaders, Error handling, Save/follow players, Dark mode audit
**Mode:** Auto-advance (all decisions auto-selected)

---

## Skeleton Loader Style

| Option | Description | Selected |
|--------|-------------|----------|
| Pulse animation | Tailwind animate-pulse with gray blocks matching component shapes | auto |
| Shimmer effect | Custom CSS gradient animation sweeping across placeholders | |
| Spinner | Simple centered loading spinner | |

**User's choice:** [auto] Pulse animation (recommended default)
**Notes:** Matches Tailwind ecosystem, zero extra dependencies, established pattern in modern React apps

---

## Error Message UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline contextual | Error replaces content area with icon, message, retry button | auto |
| Full error page | Dedicated error page with navigation back | |
| Toast notification | Non-blocking error toast | |

**User's choice:** [auto] Inline contextual (recommended default)
**Notes:** Keeps user on the dashboard page, retry button leverages existing usePlayer.refresh()

---

## Save Button Placement

| Option | Description | Selected |
|--------|-------------|----------|
| In PlayerHeader | Next to refresh button, consistent header action area | auto |
| Floating action button | Fixed position bottom-right FAB | |
| Below metrics | Standalone save bar between metrics and charts | |

**User's choice:** [auto] In PlayerHeader (recommended default)
**Notes:** Header already has action buttons pattern (refresh), keeps UI clean

---

## Save Limit Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Toast notification | Non-blocking auto-dismiss alert when hitting 10-player cap | auto |
| Disable button | Gray out save button with tooltip showing limit message | |
| Modal dialog | Blocking dialog asking to remove a player first | |

**User's choice:** [auto] Toast notification (recommended default)
**Notes:** Non-blocking UX preferred for a limit that users rarely hit

---

## Claude's Discretion

- Toast component implementation (CSS-only vs library)
- Skeleton animation timing and placeholder dimensions
- Error icon selection from lucide-react

## Deferred Ideas

None

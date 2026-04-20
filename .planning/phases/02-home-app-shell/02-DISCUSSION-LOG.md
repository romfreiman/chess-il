# Phase 2: Home & App Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 02-home-app-shell
**Areas discussed:** Search experience, Home page layout, Navbar & mobile, Visual style

---

## Search Experience

### Search Prominence

| Option | Description | Selected |
|--------|-------------|----------|
| Hero search | Large, centered search input dominating the page — like Google's homepage | ✓ |
| Compact search bar | Smaller input at the top of the page, leaving room for saved players below | |
| Search in navbar | Search input embedded in the top navbar, always accessible from any page | |

**User's choice:** Hero search
**Notes:** None

### Invalid Input Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Inline hint only | Show a subtle message under the input. Don't block navigation. | |
| Prevent submission | Disable the search button and show validation error until valid numeric ID | ✓ |
| You decide | Claude picks the approach | |

**User's choice:** Prevent submission
**Notes:** None

### Recent Players Dropdown

| Option | Description | Selected |
|--------|-------------|----------|
| Plain input only | Just a numeric input field with a search button. Saved players shown separately below. | |
| Recent suggestions | Dropdown under the input showing recently searched player IDs/names from localStorage | ✓ |

**User's choice:** Recent suggestions
**Notes:** None

### Search Button Label

| Option | Description | Selected |
|--------|-------------|----------|
| חפש (Search) | Standard search label in Hebrew | ✓ |
| הצג שחקן (Show player) | Action-oriented label | |
| You decide | Claude picks | |

**User's choice:** חפש (Search)
**Notes:** None

---

## Home Page Layout

### Page Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Saved players grid | Grid of saved player cards (2 columns mobile, 3 desktop) below hero search | ✓ |
| Single column list | Vertical list of rows below the search | |
| Tabbed sections | Tabs for saved and recent players | |

**User's choice:** Saved players grid
**Notes:** None

### Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly prompt | Illustration/icon with text like "חפשו שחקן כדי להתחיל" | ✓ |
| Just hide the section | Don't show saved players section until there's at least one | |
| You decide | Claude picks | |

**User's choice:** Friendly prompt
**Notes:** None

### Saved Player Card Info

| Option | Description | Selected |
|--------|-------------|----------|
| Name + rating + club | Player name, current rating, and club name | ✓ |
| Name + rating only | Minimal — just the essentials | |
| Name + rating + last change | Include most recent rating change for trend info | |

**User's choice:** Name + rating + club
**Notes:** None

---

## Navbar & Mobile

### Sticky Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky | Navbar stays at the top of the viewport at all times | ✓ |
| Static | Navbar scrolls away with page content | |
| You decide | Claude picks | |

**User's choice:** Sticky
**Notes:** None

### Mobile Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Always visible | All items always shown — few enough to fit | ✓ |
| Hamburger menu | Collapse links into hamburger on small screens | |
| Bottom tab bar | Move navigation to bottom bar on mobile | |

**User's choice:** Always visible
**Notes:** None

### Dark Mode Toggle

| Option | Description | Selected |
|--------|-------------|----------|
| Sun/moon icon toggle | Simple icon button that switches between sun and moon | ✓ |
| Labeled switch | Toggle switch with "בהיר/כהה" label | |
| You decide | Claude picks | |

**User's choice:** Sun/moon icon toggle
**Notes:** None

### Compare Link Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Always show, disabled when <2 | Link visible but grayed out until 2+ players saved | ✓ |
| Hide until 2+ saved | Only appears once 2+ players are saved | |
| You decide | Claude picks | |

**User's choice:** Always show, disabled when <2
**Notes:** None

---

## Visual Style

### Overall Aesthetic

| Option | Description | Selected |
|--------|-------------|----------|
| Clean & modern | Generous whitespace, subtle shadows, rounded corners. Notion/Linear feel. | ✓ |
| Dense & data-rich | Tighter spacing, more info on screen. Bloomberg terminal feel. | |
| Playful & colorful | Bold colors, larger elements, slight animations. | |

**User's choice:** Clean & modern
**Notes:** None

### Hebrew Font

| Option | Description | Selected |
|--------|-------------|----------|
| Heebo | Modern, clean Hebrew sans-serif from Google Fonts | ✓ |
| Assistant | Popular Hebrew Google Font, slightly rounder | |
| Rubik | Geometric Hebrew font, more distinctive | |
| You decide | Claude picks | |

**User's choice:** Heebo
**Notes:** None

### Card Style

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle shadow + rounded | Soft shadow, rounded-xl corners, white/gray background | ✓ |
| Bordered cards | Thin border, rounded-lg, no shadow | |
| Elevated cards | Strong shadow, prominent lift | |

**User's choice:** Subtle shadow + rounded
**Notes:** None

### Background Color

| Option | Description | Selected |
|--------|-------------|----------|
| Light gray (bg-gray-50) | Subtle gray background makes white cards pop | ✓ |
| Pure white | All-white background, cards distinguished by shadow alone | |
| You decide | Claude picks | |

**User's choice:** Light gray (bg-gray-50)
**Notes:** None

---

## Claude's Discretion

- Frontend project scaffold specifics (Vite config, Tailwind config, PostCSS setup)
- React Router route structure and layout components
- Search input placeholder text and exact Hebrew wording
- Recent suggestions dropdown implementation approach
- Icon library choice for sun/moon toggle
- Exact spacing/padding values
- Component file organization

## Deferred Ideas

None — discussion stayed within phase scope

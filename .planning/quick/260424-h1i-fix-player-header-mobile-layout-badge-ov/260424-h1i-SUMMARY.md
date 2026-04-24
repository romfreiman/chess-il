# Quick Task 260424-h1i: Summary

## What changed

Fixed the player header mobile layout where the grade badge ("מדורג מתחיל") was being clipped by the absolutely positioned action buttons (refresh/bookmark) on narrow screens.

### Changes made

1. **PlayerHeader.tsx** (line 42): Added `pe-14` to the name/ID/badge flex container — reserves 56px of inline-end padding (left in RTL) so flex items don't overlap the action buttons.

2. **PlayerHeader.tsx** (line 49): Added `whitespace-nowrap shrink-0` to the badge span — prevents the badge text from being compressed or broken mid-word by flex layout.

3. **PlayerHeaderSkeleton.tsx** (line 11): Added `pe-14` to match the loaded component layout.

### Result

On mobile (375px), the badge now wraps cleanly to its own line below the name/ID, displaying the full text without overlap. Desktop layout is unaffected.

## Files modified
- `client/src/components/dashboard/PlayerHeader.tsx`
- `client/src/components/dashboard/skeletons/PlayerHeaderSkeleton.tsx`

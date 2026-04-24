---
phase: quick
plan: 260424-hyx
type: execute
wave: 1
depends_on: []
files_modified:
  - client/src/pages/HomePage.tsx
  - client/src/components/players/PlayerGrid.tsx
  - client/src/components/players/PlayerCard.tsx
  - client/src/components/players/CompareSelector.tsx  # DELETE
autonomous: true
requirements: [quick-task]

must_haves:
  truths:
    - "Each saved player card shows a checkbox for comparison selection"
    - "User can check exactly 2 player cards to enable comparison"
    - "A floating compare button appears when exactly 2 players are checked"
    - "Clicking the floating button navigates to /compare?a={id1}&b={id2}"
    - "CompareSelector dropdown component is fully removed"
    - "Checking/unchecking a card does NOT navigate to the player page"
  artifacts:
    - path: "client/src/pages/HomePage.tsx"
      provides: "Compare selection state management, floating compare button"
    - path: "client/src/components/players/PlayerGrid.tsx"
      provides: "Passes selection props to PlayerCard"
    - path: "client/src/components/players/PlayerCard.tsx"
      provides: "Checkbox on each card for compare selection"
  key_links:
    - from: "HomePage.tsx"
      to: "PlayerGrid.tsx"
      via: "selectedIds + onToggleSelect props"
      pattern: "selectedIds.*onToggleSelect"
    - from: "PlayerGrid.tsx"
      to: "PlayerCard.tsx"
      via: "isSelected + onToggleSelect props"
      pattern: "isSelected.*onToggleSelect"
    - from: "HomePage.tsx"
      to: "/compare"
      via: "useNavigate with query params"
      pattern: "navigate.*compare.*a=.*b="
---

<objective>
Replace the CompareSelector dropdown component with checkbox-based player selection directly on saved player cards. When exactly 2 players are checked, a floating compare button appears at the bottom of the screen. Delete CompareSelector.tsx entirely.

Purpose: Better UX -- users select players for comparison directly on the cards they see, not via a separate dropdown widget.
Output: Updated HomePage, PlayerGrid, PlayerCard; deleted CompareSelector.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@client/src/pages/HomePage.tsx
@client/src/components/players/PlayerGrid.tsx
@client/src/components/players/PlayerCard.tsx
@client/src/components/players/CompareSelector.tsx

<interfaces>
From client/src/lib/types.ts:
```typescript
export interface SavedPlayer {
  id: number;
  name: string;
  rating: number;
  club: string | null;
  totalGames?: number;
  savedAt: string;
}
```

From client/src/pages/ComparePage.tsx:
- ComparePage reads query params `a` and `b` from URL via `useSearchParams`
- Navigation target: `/compare?a={playerId}&b={playerId}`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add checkbox selection to PlayerCard and wire through PlayerGrid</name>
  <files>client/src/components/players/PlayerCard.tsx, client/src/components/players/PlayerGrid.tsx</files>
  <action>
**PlayerCard.tsx changes:**

1. Add new optional props to PlayerCardProps:
   - `isSelected?: boolean` -- whether this card's checkbox is checked
   - `onToggleSelect?: (id: number) => void` -- callback when checkbox is toggled
   - `selectionDisabled?: boolean` -- true when 2 other players are already selected (disable unchecked boxes)

2. Add a checkbox in the top-start corner of the card (opposite the X remove button which is top-end). The checkbox should:
   - Use a styled `<input type="checkbox">` or a custom checkbox div with a checkmark icon
   - Use `checked={isSelected}` and `onChange` calling `onToggleSelect(player.id)`
   - onClick must call `e.preventDefault()` and `e.stopPropagation()` to prevent the Link navigation
   - When `selectionDisabled && !isSelected`, show the checkbox as disabled/grayed out
   - Use accent-color or Tailwind checkbox styling with the primary blue (#378ADD)
   - Size: `w-5 h-5` for good touch target on mobile

3. Only render the checkbox when `onToggleSelect` is provided (so PlayerCard can be reused without compare mode).

4. The existing Link wrapper and all other card content remain unchanged.

**PlayerGrid.tsx changes:**

1. Add new optional props to PlayerGridProps:
   - `selectedIds?: Set<number>` -- currently selected player IDs for comparison
   - `onToggleSelect?: (id: number) => void` -- toggle callback

2. Pass down to each PlayerCard:
   - `isSelected={selectedIds?.has(player.id)}`
   - `onToggleSelect={onToggleSelect}`
   - `selectionDisabled={!!selectedIds && selectedIds.size >= 2 && !selectedIds.has(player.id)}`
  </action>
  <verify>
    <automated>cd /home/rfreiman/code/chess-il && npx tsc --noEmit --project client/tsconfig.json 2>&1 | tail -20</automated>
  </verify>
  <done>PlayerCard renders a checkbox when onToggleSelect is provided. Checkbox click does not navigate. Checkbox is disabled when 2 others are selected. PlayerGrid passes selection state to each card.</done>
</task>

<task type="auto">
  <name>Task 2: Add selection state and floating compare button to HomePage, delete CompareSelector</name>
  <files>client/src/pages/HomePage.tsx, client/src/components/players/CompareSelector.tsx</files>
  <action>
**HomePage.tsx changes:**

1. Remove the CompareSelector import and its JSX usage (the `<div className="mt-6">` wrapper and `<CompareSelector>` inside it).

2. Add imports: `useState` from react, `useNavigate` from react-router-dom, and `useCallback` if desired.

3. Add selection state:
   ```
   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
   const navigate = useNavigate();
   ```

4. Add toggle handler:
   ```
   const handleToggleSelect = useCallback((id: number) => {
     setSelectedIds(prev => {
       const next = new Set(prev);
       if (next.has(id)) {
         next.delete(id);
       } else if (next.size < 2) {
         next.add(id);
       }
       return next;
     });
   }, []);
   ```

5. Pass `selectedIds` and `onToggleSelect={handleToggleSelect}` to PlayerGrid.

6. Clear selectedIds if a selected player gets removed (in the onRemove handler or via useEffect checking savedPlayers).

7. After the PlayerGrid, render a floating compare button when `selectedIds.size === 2`:
   - Fixed position at bottom center: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`
   - Styled as a prominent pill button: `bg-[#378ADD] text-white rounded-full px-8 py-3 shadow-lg hover:bg-blue-600 transition-colors font-medium text-lg`
   - Text: `השוואה` (same as the old button)
   - onClick: `navigate(\`/compare?a=\${ids[0]}&b=\${ids[1]}\`)`  where ids is `Array.from(selectedIds)`
   - Add a subtle entrance animation via Tailwind: `animate-bounce` for one cycle or just a scale transition

8. When fewer than 2 saved players exist, do NOT show checkboxes (the onToggleSelect prop is only passed when `savedPlayers.length >= 2`). This is already handled naturally since EmptyState shows when length is 0, and PlayerGrid only gets compare props when there are enough players.

**Delete CompareSelector.tsx:**
Delete the file `client/src/components/players/CompareSelector.tsx` entirely.
  </action>
  <verify>
    <automated>cd /home/rfreiman/code/chess-il && npx tsc --noEmit --project client/tsconfig.json 2>&1 | tail -20 && test ! -f client/src/components/players/CompareSelector.tsx && echo "CompareSelector deleted OK"</automated>
  </verify>
  <done>HomePage manages compare selection state, passes it to PlayerGrid, renders floating compare button when 2 players selected. CompareSelector.tsx is deleted. Navigation to /compare?a={id}&b={id} works. Checkboxes only appear when 2+ players are saved.</done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors: `cd client && npx tsc --noEmit`
2. CompareSelector.tsx no longer exists
3. No remaining imports of CompareSelector anywhere in the codebase
4. Dev server loads without errors: visit http://localhost:5173/
</verification>

<success_criteria>
- Saved player cards each show a checkbox for comparison selection
- Checking a card checkbox does NOT navigate to the player page
- When 2 checkboxes are checked, a floating "השוואה" button appears at the bottom
- Clicking the floating button navigates to /compare?a={id1}&b={id2}
- When 2 are selected, remaining unchecked checkboxes are disabled
- CompareSelector.tsx is fully deleted with no remaining references
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/260424-hyx-replace-compareselector-dropdowns-with-c/260424-hyx-SUMMARY.md`
</output>

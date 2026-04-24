---
phase: quick
plan: 260424-hqi
type: execute
wave: 1
depends_on: []
files_modified:
  - client/src/pages/ComparePage.tsx
  - client/src/components/players/CompareSelector.tsx
  - client/src/pages/HomePage.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "User can select two saved players for comparison on the home screen"
    - "Clicking the compare button navigates to /compare with the selected players pre-loaded"
    - "The compare page reads query params and auto-selects the matching players"
    - "Selection UI only appears when user has 2+ saved players"
  artifacts:
    - path: "client/src/components/players/CompareSelector.tsx"
      provides: "Two-player picker UI with compare button for home screen"
      min_lines: 30
    - path: "client/src/pages/ComparePage.tsx"
      provides: "Compare page with query param support for pre-selection"
    - path: "client/src/pages/HomePage.tsx"
      provides: "Home page with CompareSelector below saved players grid"
  key_links:
    - from: "client/src/components/players/CompareSelector.tsx"
      to: "/compare?a={id}&b={id}"
      via: "useNavigate with query params"
      pattern: "navigate.*compare.*[?&]a=.*b="
    - from: "client/src/pages/ComparePage.tsx"
      to: "useSearchParams"
      via: "React Router useSearchParams hook"
      pattern: "useSearchParams"
---

<objective>
Add a player comparison selection section on the home screen so users can pick two saved players and jump directly to the comparison view with those players pre-selected.

Purpose: Currently users must navigate to /compare and manually pick players from dropdowns. This adds a shortcut on the home screen where saved players are already visible, reducing friction.
Output: CompareSelector component on home page, ComparePage reads URL query params for pre-selection.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@client/src/pages/HomePage.tsx
@client/src/pages/ComparePage.tsx
@client/src/components/compare/PlayerPicker.tsx
@client/src/components/players/PlayerGrid.tsx
@client/src/components/players/PlayerCard.tsx
@client/src/context/SavedPlayersContext.tsx
@client/src/hooks/useSavedPlayers.ts
@client/src/lib/types.ts

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

From client/src/hooks/useSavedPlayers.ts:
```typescript
export interface UseSavedPlayersResult {
  savedPlayers: SavedPlayer[];
  savePlayer: (player: Omit<SavedPlayer, 'savedAt'>) => boolean;
  removePlayer: (id: number) => void;
  isSaved: (id: number) => boolean;
  isFull: boolean;
}
```

From client/src/context/SavedPlayersContext.tsx:
```typescript
export function useSavedPlayersContext(): UseSavedPlayersResult;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add CompareSelector component and wire into HomePage</name>
  <files>client/src/components/players/CompareSelector.tsx, client/src/pages/HomePage.tsx</files>
  <action>
Create `client/src/components/players/CompareSelector.tsx`:
- Accepts `players: SavedPlayer[]` prop (the saved players list)
- Renders a section with heading "השוואת שחקנים" (compare players)
- Two `<select>` dropdowns side-by-side (grid grid-cols-2 gap-4) for selecting Player A and Player B
  - Each dropdown shows all saved players except the one selected in the other dropdown (filter by excludeId, same pattern as PlayerPicker)
  - Default option: "-- בחרו שחקן --" with value="" disabled
  - Display format in options: `{player.name} ({player.rating})`
- A "השוואה" (Compare) button below the dropdowns, styled with bg-primary text-white rounded-xl, centered
  - Button disabled when fewer than 2 players are selected (both selects must have a value)
  - On click: `navigate(`/compare?a=${selectedA}&b=${selectedB}`)` using React Router's `useNavigate`
- Use RTL-safe logical properties (ms-/me-/ps-/pe-) per project convention
- Wrap entire section in a card style: bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 (consistent with existing card patterns)
- Component should NOT render at all (return null) if players.length < 2

Update `client/src/pages/HomePage.tsx`:
- Import CompareSelector from '../components/players/CompareSelector'
- Render `<CompareSelector players={savedPlayers} />` below the PlayerGrid (inside the savedPlayers.length > 0 branch), with mt-6 spacing
  </action>
  <verify>
    <automated>cd /home/rfreiman/code/chess-il && npx tsc --noEmit --project client/tsconfig.json 2>&1 | head -30</automated>
  </verify>
  <done>CompareSelector renders two dropdowns and a compare button on the home screen when 2+ players are saved. Button navigates to /compare with query params.</done>
</task>

<task type="auto">
  <name>Task 2: Add query param pre-selection to ComparePage</name>
  <files>client/src/pages/ComparePage.tsx</files>
  <action>
Update `client/src/pages/ComparePage.tsx` to read URL query params and pre-select players:
- Import `useSearchParams` from 'react-router-dom'
- At the top of the component, call `const [searchParams] = useSearchParams()`
- Initialize selectedA state with `searchParams.get('a') || ''` instead of `''`
- Initialize selectedB state with `searchParams.get('b') || ''` instead of `''`
- This is the only change needed -- the existing usePlayer hooks and rendering logic will automatically pick up the pre-selected values

This means when a user navigates from the home screen CompareSelector to `/compare?a=205001&b=210498`, the compare page will immediately load both players without requiring manual dropdown selection.
  </action>
  <verify>
    <automated>cd /home/rfreiman/code/chess-il && npx tsc --noEmit --project client/tsconfig.json 2>&1 | head -30</automated>
  </verify>
  <done>Navigating to /compare?a=205001&b=210498 auto-selects both players and loads their data immediately. Navigating to /compare without params works as before (empty dropdowns).</done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors: `cd client && npx tsc --noEmit`
2. Home screen with 2+ saved players shows the CompareSelector section with two dropdowns and a compare button
3. Selecting two players and clicking compare navigates to /compare?a=X&b=Y
4. The compare page auto-loads both players from the query params
5. Home screen with 0-1 saved players does NOT show the CompareSelector
6. /compare without query params still works as before (empty dropdowns)
</verification>

<success_criteria>
- CompareSelector component exists and renders on home screen when 2+ saved players exist
- Selecting two players and clicking compare navigates to the comparison page with those players pre-loaded
- Compare page supports both query param pre-selection and manual dropdown selection
- All existing functionality (manual comparison, saved players grid) remains intact
</success_criteria>

<output>
After completion, create `.planning/quick/260424-hqi-add-player-comparison-selection-home/260424-hqi-SUMMARY.md`
</output>

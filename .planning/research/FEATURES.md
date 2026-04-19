# Feature Research

**Domain:** Chess player stats dashboard
**Researched:** 2026-04-19
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Player search by ID | Core entry point; chess.org.il uses numeric IDs | LOW | Simple input + navigation |
| Player profile card | Basic identity (name, club, rating) | LOW | Direct from scraped data |
| Current rating display | Primary stat users care about | LOW | Single field |
| Tournament history list | Users want recent activity | MEDIUM | Table with pagination |
| Rating history chart | Visual trend is the main value proposition | MEDIUM | Line chart from tournament data |
| Loading states | Feedback during data fetch | LOW | Skeleton loaders |
| Error handling | Graceful handling of missing/invalid players | LOW | Hebrew error messages |
| Mobile responsive | Most users check on phones | MEDIUM | RTL-aware responsive layout |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Player comparison | chess.org.il has no comparison tool; parents/coaches compare players | HIGH | Load 2 players, aligned charts |
| Saved players list | Quick access; chess.org.il requires remembering IDs | LOW | localStorage, max 10 |
| Win/Draw/Loss donut chart | Visual summary not on source site | MEDIUM | Aggregate from tournaments |
| Dark mode | Expected in modern apps (chess.com/lichess both have it) | MEDIUM | Tailwind dark: classes |
| Cumulative rating change | Trajectory at a glance; not computed on source | LOW | Sum of ratingChange values |
| Result chips (W/D/L visual) | Cleaner than raw "+3-1=0" strings | LOW | Parse into colored chips |
| Shared tournaments detection | In compare view, highlight same tournaments | HIGH | Match on date/name |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Individual game results | See each game's opponent | Requires __doPostBack simulation | Link to tournament page |
| User accounts | Persist across devices | Massive complexity for MVP | localStorage sufficient |
| Real-time updates | Know changes instantly | chess.org.il updates periodically | "Pending" badge |
| Name-based search | Easier than ID lookup | No name search API exists | Manual ID + saved players |

## Feature Dependencies

```
[Player Search] ──requires──> [Scraping Engine] ──requires──> [Supabase Cache]

[Player Dashboard] ──requires──> [Player Search]
  ├── [Rating Chart]
  ├── [Tournament Table]
  └── [Win/Loss Donut]

[Compare Page] ──requires──> [Player Dashboard] + [Saved Players (2+)]

[Dark Mode] ──enhances──> [All UI Components]
```

## MVP Definition

### Launch With (v1)

- [ ] Player search by ID
- [ ] Player profile header card
- [ ] Rating + metrics display
- [ ] Rating history line chart
- [ ] Tournament table with pagination
- [ ] Win/Draw/Loss donut chart
- [ ] Saved players (localStorage)
- [ ] Compare page
- [ ] Dark mode
- [ ] RTL Hebrew interface
- [ ] Mobile responsive
- [ ] Skeleton loaders and error states

### Add After Validation (v1.x)

- [ ] Force refresh button
- [ ] Tournament search/filter

### Future Consideration (v2+)

- [ ] Name-based player search
- [ ] Nemesis/client rival detection
- [ ] Club leaderboards

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Player search + profile | HIGH | LOW | P1 |
| Rating history chart | HIGH | MEDIUM | P1 |
| Tournament table | HIGH | MEDIUM | P1 |
| Win/Loss donut | MEDIUM | LOW | P1 |
| Saved players | HIGH | LOW | P1 |
| Dark mode | MEDIUM | MEDIUM | P1 |
| RTL/Hebrew | HIGH | MEDIUM | P1 |
| Compare page | HIGH | HIGH | P1 |

## Competitor Feature Analysis

| Feature | chess.org.il | chess.com | lichess | Our Approach |
|---------|-------------|-----------|---------|--------------|
| Player profile | Basic HTML | Rich dashboard | Clean stats | Modern dashboard |
| Rating chart | None | Interactive | Interactive | Recharts line/bar |
| Tournament history | HTML table | Game list | Game list | Paginated + chips |
| Win/Loss summary | None | Pie chart | Bar chart | Donut chart |
| Player comparison | None | Head-to-head | None | Side-by-side |
| Dark mode | None | Yes | Yes | Yes |
| Hebrew | Yes (source) | No | No | Full RTL |

---
*Feature research for: chess player stats dashboard*
*Researched: 2026-04-19*

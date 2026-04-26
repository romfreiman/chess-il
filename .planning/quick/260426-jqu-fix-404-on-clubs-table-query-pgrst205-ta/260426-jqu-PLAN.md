---
phase: quick
plan: 260426-jqu
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/001_create_clubs_table.sql
autonomous: false
requirements: []

must_haves:
  truths:
    - "GET /api/clubs returns cached club list from Supabase without re-scraping every time"
    - "Clubs table exists in Supabase with same schema as SQLite (id, data, updated_at)"
  artifacts:
    - path: "supabase/migrations/001_create_clubs_table.sql"
      provides: "SQL migration for clubs table creation"
      contains: "CREATE TABLE"
  key_links:
    - from: "src/db/supabase.ts"
      to: "clubs table in Supabase"
      via: "supabase.from('clubs')"
      pattern: "from\\('clubs'\\)"
---

<objective>
Fix PGRST205 "table not found" error for the `clubs` table in Supabase.

Purpose: The `clubs` table was never created in the production Supabase database. The SQLite fallback auto-creates it, but Supabase requires explicit table creation. This causes every /api/clubs request to fail cache lookup and re-scrape chess.org.il, wasting time and risking rate limits.

Output: SQL migration file in repo + clubs table created in Supabase.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/db/supabase.ts
@src/db/sqlite.ts
@src/api/routes/clubs.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create SQL migration file for clubs table</name>
  <files>supabase/migrations/001_create_clubs_table.sql</files>
  <action>
Create `supabase/migrations/` directory and add `001_create_clubs_table.sql` with the SQL to create the clubs table in Supabase (Postgres).

The table schema must match how `src/db/supabase.ts` uses it:
- `id` INTEGER PRIMARY KEY (single row with id=1 stores the full club list as JSONB)
- `data` JSONB NOT NULL (stores array of {id: number, name: string} objects)
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

The SQL should be:
```sql
-- Create clubs cache table (mirrors the players cache pattern)
-- Stores the full club list as a single JSONB row (id=1)
CREATE TABLE IF NOT EXISTS clubs (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (backend uses service role key)
CREATE POLICY "Service role full access" ON clubs
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

This matches the pattern used by the existing `players` table in Supabase. The RLS policy allows the service role key (used by the backend) full read/write access.
  </action>
  <verify>
    <automated>test -f supabase/migrations/001_create_clubs_table.sql && grep -q "CREATE TABLE" supabase/migrations/001_create_clubs_table.sql && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>Migration SQL file exists with correct Postgres schema matching supabase.ts usage</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: Run migration SQL in Supabase dashboard</name>
  <action>
The user must execute the SQL from `supabase/migrations/001_create_clubs_table.sql` in the Supabase SQL Editor.
  </action>
  <instructions>
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor (left sidebar)
3. Click "New query"
4. Paste the contents of `supabase/migrations/001_create_clubs_table.sql`
5. Click "Run" to execute
6. Verify: Go to Table Editor (left sidebar) and confirm the `clubs` table appears
7. Test: Visit the deployed app, go to the Clubs tab, and confirm the club list loads (should cache on first load and be fast on subsequent loads)
  </instructions>
  <resume-signal>Type "done" after creating the table in Supabase</resume-signal>
</task>

</tasks>

<verification>
After the table is created in Supabase:
- The Netlify function logs should no longer show PGRST205 errors for clubs
- GET /api/clubs should return the club list and cache it in Supabase
- Subsequent calls to GET /api/clubs within 7 days should return cached data without scraping
</verification>

<success_criteria>
- SQL migration file committed to repo for documentation
- clubs table exists in Supabase with correct schema (id, data JSONB, updated_at)
- /api/clubs endpoint returns club list and caches successfully
</success_criteria>

<output>
After completion, create `.planning/quick/260426-jqu-fix-404-on-clubs-table-query-pgrst205-ta/260426-jqu-SUMMARY.md`
</output>

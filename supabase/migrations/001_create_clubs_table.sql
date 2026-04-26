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

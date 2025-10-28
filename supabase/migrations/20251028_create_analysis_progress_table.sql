-- Create analysis_progress table for tracking real-time analysis progress
-- This replaces in-memory Map to work in serverless environments

CREATE TABLE IF NOT EXISTS analysis_progress (
  id TEXT PRIMARY KEY,
  progress INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  estimated_time INTEGER NOT NULL DEFAULT 0,
  complete BOOLEAN NOT NULL DEFAULT FALSE,
  success BOOLEAN,
  error TEXT,
  artist_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by ID (primary key already indexed)
-- Index for cleanup queries (find old completed entries)
CREATE INDEX IF NOT EXISTS idx_analysis_progress_complete_created
  ON analysis_progress(complete, created_at);

-- Enable Row Level Security
ALTER TABLE analysis_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (no auth required for public tool)
CREATE POLICY "Allow public read access to analysis progress"
  ON analysis_progress
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow service role to insert/update/delete
CREATE POLICY "Allow service role full access to analysis progress"
  ON analysis_progress
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analysis_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_analysis_progress_timestamp
  BEFORE UPDATE ON analysis_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_progress_updated_at();

-- Clean up old entries (completed > 30 min or any > 2 hours)
-- Run this periodically via cron job or scheduled function
CREATE OR REPLACE FUNCTION cleanup_old_analysis_progress()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analysis_progress
  WHERE (complete = TRUE AND created_at < NOW() - INTERVAL '30 minutes')
     OR (created_at < NOW() - INTERVAL '2 hours');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

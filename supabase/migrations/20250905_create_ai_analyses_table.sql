-- Create ai_analyses table for the social media analysis platform
-- This table stores analysis results with unique artist URLs

-- Create ai_analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  artist_slug TEXT UNIQUE NOT NULL,
  instagram_username TEXT,
  tiktok_username TEXT,
  posts_analyzed INTEGER DEFAULT 0,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on artist_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_analyses_artist_slug ON ai_analyses(artist_slug);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at);

-- Enable RLS
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own analyses
CREATE POLICY "Users can manage own analyses"
  ON ai_analyses
  USING (auth.uid() = user_id);

-- Create policy for public read access via artist slugs (for unique URLs)
CREATE POLICY "Public read access for artist slugs"
  ON ai_analyses
  FOR SELECT
  USING (artist_slug IS NOT NULL);

-- Create function to get analysis by slug
CREATE OR REPLACE FUNCTION get_analysis_by_slug(slug text)
RETURNS TABLE (
  id uuid,
  artist_name text,
  artist_slug text,
  instagram_username text,
  tiktok_username text,
  posts_analyzed integer,
  analysis_result jsonb,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    artist_name,
    artist_slug,
    instagram_username,
    tiktok_username,
    posts_analyzed,
    analysis_result,
    created_at
  FROM ai_analyses 
  WHERE artist_slug = slug 
  ORDER BY created_at DESC 
  LIMIT 1;
$$;
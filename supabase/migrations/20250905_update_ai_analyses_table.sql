-- Update ai_analyses table to support artist names and slugs for unique URLs
-- This migration adds fields needed for the social media analysis platform

-- Add new columns to ai_analyses table
ALTER TABLE ai_analyses 
ADD COLUMN IF NOT EXISTS artist_name TEXT,
ADD COLUMN IF NOT EXISTS artist_slug TEXT UNIQUE;

-- Create index on artist_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_analyses_artist_slug ON ai_analyses(artist_slug);

-- Make user_id nullable to allow anonymous analyses
ALTER TABLE ai_analyses ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow public read access for unique slugs
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
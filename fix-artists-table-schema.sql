-- Fix Artists Table Schema to Match Code Expectations
-- Run this in your Supabase SQL editor

-- First, let's see what columns exist in the artists table
-- Check if artists table exists and what its structure is
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artists' AND table_schema = 'public') THEN
        RAISE NOTICE 'Artists table exists. Checking schema...';
    ELSE
        RAISE NOTICE 'Artists table does not exist. Creating it...';
    END IF;
END $$;

-- Drop the artists table if it exists with wrong schema and recreate it
DROP TABLE IF EXISTS public.artists CASCADE;

-- Recreate the artists table with the correct schema that matches our code
CREATE TABLE public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE NOT NULL, -- Viberate UUID (this was missing)
    name TEXT NOT NULL,
    slug TEXT,
    image TEXT,
    verified BOOLEAN DEFAULT false,
    rank INTEGER,
    status TEXT DEFAULT 'active',
    bio TEXT,
    country JSONB, -- Store country as JSONB (this was missing)
    genre JSONB,   -- Store genre as JSONB
    subgenres JSONB DEFAULT '[]', -- Store subgenres as JSONB array
    genres TEXT[],
    social_links JSONB DEFAULT '{}',
    streaming_links JSONB DEFAULT '{}',
    tracks JSONB DEFAULT '[]',
    events JSONB DEFAULT '{}',
    fanbase JSONB DEFAULT '{}',
    similar_artists JSONB DEFAULT '[]',
    ranks JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for artists table (public read for search)
DROP POLICY IF EXISTS "Anyone can read artists" ON public.artists;
CREATE POLICY "Anyone can read artists" ON public.artists
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can manage artists" ON public.artists;
CREATE POLICY "System can manage artists" ON public.artists
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.artists TO authenticated;
GRANT ALL ON public.artists TO anon;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artists_uuid ON public.artists(uuid);
CREATE INDEX IF NOT EXISTS idx_artists_name ON public.artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON public.artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_verified ON public.artists(verified);
CREATE INDEX IF NOT EXISTS idx_artists_rank ON public.artists(rank);

-- Test the schema
SELECT 'Artists table schema fixed successfully!' as status;

-- Show the new table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'artists' AND table_schema = 'public'
ORDER BY ordinal_position;
-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uuid TEXT UNIQUE NOT NULL, -- Viberate UUID
  name TEXT NOT NULL,
  slug TEXT,
  image TEXT,
  bio TEXT,
  country JSONB,
  genre JSONB,
  subgenres JSONB DEFAULT '[]'::jsonb,
  rank INTEGER DEFAULT 0,
  status TEXT,
  verified BOOLEAN DEFAULT false,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on uuid for faster lookups
CREATE INDEX IF NOT EXISTS idx_artists_uuid ON artists(uuid);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- Create artist_social_links table
CREATE TABLE IF NOT EXISTS artist_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_social_links_artist_id ON artist_social_links(artist_id);

-- Create artist_tracks table
CREATE TABLE IF NOT EXISTS artist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL, -- Viberate track ID
  name TEXT NOT NULL,
  release_date DATE,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_tracks_artist_id ON artist_tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_tracks_track_id ON artist_tracks(track_id);

-- Create artist_events table
CREATE TABLE IF NOT EXISTS artist_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  event_id TEXT, -- Viberate event ID
  name TEXT,
  date DATE,
  venue TEXT,
  city TEXT,
  country TEXT,
  data JSONB, -- Store full event data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_events_artist_id ON artist_events(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_events_date ON artist_events(date);

-- Create artist_ranks table
CREATE TABLE IF NOT EXISTS artist_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  rank_type TEXT NOT NULL, -- e.g., 'global', 'country', 'genre'
  rank_value INTEGER,
  data JSONB, -- Store additional rank data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_ranks_artist_id ON artist_ranks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_ranks_type ON artist_ranks(rank_type);

-- Create artist_fanbase table
CREATE TABLE IF NOT EXISTS artist_fanbase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  total_fans INTEGER DEFAULT 0,
  distribution JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb, -- Store full fanbase data
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_fanbase_artist_id ON artist_fanbase(artist_id);

-- Create artist_similar table for similar artists
CREATE TABLE IF NOT EXISTS artist_similar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  similar_artist_uuid TEXT,
  similar_artist_name TEXT,
  similarity_score DECIMAL,
  data JSONB, -- Store additional similarity data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_similar_artist_id ON artist_similar(artist_id);

-- Update artist_profiles table to reference the new artists table
ALTER TABLE artist_profiles 
ADD COLUMN IF NOT EXISTS artist_uuid TEXT REFERENCES artists(uuid);

-- Create index on the new reference
CREATE INDEX IF NOT EXISTS idx_artist_profiles_artist_uuid ON artist_profiles(artist_uuid);

-- Add updated_at trigger for artists table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_fanbase_updated_at BEFORE UPDATE ON artist_fanbase
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_ranks_updated_at BEFORE UPDATE ON artist_ranks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
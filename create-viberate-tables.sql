-- Create tables for storing Viberate API data

-- Artist social links table
CREATE TABLE IF NOT EXISTS public.artist_social_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artist_id, platform)
);

-- Artist tracks table
CREATE TABLE IF NOT EXISTS public.artist_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    track_id VARCHAR(255) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT,
    release_date DATE,
    source VARCHAR(50) DEFAULT 'viberate',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artist_id, track_id)
);

-- Artist fanbase table
CREATE TABLE IF NOT EXISTS public.artist_fanbase (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    total_fans BIGINT DEFAULT 0,
    distribution JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artist_id)
);

-- Artist ranks table
CREATE TABLE IF NOT EXISTS public.artist_ranks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    rank_type VARCHAR(100) NOT NULL,
    rank_value INTEGER NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artist_id, rank_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artist_social_links_artist ON artist_social_links(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_tracks_artist ON artist_tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_fanbase_artist ON artist_fanbase(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_ranks_artist ON artist_ranks(artist_id);

-- Grant permissions
GRANT ALL ON artist_social_links TO authenticated;
GRANT ALL ON artist_tracks TO authenticated;
GRANT ALL ON artist_fanbase TO authenticated;
GRANT ALL ON artist_ranks TO authenticated;
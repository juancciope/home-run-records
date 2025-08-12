-- Artist OS Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Create custom types (skip if they already exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'artist_manager', 'artist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agency_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE release_type AS ENUM ('single', 'ep', 'album', 'compilation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE release_status AS ENUM ('draft', 'scheduled', 'released', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE metric_type AS ENUM ('streams', 'followers', 'engagement', 'reach', 'revenue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    global_role user_role NOT NULL DEFAULT 'artist',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agencies table for multi-tenant support
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    status agency_status NOT NULL DEFAULT 'active',
    subscription_tier TEXT NOT NULL DEFAULT 'free',
    max_artists INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agency users junction table
CREATE TABLE IF NOT EXISTS public.agency_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'artist',
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agency_id, user_id)
);

-- Artist profiles table (enhanced with Viberate data)
CREATE TABLE IF NOT EXISTS public.artist_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    artist_name TEXT,
    stage_name TEXT,
    genre TEXT,
    bio TEXT,
    profile_image_url TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    
    -- Viberate integration fields
    viberate_artist_id TEXT UNIQUE,
    viberate_uuid TEXT UNIQUE,
    viberate_slug TEXT,
    viberate_verified BOOLEAN DEFAULT false,
    viberate_rank INTEGER,
    viberate_last_sync TIMESTAMPTZ,
    
    -- Social media stats (from Viberate)
    instagram_followers INTEGER DEFAULT 0,
    instagram_url TEXT,
    tiktok_followers INTEGER DEFAULT 0,
    tiktok_url TEXT,
    facebook_followers INTEGER DEFAULT 0,
    facebook_url TEXT,
    twitter_followers INTEGER DEFAULT 0,
    twitter_url TEXT,
    youtube_subscribers INTEGER DEFAULT 0,
    youtube_url TEXT,
    
    -- Streaming platform stats (from Viberate)
    spotify_followers INTEGER DEFAULT 0,
    spotify_monthly_listeners INTEGER DEFAULT 0,
    spotify_url TEXT,
    spotify_id TEXT,
    apple_music_url TEXT,
    deezer_followers INTEGER DEFAULT 0,
    deezer_url TEXT,
    soundcloud_followers INTEGER DEFAULT 0,
    soundcloud_url TEXT,
    
    -- Aggregated metrics
    total_followers INTEGER DEFAULT 0,
    total_streams BIGINT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Profile status
    onboarding_completed BOOLEAN DEFAULT false,
    subscription_tier TEXT DEFAULT 'free',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Artist metrics table for historical data
CREATE TABLE IF NOT EXISTS public.artist_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type metric_type NOT NULL,
    platform TEXT,
    value BIGINT NOT NULL,
    date DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, metric_type, platform, date)
);

-- Releases table
CREATE TABLE IF NOT EXISTS public.releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    release_type release_type NOT NULL,
    release_date DATE,
    cover_image_url TEXT,
    platforms JSONB DEFAULT '{}',
    status release_status NOT NULL DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Artists table (for Viberate API data storage)
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE NOT NULL, -- Viberate UUID
    name TEXT NOT NULL,
    slug TEXT,
    image TEXT,
    verified BOOLEAN DEFAULT false,
    rank INTEGER,
    genres TEXT[],
    social_links JSONB DEFAULT '{}',
    streaming_links JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for artist_profiles table
CREATE POLICY "Users can view own artist profile" ON public.artist_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own artist profile" ON public.artist_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own artist profile" ON public.artist_profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for artist_metrics table
CREATE POLICY "Users can view own metrics" ON public.artist_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON public.artist_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for releases table
CREATE POLICY "Users can view own releases" ON public.releases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own releases" ON public.releases
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for agencies (multi-tenant)
CREATE POLICY "Agency members can view agency" ON public.agencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agency_users au 
            WHERE au.agency_id = id AND au.user_id = auth.uid()
        )
    );

-- RLS Policies for agency_users
CREATE POLICY "Users can view their agency memberships" ON public.agency_users
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for artists table (public read for search)
CREATE POLICY "Anyone can read artists" ON public.artists
    FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_global_role ON public.users(global_role);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_viberate_id ON public.artist_profiles(viberate_artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_onboarding ON public.artist_profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_artist_metrics_user_date ON public.artist_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_artist_metrics_type_platform ON public.artist_metrics(metric_type, platform);
CREATE INDEX IF NOT EXISTS idx_releases_user_status ON public.releases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_artists_uuid ON public.artists(uuid);
CREATE INDEX IF NOT EXISTS idx_artists_name ON public.artists(name);
CREATE INDEX IF NOT EXISTS idx_agency_users_agency_id ON public.agency_users(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_users_user_id ON public.agency_users(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agencies_updated_at ON public.agencies;
CREATE TRIGGER update_agencies_updated_at 
    BEFORE UPDATE ON public.agencies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON public.artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at 
    BEFORE UPDATE ON public.artist_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_releases_updated_at ON public.releases;
CREATE TRIGGER update_releases_updated_at 
    BEFORE UPDATE ON public.releases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default superadmin agency
INSERT INTO public.agencies (name, slug, subscription_tier, max_artists) 
VALUES ('Artist OS', 'artist-os', 'enterprise', 1000)
ON CONFLICT (slug) DO NOTHING;
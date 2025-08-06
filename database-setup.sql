-- Home Run Records Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables
-- Note: Supabase manages auth.users table automatically, we create artist_profiles instead

-- Artist profiles table (separate from Supabase auth.users)
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  artist_name TEXT,
  stage_name TEXT,
  genre TEXT,
  bio TEXT,
  profile_image_url TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  viberate_artist_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artist metrics table for storing streaming and social media data
CREATE TABLE IF NOT EXISTS artist_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'streams', 'followers', 'engagement', 'reach', 'revenue'
  platform TEXT, -- 'spotify', 'youtube', 'instagram', 'tiktok', 'facebook'
  value NUMERIC NOT NULL,
  date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric_type, platform, date)
);

-- Releases table for production pipeline
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_type TEXT NOT NULL, -- 'single', 'ep', 'album', 'compilation'
  release_date DATE,
  cover_image_url TEXT,
  platforms JSONB DEFAULT '{}', -- URLs for different platforms
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'released', 'archived'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viberate sync log to track data imports
CREATE TABLE IF NOT EXISTS viberate_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viberate_artist_id TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'full', 'metrics', 'profile'
  status TEXT NOT NULL, -- 'success', 'error', 'partial'
  data_synced JSONB DEFAULT '{}',
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artist_metrics_user_date ON artist_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_artist_metrics_platform ON artist_metrics(platform, metric_type);
CREATE INDEX IF NOT EXISTS idx_releases_user_status ON releases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_viberate_sync_user ON viberate_sync_log(user_id, synced_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE viberate_sync_log ENABLE ROW LEVEL SECURITY;

-- Artist profiles policies
DROP POLICY IF EXISTS "Users can view own artist profile" ON artist_profiles;
CREATE POLICY "Users can view own artist profile" ON artist_profiles 
  FOR SELECT USING (auth.uid() = id);
  
DROP POLICY IF EXISTS "Users can update own artist profile" ON artist_profiles;
CREATE POLICY "Users can update own artist profile" ON artist_profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own artist profile" ON artist_profiles;
CREATE POLICY "Users can insert own artist profile" ON artist_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Artist metrics policies
DROP POLICY IF EXISTS "Users can view own metrics" ON artist_metrics;
CREATE POLICY "Users can view own metrics" ON artist_metrics 
  FOR SELECT USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can insert own metrics" ON artist_metrics;
CREATE POLICY "Users can insert own metrics" ON artist_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own metrics" ON artist_metrics;
CREATE POLICY "Users can update own metrics" ON artist_metrics 
  FOR UPDATE USING (auth.uid() = user_id);

-- Releases policies  
DROP POLICY IF EXISTS "Users can view own releases" ON releases;
CREATE POLICY "Users can view own releases" ON releases 
  FOR SELECT USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can manage own releases" ON releases;
CREATE POLICY "Users can manage own releases" ON releases 
  FOR ALL USING (auth.uid() = user_id);

-- Sync log policies
DROP POLICY IF EXISTS "Users can view own sync log" ON viberate_sync_log;
CREATE POLICY "Users can view own sync log" ON viberate_sync_log 
  FOR SELECT USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can insert own sync log" ON viberate_sync_log;
CREATE POLICY "Users can insert own sync log" ON viberate_sync_log 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_releases_updated_at ON releases;
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
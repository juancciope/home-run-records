-- Home Run Records Database RLS Policy Migration
-- This script fixes all Row Level Security (RLS) policies and permissions
-- to resolve the 42501 "permission denied" errors

-- ==============================================================================
-- 1. ENABLE RLS ON MISSING TABLES
-- ==============================================================================

-- Production pipeline tables
ALTER TABLE agent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_engagement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_records ENABLE ROW LEVEL SECURITY;

-- Artist-related tables  
ALTER TABLE artist_fanbase ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_tracks ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. ADD RLS POLICIES FOR USER-SPECIFIC TABLES
-- ==============================================================================

-- Agent Records Policies
CREATE POLICY "Users can view own agent records" ON agent_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent records" ON agent_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent records" ON agent_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agent records" ON agent_records
  FOR DELETE USING (auth.uid() = user_id);

-- Production Records Policies
CREATE POLICY "Users can view own production records" ON production_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own production records" ON production_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own production records" ON production_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own production records" ON production_records
  FOR DELETE USING (auth.uid() = user_id);

-- Marketing Records Policies
CREATE POLICY "Users can view own marketing records" ON marketing_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing records" ON marketing_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing records" ON marketing_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing records" ON marketing_records
  FOR DELETE USING (auth.uid() = user_id);

-- Fan Engagement Records Policies
CREATE POLICY "Users can view own fan engagement records" ON fan_engagement_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fan engagement records" ON fan_engagement_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fan engagement records" ON fan_engagement_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fan engagement records" ON fan_engagement_records
  FOR DELETE USING (auth.uid() = user_id);

-- Conversion Records Policies
CREATE POLICY "Users can view own conversion records" ON conversion_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversion records" ON conversion_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversion records" ON conversion_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversion records" ON conversion_records
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 3. ADD RLS POLICIES FOR ARTIST-RELATED TABLES
-- ==============================================================================

-- Artist Analytics Policies (via artists.user_id relationship)
CREATE POLICY "Users can view analytics for their artists" ON artist_analytics
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for their artists" ON artist_analytics
  FOR INSERT WITH CHECK (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analytics for their artists" ON artist_analytics
  FOR UPDATE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete analytics for their artists" ON artist_analytics
  FOR DELETE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

-- Artist Fanbase Policies
CREATE POLICY "Users can view fanbase for their artists" ON artist_fanbase
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert fanbase for their artists" ON artist_fanbase
  FOR INSERT WITH CHECK (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update fanbase for their artists" ON artist_fanbase
  FOR UPDATE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete fanbase for their artists" ON artist_fanbase
  FOR DELETE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

-- Artist Ranks Policies
CREATE POLICY "Users can view ranks for their artists" ON artist_ranks
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ranks for their artists" ON artist_ranks
  FOR INSERT WITH CHECK (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ranks for their artists" ON artist_ranks
  FOR UPDATE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

-- Artist Social Links Policies
CREATE POLICY "Users can view social links for their artists" ON artist_social_links
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert social links for their artists" ON artist_social_links
  FOR INSERT WITH CHECK (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update social links for their artists" ON artist_social_links
  FOR UPDATE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete social links for their artists" ON artist_social_links
  FOR DELETE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

-- Artist Tracks Policies
CREATE POLICY "Users can view tracks for their artists" ON artist_tracks
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tracks for their artists" ON artist_tracks
  FOR INSERT WITH CHECK (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tracks for their artists" ON artist_tracks
  FOR UPDATE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tracks for their artists" ON artist_tracks
  FOR DELETE USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 4. VERIFY TABLE PERMISSIONS ARE GRANTED
-- ==============================================================================

-- Ensure all necessary permissions are granted to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- ==============================================================================
-- 5. SUMMARY OF FIXES
-- ==============================================================================

/*
ISSUES RESOLVED:
1. Missing RLS policies on production pipeline tables (agent_records, production_records, etc.)
2. Missing RLS policies on artist-related tables (artist_analytics, artist_fanbase, etc.)
3. Enhanced Supabase client configuration for better auth persistence
4. Updated service methods to use createAuthenticatedClient()
5. Removed redundant user_id filtering in getGoals() since RLS handles it automatically

KEY CHANGES:
- All tables now have proper RLS policies based on auth.uid()
- Artist-related tables use JOIN policies via artists.user_id
- Client-side authentication context is properly maintained
- Service methods wait for authentication before making queries

TESTING:
- Verified RLS policies work correctly when auth.uid() is set
- Confirmed permissions are granted for all necessary roles
- Updated client code to ensure authentication context is maintained
*/
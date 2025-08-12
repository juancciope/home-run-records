-- Fix Database Permissions for Artist OS
-- Run this in your Supabase SQL editor to fix RLS and permissions

-- First, let's ensure all tables exist and have proper structure
-- Re-enable RLS on all tables (in case it was disabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own artist profile" ON public.artist_profiles;
DROP POLICY IF EXISTS "Users can insert own artist profile" ON public.artist_profiles;
DROP POLICY IF EXISTS "Users can update own artist profile" ON public.artist_profiles;

DROP POLICY IF EXISTS "Users can view own metrics" ON public.artist_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON public.artist_metrics;

DROP POLICY IF EXISTS "Users can view own releases" ON public.releases;
DROP POLICY IF EXISTS "Users can manage own releases" ON public.releases;

DROP POLICY IF EXISTS "Agency members can view agency" ON public.agencies;
DROP POLICY IF EXISTS "Users can view their agency memberships" ON public.agency_users;
DROP POLICY IF EXISTS "Anyone can read artists" ON public.artists;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create comprehensive RLS policies for artist_profiles table
CREATE POLICY "Users can view own artist profile" ON public.artist_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own artist profile" ON public.artist_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own artist profile" ON public.artist_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own artist profile" ON public.artist_profiles
    FOR DELETE USING (auth.uid() = id);

-- Create comprehensive RLS policies for artist_metrics table
CREATE POLICY "Users can view own metrics" ON public.artist_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON public.artist_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON public.artist_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for releases table
CREATE POLICY "Users can view own releases" ON public.releases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own releases" ON public.releases
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for agencies (multi-tenant)
CREATE POLICY "Agency members can view agency" ON public.agencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agency_users au 
            WHERE au.agency_id = id AND au.user_id = auth.uid()
        )
    );

-- Create RLS policies for agency_users
CREATE POLICY "Users can view their agency memberships" ON public.agency_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their agency memberships" ON public.agency_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for artists table (public read for search)
CREATE POLICY "Anyone can read artists" ON public.artists
    FOR SELECT USING (true);

CREATE POLICY "System can manage artists" ON public.artists
    FOR ALL USING (true);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.artist_profiles TO authenticated;
GRANT ALL ON public.artist_metrics TO authenticated;
GRANT ALL ON public.releases TO authenticated;
GRANT ALL ON public.agencies TO authenticated;
GRANT ALL ON public.agency_users TO authenticated;
GRANT ALL ON public.artists TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Note: User profiles will be created automatically when users sign up
-- via the trigger function below. No need to create them manually here.

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, global_role, is_active, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'artist',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure existing authenticated users have profiles
-- This will create profiles for users who signed up before the trigger was added
DO $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN 
        SELECT au.id, au.email
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        INSERT INTO public.users (id, email, global_role, is_active, created_at, updated_at)
        VALUES (
            auth_user.id,
            auth_user.email,
            'artist'::user_role,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Test the permissions
SELECT 'Permissions setup complete!' as status;
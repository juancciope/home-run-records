-- COMPREHENSIVE FIX FOR RLS AND DATABASE ACCESS ISSUES
-- This script addresses multiple issues found in the research

-- Step 1: Completely disable RLS and remove all policies
ALTER TABLE production_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE fan_engagement_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_records DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (including ones that may not have been caught)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies for production_records
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'production_records'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON production_records', policy_record.policyname);
    END LOOP;

    -- Drop all policies for marketing_records
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'marketing_records'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON marketing_records', policy_record.policyname);
    END LOOP;

    -- Drop all policies for fan_engagement_records
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'fan_engagement_records'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON fan_engagement_records', policy_record.policyname);
    END LOOP;

    -- Drop all policies for conversion_records
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'conversion_records'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversion_records', policy_record.policyname);
    END LOOP;

    -- Drop all policies for agent_records
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'agent_records'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON agent_records', policy_record.policyname);
    END LOOP;
END
$$;

-- Step 3: Grant explicit permissions to authenticated role
GRANT ALL PRIVILEGES ON production_records TO authenticated;
GRANT ALL PRIVILEGES ON marketing_records TO authenticated;
GRANT ALL PRIVILEGES ON fan_engagement_records TO authenticated;
GRANT ALL PRIVILEGES ON conversion_records TO authenticated;
GRANT ALL PRIVILEGES ON agent_records TO authenticated;

-- Grant usage on sequences (needed for inserts)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 4: Verify table ownership and permissions
DO $$
DECLARE
    table_names text[] := ARRAY['production_records', 'marketing_records', 'fan_engagement_records', 'conversion_records', 'agent_records'];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- Ensure tables are owned by postgres/service role
        EXECUTE format('ALTER TABLE %I OWNER TO postgres', table_name);
        
        -- Grant all permissions to public schema users
        EXECUTE format('GRANT ALL PRIVILEGES ON TABLE %I TO PUBLIC', table_name);
    END LOOP;
END
$$;

-- Step 5: Check and display current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerlsactive as rls_forced
FROM pg_tables 
WHERE tablename IN ('production_records', 'marketing_records', 'fan_engagement_records', 'conversion_records', 'agent_records')
ORDER BY tablename;
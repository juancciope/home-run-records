-- Get Current Database Schema Structure
-- Run this in your Supabase SQL editor to see EXACTLY what tables and columns exist

-- 1. List all tables in the public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Get detailed column information for ALL tables
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
    AND c.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 3. Get all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Get all foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 5. Get all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Get custom types (ENUMs)
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY t.typname, e.enumsortorder;

-- 7. Check if specific tables exist and show their structure
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check users table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'users table EXISTS';
    ELSE
        RAISE NOTICE 'users table DOES NOT EXIST';
    END IF;
    
    -- Check artist_profiles table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'artist_profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'artist_profiles table EXISTS';
    ELSE
        RAISE NOTICE 'artist_profiles table DOES NOT EXIST';
    END IF;
    
    -- Check artists table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'artists'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'artists table EXISTS';
    ELSE
        RAISE NOTICE 'artists table DOES NOT EXIST';
    END IF;
END $$;

-- 8. Show current database version and settings
SELECT version();
SELECT current_database(), current_schema(), current_user;
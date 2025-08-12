-- Fix users table RLS policies to allow basic access

-- First, drop any existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Superadmins can view all users" ON users;
DROP POLICY IF EXISTS "Superadmins can manage all users" ON users;

-- Temporarily disable RLS to clear any issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add the most basic policy that allows users to read their own profile
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Allow users to update their own profile  
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Allow creating new user profiles (needed for signup/profile creation)
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- For now, let's add a simple superadmin policy without using helper functions
-- We'll check the global_role directly in the policy
CREATE POLICY "Superadmins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.global_role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.global_role = 'superadmin'
        )
    );
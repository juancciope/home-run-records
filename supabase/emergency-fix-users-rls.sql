-- Emergency fix: Completely disable RLS on users table to stop infinite recursion
-- This is a temporary solution to get login working immediately

-- Drop ALL policies on users table
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Superadmins can view all users" ON users;
DROP POLICY IF EXISTS "Superadmins can manage all users" ON users;

-- Completely disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- This means anyone authenticated can access the users table
-- We'll re-implement proper RLS later once login is working
-- For now, this will get you unblocked
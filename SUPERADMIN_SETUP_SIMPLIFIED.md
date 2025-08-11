# Simplified Superadmin Setup with Existing Supabase Users

## Current Status
You have 2 users in Supabase auth:
- `logan@homeformusic.app` 
- `juan@elo7.com`

## Quick Setup (5 minutes)

### Step 1: Make Logan a Superadmin

Since you already have users in Supabase auth, let's make Logan the superadmin:

```sql
-- First, create user profile for Logan (linking to Supabase auth)
INSERT INTO users (id, email, global_role, first_name, last_name, is_active)
VALUES (
  '742f2384-a69f-4ca7-8f94-4a9514cd4068',  -- Logan's ID from auth.users
  'logan@homeformusic.app',
  'superadmin',
  'Logan',
  'Admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  global_role = 'superadmin',
  first_name = 'Logan',
  last_name = 'Admin';
```

### Step 2: Make Juan an Artist Manager

```sql
-- Create user profile for Juan
INSERT INTO users (id, email, global_role, first_name, last_name, is_active)
VALUES (
  'c4aebcda-fe3c-4017-a3d3-0daf6c53011c',  -- Juan's ID from auth.users  
  'juan@elo7.com',
  'artist_manager',
  'Juan',
  'Garcia',
  true
)
ON CONFLICT (id) DO UPDATE SET
  global_role = 'artist_manager',
  first_name = 'Juan',
  last_name = 'Garcia';

-- Link Juan to Home Run Records as manager
INSERT INTO agency_users (agency_id, user_id, role, is_primary)
VALUES (
  (SELECT id FROM agencies WHERE slug = 'home-run-records'),
  'c4aebcda-fe3c-4017-a3d3-0daf6c53011c',
  'artist_manager',
  true
)
ON CONFLICT (agency_id, user_id) DO NOTHING;
```

### Step 3: Test Access

1. **Logan logs in** → Should see "Super Admin" badge + Admin menu
2. **Juan logs in** → Should see "Home Run Records" agency + artist switcher

## Why We Still Need the `users` Table

```sql
-- auth.users (Supabase managed)
- id, email, password, email_verified, etc.
- Handles: Login, logout, password reset, email verification

-- users (Our app managed)  
- id (same as auth.users.id), global_role, agency relationships, profile data
- Handles: Roles, permissions, app-specific profile info
```

## Updated Trigger

The trigger needs to be simpler since you have existing users:

```sql
-- Updated trigger for new users (keeps existing users intact)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, global_role, is_active)
  VALUES (NEW.id, NEW.email, 'artist', true)
  ON CONFLICT (id) DO NOTHING;  -- Don't overwrite existing users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Verification Commands

```sql
-- Check your users are set up correctly
SELECT u.email, u.global_role, u.first_name, u.last_name,
       au.email as auth_email
FROM users u
JOIN auth.users au ON u.id = au.id;

-- Check agency relationships
SELECT u.email, u.global_role, a.name as agency, aau.role
FROM users u
LEFT JOIN agency_users aau ON u.id = aau.user_id  
LEFT JOIN agencies a ON aau.agency_id = a.id;
```

## Next Steps

After running these SQL commands:

1. **Logan** can log in and act as superadmin
2. **Juan** can log in and manage Home Run Records
3. Any new signups will automatically get `artist` role
4. You can promote users through the database or build admin UI

This approach keeps it simple while leveraging your existing Supabase authentication!
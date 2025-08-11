# Artist OS - Database Migration Guide

This guide will help you migrate from the old single-tenant structure to the new multi-tenant architecture.

## 🔥 **IMPORTANT: Fresh Start Required**

Since we're implementing a completely new multi-tenant architecture, we need to start with a fresh database. All existing data will be lost, which is acceptable for this migration.

## Step 1: Reset Database

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this command to drop all existing tables:

```sql
-- Drop all existing tables and functions
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
```

### Option B: Using Local Development
If you're using local Supabase:

```bash
supabase db reset
```

## Step 2: Apply New Multi-Tenant Schema

1. In Supabase SQL Editor, run the complete schema from `/supabase/multi-tenant-schema.sql`
2. Or if using local development:

```bash
supabase db push
```

## Step 3: Verify Schema

Check that these tables were created:
- `agencies`
- `users` 
- `agency_users`
- `artists`
- `artist_goals`
- `team_members`
- `tasks`
- `artist_analytics`

## Step 4: Set Up Authentication Triggers

Add this trigger to automatically create user profiles when users sign up:

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, global_role)
  VALUES (NEW.id, NEW.email, 'artist');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Step 5: Create Your First Superadmin

### Method 1: Direct Database Insert (Recommended)

1. First, sign up normally through your app with the email you want to be superadmin
2. Find your user ID from the `auth.users` table:

```sql
SELECT id, email FROM auth.users WHERE email = 'your-admin-email@example.com';
```

3. Update the user to be superadmin:

```sql
UPDATE users 
SET global_role = 'superadmin',
    first_name = 'Super',
    last_name = 'Admin'
WHERE email = 'your-admin-email@example.com';
```

### Method 2: Using the App Interface

1. Sign up normally through your app
2. Use the direct database method above to promote yourself to superadmin
3. Log out and log back in to get the new permissions

## Step 6: Create Sample Agencies

Insert some sample agencies to get started:

```sql
-- Insert sample agencies
INSERT INTO agencies (id, name, slug, description, contact_email, max_artists) VALUES
(gen_random_uuid(), 'Home Run Records', 'home-run-records', 'Independent music label and artist management', 'contact@homerunrecords.com', 50),
(gen_random_uuid(), 'Indie Wave Agency', 'indie-wave-agency', 'Boutique artist management for indie artists', 'hello@indiewave.com', 25),
(gen_random_uuid(), 'Urban Beats Management', 'urban-beats', 'Hip-hop and R&B artist management', 'info@urbanbeats.com', 30);
```

## Step 7: Create Sample Artists

```sql
-- First, get agency IDs
SELECT id, name FROM agencies;

-- Insert sample artists (replace 'AGENCY_ID_HERE' with actual IDs)
INSERT INTO artists (agency_id, stage_name, real_name, genres, total_followers, total_monthly_listeners) VALUES
('AGENCY_ID_HERE', 'Alex Rivera', 'Alexander Rivera', ARRAY['Pop', 'Electronic'], 45000, 25000),
('AGENCY_ID_HERE', 'Maya Chen', 'Maya Chen', ARRAY['Indie', 'Folk'], 32000, 18000),
('AGENCY_ID_HERE', 'DJ Neon', 'Marcus Johnson', ARRAY['Electronic', 'House'], 78000, 45000);
```

## Step 8: Test the System

1. **As Superadmin:**
   - Log in and verify you see the "Admin" menu
   - Check that you can see all agencies
   - Verify agency switching works

2. **Create Agency Manager:**
   ```sql
   -- Create agency relationship for a user to be manager
   INSERT INTO agency_users (agency_id, user_id, role, is_primary)
   VALUES ('AGENCY_ID', 'USER_ID', 'artist_manager', true);
   ```

3. **Create Regular Artist:**
   - Link an artist record to a user account
   ```sql
   UPDATE artists 
   SET user_id = 'USER_ID' 
   WHERE id = 'ARTIST_ID';
   ```

## Step 9: Update Environment Variables

Make sure your `.env.local` has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 10: Test Authentication Flow

1. **Sign up new users** - Should automatically create user records
2. **Test role-based access** - Different users should see different navigation
3. **Test agency switching** - Superadmins should be able to switch between agencies
4. **Test artist switching** - Agency managers should be able to switch between their artists

## Troubleshooting

### Issue: "Row Level Security policy violation"
- Check that RLS policies are properly configured
- Verify user roles are set correctly
- Make sure agency relationships exist

### Issue: User not showing as superadmin
- Check the `users` table for correct `global_role`
- Log out and log back in to refresh session
- Verify the user record exists in both `auth.users` and `users` tables

### Issue: No agencies showing
- Check that agencies exist in the `agencies` table
- For superadmins, verify the `loadAllAgencies` function is working
- For regular users, verify `agency_users` relationships exist

### Issue: Navigation not showing correct menu items
- Verify the user's role is correctly detected
- Check that the `useAuth` hook is being used instead of `useArtist`
- Clear browser cache and refresh

## Success Criteria

✅ Superadmin can see Admin menu and switch between agencies  
✅ Agency managers can see their agency's artists and switch between them  
✅ Regular artists can only see their own data  
✅ Role-based navigation works correctly  
✅ Agency and artist switching functions work  
✅ New user signup creates proper user records  

## Next Steps

After successful migration:
1. Create agency management pages for superadmin
2. Update all remaining components to use new AuthContext
3. Implement API authorization middleware
4. Add user invitation system for agencies
5. Create artist onboarding flow for agencies
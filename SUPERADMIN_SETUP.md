# Superadmin Setup Guide for Artist OS

## Quick Setup Instructions

### 1. **Reset Your Database**
Follow the `DATABASE_MIGRATION.md` guide to apply the new schema.

### 2. **Create Your Superadmin Account**

#### Option A: Using Supabase Dashboard (Recommended)

1. **Apply the Schema**
   - Go to Supabase → SQL Editor
   - Copy and paste the entire contents of `/supabase/multi-tenant-schema.sql`
   - Click "Run" to execute

2. **Set Up Auth Trigger**
   ```sql
   -- This automatically creates user profiles when people sign up
   CREATE OR REPLACE FUNCTION handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.users (id, email, global_role)
     VALUES (NEW.id, NEW.email, 'artist');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION handle_new_user();
   ```

3. **Sign Up Through Your App**
   - Go to your app's signup page
   - Create an account with your desired admin email
   - Complete the signup process

4. **Promote Yourself to Superadmin**
   - Go back to Supabase SQL Editor
   - Run this query (replace with your email):
   ```sql
   UPDATE users 
   SET global_role = 'superadmin',
       first_name = 'Super',
       last_name = 'Admin'
   WHERE email = 'your-email@example.com';
   ```

5. **Create Sample Agencies**
   ```sql
   INSERT INTO agencies (name, slug, description, contact_email, max_artists) VALUES
   ('Home Run Records', 'home-run-records', 'Independent music label and artist management', 'contact@homerunrecords.com', 50),
   ('Indie Wave Agency', 'indie-wave-agency', 'Boutique artist management for indie artists', 'hello@indiewave.com', 25),
   ('Urban Beats Management', 'urban-beats', 'Hip-hop and R&B artist management', 'info@urbanbeats.com', 30);
   ```

6. **Create Sample Artists**
   ```sql
   -- First get agency IDs
   SELECT id, name FROM agencies;
   
   -- Insert artists (replace the UUIDs with actual agency IDs from above)
   INSERT INTO artists (agency_id, stage_name, real_name, genres, total_followers, total_monthly_listeners) VALUES
   ((SELECT id FROM agencies WHERE slug = 'home-run-records'), 'Alex Rivera', 'Alexander Rivera', ARRAY['Pop', 'Electronic'], 45000, 25000),
   ((SELECT id FROM agencies WHERE slug = 'home-run-records'), 'Maya Chen', 'Maya Chen', ARRAY['Indie', 'Folk'], 32000, 18000),
   ((SELECT id FROM agencies WHERE slug = 'indie-wave-agency'), 'DJ Neon', 'Marcus Johnson', ARRAY['Electronic', 'House'], 78000, 45000);
   ```

### 3. **Test Your Superadmin Access**

1. **Log Out and Back In**
   - This refreshes your session with new permissions

2. **Verify Superadmin Features**
   - You should see an "Admin" menu in the sidebar
   - You should see a "Super Admin" badge in your profile
   - You should be able to switch between agencies

## What You Can Do as Superadmin

### 🏢 **Agency Management**
- View all agencies in the system
- Switch between different agencies
- See all artists under each agency
- Access agency-level analytics and data

### 👥 **User Management** 
- View all users across all agencies
- Promote users to different roles
- Assign users to agencies
- Manage agency relationships

### 🎵 **Artist Management**
- View all artists across all agencies
- Switch between artists to see their data
- Access cross-agency analytics
- Manage artist profiles and data

### ⚙️ **System Administration**
- Access system-wide settings
- View platform analytics
- Manage global configurations
- Monitor system health

## Creating Additional Users

### Create Agency Manager
```sql
-- 1. User signs up normally through the app
-- 2. Get their user ID
SELECT id, email FROM users WHERE email = 'manager@homerunrecords.com';

-- 3. Assign them to an agency as manager
INSERT INTO agency_users (agency_id, user_id, role, is_primary)
VALUES (
  (SELECT id FROM agencies WHERE slug = 'home-run-records'),
  'USER_ID_HERE',
  'artist_manager',
  true
);
```

### Create Artist Account
```sql
-- 1. User signs up normally
-- 2. Link them to an existing artist record
UPDATE artists 
SET user_id = 'USER_ID_HERE'
WHERE stage_name = 'Alex Rivera';

-- 3. Or create agency relationship if they don't have an artist record
INSERT INTO agency_users (agency_id, user_id, role, is_primary)
VALUES (
  (SELECT id FROM agencies WHERE slug = 'home-run-records'),
  'USER_ID_HERE',
  'artist',
  true
);
```

## Navigation Overview

### Superadmin Menu Structure
```
Start Here
├── Onboarding
│   ├── Connect Data
│   └── Set Goals
└── My Team

Dashboard
├── Overview
└── Analytics

Admin (Superadmin Only)
├── Agencies
├── Users
└── System Settings
```

### Agency Manager Menu Structure  
```
Start Here
├── Onboarding
│   ├── Connect Data
│   └── Set Goals
└── My Team

Dashboard
├── Overview
└── Analytics

Tools
├── Brand
├── Ads
└── Content Calendar
```

### Artist Menu Structure
```
Start Here
└── Onboarding
    ├── Connect Data
    └── Set Goals

Dashboard
├── Overview
└── Analytics

Tools
├── Brand
├── Ads
└── Content Calendar
```

## Quick Verification Checklist

✅ **Database Schema Applied**: All tables created with RLS policies  
✅ **Auth Trigger Working**: New signups create user records  
✅ **Superadmin Created**: Your account has `global_role = 'superadmin'`  
✅ **Sample Data Inserted**: Agencies and artists exist  
✅ **UI Working**: Admin menu visible, role badge shows "Super Admin"  
✅ **Agency Switching**: Can switch between different agencies  
✅ **Artist Switching**: Can see artists under each agency  

## Troubleshooting Common Issues

**Issue**: "Admin" menu not showing
- **Solution**: Make sure you logged out and back in after setting superadmin role

**Issue**: No agencies showing up
- **Solution**: Check that agencies table has data and user has correct permissions

**Issue**: Can't switch between agencies  
- **Solution**: Verify RLS policies are applied and superadmin role is set correctly

**Issue**: "Row Level Security policy violation"
- **Solution**: Check that all RLS policies from the schema file were applied correctly

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify database schema matches the migration file
3. Confirm user roles are set correctly in the `users` table
4. Ensure RLS policies are properly configured

The superadmin account gives you full access to manage agencies, users, and the entire Artist OS platform!
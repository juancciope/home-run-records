# 🚀 Complete Setup Guide - Artist OS Multi-Tenant

This is your **one-stop guide** to set up the new Artist OS multi-tenant architecture from scratch.

## 📋 Pre-Setup Checklist

- [ ] Access to Supabase dashboard
- [ ] Your desired superadmin email ready
- [ ] Artist OS app running locally

## 🔥 Step-by-Step Setup

### Step 1: Reset Database (2 minutes)

1. **Go to Supabase Dashboard** → Your Project → **SQL Editor**
2. **Run this to completely reset your database:**

```sql
-- ⚠️  WARNING: This will delete ALL existing data
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
```

### Step 2: Apply New Schema (3 minutes)

1. **In the same SQL Editor, copy and paste the entire contents of:**
   `supabase/multi-tenant-schema.sql`

2. **Click "Run"** to execute the schema

3. **Add the auth trigger:**

```sql
-- Auto-create user profiles when people sign up
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

### Step 3: Add Sample Data (1 minute)

**Copy and paste the entire contents of:** `supabase/sample-data.sql`

This creates:
- ✅ 4 sample agencies (Home Run Records, Indie Wave Agency, Urban Beats Management, Acoustic Dreams)
- ✅ 10 sample artists with realistic data
- ✅ Sample team members and tasks
- ✅ Sample goals and analytics data

### Step 4: Create Your Superadmin (2 minutes)

1. **Sign up through your app** with your desired superadmin email
2. **Go back to Supabase SQL Editor**
3. **Run this query** (replace with your email):

```sql
-- Make yourself superadmin
UPDATE users 
SET global_role = 'superadmin',
    first_name = 'Super',
    last_name = 'Admin'
WHERE email = 'YOUR_EMAIL_HERE@example.com';

-- Verify it worked
SELECT email, global_role, first_name, last_name 
FROM users 
WHERE global_role = 'superadmin';
```

### Step 5: Test Everything (3 minutes)

1. **Log out and back in** to your app
2. **Verify you see:**
   - ✅ "Super Admin" badge in header
   - ✅ "Admin" menu in sidebar  
   - ✅ Agency switcher with 4 agencies
   - ✅ Artist switcher with multiple artists

## 🎯 What You Should See

### As Superadmin:
```
👤 Header: "Super Admin" badge
🏢 Agency Switcher: Home Run Records, Indie Wave Agency, Urban Beats, Acoustic Dreams  
🎵 Artist Switcher: Alex Rivera, Maya Chen, DJ Neon, Luna Martinez, etc.
📱 Navigation: Start Here, Dashboard, Admin (with Agencies, Users, Settings)
```

### Sample Agencies Created:
1. **Home Run Records** - 3 artists (Alex Rivera, Maya Chen, The Midnight Collective)
2. **Indie Wave Agency** - 2 artists (Luna Martinez, Echo Valley)  
3. **Urban Beats Management** - 3 artists (DJ Neon, Rhythm & Soul, K-Wave)
4. **Acoustic Dreams** - 2 artists (Willow & Pine, Mountain Echo)

## 🧪 Quick Testing

### Test Agency Switching:
1. Click agency switcher in sidebar
2. Switch to "Urban Beats Management"
3. Verify you see DJ Neon, Rhythm & Soul, K-Wave in artist switcher

### Test Role-Based Navigation:
1. Admin menu should be visible (Agencies, Users, System Settings)
2. Artist managers would see "Tools" instead of "Admin"
3. Regular artists see limited navigation

## 🔧 Create Additional Users

### Create Agency Manager:
```sql
-- 1. Have them sign up normally through your app
-- 2. Get their user ID
SELECT id, email FROM users WHERE email = 'manager@homerunrecords.com';

-- 3. Make them manager of Home Run Records
INSERT INTO agency_users (agency_id, user_id, role, is_primary)
VALUES (
  (SELECT id FROM agencies WHERE slug = 'home-run-records'),
  'USER_ID_FROM_STEP_2',
  'artist_manager',
  true
);
```

### Link Existing Artist to User Account:
```sql
-- Link "Alex Rivera" to a user account
UPDATE artists 
SET user_id = 'USER_ID_HERE'
WHERE stage_name = 'Alex Rivera';
```

## 🚨 Troubleshooting

**"Admin menu not showing"**
→ Log out and back in, check user role in database

**"No agencies visible"** 
→ Check agencies table has data, verify RLS policies applied

**"Can't switch agencies"**
→ Verify superadmin role is set correctly

**"Row Level Security violation"**
→ Ensure complete schema was applied with all RLS policies

## ✅ Success Checklist

After setup, you should have:

- [ ] **Database**: New multi-tenant schema applied
- [ ] **Sample Data**: 4 agencies, 10 artists, team members, tasks
- [ ] **Superadmin**: Your account with full access
- [ ] **UI Working**: Correct navigation and role badges
- [ ] **Agency Switching**: Can switch between all agencies
- [ ] **Artist Switching**: Can see artists under each agency
- [ ] **Permissions**: Role-based access working correctly

## 🚀 Next Steps

Now that your multi-tenant system is set up:

1. **Invite team members** to agencies
2. **Connect real artist data** from Spotify/Instagram
3. **Set up agency-specific branding**  
4. **Configure user permissions**
5. **Start managing multiple agencies and artists!**

---

## 📞 Need Help?

If you run into issues:
1. Check browser console for errors
2. Verify all SQL scripts ran successfully  
3. Confirm user roles in the `users` table
4. Make sure you logged out and back in after role changes

**You're now ready to manage multiple agencies and artists with Artist OS!** 🎵
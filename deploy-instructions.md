# Production Database Setup Instructions

## Issue
The Add Data buttons don't work because the pipeline tables don't exist in the production Supabase database. We created the tables locally but they need to be deployed to production.

## Solution Options

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/projects
2. Click on your project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the contents of `production-migration.sql` 
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration
7. Refresh your app - the Add Data buttons should now work!

### Option 2: Supabase CLI (If connected)
```bash
# Connect to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Push the migrations
supabase db push
```

## What This Migration Does
- Creates 5 pipeline tables: `production_records`, `marketing_records`, `fan_engagement_records`, `conversion_records`, `agent_records`
- Sets up proper RLS (Row Level Security) policies
- Creates indexes for performance
- Adds triggers for automatic timestamp updates

## Expected Result
After running the migration:
- Add Data buttons will open functional modals
- Users can add records manually or via CSV import
- Dashboard cards will show real data instead of just mock data
- Each user can only see/edit their own records (RLS security)

## Verification
After applying the migration, you can verify it worked by:
1. Going to your app dashboard
2. Clicking any + button
3. The modal should open without console errors
4. Try adding a test record - it should save and update the card total
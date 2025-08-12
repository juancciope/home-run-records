# Actual Database Schema - LIVE STATE

**Last Updated**: August 12, 2025  
**Connection**: Direct CLI inspection via Supabase pooler

## Tables Found

```
agencies
agency_users  
artist_analytics
artist_goals
artist_metrics
artist_profiles
artists
releases
tasks
team_members
users
```

## Artists Table Structure (FIXED)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | NO | Primary key |
| agency_id | uuid | YES | Foreign key |
| user_id | uuid | YES | Foreign key |
| stage_name | varchar | NO | Required field |
| real_name | varchar | YES | |
| bio | text | YES | |
| genres | ARRAY | YES | Original field |
| avatar_url | text | YES | |
| banner_url | text | YES | |
| status | USER-DEFINED | YES | |
| spotify_id | varchar | YES | |
| instagram_handle | varchar | YES | |
| tiktok_handle | varchar | YES | |
| youtube_channel_id | varchar | YES | |
| viberate_artist_id | varchar | YES | |
| total_followers | integer | YES | |
| total_monthly_listeners | integer | YES | |
| total_streams | bigint | YES | |
| created_at | timestamptz | YES | |
| updated_at | timestamptz | YES | |
| **uuid** | **text** | **YES** | ✅ **ADDED** - Viberate UUID |
| **name** | **text** | **YES** | ✅ **ADDED** - Artist name |
| **slug** | **text** | **YES** | ✅ **ADDED** - URL slug |
| **image** | **text** | **YES** | ✅ **ADDED** - Profile image |
| **verified** | **boolean** | **YES** | ✅ **ADDED** - Verification status |
| **rank** | **integer** | **YES** | ✅ **ADDED** - Viberate rank |
| **country** | **jsonb** | **YES** | ✅ **ADDED** - Country data |
| **genre** | **jsonb** | **YES** | ✅ **ADDED** - Primary genre |
| **subgenres** | **jsonb** | **YES** | ✅ **ADDED** - Subgenres array |
| **social_links** | **jsonb** | **YES** | ✅ **ADDED** - Social media links |
| **streaming_links** | **jsonb** | **YES** | ✅ **ADDED** - Streaming platform links |
| **tracks** | **jsonb** | **YES** | ✅ **ADDED** - Track list |
| **events** | **jsonb** | **YES** | ✅ **ADDED** - Event data |
| **fanbase** | **jsonb** | **YES** | ✅ **ADDED** - Fanbase metrics |
| **similar_artists** | **jsonb** | **YES** | ✅ **ADDED** - Similar artists |
| **ranks** | **jsonb** | **YES** | ✅ **ADDED** - Ranking data |
| **metrics** | **jsonb** | **YES** | ✅ **ADDED** - General metrics |
| **last_updated** | **timestamptz** | **YES** | ✅ **ADDED** - Last sync time |

## Artist Profiles Table Structure (CONFIRMED WORKING)

✅ **All 41 columns present and working** including:
- All Viberate integration fields
- Social media metrics  
- Platform URLs
- Streaming data
- Profile information

## Indexes Added

✅ **idx_artists_uuid** - For Viberate UUID lookups  
✅ **idx_artists_name** - For artist name searches  
✅ **idx_artists_slug** - For URL slug lookups  
✅ **idx_artists_verified** - For verification status  
✅ **idx_artists_rank** - For ranking queries  

## Issues Fixed

1. ❌ **"column artists.uuid does not exist"** → ✅ **FIXED**: Added uuid column
2. ❌ **"Could not find the 'country' column"** → ✅ **FIXED**: Added country JSONB column  
3. ❌ **Missing genre/subgenres columns** → ✅ **FIXED**: Added genre and subgenres JSONB columns
4. ❌ **Schema mismatch with Viberate code** → ✅ **FIXED**: All expected columns now exist

## Next Steps

1. ✅ Database schema is now compatible with Viberate integration code
2. 🔄 Test the onboarding flow again
3. 🔄 Verify Rachel Curtis artist data syncs properly
4. 🔄 Confirm dashboard displays real Viberate metrics

## Connection Details

- **Pooler**: `postgresql://postgres.ghsbrsoxwusodnyuqujy:BTosw0zRKhLez1qv@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
- **Project**: ghsbrsoxwusodnyuqujy.supabase.co
- **Status**: ✅ Direct CLI access working
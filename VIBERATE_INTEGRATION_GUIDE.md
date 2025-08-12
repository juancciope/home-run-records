# Viberate API Integration Guide

## Overview

This guide explains the comprehensive Viberate API integration implemented for Artist OS, providing music artist data enrichment capabilities.

## Database Setup

### Required Tables

Run the `database-schema.sql` file in your Supabase SQL editor to create all required tables:

```bash
# Execute this in Supabase SQL Editor
psql -f database-schema.sql
```

**Key Tables Created:**
- `users` - Extends auth.users with profile data
- `artist_profiles` - Enhanced artist profiles with Viberate data
- `artist_metrics` - Historical metrics tracking
- `agencies` - Multi-tenant agency support
- `agency_users` - User-agency relationships
- `releases` - Artist releases management
- `artists` - Viberate artist data storage

### Environment Variables

Add to your `.env.local`:

```bash
# Viberate API (when available)
VIBERATE_API_KEY=your_viberate_api_key_here
```

## API Integration

### Viberate API Research Summary

**Coverage:** 11M+ artists, 100M+ tracks, 19M+ playlists, 6K+ festivals
**Data Sources:** Instagram, TikTok, Spotify, YouTube, Facebook, Twitter, Apple Music, Deezer, SoundCloud
**Pricing:** $300-5000/month with rate limits (60-1500 calls/minute)
**Features:** Guaranteed unique artist IDs, daily data refresh, historical data (3-24 months)

### Service Architecture

**`VibrateService` (`/src/lib/services/viberate-api.ts`):**
- `searchArtist()` - Search artists by name
- `getArtistDetails()` - Fetch detailed artist data
- `getArtistAnalytics()` - Get performance metrics
- `syncArtistData()` - Sync data to database
- `updateArtistProfile()` - Update artist profiles
- `completeOnboarding()` - Full onboarding workflow

### API Endpoints Currently Available

1. **`/api/viberate/search`** - Artist search functionality
2. **`/api/viberate/artist/[uuid]`** - Detailed artist data
3. **`/api/viberate/analytics`** - Artist analytics
4. **`/api/viberate/sync`** - Data synchronization

## Data Flow

### Onboarding Process

1. **User searches for artist** → `VibrateService.searchArtist()`
2. **User selects artist** → `VibrateService.completeOnboarding()`
3. **System fetches detailed data** → `getArtistDetails()`
4. **Updates artist profile** → `updateArtistProfile()`
5. **Stores historical metrics** → `storeMetrics()`
6. **Syncs additional data** → `syncArtistData()`

### Data Storage

**Artist Profile Fields:**
```typescript
interface ArtistProfile {
  // Basic info
  artist_name: string
  stage_name: string
  profile_image_url: string
  
  // Viberate integration
  viberate_artist_id: string
  viberate_uuid: string
  viberate_verified: boolean
  viberate_last_sync: string
  
  // Social media metrics
  instagram_followers: number
  tiktok_followers: number
  youtube_subscribers: number
  spotify_followers: number
  // ... more platforms
  
  // Aggregated data
  total_followers: number
  total_streams: number
  engagement_rate: number
}
```

### Metrics Tracking

**Historical Data Storage:**
```typescript
interface ArtistMetric {
  user_id: string
  metric_type: 'followers' | 'streams' | 'engagement' | 'reach' | 'revenue'
  platform: string
  value: number
  date: string
  metadata: object
}
```

## Component Integration

### Artist Onboarding Component

**Location:** `/src/components/artist-onboarding.tsx`

**Updated Flow:**
1. Search artists by name
2. Display results with verification badges
3. Connect and sync complete profile data
4. Store metrics and mark onboarding complete

### Dashboard Integration

**Enhanced with:**
- Real-time Viberate data display
- Live/Demo mode indicators
- Social media metrics
- Streaming platform stats
- Historical trend charts

## Authentication & Authorization

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only access their own data
- Multi-tenant agency support
- Superadmin access controls

### Multi-Tenant Support

**Agency Structure:**
- Multiple users per agency
- Role-based permissions (superadmin, artist_manager, artist)
- Agency-specific data isolation

## Dashboard Layout

### Fixed Issues

1. **Sidebar Restoration** - Added `/src/app/dashboard/layout.tsx`
2. **User Header** - Server-side auth data display
3. **Theme Provider** - Dark mode support
4. **Responsive Design** - Mobile-friendly sidebar

### Layout Structure

```
Dashboard Layout
├── Sidebar (AppSidebar)
│   ├── Navigation Menu
│   ├── Team Switcher
│   └── User Navigation
├── Header
│   ├── Sidebar Trigger
│   ├── User Profile
│   └── Role Badge
└── Content Area
    └── Dashboard Components
```

## Performance Optimizations

### Caching Strategy

1. **Daily Sync** - Refresh Viberate data every 24 hours
2. **Local Storage** - Cache frequently accessed data
3. **Database Indexes** - Optimized queries for metrics
4. **Rate Limiting** - Respect Viberate API limits

### Error Handling

1. **Graceful Degradation** - Show demo data if API fails
2. **Retry Logic** - Automatic retry for transient failures
3. **User Feedback** - Clear error messages and loading states
4. **Logging** - Comprehensive error tracking

## Future Enhancements

### Phase 2 Features

1. **Real-time Webhooks** - Live data updates
2. **Advanced Analytics** - Trend analysis and predictions
3. **Export Features** - Data export in multiple formats
4. **API Rate Optimization** - Intelligent caching and batching

### Viberate Pro Features

When upgraded to higher tiers:
- Festival and event data
- Label relationships
- Geographic performance data
- Extended historical data (up to 24 months)

## Troubleshooting

### Common Issues

1. **404 Errors** - Check database tables are created
2. **Auth Errors** - Verify RLS policies are applied
3. **API Limits** - Monitor Viberate rate limits
4. **Sync Failures** - Check network connectivity and API keys

### Debug Commands

```bash
# Check database connection
npm run dev

# View console logs
# Open browser DevTools → Console

# Test API endpoints
curl http://localhost:3000/api/viberate/search?q=artist+name
```

## Production Deployment

### Checklist

- [ ] Database schema applied to production Supabase
- [ ] Environment variables configured
- [ ] RLS policies enabled
- [ ] Viberate API key added (when available)
- [ ] Rate limiting configured
- [ ] Error monitoring setup

### Monitoring

1. **Database Performance** - Monitor query performance
2. **API Usage** - Track Viberate API consumption
3. **User Onboarding** - Monitor completion rates
4. **Error Rates** - Alert on high error rates

This integration provides a solid foundation for comprehensive music artist data management with room for future enhancements based on user needs and Viberate API capabilities.
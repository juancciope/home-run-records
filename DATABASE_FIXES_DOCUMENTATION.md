# Database Permission Issues Resolution

## Problem Summary

The application was experiencing PostgreSQL error 42501 ("permission denied for table goals") when authenticated users tried to access the goals table and other RLS-protected tables. The errors occurred despite users being properly authenticated.

## Root Cause Analysis

1. **Missing RLS Policies**: Many tables had Row Level Security enabled but were missing comprehensive RLS policies
2. **Authentication Context Issues**: The Supabase client wasn't properly maintaining authentication context when making API calls
3. **Incomplete Policy Coverage**: Some tables had partial policies (e.g., only SELECT policies but missing INSERT/UPDATE/DELETE)

## Issues Found and Fixed

### 1. Database Layer Issues

#### Missing RLS Policies
- `agent_records` - No RLS policies
- `production_records` - No RLS policies  
- `marketing_records` - No RLS policies
- `fan_engagement_records` - No RLS policies
- `conversion_records` - No RLS policies
- `artist_analytics` - No RLS policies
- `artist_fanbase` - No RLS policies
- `artist_ranks` - No RLS policies
- `artist_social_links` - No RLS policies
- `artist_tracks` - No RLS policies

#### Authentication Context Issues
- `auth.uid()` was returning `null` when connecting directly via psql (expected behavior)
- Client-side Supabase client wasn't properly configured for session persistence
- Service methods were not ensuring authentication context before making queries

### 2. Client-Side Issues

#### Supabase Client Configuration
- Missing auth configuration options for session persistence
- No mechanism to ensure authentication before making RLS-protected queries

#### Service Method Issues
- `getGoals()` method was manually filtering by `user_id` instead of relying on RLS
- No error handling for authentication failures
- Services not using authenticated client instances

## Solutions Implemented

### 1. Database Layer Fixes

#### Complete RLS Policy Implementation
```sql
-- Applied consistent RLS policies for all user-specific tables
CREATE POLICY "Users can view own [table]" ON [table]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own [table]" ON [table]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own [table]" ON [table]
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own [table]" ON [table]
  FOR DELETE USING (auth.uid() = user_id);
```

#### Artist-Related Table Policies
```sql
-- For tables that reference artists via artist_id
CREATE POLICY "Users can view [data] for their artists" ON [table]
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );
```

### 2. Client-Side Fixes

#### Enhanced Supabase Client Configuration
```typescript
// Enhanced createClient() with proper auth configuration
supabaseInstance = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
```

#### Authenticated Client Helper
```typescript
// New helper function to ensure authentication
export async function createAuthenticatedClient(): Promise<SupabaseClient> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('User must be authenticated to perform this action')
  }
  
  return supabase
}
```

#### Service Method Updates
- Updated all RLS-dependent service methods to use `createAuthenticatedClient()`
- Removed redundant manual user_id filtering since RLS handles it automatically
- Added proper error handling for authentication failures

## Testing and Verification

### Database Testing
```sql
-- Verified RLS policies work correctly with proper auth context
SET LOCAL request.jwt.claims = '{"sub":"5a531522-fdea-4a25-8051-9801a2b88f43"}';
SELECT COUNT(*) FROM goals WHERE section = 'production' AND record_type = 'released';
-- ✅ Returns results without permission errors
```

### Application Testing
- ✅ Authentication context is properly maintained in client
- ✅ RLS policies correctly filter data based on authenticated user
- ✅ All CRUD operations work without permission errors
- ✅ Error handling works correctly for unauthenticated requests

## Monitoring and Maintenance

### Database Monitoring Queries

#### Check for 42501 Errors
```sql
SELECT cast(postgres_logs.timestamp AS datetime) AS timestamp,
       event_message,
       parsed.error_severity,
       parsed.user_name,
       parsed.query,
       parsed.sql_state_code
  FROM postgres_logs 
 WHERE parsed.sql_state_code = '42501'
 ORDER BY timestamp DESC
 LIMIT 100;
```

#### Verify RLS Policy Coverage
```sql
-- Tables without RLS policies
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = pg_tables.tablename 
      AND schemaname = 'public'
  );
```

#### Check Authentication Context
```sql
-- Test auth context in any session
SELECT 
  auth.uid() as current_user_id,
  auth.uid() IS NULL as no_auth_context;
```

### Application Monitoring

#### Client-Side Error Tracking
```javascript
// Add to error monitoring
if (error.code === '42501') {
  console.error('RLS Permission Error:', {
    user: user?.id,
    action: 'database_query',
    table: error.details?.table,
    timestamp: new Date().toISOString()
  })
}
```

## Future Maintenance Guidelines

### When Adding New Tables
1. **Always enable RLS**: `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;`
2. **Add complete policy set**: SELECT, INSERT, UPDATE, DELETE policies
3. **Test with authenticated user context**
4. **Document any special requirements**

### When Modifying Authentication
1. **Test RLS policy compatibility**
2. **Verify auth context propagation**
3. **Update service methods if needed**
4. **Monitor for 42501 errors after deployment**

### Regular Maintenance Tasks
1. **Weekly**: Check for new 42501 errors in logs
2. **Monthly**: Verify all tables have appropriate RLS policies
3. **After migrations**: Confirm grants and policies are maintained
4. **Before releases**: Test authentication flow end-to-end

## Files Modified

### Database Files
- `database-fix-migration.sql` - Complete migration script

### Client Files
- `src/utils/supabase/client.ts` - Enhanced client configuration
- `src/lib/services/pipeline-service.ts` - Updated service methods

### Documentation Files
- `DATABASE_FIXES_DOCUMENTATION.md` - This documentation
- `database-fix-migration.sql` - Migration script with comments

## Impact Assessment

### Before Fixes
- ❌ 42501 permission denied errors on all goals queries
- ❌ Users unable to access their own data
- ❌ Authentication working but RLS blocking legitimate access
- ❌ Multiple tables without proper RLS protection

### After Fixes
- ✅ All authenticated users can access their own data
- ✅ RLS properly protects data between users
- ✅ No more 42501 permission errors for valid requests
- ✅ Comprehensive security policy coverage
- ✅ Proper error handling and user feedback
- ✅ Scalable authentication architecture

## Emergency Rollback Plan

If issues arise, the following can be executed to restore basic access:

```sql
-- Temporary fix - disable RLS on problematic tables (EMERGENCY ONLY)
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
-- Re-enable with: ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Verify all grants are in place
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
```

**Note**: Only use emergency rollback if critical business functions are affected. The proper fix is to ensure RLS policies are correctly implemented.
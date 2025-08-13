-- Database Monitoring Script for Home Run Records
-- Run these queries regularly to monitor database health and security

-- ==============================================================================
-- 1. CHECK FOR PERMISSION DENIED ERRORS (42501)
-- ==============================================================================

-- Monitor for recent 42501 errors (last 24 hours)
SELECT cast(postgres_logs.timestamp AS datetime) AS timestamp,
       event_message,
       parsed.error_severity,
       parsed.user_name,
       parsed.query,
       parsed.detail,
       parsed.hint,
       parsed.sql_state_code
  FROM postgres_logs 
 WHERE parsed.sql_state_code = '42501'
   AND postgres_logs.timestamp > NOW() - INTERVAL '24 hours'
 ORDER BY timestamp DESC
 LIMIT 50;

-- ==============================================================================
-- 2. VERIFY RLS POLICY COVERAGE
-- ==============================================================================

-- Find tables without any RLS policies
SELECT 'Missing RLS Policies' as check_type,
       tablename as table_name,
       'No policies defined' as issue
FROM pg_tables 
WHERE schemaname = 'public' 
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = pg_tables.tablename 
      AND schemaname = 'public'
  )
ORDER BY tablename;

-- Check tables with RLS enabled but incomplete policy coverage
SELECT 'Incomplete Policy Coverage' as check_type,
       t.tablename,
       'Missing ' || string_agg(required_cmd, ', ') || ' policies' as issue
FROM pg_tables t
CROSS JOIN (VALUES ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) AS cmds(required_cmd)
WHERE t.schemaname = 'public'
  AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid 
              WHERE c.relname = t.tablename AND n.nspname = 'public' AND c.relrowsecurity = true)
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p 
    WHERE p.tablename = t.tablename 
      AND p.schemaname = 'public' 
      AND p.cmd = cmds.required_cmd
  )
GROUP BY t.tablename
HAVING count(*) > 0
ORDER BY t.tablename;

-- ==============================================================================
-- 3. CHECK RLS STATUS FOR ALL TABLES
-- ==============================================================================

-- Show RLS status for all public tables
SELECT c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced,
       COUNT(p.policyname) as policy_count
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid 
LEFT JOIN pg_policies p ON p.tablename = c.relname AND p.schemaname = 'public'
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
ORDER BY c.relname;

-- ==============================================================================
-- 4. VERIFY TABLE PERMISSIONS
-- ==============================================================================

-- Check table privileges for critical roles
SELECT table_name,
       grantee,
       string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.table_privileges 
WHERE grantee IN ('anon', 'authenticated', 'service_role') 
  AND table_schema = 'public'
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- ==============================================================================
-- 5. TEST AUTHENTICATION CONTEXT
-- ==============================================================================

-- Check if auth context is available (should return current user or null)
SELECT auth.uid() as current_auth_user,
       auth.uid() IS NULL as no_auth_context,
       session_user as database_user,
       current_user as current_role;

-- ==============================================================================
-- 6. MONITOR RECENT QUERY PATTERNS
-- ==============================================================================

-- Check for patterns in recent queries that might indicate issues
SELECT parsed.query_preview,
       COUNT(*) as frequency,
       MAX(postgres_logs.timestamp) as last_occurrence,
       string_agg(DISTINCT parsed.sql_state_code, ', ') as error_codes
FROM postgres_logs
WHERE postgres_logs.timestamp > NOW() - INTERVAL '1 hour'
  AND parsed.sql_state_code IS NOT NULL
  AND parsed.sql_state_code != '00000'  -- Exclude successful queries
GROUP BY parsed.query_preview
ORDER BY frequency DESC, last_occurrence DESC
LIMIT 20;

-- ==============================================================================
-- 7. CHECK FOR SPECIFIC GOALS TABLE ISSUES
-- ==============================================================================

-- Test goals table access patterns
SELECT 'Goals Table Health Check' as check_type,
       COUNT(*) as total_goals,
       COUNT(DISTINCT user_id) as unique_users,
       COUNT(DISTINCT section) as unique_sections,
       COUNT(DISTINCT record_type) as unique_record_types,
       MIN(created_at) as oldest_goal,
       MAX(created_at) as newest_goal
FROM goals;

-- Check for orphaned goals (users that don't exist)
SELECT 'Orphaned Goals' as check_type,
       g.user_id,
       COUNT(*) as orphaned_count
FROM goals g
LEFT JOIN auth.users u ON g.user_id = u.id
WHERE u.id IS NULL
GROUP BY g.user_id;

-- ==============================================================================
-- 8. PERFORMANCE MONITORING
-- ==============================================================================

-- Check for slow queries involving RLS
SELECT 'Slow RLS Queries' as check_type,
       parsed.query_preview,
       AVG(parsed.duration) as avg_duration_ms,
       COUNT(*) as frequency
FROM postgres_logs
WHERE postgres_logs.timestamp > NOW() - INTERVAL '1 hour'
  AND parsed.duration > 1000  -- Queries taking more than 1 second
  AND (parsed.query_preview ILIKE '%auth.uid%' OR parsed.query_preview ILIKE '%rls%')
GROUP BY parsed.query_preview
ORDER BY avg_duration_ms DESC;

-- ==============================================================================
-- 9. SECURITY AUDIT
-- ==============================================================================

-- Check for any policies that might be too permissive
SELECT 'Security Audit' as check_type,
       schemaname,
       tablename,
       policyname,
       cmd,
       CASE 
         WHEN qual = 'true' THEN 'WARNING: Permissive policy (true)'
         WHEN qual LIKE '%auth.uid()%' THEN 'Good: Uses auth.uid()'
         ELSE 'Review: ' || qual
       END as policy_assessment
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ==============================================================================
-- 10. GENERATE SUMMARY REPORT
-- ==============================================================================

-- Overall database health summary
SELECT 'Database Health Summary' as report_type,
       (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
       (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies,
       (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
       (SELECT COUNT(*) FROM postgres_logs 
        WHERE parsed.sql_state_code = '42501' 
          AND postgres_logs.timestamp > NOW() - INTERVAL '24 hours') as permission_errors_24h,
       NOW() as report_generated_at;

-- ==============================================================================
-- USAGE INSTRUCTIONS
-- ==============================================================================

/*
TO USE THIS MONITORING SCRIPT:

1. Run sections individually based on your monitoring needs:
   - Section 1: Daily check for permission errors
   - Section 2-3: Weekly verification of RLS policies
   - Section 4: After any schema changes
   - Section 5: When debugging authentication issues
   - Section 6-8: Performance monitoring (hourly/daily)
   - Section 9: Security audit (weekly)
   - Section 10: Overall health check (daily)

2. Set up automated monitoring:
   - Schedule sections 1, 6, 10 to run hourly
   - Schedule sections 2-5, 7-9 to run daily
   - Alert on any results from sections 1, 2, 9

3. Thresholds for alerts:
   - Any 42501 errors in last hour: Immediate alert
   - Tables without RLS policies: Daily alert
   - Slow queries > 5 seconds: Performance alert
   - Orphaned data: Data integrity alert

4. Integration with application monitoring:
   - Log query results to application monitoring system
   - Set up dashboards for key metrics
   - Create alerts based on error patterns
*/
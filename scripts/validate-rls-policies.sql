-- RLS Policy Recursion Detection Script
-- Identifies policies that may cause infinite recursion and 42P17 errors
-- Run this to detect problematic RLS patterns before they cause issues

-- Check for RLS recursion patterns
WITH policy_analysis AS (
    SELECT 
        schemaname,
        tablename,
        policyname,
        cmd,
        qual,
        with_check,
        permissive,
        roles,
        CASE 
            -- Check for direct auth.uid() usage in profiles table (causes recursion)
            WHEN tablename = 'profiles' 
                 AND qual LIKE '%auth.uid()%' 
                 AND qual NOT LIKE '%(SELECT auth.uid())%'
            THEN 'POTENTIAL RECURSION: Uses auth.uid() instead of (SELECT auth.uid()) in qual'
            
            WHEN tablename = 'profiles'
                 AND with_check LIKE '%auth.uid()%' 
                 AND with_check NOT LIKE '%(SELECT auth.uid())%'
            THEN 'POTENTIAL RECURSION: Uses auth.uid() instead of (SELECT auth.uid()) in with_check'
            
            -- Check for self-referencing subqueries in profiles
            WHEN tablename = 'profiles'
                 AND (qual LIKE '%FROM%profiles%' OR with_check LIKE '%FROM%profiles%')
            THEN 'WARNING: Self-referencing subquery in profiles table may cause recursion'
            
            -- Check for complex nested queries that might timeout
            WHEN (qual LIKE '%EXISTS%SELECT%FROM%profiles%' 
                  OR with_check LIKE '%EXISTS%SELECT%FROM%profiles%')
                 AND tablename != 'profiles'
            THEN 'INFO: Complex profile lookup - consider caching or simplifying'
            
            ELSE 'OK'
        END as status
    FROM pg_policies
    WHERE schemaname = 'public'
),
problem_policies AS (
    SELECT * FROM policy_analysis WHERE status != 'OK'
)

-- Report results
SELECT 
    '=== RLS POLICY ANALYSIS ===' as report
UNION ALL
SELECT 
    'Found ' || COUNT(*) || ' potential issues' as report
FROM problem_policies
UNION ALL
SELECT '' as report
UNION ALL
SELECT 
    'Table: ' || tablename || ', Policy: ' || policyname || ', Command: ' || cmd || E'\n' ||
    'Issue: ' || status || E'\n'
FROM problem_policies
UNION ALL
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN E'\n✅ No RLS recursion issues detected'
        ELSE E'\n⚠️  Found ' || COUNT(*) || ' policies that may cause recursion or performance issues'
    END as report
FROM problem_policies;

-- Additional check for common problematic patterns
SELECT E'\n=== DETAILED POLICY CHECK ===' as details
UNION ALL
SELECT 
    'Policy: ' || policyname || ' on ' || tablename || E'\n' ||
    'Definition: ' || COALESCE(qual, with_check) as details
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND (
    -- Direct auth.uid() without SELECT wrapper
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(SELECT auth.uid())%')
  )
LIMIT 5;

-- Performance impact assessment
SELECT E'\n=== PERFORMANCE IMPACT ===' as impact
UNION ALL
SELECT 
    'Table: ' || tablename || ' has ' || COUNT(*) || ' policies'
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) > 3
ORDER BY COUNT(*) DESC;

-- Recommendations
SELECT E'\n=== RECOMMENDATIONS ===' as recommendations
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
              AND tablename = 'profiles'
              AND (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid())%')
        )
        THEN '1. Replace auth.uid() with (SELECT auth.uid()) in profiles table policies'
        ELSE '1. ✓ Profiles policies are using correct auth.uid() pattern'
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public'
              AND (qual LIKE '%FROM%profiles%WHERE%' OR with_check LIKE '%FROM%profiles%WHERE%')
              AND tablename != 'profiles'
        )
        THEN '2. Consider caching profile lookups or using simpler join patterns'
        ELSE '2. ✓ No complex profile lookups detected'
    END
UNION ALL
SELECT 
    '3. Always test RLS policies with EXPLAIN ANALYZE to check performance'
UNION ALL
SELECT 
    '4. Monitor slow query logs for policies causing timeouts';
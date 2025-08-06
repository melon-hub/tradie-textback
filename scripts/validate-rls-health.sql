-- RLS HEALTH CHECK SCRIPT
-- Run this to detect potential RLS recursion issues BEFORE they cause problems

-- 1. Check for dangerous recursive patterns in profiles policies
WITH dangerous_policies AS (
  SELECT 
    policyname,
    tablename,
    qual::text as policy_definition,
    CASE 
      WHEN qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%' 
        THEN '❌ DANGER: Uses auth.uid() directly - will cause recursion!'
      WHEN qual::text LIKE '%EXISTS%SELECT%FROM%profiles%' 
        THEN '❌ DANGER: Queries profiles table within profiles policy - recursion!'
      WHEN qual::text LIKE '%jwt()%' 
        THEN '⚠️  WARNING: Uses JWT claims - may not work with dev tools'
      ELSE '✅ SAFE'
    END as risk_level
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'profiles'
)
SELECT * FROM dangerous_policies WHERE risk_level != '✅ SAFE';

-- 2. Show all current profiles policies for review
SELECT 
  '📋 Current Policy' as status,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 3. Test if basic profile fetch works (should complete in < 1 second)
DO $$
DECLARE
  start_time timestamp;
  end_time timestamp;
  test_result record;
BEGIN
  start_time := clock_timestamp();
  
  -- Try to fetch a profile (this will timeout if RLS is broken)
  BEGIN
    SELECT COUNT(*) INTO test_result FROM public.profiles LIMIT 1;
    end_time := clock_timestamp();
    RAISE NOTICE '✅ Profile fetch test PASSED in % ms', 
      EXTRACT(MILLISECOND FROM (end_time - start_time));
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Profile fetch test FAILED: %', SQLERRM;
  END;
END $$;

-- 4. Summary of RLS status across all tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '🔒 RLS Enabled'
    ELSE '🔓 RLS Disabled (SECURITY RISK!)'
  END as rls_status,
  COUNT(policyname) as policy_count
FROM pg_policies 
RIGHT JOIN pg_tables ON pg_policies.tablename = pg_tables.tablename 
  AND pg_policies.schemaname = pg_tables.schemaname
WHERE pg_tables.schemaname = 'public'
GROUP BY pg_tables.schemaname, pg_tables.tablename, rowsecurity
ORDER BY tablename;
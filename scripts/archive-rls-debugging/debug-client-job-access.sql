-- DEBUG: Why can't clients see job details?

-- 1. Check current user's profile
SELECT 
    'Your Profile' as check,
    user_id,
    phone,
    name,
    user_type
FROM profiles
WHERE user_id = auth.uid();

-- 2. Check if there are jobs with your phone
SELECT 
    'Jobs with your phone' as check,
    COUNT(*) as job_count
FROM jobs
WHERE phone = (SELECT phone FROM profiles WHERE user_id = auth.uid());

-- 3. Show sample jobs to see phone numbers
SELECT 
    'Sample jobs' as check,
    id,
    customer_name,
    phone,
    status
FROM jobs
LIMIT 5;

-- 4. Check specific job (replace with actual job ID from URL)
-- Example: If URL is /job/abc-123, use 'abc-123'
SELECT 
    'Specific job' as check,
    id,
    customer_name,
    phone,
    client_id,
    status
FROM jobs
WHERE id = 'REPLACE_WITH_JOB_ID_FROM_URL';

-- 5. Check RLS policies on jobs table
SELECT 
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies
WHERE tablename = 'jobs'
AND schemaname = 'public'
ORDER BY policyname;

-- 6. Test if removing phone check helps
-- This shows what the client SHOULD be able to see
SELECT 
    'Jobs visible to client without phone check' as check,
    id,
    customer_name,
    phone
FROM jobs
WHERE id = 'REPLACE_WITH_JOB_ID_FROM_URL';
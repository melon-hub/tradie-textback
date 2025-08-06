-- VERIFY APP FUNCTIONALITY
-- Run these tests to ensure everything works after RLS fixes

-- 1. Test your profile loads
SELECT 
    'Your profile' as test,
    id, 
    user_id, 
    name, 
    user_type, 
    role,
    is_admin
FROM profiles 
WHERE user_id = auth.uid();

-- 2. Test if you're a tradie
SELECT 
    'Are you a tradie?' as test,
    CASE 
        WHEN user_type = 'tradie' THEN 'Yes - you should see all profiles'
        ELSE 'No - you should only see your own profile'
    END as access_level
FROM profiles 
WHERE user_id = auth.uid();

-- 3. Count how many profiles you can see
SELECT 
    'Profile visibility' as test,
    COUNT(*) as profiles_you_can_see,
    (SELECT COUNT(*) FROM profiles) as total_profiles_in_db
FROM profiles;

-- 4. Test jobs access (should work normally)
SELECT 
    'Jobs access' as test,
    COUNT(*) as jobs_you_can_see
FROM jobs;

-- 5. Performance check - should be fast now
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 6. Final status
SELECT 
    '🎉 If all tests passed, your app should work now!' as message,
    'Try refreshing your browser and accessing the dashboard' as action;
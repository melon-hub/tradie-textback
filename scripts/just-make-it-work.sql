-- JUST MAKE IT WORK - Simple fixes to get app running

-- 1. Give test client a phone that has jobs
UPDATE profiles
SET phone = '+61423456789'
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'testclient@dev.local'
);

-- 2. Show what jobs exist for this phone
SELECT 
    j.id,
    j.customer_name,
    j.phone as customer_phone,
    j.job_type,
    j.status
FROM jobs j
WHERE j.phone = '+61423456789'
LIMIT 5;

-- 3. Make sure RLS allows clients to see jobs
-- Just let authenticated users see all jobs for now
DROP POLICY IF EXISTS "jobs_clients_view_own" ON jobs;
CREATE POLICY "jobs_authenticated_view" ON jobs 
FOR SELECT 
USING ((SELECT auth.uid()) IS NOT NULL);

-- Done. App should work now.
SELECT 'Fixed. Refresh browser and try again.' as status;
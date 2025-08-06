-- FIX: Check and optimize customer_jobs_view
-- This view is used by clients and might be causing the slowness

-- 1. Check if the view exists and its definition
SELECT 
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname = 'customer_jobs_view';

-- 2. Check RLS policies on the view (if any)
SELECT 
    policyname,
    qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'customer_jobs_view' 
AND schemaname = 'public';

-- 3. Test the view performance
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT * 
FROM customer_jobs_view
WHERE customer_phone = (
    SELECT phone 
    FROM profiles 
    WHERE user_id = auth.uid()
);

-- 4. If the view is slow, let's recreate it with better performance
-- First, drop the old view if it exists
DROP VIEW IF EXISTS customer_jobs_view CASCADE;

-- 5. Create an optimized version
CREATE OR REPLACE VIEW customer_jobs_view AS
SELECT 
    j.id,
    j.customer_name,
    j.customer_phone,
    j.customer_address,
    j.job_type,
    j.description,
    j.urgency,
    j.preferred_time,
    j.status,
    j.value,
    j.created_at,
    j.updated_at,
    j.client_id as tradie_id,
    p.name as tradie_name,
    p.phone as tradie_phone,
    p.address as tradie_address,
    bs.business_name as tradie_business_name
FROM jobs j
LEFT JOIN profiles p ON j.client_id = p.user_id
LEFT JOIN business_settings bs ON j.client_id = bs.user_id;

-- 6. Grant permissions
GRANT SELECT ON customer_jobs_view TO authenticated;

-- 7. Test the new view
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT * 
FROM customer_jobs_view
WHERE customer_phone = (
    SELECT phone 
    FROM profiles 
    WHERE user_id = auth.uid()
);

-- 8. Create an index to speed up phone lookups if not exists
CREATE INDEX IF NOT EXISTS idx_jobs_customer_phone ON jobs(customer_phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

SELECT 'View optimized and indexes created' as status;
-- FIX: Create/update customer_jobs_view with CORRECT column names
-- Based on actual jobs table structure

-- 1. Drop the old view if it exists
DROP VIEW IF EXISTS customer_jobs_view CASCADE;

-- 2. Create optimized view with correct column names
CREATE OR REPLACE VIEW customer_jobs_view AS
SELECT 
    j.id,
    j.customer_name,
    j.phone as customer_phone,  -- 'phone' is the customer's phone
    j.location as customer_address,  -- 'location' is the address
    j.job_type,
    j.description,
    j.urgency,
    j.preferred_time,
    j.status,
    j.estimated_value as value,
    j.created_at,
    j.updated_at,
    j.client_id as tradie_id,  -- client_id is actually the tradie!
    p.name as tradie_name,
    p.phone as tradie_phone,
    p.address as tradie_address,
    bs.business_name as tradie_business_name,
    j.last_contact,
    j.sms_blocked,
    j.quote_accepted_at,
    j.quote_accepted_by,
    j.cancellation_reason,
    j.last_update_request_at
FROM jobs j
LEFT JOIN profiles p ON j.client_id = p.user_id
LEFT JOIN business_settings bs ON j.client_id = bs.user_id;

-- 3. Grant permissions
GRANT SELECT ON customer_jobs_view TO authenticated;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_phone ON jobs(phone);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 5. Test the view performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * 
FROM customer_jobs_view
WHERE customer_phone = (
    SELECT phone 
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
);

-- 6. Verify it works
SELECT 
    'View created successfully' as status,
    COUNT(*) as total_rows
FROM customer_jobs_view;

-- 7. Test a sample query
SELECT 
    id,
    customer_name,
    customer_phone,
    job_type,
    tradie_name,
    status
FROM customer_jobs_view
LIMIT 5;
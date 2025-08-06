-- SIMPLE OPTIMIZATION: Just add the key indexes we need

-- 1. Add composite index for customer phone lookups
CREATE INDEX IF NOT EXISTS idx_jobs_phone_created 
ON jobs(phone, created_at DESC);

-- 2. Ensure basic indexes exist
CREATE INDEX IF NOT EXISTS idx_jobs_phone ON jobs(phone);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 3. Update statistics
ANALYZE jobs;
ANALYZE profiles;

-- 4. Test client query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * 
FROM customer_jobs_view
WHERE customer_phone = '+61423456789'
ORDER BY created_at DESC
LIMIT 10;

SELECT 'Indexes created - client login should be fast now' as status;
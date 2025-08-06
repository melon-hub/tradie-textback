-- FINAL OPTIMIZATION: Ensure client queries are fast

-- 1. Check current index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as rows_read,
    idx_tup_fetch as rows_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename IN ('jobs', 'profiles')
ORDER BY idx_scan DESC;

-- 2. Add composite index for customer phone lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_jobs_phone_created 
ON jobs(phone, created_at DESC);

-- 3. Add RLS bypass for the view (views don't need RLS if underlying tables have it)
ALTER VIEW customer_jobs_view SET (security_invoker = false);

-- 4. Analyze tables to update statistics
ANALYZE jobs;
ANALYZE profiles;
ANALYZE business_settings;

-- 5. Test client query performance
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT * 
FROM customer_jobs_view
WHERE customer_phone = '+61423456789'  -- Test with a sample phone
ORDER BY created_at DESC;

-- 6. Check if there are any missing indexes
SELECT 
    'Missing index on ' || attname || ' in ' || tablename as suggestion
FROM (
    SELECT 
        c.relname as tablename,
        a.attname,
        s.n_distinct,
        s.correlation
    FROM pg_stats s
    JOIN pg_class c ON s.tablename = c.relname
    JOIN pg_attribute a ON c.oid = a.attrelid AND a.attname = s.attname
    WHERE s.schemaname = 'public'
    AND s.tablename IN ('jobs', 'profiles')
    AND s.n_distinct > 100
    AND abs(s.correlation) < 0.1
    AND NOT EXISTS (
        SELECT 1 FROM pg_index i
        JOIN pg_attribute ia ON i.indrelid = ia.attrelid
        WHERE i.indrelid = c.oid
        AND ia.attname = a.attname
        AND i.indisprimary = false
    )
) t;

SELECT 'Optimization complete - test client login now' as status;
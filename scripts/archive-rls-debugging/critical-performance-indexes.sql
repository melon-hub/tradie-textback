-- Critical Performance Indexes
-- Apply these in Supabase SQL Editor to fix the 30+ second load times
-- These are completely safe - they use "IF NOT EXISTS"

-- =============================================================================
-- CRITICAL PERFORMANCE INDEXES
-- =============================================================================

-- 1. MOST CRITICAL: profiles.user_id index
-- This is the main cause of 30+ second load times in useAuth hook
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 2. User type filtering index  
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- 3. Composite index for admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_admin ON profiles(user_id, is_admin);

-- 4. Jobs client relationship index
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);

-- 5. Jobs status filtering index
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check that indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE indexname IN (
    'idx_profiles_user_id',
    'idx_profiles_user_type', 
    'idx_profiles_user_id_is_admin',
    'idx_jobs_client_id',
    'idx_jobs_status'
)
ORDER BY tablename, indexname;

-- Test profile query performance (should be very fast now)
EXPLAIN ANALYZE 
SELECT * FROM profiles 
WHERE user_id = (SELECT user_id FROM profiles LIMIT 1);

-- =============================================================================
-- EXPECTED RESULTS
-- =============================================================================

-- After applying these indexes:
-- - Profile queries: 30+ seconds → <500ms  
-- - Admin dashboard: Should load in seconds, not minutes
-- - Authentication: Should be nearly instant
-- - Jobs queries: Much faster filtering by client_id and status

-- =============================================================================
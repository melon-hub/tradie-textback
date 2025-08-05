-- Database Constraint Validation Script
-- Run this in Supabase SQL Editor to verify constraints match expectations

-- 1. Check all constraints on jobs table
SELECT 
    '=== JOBS TABLE CONSTRAINTS ===' as section;

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'jobs'::regclass 
AND contype = 'c'
ORDER BY conname;

-- 2. Verify expected job status values
SELECT 
    '=== EXPECTED JOB STATUSES ===' as section;

WITH expected_statuses AS (
    SELECT unnest(ARRAY['new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled']) as status
),
actual_statuses AS (
    SELECT DISTINCT status FROM jobs
)
SELECT 
    e.status,
    CASE WHEN a.status IS NOT NULL THEN '✓ Used' ELSE '✗ Not used' END as in_database,
    CASE 
        WHEN e.status = ANY(ARRAY['new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled']) 
        THEN '✓ Valid' 
        ELSE '✗ Invalid' 
    END as constraint_check
FROM expected_statuses e
LEFT JOIN actual_statuses a ON e.status = a.status
ORDER BY e.status;

-- 3. Find any invalid statuses in database
SELECT 
    '=== INVALID STATUSES IN DATABASE ===' as section;

SELECT 
    status, 
    COUNT(*) as count
FROM jobs
WHERE status NOT IN ('new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled')
GROUP BY status
ORDER BY count DESC;

-- 4. Check urgency constraint
SELECT 
    '=== URGENCY CONSTRAINT ===' as section;

SELECT DISTINCT urgency 
FROM jobs 
WHERE urgency NOT IN ('low', 'medium', 'high', 'urgent')
ORDER BY urgency;

-- 5. Summary of all check constraints
SELECT 
    '=== ALL CHECK CONSTRAINTS IN DATABASE ===' as section;

SELECT 
    n.nspname AS schema,
    c.relname AS table_name,
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype = 'c'
AND n.nspname = 'public'
ORDER BY c.relname, con.conname;
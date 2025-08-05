-- Comprehensive Database Validation Script
-- This script provides detailed validation of database structure, constraints, and data integrity
-- Run this in Supabase SQL Editor or via psql for detailed database health checks

-- Header
SELECT '=== COMPREHENSIVE DATABASE VALIDATION ===' as section;

-- 1. Table Structure Validation
SELECT '=== 1. TABLE STRUCTURE VALIDATION ===' as section;

-- Check if all expected tables exist
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        'profiles', 
        'jobs', 
        'job_photos', 
        'twilio_settings', 
        'tenant_sms_templates',
        'business_settings'
    ]) as table_name
),
actual_tables AS (
    SELECT tablename as table_name 
    FROM pg_tables 
    WHERE schemaname = 'public'
)
SELECT 
    e.table_name,
    CASE WHEN a.table_name IS NOT NULL THEN '✓ Exists' ELSE '✗ Missing' END as status,
    CASE WHEN a.table_name IS NULL THEN 'CREATE TABLE required' ELSE 'OK' END as action_needed
FROM expected_tables e
LEFT JOIN actual_tables a ON e.table_name = a.table_name
ORDER BY e.table_name;

-- 2. Column Structure Validation
SELECT '=== 2. CRITICAL COLUMN VALIDATION ===' as section;

-- Check critical columns exist
SELECT 
    'jobs table has client_id column' as check_description,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'client_id'
    ) THEN '✓ Present' ELSE '✗ Missing' END as status;

SELECT 
    'profiles table has user_type column' as check_description,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_type'
    ) THEN '✓ Present' ELSE '✗ Missing' END as status;

SELECT 
    'jobs table has status column' as check_description,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'status'
    ) THEN '✓ Present' ELSE '✗ Missing' END as status;

-- 3. Constraint Validation
SELECT '=== 3. CONSTRAINT VALIDATION ===' as section;

-- Job status constraint
SELECT 
    'Job Status Constraint' as constraint_type,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition,
    CASE 
        WHEN pg_get_constraintdef(oid) LIKE '%new%' 
        AND pg_get_constraintdef(oid) LIKE '%contacted%'
        AND pg_get_constraintdef(oid) LIKE '%quoted%'
        AND pg_get_constraintdef(oid) LIKE '%scheduled%'
        AND pg_get_constraintdef(oid) LIKE '%completed%'
        AND pg_get_constraintdef(oid) LIKE '%cancelled%'
        THEN '✓ Complete'
        ELSE '⚠ Incomplete or missing'
    END as validation_status
FROM pg_constraint 
WHERE conrelid = 'jobs'::regclass 
AND contype = 'c'
AND conname LIKE '%status%';

-- User type constraint
SELECT 
    'User Type Constraint' as constraint_type,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition,
    CASE 
        WHEN pg_get_constraintdef(oid) LIKE '%client%' 
        AND pg_get_constraintdef(oid) LIKE '%tradie%'
        THEN '✓ Complete'
        ELSE '⚠ Incomplete or missing'
    END as validation_status
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'c'
AND conname LIKE '%user_type%';

-- 4. Data Integrity Checks
SELECT '=== 4. DATA INTEGRITY CHECKS ===' as section;

-- Jobs without client_id
SELECT 
    'Jobs without client_id' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ No orphaned jobs'
        ELSE '⚠ ' || COUNT(*) || ' jobs missing client_id'
    END as status
FROM jobs 
WHERE client_id IS NULL;

-- Jobs with invalid status
SELECT 
    'Jobs with invalid status' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ All statuses valid'
        ELSE '❌ ' || COUNT(*) || ' jobs with invalid status'
    END as status
FROM jobs 
WHERE status NOT IN ('new', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled');

-- Profiles with invalid user_type
SELECT 
    'Profiles with invalid user_type' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ All user types valid'
        ELSE '❌ ' || COUNT(*) || ' profiles with invalid user_type'
    END as status
FROM profiles 
WHERE user_type NOT IN ('client', 'tradie');

-- Job photos without corresponding jobs
SELECT 
    'Orphaned job photos' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ No orphaned photos'
        ELSE '⚠ ' || COUNT(*) || ' photos without jobs'
    END as status
FROM job_photos jp
LEFT JOIN jobs j ON jp.job_id = j.id
WHERE j.id IS NULL;

-- 5. RLS Policy Validation
SELECT '=== 5. RLS POLICY VALIDATION ===' as section;

-- Check if RLS is enabled on critical tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✓ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('jobs', 'profiles', 'job_photos')
ORDER BY tablename;

-- Count of policies per table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ Has policies'
        ELSE '⚠ No policies'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('jobs', 'profiles', 'job_photos')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 6. Index Validation
SELECT '=== 6. INDEX VALIDATION ===' as section;

-- Check for indexes on foreign keys and frequently queried columns
SELECT 
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name,
    CASE 
        WHEN i.relname IS NOT NULL THEN '✓ Indexed'
        ELSE '⚠ Consider indexing'
    END as index_status
FROM pg_class t
JOIN pg_attribute a ON t.oid = a.attrelid
LEFT JOIN pg_index ix ON t.oid = ix.indrelid AND a.attnum = ANY(ix.indkey)
LEFT JOIN pg_class i ON i.oid = ix.indexrelid
WHERE t.relkind = 'r'
AND t.relname IN ('jobs', 'profiles', 'job_photos')
AND a.attname IN ('client_id', 'user_id', 'job_id', 'created_at', 'status', 'user_type')
AND NOT a.attisdropped
ORDER BY t.relname, a.attname;

-- 7. Function and Trigger Validation
SELECT '=== 7. FUNCTION AND TRIGGER VALIDATION ===' as section;

-- Check for expected functions
SELECT 
    proname as function_name,
    prosrc as function_body_preview,
    CASE 
        WHEN proname IS NOT NULL THEN '✓ Function exists'
        ELSE '⚠ Function missing'
    END as status
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'update_updated_at_column')
ORDER BY proname;

-- Check for triggers
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation as trigger_event,
    action_timing,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✓ Trigger active'
        ELSE '⚠ Trigger missing'
    END as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8. Storage and Performance
SELECT '=== 8. STORAGE AND PERFORMANCE VALIDATION ===' as section;

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_total_relation_size(schemaname||'.'||tablename) as total_bytes,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_total_relation_size(schemaname||'.'||tablename) / 1024 / 1024 as total_mb
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('jobs', 'profiles', 'job_photos', 'twilio_settings', 'tenant_sms_templates')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count,
    COUNT(CASE WHEN user_type = 'client' THEN 1 END) as clients,
    COUNT(CASE WHEN user_type = 'tradie' THEN 1 END) as tradies
FROM profiles
UNION ALL
SELECT 
    'jobs' as table_name,
    COUNT(*) as row_count,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_jobs,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_jobs
FROM jobs
UNION ALL
SELECT 
    'job_photos' as table_name,
    COUNT(*) as row_count,
    COUNT(CASE WHEN upload_status = 'completed' THEN 1 END) as completed_uploads,
    COUNT(CASE WHEN upload_status = 'pending' THEN 1 END) as pending_uploads
FROM job_photos;

-- 9. Security Validation
SELECT '=== 9. SECURITY VALIDATION ===' as section;

-- Check for users with elevated privileges (should be minimal)
SELECT 
    rolname as role_name,
    rolsuper as is_superuser,
    rolcreaterole as can_create_roles,
    rolcreatedb as can_create_db,
    CASE 
        WHEN rolsuper THEN '⚠ Superuser privileges'
        WHEN rolcreaterole OR rolcreatedb THEN '⚠ Elevated privileges'
        ELSE '✓ Standard privileges'
    END as privilege_level
FROM pg_roles 
WHERE rolname NOT LIKE 'pg_%' 
AND rolname NOT IN ('postgres', 'supabase_admin', 'supabase_auth_admin')
ORDER BY rolsuper DESC, rolcreaterole DESC, rolcreatedb DESC;

-- 10. Summary Report
SELECT '=== 10. VALIDATION SUMMARY ===' as section;

-- Overall health check
WITH health_checks AS (
    SELECT 'Tables' as category, 
           CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'FAIL' END as status
    FROM pg_tables WHERE schemaname = 'public'
    
    UNION ALL
    
    SELECT 'Constraints' as category,
           CASE WHEN COUNT(*) >= 2 THEN 'PASS' ELSE 'FAIL' END as status
    FROM pg_constraint 
    WHERE conrelid IN ('jobs'::regclass, 'profiles'::regclass) 
    AND contype = 'c'
    
    UNION ALL
    
    SELECT 'RLS Policies' as category,
           CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END as status
    FROM pg_policies 
    WHERE schemaname = 'public'
    
    UNION ALL
    
    SELECT 'Data Integrity' as category,
           CASE WHEN (
               SELECT COUNT(*) FROM jobs WHERE client_id IS NULL
           ) = 0 THEN 'PASS' ELSE 'FAIL' END as status
)
SELECT 
    category,
    status,
    CASE 
        WHEN status = 'PASS' THEN '✅'
        ELSE '❌'
    END as icon
FROM health_checks
ORDER BY 
    CASE WHEN status = 'PASS' THEN 1 ELSE 0 END,
    category;

-- Final message
SELECT 
    'VALIDATION COMPLETE' as message,
    CURRENT_TIMESTAMP as completed_at,
    'Review the results above for any issues that need attention' as next_steps;
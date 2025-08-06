-- FIX CONNECTION POOL ISSUES
-- Your diagnostic showed 14 idle connections which could be causing timeouts

-- 1. Show current connections
SELECT 
    COUNT(*) as total_connections,
    state,
    application_name,
    client_addr
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state, application_name, client_addr
ORDER BY COUNT(*) DESC;

-- 2. Kill idle connections older than 5 minutes (optional - be careful)
-- Uncomment to run:
/*
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes'
  AND pid != pg_backend_pid();
*/

-- 3. Check connection limits
SELECT 
    setting as max_connections
FROM pg_settings 
WHERE name = 'max_connections';

-- 4. Check if we're hitting connection limits
SELECT 
    (SELECT COUNT(*) FROM pg_stat_activity) as current_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
    ROUND(
        (SELECT COUNT(*)::numeric FROM pg_stat_activity) / 
        (SELECT setting::numeric FROM pg_settings WHERE name = 'max_connections') * 100, 2
    ) as percent_used;

-- 5. Test if clearing session storage helps
-- Run this in browser console:
-- sessionStorage.clear();
-- localStorage.clear();
-- Then refresh the page

-- 6. Check if any long-running queries are blocking
SELECT 
    pid,
    usename,
    application_name,
    state,
    query,
    age(now(), query_start) as query_age
FROM pg_stat_activity
WHERE datname = current_database()
  AND state != 'idle'
  AND query_start < NOW() - INTERVAL '10 seconds'
ORDER BY query_start;
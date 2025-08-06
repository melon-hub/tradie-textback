-- CHECK: Which migrations are applied vs which files exist

-- Show all applied migrations in the database
SELECT 
    version,
    name,
    executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;

-- This will show which migrations are actually in the database
-- Compare with the files in /supabase/migrations/ to see if any are unused
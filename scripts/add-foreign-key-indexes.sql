-- =============================================================================
-- Add indexes for unindexed foreign keys
-- =============================================================================
-- These indexes will improve query performance when joining or filtering by job_id
-- =============================================================================

-- Add index for job_links.job_id foreign key
CREATE INDEX IF NOT EXISTS idx_job_links_job_id 
ON public.job_links(job_id);

-- Add index for job_photos.job_id foreign key  
CREATE INDEX IF NOT EXISTS idx_job_photos_job_id
ON public.job_photos(job_id);

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('job_links', 'job_photos')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
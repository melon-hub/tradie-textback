-- Check current job types in the database
SELECT 
  job_type, 
  COUNT(*) as count,
  array_agg(DISTINCT customer_name) as customers
FROM jobs 
GROUP BY job_type 
ORDER BY count DESC;

-- Show all job types with their descriptions for context
SELECT 
  id,
  customer_name,
  job_type,
  description,
  created_at
FROM jobs 
ORDER BY created_at DESC 
LIMIT 20;
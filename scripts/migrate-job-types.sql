-- Migration script to standardize job types to match dropdown options
-- Run this script to convert existing free text job types to standardized trade types

BEGIN;

-- First, let's see what we're working with
CREATE TEMP TABLE job_type_mapping AS
SELECT DISTINCT job_type, COUNT(*) as count
FROM jobs 
WHERE job_type IS NOT NULL AND job_type != ''
GROUP BY job_type;

-- Standard trade types from our dropdown
-- { code: 'plumber', label: 'Plumber' },
-- { code: 'electrician', label: 'Electrician' },
-- { code: 'carpenter', label: 'Carpenter' },
-- { code: 'hvac', label: 'HVAC Technician' },
-- { code: 'handyman', label: 'Handyman' },
-- { code: 'landscaper', label: 'Landscaper' },
-- { code: 'locksmith', label: 'Locksmith' },
-- { code: 'painter', label: 'Painter' },
-- { code: 'tiler', label: 'Tiler' },
-- { code: 'roofer', label: 'Roofer' },

-- Map common variations to standard trade types
UPDATE jobs SET job_type = 'Plumber' 
WHERE LOWER(job_type) SIMILAR TO '%(plumb|leak|tap|drain|water|pipe|toilet|bathroom)%';

UPDATE jobs SET job_type = 'Electrician' 
WHERE LOWER(job_type) SIMILAR TO '%(electric|power|light|outlet|wire|switch|electric)%';

UPDATE jobs SET job_type = 'Carpenter' 
WHERE LOWER(job_type) SIMILAR TO '%(carpent|wood|door|window|cabinet|deck|frame)%';

UPDATE jobs SET job_type = 'HVAC Technician' 
WHERE LOWER(job_type) SIMILAR TO '%(hvac|air|heat|cool|duct|furnace|ac)%';

UPDATE jobs SET job_type = 'Handyman' 
WHERE LOWER(job_type) SIMILAR TO '%(handy|general|repair|fix|maintain|odd job)%';

UPDATE jobs SET job_type = 'Landscaper' 
WHERE LOWER(job_type) SIMILAR TO '%(landscap|garden|lawn|tree|yard)%';

UPDATE jobs SET job_type = 'Locksmith' 
WHERE LOWER(job_type) SIMILAR TO '%(lock|key|secur|door lock)%';

UPDATE jobs SET job_type = 'Painter' 
WHERE LOWER(job_type) SIMILAR TO '%(paint|wall|ceiling|interior|exterior)%';

UPDATE jobs SET job_type = 'Tiler' 
WHERE LOWER(job_type) SIMILAR TO '%(tile|floor|bathroom|kitchen)%';

UPDATE jobs SET job_type = 'Roofer' 
WHERE LOWER(job_type) SIMILAR TO '%(roof|gutter|shingle)%';

-- Default unmapped job types to 'Handyman' (most general)
UPDATE jobs SET job_type = 'Handyman' 
WHERE job_type NOT IN (
  'Plumber', 'Electrician', 'Carpenter', 'HVAC Technician', 
  'Handyman', 'Landscaper', 'Locksmith', 'Painter', 'Tiler', 'Roofer'
) AND (job_type IS NOT NULL AND job_type != '');

-- Show the results
SELECT 
  'After migration:' as status,
  job_type, 
  COUNT(*) as count
FROM jobs 
GROUP BY job_type 
ORDER BY count DESC;

COMMIT;

-- Show final results
SELECT 'Migration completed successfully!' as result;
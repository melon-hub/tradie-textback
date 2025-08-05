-- Populate comprehensive test data for dev users
-- Run this in Supabase SQL editor after creating the users

-- Update profiles with comprehensive data
WITH user_ids AS (
  SELECT 
    id,
    email,
    CASE 
      WHEN email = 'testadmin@dev.local' THEN 'admin'
      WHEN email = 'testtradie@dev.local' THEN 'tradie'
      WHEN email = 'testclient@dev.local' THEN 'client'
    END as role_type
  FROM auth.users 
  WHERE email IN ('testadmin@dev.local', 'testtradie@dev.local', 'testclient@dev.local')
)
UPDATE profiles p
SET 
  name = CASE 
    WHEN u.role_type = 'admin' THEN 'Admin McManager'
    WHEN u.role_type = 'tradie' THEN 'John Plumber'
    WHEN u.role_type = 'client' THEN 'Sarah Homeowner'
  END,
  phone = CASE 
    WHEN u.role_type = 'admin' THEN '+61400111111'
    WHEN u.role_type = 'tradie' THEN '+61400222222'
    WHEN u.role_type = 'client' THEN '+61400333333'
  END,
  business_name = CASE 
    WHEN u.role_type = 'admin' THEN 'Tradie Textback Admin'
    WHEN u.role_type = 'tradie' THEN 'John''s Plumbing Services'
    WHEN u.role_type = 'client' THEN NULL
  END,
  abn = CASE 
    WHEN u.role_type = 'admin' THEN '12345678901'
    WHEN u.role_type = 'tradie' THEN '98765432109'
    WHEN u.role_type = 'client' THEN NULL
  END,
  address = CASE 
    WHEN u.role_type = 'admin' THEN '1 Admin Street, Sydney NSW 2000'
    WHEN u.role_type = 'tradie' THEN '42 Plumber Lane, Parramatta NSW 2150'
    WHEN u.role_type = 'client' THEN '15 Residential Ave, Bondi NSW 2026'
  END,
  trade_primary = CASE 
    WHEN u.role_type = 'tradie' THEN 'plumber'
    ELSE NULL
  END,
  trade_secondary = CASE 
    WHEN u.role_type = 'tradie' THEN ARRAY['gasfitter', 'drainer']
    ELSE NULL
  END,
  years_experience = CASE 
    WHEN u.role_type = 'tradie' THEN 15
    ELSE NULL
  END,
  license_number = CASE 
    WHEN u.role_type = 'tradie' THEN 'PL123456'
    ELSE NULL
  END,
  license_expiry = CASE 
    WHEN u.role_type = 'tradie' THEN (CURRENT_DATE + INTERVAL '2 years')::date
    ELSE NULL
  END,
  insurance_provider = CASE 
    WHEN u.role_type = 'tradie' THEN 'Trade Insurance Co'
    ELSE NULL
  END,
  insurance_expiry = CASE 
    WHEN u.role_type = 'tradie' THEN (CURRENT_DATE + INTERVAL '1 year')::date
    ELSE NULL
  END,
  service_postcodes = CASE 
    WHEN u.role_type = 'tradie' THEN ARRAY['2000', '2150', '2026', '2035', '2040']
    ELSE NULL
  END,
  service_radius_km = CASE 
    WHEN u.role_type = 'tradie' THEN 25
    ELSE NULL
  END,
  callback_window_minutes = CASE 
    WHEN u.role_type = 'tradie' THEN 30
    ELSE NULL
  END,
  after_hours_enabled = CASE 
    WHEN u.role_type = 'tradie' THEN true
    ELSE NULL
  END,
  languages_spoken = CASE 
    WHEN u.role_type = 'tradie' THEN '["English", "Spanish"]'::jsonb
    ELSE NULL
  END,
  specializations = CASE 
    WHEN u.role_type = 'tradie' THEN '["Emergency plumbing", "Hot water systems", "Blocked drains", "Gas fitting"]'::jsonb
    ELSE NULL
  END,
  timezone = 'Australia/Sydney',
  onboarding_completed = true,
  onboarding_step = 5,
  updated_at = now()
FROM user_ids u
WHERE p.user_id = u.id;

-- Delete existing business settings for tradie before inserting
DELETE FROM business_settings 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local');

-- Insert business settings for tradie
INSERT INTO business_settings (user_id, business_name, abn, primary_color, logo_url, operating_hours, service_areas, created_at, updated_at)
SELECT 
  id as user_id,
  'John''s Plumbing Services' as business_name,
  '98765432109' as abn,
  '#1e40af' as primary_color,
  NULL as logo_url,
  '{
    "monday": {"start": "07:00", "end": "17:00"},
    "tuesday": {"start": "07:00", "end": "17:00"},
    "wednesday": {"start": "07:00", "end": "17:00"},
    "thursday": {"start": "07:00", "end": "17:00"},
    "friday": {"start": "07:00", "end": "17:00"},
    "saturday": {"start": "08:00", "end": "14:00"},
    "sunday": {"closed": true}
  }'::jsonb as operating_hours,
  '["Sydney CBD", "Eastern Suburbs", "Inner West", "Parramatta"]'::jsonb as service_areas,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'testtradie@dev.local';

-- Delete existing service locations for tradie before inserting
DELETE FROM service_locations 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local');

-- Insert service locations for tradie
INSERT INTO service_locations (user_id, postcode, suburb, state, travel_time, surcharge, is_active)
SELECT 
  u.id,
  v.postcode,
  v.suburb,
  'NSW',
  v.travel_time,
  v.surcharge,
  true
FROM auth.users u
CROSS JOIN (VALUES 
  ('2000', 'Sydney CBD', 20, 0),
  ('2150', 'Parramatta', 0, 0),
  ('2026', 'Bondi', 30, 25),
  ('2035', 'Maroubra', 35, 25),
  ('2040', 'Leichhardt', 25, 0)
) AS v(postcode, suburb, travel_time, surcharge)
WHERE u.email = 'testtradie@dev.local';

-- Delete existing SMS templates for tradie before inserting
DELETE FROM tenant_sms_templates 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local');

-- Insert SMS templates for tradie
INSERT INTO tenant_sms_templates (user_id, template_type, content, variables, is_active)
SELECT 
  u.id,
  v.template_type,
  v.content,
  v.variables,
  true
FROM auth.users u
CROSS JOIN (VALUES 
  ('missed_call', 'Hi {{customer_name}}, this is {{business_name}}. Thanks for calling! I''ll get back to you about your {{job_type}} within {{callback_window}} minutes.', ARRAY['customer_name', 'business_name', 'job_type', 'callback_window']),
  ('after_hours', 'Hi {{customer_name}}, thanks for calling {{business_name}} after hours. I''ll respond to your {{job_type}} inquiry first thing tomorrow morning.', ARRAY['customer_name', 'business_name', 'job_type']),
  ('job_confirmation', 'Hi {{customer_name}}, your {{job_type}} is scheduled for {{appointment_date}} at {{appointment_time}}. I''ll text you when I''m on my way.', ARRAY['customer_name', 'job_type', 'appointment_date', 'appointment_time']),
  ('appointment_reminder', 'Hi {{customer_name}}, reminder: I''ll be there tomorrow at {{appointment_time}} for your {{job_type}}. Reply CONFIRM or call to reschedule.', ARRAY['customer_name', 'appointment_time', 'job_type']),
  ('follow_up', 'Hi {{customer_name}}, following up on your {{job_type}} inquiry. When would be a good time to discuss? Reply with your preferred time.', ARRAY['customer_name', 'job_type']),
  ('quote_ready', 'Hi {{customer_name}}, your quote for {{job_type}} is ready. Total: ${{quote_amount}}. Valid for 30 days. Reply YES to accept.', ARRAY['customer_name', 'job_type', 'quote_amount']),
  ('invoice_sent', 'Hi {{customer_name}}, invoice #{{invoice_number}} for ${{amount}} has been sent to {{email}}. Due date: {{due_date}}.', ARRAY['customer_name', 'invoice_number', 'amount', 'email', 'due_date'])
) AS v(template_type, content, variables)
WHERE u.email = 'testtradie@dev.local';

-- Delete existing Twilio settings for tradie before inserting
DELETE FROM twilio_settings 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local');

-- Insert Twilio settings for tradie (mock data)
INSERT INTO twilio_settings (user_id, phone_number, status, verified_at, capabilities, webhook_url)
SELECT 
  id,
  '+61400222222',
  'active',
  now(),
  '{"sms": true, "voice": true, "mms": true}'::jsonb,
  'https://tradie-textback.lovable.app/api/twilio/webhook'
FROM auth.users
WHERE email = 'testtradie@dev.local';

-- Delete existing jobs for tradie before inserting new ones
DELETE FROM jobs 
WHERE client_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local');

-- Now insert test jobs
-- Get tradie's user_id for client_id field (confusing naming - client_id is the tradie who owns the job)
INSERT INTO jobs (
  client_id,
  customer_name,
  phone,
  location,
  job_type,
  urgency,
  status,
  description,
  estimated_value,
  preferred_time,
  last_contact,
  sms_blocked,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  v.customer_name,
  v.phone,
  v.location,
  v.job_type,
  v.urgency,
  v.status,
  v.description,
  v.estimated_value,
  v.preferred_time,
  v.last_contact,
  false,
  v.created_at,
  v.updated_at
FROM auth.users u
CROSS JOIN (VALUES
  -- Recent active jobs
  ('Emma Wilson', '+61401234567', '23 Beach Rd, Bondi NSW 2026', 'Blocked Drain', 'urgent', 'new', 
   'Kitchen sink completely blocked, water not draining at all. Tried plunger but no luck.', 
   350, 'ASAP - working from home today', NULL, 
   now() - INTERVAL '2 hours', now() - INTERVAL '2 hours'),
  
  ('David Chen', '+61402345678', '156 King St, Sydney NSW 2000', 'Leaking Tap', 'medium', 'in_progress', 
   'Bathroom tap leaking constantly, wasting water. Located in ensuite bathroom.', 
   180, 'Mornings before 9am or after 5pm', now() - INTERVAL '30 minutes', 
   now() - INTERVAL '1 day', now() - INTERVAL '30 minutes'),
  
  ('Maria Garcia', '+61403456789', '89 Smith St, Parramatta NSW 2150', 'Hot Water System', 'urgent', 'new', 
   'No hot water since yesterday morning. Electric system, about 8 years old.', 
   1200, 'Any time - need hot water urgently', NULL, 
   now() - INTERVAL '4 hours', now() - INTERVAL '4 hours'),
  
  -- Today's jobs
  ('Tom Anderson', '+61404567890', '45 Park Ave, Leichhardt NSW 2040', 'Toilet Repair', 'high', 'new', 
   'Toilet constantly running, water bill getting expensive. Dual flush system.', 
   280, 'Weekday afternoons preferred', NULL, 
   now() - INTERVAL '6 hours', now() - INTERVAL '6 hours'),
  
  ('Sophie Brown', '+61405678901', '12 Ocean View, Maroubra NSW 2035', 'Gas Fitting', 'medium', 'new', 
   'Need gas connection for new cooktop. Already have gas to the house.', 
   450, 'Flexible - work from home Tuesdays/Thursdays', NULL, 
   now() - INTERVAL '8 hours', now() - INTERVAL '8 hours'),
  
  -- Yesterday's jobs
  ('Michael O''Brien', '+61406789012', '78 High St, Sydney NSW 2000', 'Burst Pipe', 'urgent', 'completed', 
   'Pipe burst under kitchen sink, water everywhere. Turned off mains.', 
   580, 'Emergency - come immediately', now() - INTERVAL '20 hours', 
   now() - INTERVAL '25 hours', now() - INTERVAL '18 hours'),
  
  ('Lisa Wang', '+61407890123', '34 Garden Rd, Bondi NSW 2026', 'Shower Installation', 'low', 'in_progress', 
   'Replace old shower unit with new one. Already purchased the unit.', 
   890, 'Weekends preferred', now() - INTERVAL '2 days', 
   now() - INTERVAL '3 days', now() - INTERVAL '1 day'),
  
  -- This week's jobs
  ('James Taylor', '+61408901234', '67 Main St, Parramatta NSW 2150', 'Blocked Toilet', 'high', 'completed', 
   'Guest toilet blocked, plunger not working. Need professional help.', 
   220, 'After 6pm weekdays', now() - INTERVAL '3 days', 
   now() - INTERVAL '4 days', now() - INTERVAL '3 days'),
  
  ('Anna Kowalski', '+61409012345', '90 Station Rd, Leichhardt NSW 2040', 'Tap Installation', 'medium', 'in_progress', 
   'Install new mixer taps in bathroom. Taps already purchased from Bunnings.', 
   320, 'Saturday morning ideal', now() - INTERVAL '4 days', 
   now() - INTERVAL '5 days', now() - INTERVAL '2 days'),
  
  ('Robert Singh', '+61410123456', '23 Queen St, Sydney NSW 2000', 'Water Heater Service', 'low', 'new', 
   'Annual service for gas water heater. No issues, just routine maintenance.', 
   180, 'Any weekday fine', NULL, 
   now() - INTERVAL '5 days', now() - INTERVAL '5 days'),
  
  -- Last week's jobs
  ('Catherine Lee', '+61411234567', '56 Beach Ave, Bondi NSW 2026', 'Bathroom Renovation', 'low', 'completed', 
   'Full bathroom renovation - plumbing rough-in and fit-off.', 
   4500, 'Flexible timing', now() - INTERVAL '7 days', 
   now() - INTERVAL '10 days', now() - INTERVAL '6 days'),
  
  ('Peter Nguyen', '+61412345678', '101 Park Lane, Maroubra NSW 2035', 'Drain Cleaning', 'medium', 'completed', 
   'Regular drain cleaning service for restaurant. Grease trap and floor drains.', 
   380, 'After 10pm when closed', now() - INTERVAL '8 days', 
   now() - INTERVAL '9 days', now() - INTERVAL '8 days'),
  
  -- Older completed jobs
  ('Helen Mitchell', '+61413456789', '44 Rose St, Parramatta NSW 2150', 'Pipe Relocation', 'low', 'completed', 
   'Move washing machine pipes for kitchen renovation.', 
   650, 'Coordinate with builder', now() - INTERVAL '14 days', 
   now() - INTERVAL '20 days', now() - INTERVAL '14 days'),
  
  ('George Adams', '+61414567890', '78 Elm Rd, Leichhardt NSW 2040', 'Gas Leak', 'urgent', 'completed', 
   'Smell gas in laundry room. Very worried about safety.', 
   420, 'Emergency - come now', now() - INTERVAL '21 days', 
   now() - INTERVAL '22 days', now() - INTERVAL '21 days'),
  
  ('Sarah Thompson', '+61415678901', '15 View St, Sydney NSW 2000', 'Install Dishwasher', 'low', 'completed', 
   'Install new dishwasher, need water connection and waste.', 
   280, 'Weekend morning', now() - INTERVAL '30 days', 
   now() - INTERVAL '35 days', now() - INTERVAL '30 days')
) AS v(
  customer_name, phone, location, job_type, urgency, status, 
  description, estimated_value, preferred_time, last_contact, 
  created_at, updated_at
)
WHERE u.email = 'testtradie@dev.local';

-- Add some job photos for completed jobs
-- First, let's check what columns job_photos actually has by inserting with explicit NULL values
INSERT INTO job_photos (job_id, photo_url, storage_path, file_name, file_size, mime_type, upload_status, uploaded_by, retry_count, created_at)
SELECT 
  j.id,
  'https://via.placeholder.com/800x600/0000FF/FFFFFF?text=' || REPLACE(j.customer_name, ' ', '+') || '+Job+Photo',
  'job-photos/' || j.id || '/photo-1.jpg',
  'completed-work-photo.jpg',
  1024000,
  'image/jpeg',
  'pending', -- Try 'pending' instead of 'completed' as it might be the allowed value
  'tradie',
  0, -- retry_count
  now() -- created_at
FROM jobs j
WHERE j.client_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local')
  AND j.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM job_photos jp WHERE jp.job_id = j.id
  )
LIMIT 5;

-- Create some job links for recent jobs
INSERT INTO job_links (job_id, token, expires_at, created_for_phone, accessed_count)
SELECT 
  j.id,
  encode(gen_random_bytes(32), 'hex'),
  now() + INTERVAL '30 days',
  j.phone,
  0
FROM jobs j
WHERE j.client_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local')
  AND j.created_at > now() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM job_links jl WHERE jl.job_id = j.id
  )
LIMIT 3;

-- Verify the data
SELECT 'Test data population complete!' as message;

-- Show summary of what was created
SELECT 
  'Profiles updated' as item,
  COUNT(*) as count
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email IN ('testadmin@dev.local', 'testtradie@dev.local', 'testclient@dev.local')
UNION ALL
SELECT 
  'Jobs created' as item,
  COUNT(*) as count
FROM jobs j
WHERE j.client_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local')
UNION ALL
SELECT 
  'SMS templates created' as item,
  COUNT(*) as count
FROM tenant_sms_templates t
WHERE t.user_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local')
UNION ALL
SELECT 
  'Service locations created' as item,
  COUNT(*) as count
FROM service_locations s
WHERE s.user_id = (SELECT id FROM auth.users WHERE email = 'testtradie@dev.local');
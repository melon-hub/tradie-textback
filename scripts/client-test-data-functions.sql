-- Client Test Data Functions
-- These functions help create test data for client (customer) views

-- Function to create a job request as a client (customer)
-- This simulates what happens when a customer submits the intake form
CREATE OR REPLACE FUNCTION create_client_job_request(
    tradie_user_id UUID,
    job_type TEXT,
    urgency TEXT,
    description TEXT,
    location TEXT,
    preferred_time TEXT DEFAULT NULL,
    hours_ago INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    new_job_id UUID;
    client_profile RECORD;
BEGIN
    -- Get the current user's profile (the client/customer)
    SELECT * INTO client_profile 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    IF client_profile IS NULL THEN
        RAISE EXCEPTION 'No profile found for current user';
    END IF;
    
    -- Create a job owned by the tradie, but with the client's info
    INSERT INTO jobs (
        client_id, -- This is the tradie who owns the job
        customer_name,
        phone,
        location,
        job_type,
        urgency,
        status,
        description,
        preferred_time,
        created_at,
        updated_at
    ) VALUES (
        tradie_user_id, -- The tradie who will handle this job
        COALESCE(client_profile.name, 'Test Client'),
        COALESCE(client_profile.phone, '+61400333333'), -- Use test client phone as fallback
        location,
        job_type,
        urgency,
        'new',
        description,
        preferred_time,
        NOW() - (hours_ago || ' hours')::INTERVAL,
        NOW() - (hours_ago || ' hours')::INTERVAL
    ) RETURNING id INTO new_job_id;
    
    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create test jobs for the test client
-- This creates jobs that the client has "submitted" to the test tradie
CREATE OR REPLACE FUNCTION create_test_client_jobs()
RETURNS void AS $$
DECLARE
    tradie_id UUID;
    client_profile RECORD;
BEGIN
    -- Get the test tradie's user ID (who will own these jobs)
    SELECT id INTO tradie_id 
    FROM auth.users 
    WHERE email = 'testtradie@dev.local'
    LIMIT 1;
    
    IF tradie_id IS NULL THEN
        -- If can't find test tradie, use any tradie
        SELECT u.id INTO tradie_id 
        FROM auth.users u
        JOIN profiles p ON p.user_id = u.id
        WHERE p.user_type = 'tradie'
        LIMIT 1;
    END IF;
    
    IF tradie_id IS NULL THEN
        RAISE EXCEPTION 'No tradie found to assign jobs to';
    END IF;
    
    -- Get current user's profile
    SELECT * INTO client_profile 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    -- Clear existing jobs for this client's phone number
    IF client_profile.phone IS NOT NULL THEN
        DELETE FROM jobs 
        WHERE client_id = tradie_id 
        AND phone = client_profile.phone;
    END IF;
    
    -- Create various test jobs "submitted" by this client
    
    -- Recent urgent job (2 hours ago)
    PERFORM create_client_job_request(
        tradie_id,
        'Blocked Drain',
        'urgent',
        'Kitchen sink is completely blocked and water is backing up. Need help ASAP!',
        '15 Residential Ave, Bondi NSW 2026',
        'Any time today',
        2
    );
    
    -- Job from yesterday
    PERFORM create_client_job_request(
        tradie_id,
        'Leaking Tap',
        'medium',
        'Bathroom tap has been dripping for a week. Want to get it fixed to save water.',
        '15 Residential Ave, Bondi NSW 2026',
        'Weekday mornings work best',
        26
    );
    
    -- Completed job from last week
    INSERT INTO jobs (
        client_id,
        customer_name,
        phone,
        location,
        job_type,
        urgency,
        status,
        description,
        created_at,
        updated_at,
        last_contact
    ) VALUES (
        tradie_id,
        COALESCE(client_profile.name, 'Test Client'),
        COALESCE(client_profile.phone, '+61400333333'),
        '15 Residential Ave, Bondi NSW 2026',
        'Toilet Repair',
        'high',
        'completed',
        'Toilet was running constantly. Fixed by replacing flush valve.',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    );
    
    RAISE NOTICE 'Created test jobs for client view';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get jobs for the current client based on their phone number
CREATE OR REPLACE FUNCTION get_client_jobs()
RETURNS TABLE(
    id UUID,
    job_type TEXT,
    urgency TEXT,
    status TEXT,
    description TEXT,
    location TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    last_contact TIMESTAMPTZ,
    tradie_name TEXT,
    tradie_phone TEXT,
    tradie_business TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.job_type,
        j.urgency,
        j.status,
        j.description,
        j.location,
        j.created_at,
        j.updated_at,
        j.last_contact,
        p.name as tradie_name,
        p.phone as tradie_phone,
        p.business_name as tradie_business
    FROM jobs j
    LEFT JOIN profiles p ON p.user_id = j.client_id
    WHERE j.phone = (
        SELECT phone 
        FROM profiles 
        WHERE user_id = auth.uid()
    )
    ORDER BY j.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_client_job_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_test_client_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_jobs() TO authenticated;
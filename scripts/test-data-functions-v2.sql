-- Test Data Management Functions V2
-- Updated to work with current user context instead of email lookup

-- Function to clear all test data for current user
CREATE OR REPLACE FUNCTION clear_current_user_test_data()
RETURNS void AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the current user ID from auth context
    user_uuid := auth.uid();
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;
    
    -- Delete in correct order to respect foreign keys
    DELETE FROM job_photos WHERE job_id IN (SELECT id FROM jobs WHERE client_id = user_uuid);
    DELETE FROM job_links WHERE job_id IN (SELECT id FROM jobs WHERE client_id = user_uuid);
    DELETE FROM jobs WHERE client_id = user_uuid;
    DELETE FROM tenant_sms_templates WHERE user_id = user_uuid;
    DELETE FROM twilio_settings WHERE user_id = user_uuid;
    DELETE FROM service_locations WHERE user_id = user_uuid;
    DELETE FROM business_settings WHERE user_id = user_uuid;
    
    RAISE NOTICE 'Cleared all test data for current user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a test job for current user
CREATE OR REPLACE FUNCTION create_test_job_for_current_user(
    customer_name TEXT,
    phone TEXT,
    location TEXT,
    job_type TEXT,
    urgency TEXT,
    status TEXT,
    description TEXT,
    estimated_value NUMERIC,
    hours_ago INTEGER DEFAULT 0,
    last_contact_hours_ago INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    current_user_id UUID;
    new_job_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;
    
    -- Insert the job
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
        created_at,
        updated_at,
        last_contact
    ) VALUES (
        current_user_id,
        customer_name,
        phone,
        location,
        job_type,
        urgency,
        status,
        description,
        estimated_value,
        NOW() - (hours_ago || ' hours')::INTERVAL,
        NOW() - (hours_ago || ' hours')::INTERVAL,
        CASE 
            WHEN last_contact_hours_ago IS NOT NULL 
            THEN NOW() - (last_contact_hours_ago || ' hours')::INTERVAL
            ELSE NULL
        END
    ) RETURNING id INTO new_job_id;
    
    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create time-based test jobs for current user
CREATE OR REPLACE FUNCTION create_time_based_test_jobs_for_current_user()
RETURNS void AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;
    
    -- Clear existing jobs first
    DELETE FROM jobs WHERE client_id = current_user_id;
    
    -- Jobs from different time periods
    -- Just now (< 1 hour)
    PERFORM create_test_job_for_current_user(
        'Emma Wilson', '+61401234567', '23 Beach Rd, Bondi NSW 2026', 
        'Blocked Drain', 'urgent', 'new', 'Kitchen sink blocked - urgent!', 350, 0
    );
    
    -- Today (2-8 hours ago)
    PERFORM create_test_job_for_current_user(
        'David Chen', '+61402345678', '156 King St, Sydney NSW 2000', 
        'Leaking Tap', 'medium', 'new', 'Bathroom tap leaking', 180, 3
    );
    
    PERFORM create_test_job_for_current_user(
        'Maria Garcia', '+61403456789', '89 Smith St, Parramatta NSW 2150', 
        'Hot Water System', 'urgent', 'in_progress', 'No hot water', 1200, 5, 2
    );
    
    -- Yesterday (24-48 hours ago)
    PERFORM create_test_job_for_current_user(
        'Tom Anderson', '+61404567890', '45 Park Ave, Leichhardt NSW 2040', 
        'Toilet Repair', 'high', 'in_progress', 'Toilet running constantly', 280, 28, 24
    );
    
    -- This week (3-7 days ago)
    PERFORM create_test_job_for_current_user(
        'Sophie Brown', '+61405678901', '12 Ocean View, Maroubra NSW 2035', 
        'Gas Fitting', 'medium', 'completed', 'New cooktop gas connection', 450, 72, 48
    );
    
    PERFORM create_test_job_for_current_user(
        'Michael O''Brien', '+61406789012', '78 High St, Sydney NSW 2000', 
        'Burst Pipe', 'urgent', 'completed', 'Emergency pipe repair', 580, 120, 96
    );
    
    -- Last week (7-14 days ago)
    PERFORM create_test_job_for_current_user(
        'Lisa Wang', '+61407890123', '34 Garden Rd, Bondi NSW 2026', 
        'Shower Installation', 'low', 'completed', 'Replace shower unit', 890, 240, 192
    );
    
    -- Two weeks ago
    PERFORM create_test_job_for_current_user(
        'James Taylor', '+61408901234', '67 Main St, Parramatta NSW 2150', 
        'Blocked Toilet', 'high', 'completed', 'Guest toilet blocked', 220, 336, 312
    );
    
    -- Last month (30 days ago)
    PERFORM create_test_job_for_current_user(
        'Anna Kowalski', '+61409012345', '90 Station Rd, Leichhardt NSW 2040', 
        'Tap Installation', 'medium', 'completed', 'Install mixer taps', 320, 720, 696
    );
    
    -- Old jobs (60+ days ago)
    PERFORM create_test_job_for_current_user(
        'Robert Singh', '+61410123456', '23 Queen St, Sydney NSW 2000', 
        'Water Heater Service', 'low', 'completed', 'Annual service', 180, 1440, 1440
    );
    
    RAISE NOTICE 'Created time-based test jobs for current user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get job age statistics for current user
CREATE OR REPLACE FUNCTION get_current_user_job_age_stats()
RETURNS TABLE(
    time_period TEXT,
    job_count BIGINT,
    status_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH job_ages AS (
        SELECT 
            j.*,
            EXTRACT(EPOCH FROM (NOW() - j.created_at)) / 3600 as hours_old
        FROM jobs j
        WHERE j.client_id = auth.uid()
    )
    SELECT 
        CASE 
            WHEN hours_old < 1 THEN 'Last Hour'
            WHEN hours_old < 24 THEN 'Today'
            WHEN hours_old < 48 THEN 'Yesterday'
            WHEN hours_old < 168 THEN 'This Week'
            WHEN hours_old < 336 THEN 'Last Week'
            WHEN hours_old < 720 THEN 'This Month'
            ELSE 'Older'
        END as time_period_label,
        COUNT(*) as count,
        jsonb_object_agg(status, status_count) as breakdown
    FROM (
        SELECT 
            CASE 
                WHEN hours_old < 1 THEN 'Last Hour'
                WHEN hours_old < 24 THEN 'Today'
                WHEN hours_old < 48 THEN 'Yesterday'
                WHEN hours_old < 168 THEN 'This Week'
                WHEN hours_old < 336 THEN 'Last Week'
                WHEN hours_old < 720 THEN 'This Month'
                ELSE 'Older'
            END as time_period_label,
            status,
            COUNT(*) as status_count
        FROM job_ages
        GROUP BY 1, 2
    ) sub
    GROUP BY time_period_label
    ORDER BY 
        CASE time_period_label
            WHEN 'Last Hour' THEN 1
            WHEN 'Today' THEN 2
            WHEN 'Yesterday' THEN 3
            WHEN 'This Week' THEN 4
            WHEN 'Last Week' THEN 5
            WHEN 'This Month' THEN 6
            ELSE 7
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION clear_current_user_test_data() TO authenticated;
GRANT EXECUTE ON FUNCTION create_test_job_for_current_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_time_based_test_jobs_for_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_job_age_stats() TO authenticated;
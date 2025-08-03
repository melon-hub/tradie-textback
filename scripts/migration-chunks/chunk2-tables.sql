-- =============================================================================
-- CHUNK 2: TRADE TYPES AND SERVICE LOCATIONS TABLES
-- =============================================================================
-- Purpose: Create trade types master data and service locations tables
-- Created: 2025-08-03
-- =============================================================================

-- =============================================================================
-- TRADE TYPES TABLE
-- =============================================================================

-- Drop and recreate trade_types table to ensure clean state
DROP TABLE IF EXISTS public.trade_types CASCADE;

CREATE TABLE public.trade_types (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    category TEXT,
    typical_urgency TEXT CHECK (typical_urgency IN ('low', 'medium', 'high')),
    icon_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SERVICE LOCATIONS TABLE
-- =============================================================================

-- Drop and recreate service_locations table to ensure clean state
DROP TABLE IF EXISTS public.service_locations CASCADE;

CREATE TABLE public.service_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    postcode TEXT NOT NULL,
    suburb TEXT,
    state TEXT,
    travel_time INTEGER, -- minutes
    surcharge NUMERIC(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE public.service_locations ADD CONSTRAINT service_locations_travel_time_check 
CHECK (travel_time >= 0 AND travel_time <= 300);

ALTER TABLE public.service_locations ADD CONSTRAINT service_locations_surcharge_check 
CHECK (surcharge >= 0);

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE public.trade_types IS 'Master list of available trade types with metadata';
COMMENT ON TABLE public.service_locations IS 'Specific postcodes where tradies provide services';

COMMENT ON COLUMN public.service_locations.travel_time IS 'Estimated travel time to this location in minutes';
COMMENT ON COLUMN public.service_locations.surcharge IS 'Additional charge for servicing this location';
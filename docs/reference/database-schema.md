# Database Schema Reference

<!-- Created: 2025-08-03 - Complete database schema documentation including onboarding system tables -->
<!-- Updated: 2025-08-05 - Added notification_logs table for job update notifications -->

## Overview

This document provides a comprehensive reference for the TradiePro database schema, including all tables, relationships, and constraints as of the onboarding system implementation (2025-08-03).

## Schema Architecture

### Core Entities
- **Users & Profiles**: User authentication and extended profile data
- **Jobs & Management**: Job creation, tracking, and administration
- **Onboarding System**: Trade types, service areas, templates, and communication setup
- **System Tables**: Configuration, logging, and administrative data

## Table Relationships

```
auth.users (Supabase Auth)
    ├── profiles (1:1) - Extended user data
    │   ├── service_locations (1:many) - Service areas
    │   ├── tenant_sms_templates (1:many) - Custom SMS templates
    │   └── twilio_settings (1:1) - Phone configuration
    ├── jobs (1:many) - Job management
    └── admin_logs (1:many) - Administrative actions

trade_types (Reference) ──→ profiles.trade_primary (FK reference)
```

## Core Tables

### 1. profiles
Extended user profile information with onboarding enhancements.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information (Original)
  phone TEXT UNIQUE,
  display_name TEXT,
  user_type TEXT DEFAULT 'tradie',
  business_postcode TEXT,
  
  -- Trade Classification (2025-08-03)
  trade_primary TEXT REFERENCES trade_types(code),
  trade_secondary TEXT[],
  specializations JSONB DEFAULT '{}'::jsonb,
  years_experience INTEGER CHECK (years_experience >= 0 AND years_experience <= 50),
  
  -- Business Information (2025-08-03)
  business_name TEXT,
  abn TEXT,
  license_number TEXT,
  license_expiry DATE,
  insurance_provider TEXT,
  insurance_expiry DATE,
  
  -- Service Areas (2025-08-03)
  service_postcodes TEXT[],
  service_radius_km NUMERIC(5,2) CHECK (service_radius_km > 0),
  
  -- Communication Preferences (2025-08-03)
  callback_window_minutes INTEGER DEFAULT 60 CHECK (callback_window_minutes > 0),
  after_hours_enabled BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'Australia/Sydney',
  languages_spoken JSONB DEFAULT '[]'::jsonb,
  
  -- Onboarding Tracking (2025-08-03)
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0 CHECK (onboarding_step >= 0 AND onboarding_step <= 10),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `id`: Primary key, references auth.users
- `trade_primary`: Main trade from trade_types table
- `trade_secondary`: Array of additional trades
- `onboarding_step`: Current step in onboarding process (0-10)
- `service_postcodes`: Array of served postcode areas
- `business_name`: Official business trading name

**Constraints:**
- Phone must be unique
- Experience years between 0-50
- Onboarding step between 0-10
- Service radius must be positive

### 2. trade_types
Reference table for trade classification system.

```sql
CREATE TABLE trade_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  typical_urgency TEXT NOT NULL CHECK (typical_urgency IN ('low', 'medium', 'high', 'emergency')),
  icon_name TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default Trade Types:**
| Code | Label | Category | Urgency |
|------|-------|----------|---------|
| plumber | Plumber | services | high |
| electrician | Electrician | services | emergency |
| carpenter | Carpenter | construction | medium |
| hvac | HVAC Technician | services | high |
| handyman | Handyman | maintenance | low |
| landscaper | Landscaper | outdoor | low |
| locksmith | Locksmith | security | emergency |
| painter | Painter | cosmetic | low |
| tiler | Tiler | construction | medium |
| roofer | Roofer | construction | high |

### 3. service_locations
Postcode-based service area management for tradies.

```sql
CREATE TABLE service_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  postcode TEXT NOT NULL CHECK (postcode ~ '^[0-9]{4}$'),
  suburb TEXT,
  state TEXT NOT NULL CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT')),
  travel_time_minutes INTEGER CHECK (travel_time_minutes > 0),
  surcharge_amount NUMERIC(10,2) DEFAULT 0 CHECK (surcharge_amount >= 0),
  is_primary_area BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `user_id`: Links to tradie profile
- `postcode`: 4-digit Australian postcode
- `is_primary_area`: Marks primary service location
- `surcharge_amount`: Additional cost for this area
- `travel_time_minutes`: Estimated travel time

**Constraints:**
- Postcode must be 4 digits
- State must be valid Australian state/territory
- Surcharge amount must be non-negative

### 4. tenant_sms_templates
Customizable SMS templates per tradie.

```sql
CREATE TABLE tenant_sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 1600),
  variables JSONB DEFAULT '[]'::jsonb,
  character_count INTEGER,
  sms_segments INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, template_type, template_name)
);
```

**Template Types:**
- `missed_call`: Response to missed calls
- `after_hours`: After-hours auto-response
- `reminder`: Appointment reminders
- `scheduled_confirm`: Job scheduling confirmation
- `quote_ready`: Quote completion notification
- `followup`: Post-job follow-up
- `custom`: User-defined templates

**Available Variables:**
- `{customer_name}`: Customer's name
- `{business_name}`: Tradie's business name
- `{intake_link}`: Job intake form URL
- `{callback_window}`: Response time commitment
- `{next_business_day}`: Next working day
- `{job_id}`: Job reference number

### 5. twilio_settings
Secure phone number configuration (credentials stored in Vault).

```sql
CREATE TABLE twilio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL CHECK (phone_number ~ '^\+61[0-9]{9}$'),
  phone_sid TEXT NOT NULL,
  webhook_url TEXT,
  forwarding_enabled BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'error')),
  verification_attempts INTEGER DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `phone_number`: Australian format (+61xxxxxxxxx)
- `phone_sid`: Twilio phone number SID
- `webhook_url`: Endpoint for incoming calls/SMS
- `capabilities`: JSON object with voice/sms features
- `status`: Current operational status

**Security Note:** Twilio `account_sid` and `auth_token` are stored in Supabase Vault using key format `twilio_creds_{user_id}`.

## Supporting Tables

### 6. jobs
Job management and tracking (existing table).

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  job_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. admin_logs
Administrative action logging (existing table).

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. notification_logs
Tracks all notifications sent (SMS, email, etc) for audit and debugging (2025-08-05).

```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'push', 'in_app')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notification_logs_job_id ON notification_logs(job_id);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX idx_notification_logs_type_status ON notification_logs(type, status);
```

## Indexes and Performance

### Primary Indexes
All tables have primary key indexes by default.

### Custom Indexes (2025-08-03)

```sql
-- Profile search and filtering
CREATE INDEX idx_profiles_trade_primary ON profiles(trade_primary);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed, onboarding_step);
CREATE INDEX idx_profiles_service_postcodes ON profiles USING GIN(service_postcodes);
CREATE INDEX idx_profiles_business_postcode ON profiles(business_postcode);

-- Service location lookups
CREATE INDEX idx_service_locations_postcode ON service_locations(postcode);
CREATE INDEX idx_service_locations_state ON service_locations(state);
CREATE INDEX idx_service_locations_user_primary ON service_locations(user_id, is_primary_area);

-- SMS template management
CREATE INDEX idx_templates_user_type ON tenant_sms_templates(user_id, template_type, is_active);
CREATE INDEX idx_templates_type_active ON tenant_sms_templates(template_type, is_active);

-- Twilio settings
CREATE INDEX idx_twilio_user_status ON twilio_settings(user_id, status);
CREATE INDEX idx_twilio_phone_number ON twilio_settings(phone_number);

-- Job management (existing)
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX idx_jobs_scheduled ON jobs(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_jobs_created ON jobs(created_at);

-- Trade types reference
CREATE INDEX idx_trade_types_active ON trade_types(is_active, sort_order);
CREATE INDEX idx_trade_types_category ON trade_types(category, is_active);
```

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies.

### Profile Policies
```sql
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);
```

### Service Location Policies
```sql
-- Users can manage their own service locations
CREATE POLICY "Users can manage own service locations" ON service_locations 
FOR ALL USING (auth.uid() = user_id);
```

### SMS Template Policies
```sql
-- Users can manage their own templates
CREATE POLICY "Users can manage own templates" ON tenant_sms_templates 
FOR ALL USING (auth.uid() = user_id);
```

### Twilio Settings Policies
```sql
-- Users can manage their own Twilio settings
CREATE POLICY "Users can manage own Twilio settings" ON twilio_settings 
FOR ALL USING (auth.uid() = user_id);
```

### Admin Policies
```sql
-- Admins can view all profiles (with user_type check)
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.user_type = 'admin'
  )
);
```

## Triggers and Functions

### Updated At Triggers
All tables have automatic `updated_at` timestamp updates:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to all tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### SMS Template Functions
```sql
-- Function to get default SMS template
CREATE OR REPLACE FUNCTION get_default_sms_template(
  p_user_id UUID,
  p_template_type TEXT
)
RETURNS TEXT AS $$
DECLARE
  template_content TEXT;
BEGIN
  SELECT content INTO template_content
  FROM tenant_sms_templates
  WHERE user_id = p_user_id 
    AND template_type = p_template_type 
    AND is_active = true
  ORDER BY is_default DESC, created_at DESC
  LIMIT 1;
  
  RETURN template_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Twilio Security Functions
```sql
-- Function to securely retrieve Twilio credentials
CREATE OR REPLACE FUNCTION get_twilio_credentials(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  -- This function retrieves credentials from Supabase Vault
  -- Implementation depends on Vault API access
  RETURN vault.get_secret(CONCAT('twilio_creds_', p_user_id::text));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Validation and Constraints

### Check Constraints
```sql
-- Profiles
ALTER TABLE profiles ADD CONSTRAINT profiles_phone_format 
CHECK (phone ~ '^04[0-9]{8}$' OR phone ~ '^\+61[0-9]{9}$');

ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_valid 
CHECK (user_type IN ('tradie', 'client', 'admin'));

-- Service Locations
ALTER TABLE service_locations ADD CONSTRAINT service_locations_postcode_format 
CHECK (postcode ~ '^[0-9]{4}$');

-- Twilio Settings
ALTER TABLE twilio_settings ADD CONSTRAINT twilio_phone_format 
CHECK (phone_number ~ '^\+61[0-9]{9}$');

-- SMS Templates
ALTER TABLE tenant_sms_templates ADD CONSTRAINT sms_content_length 
CHECK (LENGTH(content) <= 1600);
```

### Foreign Key Constraints
```sql
-- Profile to trade type
ALTER TABLE profiles ADD CONSTRAINT profiles_trade_primary_fkey 
FOREIGN KEY (trade_primary) REFERENCES trade_types(code);

-- Service locations to user
ALTER TABLE service_locations ADD CONSTRAINT service_locations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- SMS templates to user
ALTER TABLE tenant_sms_templates ADD CONSTRAINT tenant_sms_templates_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Twilio settings to user
ALTER TABLE twilio_settings ADD CONSTRAINT twilio_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## Enums and Reference Values

### User Types
- `tradie`: Service provider
- `client`: Customer (rarely used)
- `admin`: System administrator

### Job Status Values
- `pending`: Awaiting assignment
- `scheduled`: Appointment booked
- `in_progress`: Work underway
- `completed`: Job finished
- `cancelled`: Job cancelled

### Twilio Status Values
- `pending`: Setup in progress
- `active`: Fully operational
- `suspended`: Temporarily disabled
- `error`: Configuration issue

### Trade Categories
- `services`: Emergency/urgent trades (plumber, electrician, hvac, locksmith)
- `construction`: Building trades (carpenter, tiler, roofer)
- `maintenance`: General maintenance (handyman)
- `outdoor`: Outdoor work (landscaper)
- `cosmetic`: Non-urgent improvement (painter)

## Migration History

### Version: 20250803100000_onboarding_schema_secure.sql
**Applied**: 2025-08-03  
**Changes**:
- Enhanced profiles table with 18 new columns
- Added trade_types reference table
- Added service_locations table
- Added tenant_sms_templates table
- Added twilio_settings table (secure version)
- Created indexes for performance
- Set up RLS policies
- Added validation constraints
- Implemented security functions

## TypeScript Type Generation

After schema changes, regenerate types:
```bash
npm run sdb-types
```

**Generated Types Location**: `src/types/database.types.ts`

## Testing Considerations

### Mock Data Requirements
- Valid trade types from reference table
- Australian postcodes for service locations
- SMS templates with variable substitution
- Twilio phone numbers in correct format

### Test Scenarios
- Profile creation with onboarding progression
- Service area configuration and validation
- SMS template CRUD operations
- Twilio settings without exposing credentials

## Common Queries

### Find tradies by trade and location
```sql
SELECT p.*, t.label as trade_label 
FROM profiles p
JOIN trade_types t ON p.trade_primary = t.code
WHERE t.code = 'plumber' 
  AND p.service_postcodes @> ARRAY['2000'];
```

### Get active SMS templates for user
```sql
SELECT * FROM tenant_sms_templates 
WHERE user_id = $1 AND is_active = true 
ORDER BY template_type, is_default DESC;
```

### Check onboarding completion status
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN onboarding_completed THEN 1 END) as completed,
  AVG(onboarding_step) as avg_step
FROM profiles 
WHERE user_type = 'tradie';
```

---

**Last Updated**: 2025-08-03  
**Next Review**: After Phase 3 UI completion  
**Schema Version**: 20250803100000
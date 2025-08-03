# Database Setup and Schema Guide

<!-- Created: 2025-08-03 - Comprehensive database setup and migration guide for onboarding system -->

## Overview

This document provides essential information about the TradiePro database schema, particularly the new onboarding-related tables and migration process implemented on 2025-08-03.

## CRITICAL: Recent Schema Changes (2025-08-03)

The database has been significantly enhanced with onboarding system implementation. **All developers must apply the migration before working with onboarding features.**

### Migration Status
- **Migration File**: `supabase/migrations/20250803100000_onboarding_schema_secure.sql`
- **Security**: Twilio credentials stored in Supabase Vault (not database)
- **Chunked Application**: 9 migration chunks available for step-by-step execution
- **Guide**: See `scripts/apply-onboarding-migration.md` for detailed instructions

## New Tables Added

### 1. Enhanced Profiles Table
The existing `profiles` table has been enhanced with 18 new columns:

**Trade Classification:**
- `trade_primary` TEXT - Primary trade (required)
- `trade_secondary` TEXT[] - Additional trades array
- `specializations` JSONB - Detailed skill areas

**Business Information:**
- `business_name` TEXT - Trading name
- `abn` TEXT - Australian Business Number
- `years_experience` INTEGER - Experience level

**Service Areas:**
- `service_postcodes` TEXT[] - Covered postcode areas
- `service_radius_km` NUMERIC - Service radius (alternative to postcodes)

**Credentials:**
- `license_number` TEXT - Trade license
- `license_expiry` DATE - License expiration
- `insurance_provider` TEXT - Insurance company
- `insurance_expiry` DATE - Insurance expiration

**Onboarding Tracking:**
- `onboarding_completed` BOOLEAN - Completion status
- `onboarding_step` INTEGER - Current step (0-10)

**Communication Preferences:**
- `callback_window_minutes` INTEGER - Response time window
- `after_hours_enabled` BOOLEAN - After-hours availability
- `timezone` TEXT - User timezone
- `languages_spoken` JSONB - Supported languages

### 2. Trade Types Reference Table (`trade_types`)
Master classification system for trade types:

```sql
CREATE TABLE trade_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  typical_urgency TEXT NOT NULL,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Included Trade Types:**
- plumber, electrician, carpenter, hvac
- handyman, landscaper, locksmith, painter
- tiler, roofer

### 3. Service Locations Table (`service_locations`)
Postcode-based service area management:

```sql
CREATE TABLE service_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  postcode TEXT NOT NULL,
  suburb TEXT,
  state TEXT NOT NULL,
  travel_time_minutes INTEGER,
  surcharge_amount NUMERIC(10,2) DEFAULT 0,
  is_primary_area BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. SMS Templates Table (`tenant_sms_templates`)
Customizable SMS templates per tradie:

```sql
CREATE TABLE tenant_sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Template Types:**
- missed_call, after_hours, reminder
- scheduled_confirm, quote_ready, followup
- custom

### 5. Twilio Settings Table (`twilio_settings`)
Secure phone configuration (credentials in Vault):

```sql
CREATE TABLE twilio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  phone_sid TEXT NOT NULL,
  webhook_url TEXT,
  forwarding_enabled BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Security Note**: Twilio `account_sid` and `auth_token` are stored in Supabase Vault, not in this table.

## Migration Application Process

### Prerequisites
- Supabase project access
- SQL Editor permissions
- Understanding of migration chunking

### Quick Application Steps
1. **Open Supabase SQL Editor**
2. **Execute migration chunks 1-9 in order** (see `scripts/migration-chunks/`)
3. **Verify success** with provided SQL queries
4. **Generate TypeScript types**: `npm run sdb-types`
5. **Configure Twilio credentials** in Supabase Vault

### Detailed Instructions
See `scripts/apply-onboarding-migration.md` for step-by-step guidance.

## Row Level Security (RLS)

All new tables have RLS enabled with policies that:
- Allow users to manage their own records only
- Prevent cross-tenant data access
- Enable admin oversight (where needed)

### Policy Examples
```sql
-- Users can only access their own service locations
CREATE POLICY "Users can manage own service locations" 
ON service_locations 
FOR ALL USING (auth.uid() = user_id);

-- SMS templates are user-specific
CREATE POLICY "Users can manage own templates" 
ON tenant_sms_templates 
FOR ALL USING (auth.uid() = user_id);
```

## Performance Indexes

Key indexes added for optimal performance:

```sql
-- Profile search and filtering
CREATE INDEX idx_profiles_trade_primary ON profiles(trade_primary);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed, onboarding_step);
CREATE INDEX idx_profiles_service_postcodes ON profiles USING GIN(service_postcodes);

-- Service area lookups
CREATE INDEX idx_service_locations_postcode ON service_locations(postcode);
CREATE INDEX idx_service_locations_user_primary ON service_locations(user_id, is_primary_area);

-- Template management
CREATE INDEX idx_templates_user_type ON tenant_sms_templates(user_id, template_type, is_active);

-- Twilio settings
CREATE INDEX idx_twilio_user_status ON twilio_settings(user_id, status);
```

## Data Validation

### Constraints and Checks
- Trade types must match `trade_types.code` values
- Phone numbers validated with Australian format
- Postcodes validated for Australian format
- Experience years between 0-50
- Onboarding steps between 0-10

### Example Constraints
```sql
-- Trade validation
ALTER TABLE profiles ADD CONSTRAINT profiles_trade_primary_check 
CHECK (trade_primary IN (SELECT code FROM trade_types WHERE is_active = true));

-- Phone format
ALTER TABLE twilio_settings ADD CONSTRAINT phone_format_check 
CHECK (phone_number ~ '^\+61[0-9]{9}$');
```

## Testing Considerations

### Schema-Dependent Tests
The following areas require test updates after schema changes:
- Profile creation and updates
- Onboarding flow validation
- SMS template management
- Service area configuration
- Twilio integration mocking

### Test Data Requirements
Update test fixtures to include:
- Valid trade types from reference table
- Onboarding step progression data
- Service location examples
- SMS template variations

## Troubleshooting

### Common Migration Issues

**1. "Relation already exists" errors**
- Check if previous migration attempts left partial state
- Manually clean up tables if needed

**2. RLS policy failures**
- Ensure all referenced tables exist before applying policies
- Run migration chunks in specified order

**3. Type generation failures**
- Verify migration completed successfully
- Check Supabase connection in `supabase/config.toml`

### Verification Queries
```sql
-- Check all new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trade_types', 'service_locations', 'tenant_sms_templates', 'twilio_settings');

-- Verify profile enhancements
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('trade_primary', 'business_name', 'onboarding_completed');

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('service_locations', 'tenant_sms_templates', 'twilio_settings');
```

## Development Workflow

### After Schema Changes
1. **Apply migration** to local and staging databases
2. **Generate types**: `npm run sdb-types`
3. **Update test fixtures** with new schema requirements
4. **Run test suite** to identify breaking changes
5. **Update API endpoints** to handle new fields
6. **Test onboarding flow** end-to-end

### DevDrawer Integration
New test presets available for onboarding testing:
- `plumber-sydney`: Complete profile example
- `electrician-melbourne`: Licensed tradie with insurance
- `incomplete-onboarding`: Mid-flow testing scenario
- `twilio-configured`: Post-setup state
- `twilio-pending`: Pre-verification state

## Security Considerations

### Twilio Credentials
- **NEVER** store credentials in database tables
- Use Supabase Vault for sensitive data
- Access via secure edge functions only
- Implement proper webhook signature validation

### Data Privacy
- All personal data must comply with Australian Privacy Act
- Implement proper data retention policies
- Ensure secure deletion of user data
- Log access to sensitive information

## Next Steps

### Immediate Actions (Post-Migration)
1. **Configure Supabase Vault** with Twilio credentials
2. **Update application code** to use new schema
3. **Test onboarding wizard** functionality
4. **Verify RLS policies** protect data appropriately

### Upcoming Enhancements
- Onboarding wizard UI components (Phase 3)
- Twilio self-service integration (Phase 4)
- Enhanced settings management (Phase 5)
- SMS template editor (Phase 6)

## Support and Resources

### Key Documentation
- [Migration Application Guide](../scripts/apply-onboarding-migration.md)
- [Onboarding Implementation Plan](../ONBOARDING_IMPLEMENTATION_PLAN.md)
- [Phase 1 Completion Summary](../PHASE1_COMPLETION_SUMMARY.md)
- [Phase 2 Completion Summary](../PHASE2_COMPLETION_SUMMARY.md)

### Contact and Issues
For migration issues or questions:
1. Check Supabase logs for error details
2. Verify each migration chunk completed
3. Reference troubleshooting section above
4. Create issue with error logs and steps attempted

---

**Last Updated**: 2025-08-03  
**Next Review**: After Phase 3 completion  
**Migration Version**: 20250803100000
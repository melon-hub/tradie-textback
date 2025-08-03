# Onboarding Migration Application Guide

## Overview
This guide helps you apply the secure onboarding migration to your Supabase database.

## IMPORTANT: Security Note
We've created a secure version of the migration that doesn't store Twilio credentials in the database. Instead, credentials will be stored in Supabase Vault.

## File to Use
Use the SECURE version: `supabase/migrations/20250803100000_onboarding_schema_secure.sql`

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query

### Step 2: Execute Migration in Chunks

Due to the size of the migration, execute it in these chunks. Ready-to-use SQL files have been created in `scripts/migration-chunks/`:

#### Chunk 1: Extensions and Profile Enhancements
1. Open `scripts/migration-chunks/chunk1-extensions-profiles.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Adds all new profile columns and constraints

#### Chunk 2: Trade Types and Service Locations Tables
1. Open `scripts/migration-chunks/chunk2-tables.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Creates trade_types and service_locations tables

#### Chunk 3: SMS Templates Table
1. Open `scripts/migration-chunks/chunk3-sms-templates.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Creates tenant_sms_templates table

#### Chunk 4: Secure Twilio Settings Table
1. Open `scripts/migration-chunks/chunk4-twilio-secure.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Creates SECURE twilio_settings table (credentials in Vault)

#### Chunk 5: Indexes
1. Open `scripts/migration-chunks/chunk5-indexes.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Creates all performance indexes

#### Chunk 6: Triggers
1. Open `scripts/migration-chunks/chunk6-triggers.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Sets up updated_at triggers

#### Chunk 7: RLS Policies
1. Open `scripts/migration-chunks/chunk7-rls.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Enables Row Level Security and creates policies

#### Chunk 8: Initial Data and Functions
1. Open `scripts/migration-chunks/chunk8-data.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Inserts trade types and creates SMS template function

#### Chunk 9: Security Functions
1. Open `scripts/migration-chunks/chunk9-security-functions.sql`
2. Copy entire contents
3. Paste and run in Supabase SQL Editor
4. Creates secure Twilio credential management functions

### Step 3: Verify Migration Success

After running all chunks, verify by running:

```sql
-- Check new columns in profiles
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('trade_primary', 'business_name', 'onboarding_completed');

-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trade_types', 'service_locations', 'tenant_sms_templates', 'twilio_settings');

-- Verify trade types data
SELECT * FROM trade_types;
```

### Step 4: Configure Supabase Vault (After Migration)

1. Go to Settings → Vault in Supabase dashboard
2. Add Twilio credentials:
   - Key format: `twilio_creds_[user_id]`
   - Value: JSON with `account_sid` and `auth_token`

### Step 5: Update Migration History

If the migration applies successfully but isn't tracked, run in SQL editor:

```sql
INSERT INTO supabase_migrations.schema_migrations (version) 
VALUES ('20250803100000') 
ON CONFLICT DO NOTHING;
```

## Troubleshooting

### If you get "relation already exists" errors:
- The table/column might already exist from a previous attempt
- Check existing schema before re-running

### If you get permission errors:
- Make sure you're using the Supabase dashboard SQL editor
- Check that you have proper database permissions

### If RLS policies fail:
- Ensure all referenced tables exist first
- Run chunks in the specified order

## Next Steps

After successful migration:
1. Generate new TypeScript types: `sdb-types`
2. Update your application code to use the new schema
3. Configure Twilio credentials in Supabase Vault
4. Test the onboarding flow

## Support

If you encounter issues:
1. Check the Supabase logs
2. Verify each chunk completed successfully
3. Ensure you're using the SECURE migration file
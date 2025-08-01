# Supabase Deployment Guide for Tradie Textback

## Overview
This guide provides step-by-step instructions for deploying the fixed Supabase implementation for the tradie-textback project.

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Access to your Supabase project
- Project linked to Supabase (`supabase link`)

## Step 1: Apply Database Migrations

The migrations need to be applied in the correct order. Due to the duplicate column issue, you need to handle this carefully:

```bash
# First, check current migration status
supabase db status

# If the problematic migration (20250731080152_add_client_id_to_jobs.sql) hasn't been applied yet, skip it
# The client_id column already exists from the initial migration

# Apply the fix migration
supabase db push --include-all
```

If you get an error about the client_id column already existing, you can manually mark the problematic migration as applied:

```sql
-- Run this in the Supabase SQL editor
INSERT INTO supabase_migrations.schema_migrations (version) 
VALUES ('20250731080152_add_client_id_to_jobs.sql')
ON CONFLICT DO NOTHING;
```

## Step 2: Deploy Edge Functions

Deploy the updated edge functions:

```bash
# Deploy create-test-client function
supabase functions deploy create-test-client

# Deploy create-test-job function
supabase functions deploy create-test-job

# Deploy other functions as needed
supabase functions deploy create-test-tradie
supabase functions deploy dev-login
supabase functions deploy reset-test-data
```

## Step 3: Verify RLS Policies

Check that all RLS policies are correctly applied:

```sql
-- Run this query in Supabase SQL editor to see all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Step 4: Test the Implementation

### Test 1: Create a Test Client
```bash
# Using curl or your HTTP client
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-test-client \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+61412345678",
    "name": "Test Client",
    "address": "123 Test St, Sydney NSW 2000"
  }'
```

Save the returned `userId`, `email`, and `password`.

### Test 2: Create a Test Job
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-test-job \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "THE_USER_ID_FROM_STEP_1",
    "description": "Test job to verify client access"
  }'
```

### Test 3: Login as Client and Verify Access
1. Login to the app using the test client credentials
2. Navigate to the dashboard
3. Verify you can only see jobs created for your client_id
4. Try to access other client's jobs (should fail)

### Test 4: Login as Tradie and Verify Access
1. Login as a tradie user
2. Navigate to the dashboard
3. Verify you can see ALL jobs from all clients
4. Verify you can update any job

## Step 5: Production Checklist

Before going to production, ensure:

- [ ] All migrations are applied successfully
- [ ] Edge functions are deployed and working
- [ ] RLS policies are active and tested
- [ ] Client isolation is working (clients can't see other clients' jobs)
- [ ] Tradies have full access to all jobs
- [ ] No mock data is being returned from edge functions
- [ ] Dashboard properly filters jobs by client_id
- [ ] All test accounts are removed or disabled
- [ ] Proper error handling is in place
- [ ] Authentication flows are secure

## Troubleshooting

### Issue: Migration fails with "column already exists"
**Solution**: The column was already created in an earlier migration. Skip the duplicate migration:
```sql
INSERT INTO supabase_migrations.schema_migrations (version) 
VALUES ('20250731080152_add_client_id_to_jobs.sql');
```

### Issue: Edge functions return "Missing Supabase environment variables"
**Solution**: Ensure your edge functions have access to environment variables:
```bash
supabase secrets list
supabase secrets set SUPABASE_URL=your_url_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### Issue: Clients can see all jobs
**Solution**: Check that:
1. The client user has `user_type = 'client'` in their profile
2. The jobs have the correct `client_id` set
3. RLS policies are enabled on the jobs table

### Issue: Profile not created for new users
**Solution**: Check that the trigger is active:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## Security Best Practices

1. **Never expose service role key**: Only use it in edge functions, never in client code
2. **Always use RLS**: Ensure all tables have RLS enabled
3. **Validate input**: Always validate user input in edge functions
4. **Use proper authentication**: Don't bypass auth checks
5. **Monitor access**: Regularly audit who has access to what data

## Migration Rollback

If you need to rollback:

```sql
-- Rollback RLS policies
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Clients view own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradies view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Clients update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradies update all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradies delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Tradies can view all profiles" ON public.profiles;

-- Restore original policies if needed
-- (Copy from original migration files)
```

## Summary

The key changes made:
1. Fixed overlapping RLS policies with clear, non-conflicting rules
2. Updated edge functions to actually interact with the database
3. Fixed Dashboard to use client_id instead of phone number filtering
4. Added proper indexes for performance
5. Ensured profile creation trigger handles all necessary fields

The system now properly isolates client data while giving tradies full access, as required for a production multi-tenant application.
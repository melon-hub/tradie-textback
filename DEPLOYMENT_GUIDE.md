# Supabase Production Deployment Guide

## Overview
This guide ensures your tradie-textback project is properly configured with multi-tenant security, RLS policies, and functional edge functions.

## Step-by-Step Deployment

### 1. Apply Database Migrations

First, check which migrations have already been applied:
```bash
supabase db remote list
```

Then apply the production fix migration:
```bash
supabase db push
```

If you encounter an error about the `client_id` column already existing, that's fine - the migration handles this gracefully.

### 2. Deploy Edge Functions

Deploy all edge functions to production:
```bash
# Deploy individual functions
supabase functions deploy create-test-client
supabase functions deploy create-test-job

# Or deploy all functions at once
supabase functions deploy
```

### 3. Verify RLS Policies

Check that all RLS policies are properly applied by running this SQL in the Supabase SQL editor:

```sql
-- Check jobs table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'jobs'
ORDER BY policyname;

-- Check profiles table policies  
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

You should see these policies for the jobs table:
- `clients_create_own_jobs`
- `tradies_create_any_jobs`
- `clients_view_own_jobs`
- `tradies_view_all_jobs`
- `clients_update_own_jobs`
- `tradies_update_all_jobs`
- `tradies_delete_all_jobs`

### 4. Test Multi-Tenant Isolation

#### Test Client Access:
1. Create a test client using the edge function:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/create-test-client \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+61400123456", "name": "Test Client", "address": "123 Test St"}'
```

2. Sign in as the client and verify they can only see their own jobs

#### Test Tradie Access:
1. Sign in as a tradie account
2. Verify they can see all jobs from all clients
3. Verify they can create, update, and delete any job

### 5. Environment Variables

Ensure these are set in your Supabase project settings:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY` (for edge functions only)

### 6. Frontend Configuration

The Dashboard component is already configured to work with the RLS policies. It will:
- Filter jobs by `client_id` for client users automatically (handled by RLS)
- Show all jobs for tradie users
- Use the proper authentication context

### 7. Production Checklist

- [ ] All migrations applied successfully
- [ ] Edge functions deployed and tested
- [ ] RLS policies verified in database
- [ ] Client isolation tested (clients can only see their own jobs)
- [ ] Tradie access tested (tradies can see all jobs)
- [ ] No errors in Supabase logs
- [ ] Dashboard filtering works correctly for both user types
- [ ] Authentication flow works smoothly

## Troubleshooting

### Issue: "column client_id already exists"
**Solution**: This is expected if you've run migrations before. The production fix migration handles this gracefully.

### Issue: Edge functions returning 500 errors
**Solution**: Check that environment variables are set correctly in Supabase dashboard under Settings > Edge Functions.

### Issue: Clients can see other clients' jobs
**Solution**: Verify RLS policies are enabled on the jobs table:
```sql
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
```

### Issue: Dashboard shows no jobs for clients
**Solution**: Ensure jobs have the correct `client_id` set. Run this to check:
```sql
SELECT id, customer_name, client_id FROM public.jobs WHERE client_id = 'USER_ID_HERE';
```

## Security Best Practices

1. **Never expose service role key**: Only use it in edge functions, never in frontend code
2. **Always use RLS**: All tables should have RLS enabled
3. **Validate client_id**: Ensure jobs are always created with the correct client_id
4. **Regular audits**: Periodically check that clients can only access their own data
5. **Monitor logs**: Check Supabase logs for any unauthorized access attempts

## Next Steps

After deployment:
1. Create real client accounts
2. Migrate any existing jobs to have proper client_ids
3. Set up monitoring and alerts
4. Document client onboarding process
5. Train support staff on multi-tenant architecture
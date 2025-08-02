# URGENT: Database Performance Fix

## Current Situation
- 347 profiles in database (325 clients, 22 tradies)
- Queries taking 10-15 seconds (sometimes timing out)
- Even service role queries take ~1 second
- This is NOT an RLS issue - it's database performance

## Immediate Actions

### 1. Check Supabase Database Status
Go to: https://supabase.com/dashboard/project/cjxejmljovszxuleibqn/settings/general
- Check if database is paused/sleeping
- Check database size and limits
- Check connection pooler mode (should be "Transaction")

### 2. Run VACUUM and ANALYZE
In SQL Editor, run:
```sql
-- Clean up dead rows and update statistics
VACUUM ANALYZE profiles;

-- Check if indexes exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles';
```

### 3. Force Index Usage
```sql
-- Drop and recreate the primary index
DROP INDEX IF EXISTS idx_profiles_user_id;
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Ensure it's being used
EXPLAIN ANALYZE 
SELECT * FROM profiles 
WHERE user_id = 'b0af2682-f09b-4851-b21e-a587cc9287ac';
```

## Temporary Workaround for Your App

Add caching to useAuth.ts to avoid repeated queries:

```typescript
// In fetchProfile function, add caching:
const cacheKey = `profile_${userId}`;
const cached = sessionStorage.getItem(cacheKey);
if (cached) {
  const data = JSON.parse(cached);
  setProfile(data);
  setProfileLoading(false);
  return;
}

// After successful fetch:
sessionStorage.setItem(cacheKey, JSON.stringify(data));
```

## Possible Root Causes

1. **Database is sleeping/paused** - Free tier databases pause after inactivity
2. **Connection pooling issues** - Pooler might be misconfigured
3. **Missing statistics** - Query planner doesn't know about indexes
4. **Region latency** - Database might be far from your location

## Next Steps

1. Check database status in Supabase dashboard
2. Run VACUUM ANALYZE
3. Consider upgrading database plan if on free tier
4. Contact Supabase support if issue persists

The fact that even service role queries (no RLS) are slow confirms this is an infrastructure issue, not a code issue.
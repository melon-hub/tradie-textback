# Admin Setup Guide

## How to Designate Admin Users

Since we have the `is_admin` field in the profiles table, we need a way to set certain users as admins. Here are the approaches:

### Option 1: Direct Database Update (Recommended for Initial Setup)
```sql
-- Set a specific user as admin by email
UPDATE profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
```

### Option 2: First User is Admin
Create a database trigger that automatically makes the first registered user an admin:
```sql
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM profiles) = 1 THEN
    NEW.is_admin := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER first_user_admin
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION make_first_user_admin();
```

### Option 3: Environment-Based Admin Email
Set admin emails in environment variables and check during profile creation:
```typescript
// In profile creation logic
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
if (ADMIN_EMAILS.includes(userEmail)) {
  // Set is_admin = true
}
```

### Option 4: Invitation System
Create an admin invitation system where existing admins can promote other users.

### Option 5: Manual Promotion via Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to Table Editor > profiles
3. Find the user you want to make admin
4. Set `is_admin` to `true`

## Recommended Approach for Your Project

For the Tradie Textback project, I recommend:

1. **Immediate**: Use Option 5 (Supabase Dashboard) to manually set yourself as admin
2. **Long-term**: Implement Option 4 (invitation system) as part of the admin dashboard

## Setting Your First Admin

1. Apply the migration first:
   ```bash
   sdb-push
   ```

2. Find your user ID:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

3. Set yourself as admin:
   ```sql
   UPDATE profiles SET is_admin = true WHERE user_id = 'your-user-id';
   ```

## Security Considerations

- Only admins should be able to set other users as admins
- The `is_admin` field is protected by RLS policies in the migration
- Admin actions are logged in the `admin_audit_log` table
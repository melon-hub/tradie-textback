# Twilio Vault Setup Guide

This guide provides comprehensive instructions for setting up secure Twilio credential storage using Supabase Vault.

## Overview

The Tradie Textback application uses Supabase Vault to securely store Twilio credentials (Account SID and Auth Token) separately from the main database. This approach ensures:

- **Security**: Sensitive credentials are encrypted and stored in Vault
- **Compliance**: Credentials are not exposed in database dumps or logs
- **Access Control**: Only authorized users can access their own credentials
- **Audit Trail**: All credential operations are logged for security monitoring

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │    │   Supabase DB    │    │  Supabase Vault │
│                 │    │                  │    │                 │
│ User stores     │───▶│ twilio_settings  │    │   Encrypted     │
│ credentials     │    │ - phone_number   │    │   Credentials   │
│                 │    │ - webhook_url    │    │   - account_sid │
│                 │    │ - vault_secret   │───▶│   - auth_token  │
│                 │    │ - status         │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Prerequisites

1. **Supabase Vault Enabled**: Ensure Vault is enabled in your Supabase project
2. **Database Setup**: Run the onboarding schema migration (already done)
3. **Admin Access**: You'll need admin access to your Supabase project

## Step 1: Enable Supabase Vault

### Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Enable the Vault extension
4. The vault schema will be automatically created

### Via Supabase CLI
```bash
# Enable vault extension
supabase db push

# Verify vault is enabled
supabase db inspect --schema=vault
```

## Step 2: Run the Vault Setup Script

Execute the vault setup SQL script to create all the necessary functions and security policies:

```bash
# Run the setup script
supabase db push
# Then run:
psql -h your-db-host -U postgres -d postgres -f scripts/setup-twilio-vault.sql
```

Or via Supabase SQL Editor:
1. Open the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `scripts/setup-twilio-vault.sql`
3. Execute the script

## Step 3: Application Integration

### Storing Twilio Credentials

Use the `vault_store_twilio_credentials` function to securely store credentials:

```javascript
// Frontend/API code
const { data, error } = await supabase.rpc('vault_store_twilio_credentials', {
  target_user_id: user.id,
  account_sid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with real account SID
  auth_token: 'your_auth_token_here',
  phone_number: '+1234567890',
  webhook_url: 'https://yourapp.com/webhook'
});

if (error) {
  console.error('Failed to store credentials:', error);
} else {
  console.log('Credentials stored successfully:', data);
}
```

### Retrieving Twilio Credentials

Use the `vault_get_twilio_credentials` function to safely retrieve credentials:

```javascript
// Backend code only - never expose credentials in frontend
const { data, error } = await supabase.rpc('vault_get_twilio_credentials', {
  target_user_id: user.id
});

if (data?.success) {
  const { account_sid, auth_token, phone_number } = data;
  // Use credentials for Twilio API calls
} else {
  console.error('Failed to retrieve credentials:', data?.message);
}
```

### Testing Credentials

Use the `vault_test_twilio_credentials` function to verify credentials exist without exposing them:

```javascript
// Safe to use in frontend
const { data, error } = await supabase.rpc('vault_test_twilio_credentials', {
  target_user_id: user.id
});

if (data?.success) {
  console.log('Credentials available:', {
    hasAccountSid: data.has_account_sid,
    hasAuthToken: data.has_auth_token,
    phoneNumber: data.phone_number,
    accountSidPrefix: data.account_sid_prefix // e.g., "AC123456..."
  });
}
```

## Step 4: Validation Functions

The system includes built-in validation for Twilio credential formats:

```javascript
// Validate Account SID format
const { data: validSid } = await supabase.rpc('validate_twilio_account_sid', {
  account_sid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // Must start with AC + 32 hex chars
});

// Validate Auth Token format
const { data: validToken } = await supabase.rpc('validate_twilio_auth_token', {
  auth_token: 'your_32_character_hex_token'
});

// Validate Phone Number format
const { data: validPhone } = await supabase.rpc('validate_twilio_phone_number', {
  phone_number: '+1234567890'
});
```

## Security Features

### Row Level Security (RLS)

All functions enforce user-level access control:
- Users can only access their own credentials
- Unauthorized access attempts are blocked
- Admin functions require admin privileges

### Audit Logging

All vault operations are logged in the `vault_audit_log` table:

```javascript
// View your own audit log
const { data, error } = await supabase
  .from('vault_audit_log')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

### Input Validation

All credential inputs are validated before storage:
- Account SID: Must be format `AC` + 32 hex characters
- Auth Token: Must be 32 hex characters
- Phone Number: Must be valid international format

## Admin Functions

### List All Vault Secrets

Admins can view metadata for all stored credentials:

```javascript
// Admin only
const { data, error } = await supabase.rpc('admin_list_vault_secrets');
```

### Cleanup Orphaned Secrets

Remove vault secrets for deleted users:

```javascript
// Admin only
const { data, error } = await supabase.rpc('admin_cleanup_orphaned_vault_secrets');
console.log(`Cleaned up ${data.cleaned_up_count} orphaned secrets`);
```

## Error Handling

All vault functions return structured error responses:

```javascript
{
  "success": false,
  "error": "Unauthorized: Cannot store credentials for another user",
  "message": "Failed to store Twilio credentials"
}
```

Common error scenarios:
- **Unauthorized access**: User trying to access another user's credentials
- **Invalid format**: Credentials don't match Twilio format requirements
- **Vault unavailable**: Vault service is down or not configured
- **Missing credentials**: No credentials found for user

## Environment Variables

For additional security, you can also store global Twilio credentials as environment variables:

```bash
# In your Supabase project settings
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

Access these in Edge Functions:

```javascript
// In Edge Functions
const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
```

## Best Practices

### 1. Credential Rotation

Regularly rotate Twilio credentials:

```javascript
// Update credentials
await supabase.rpc('vault_update_twilio_credentials', {
  target_user_id: user.id,
  auth_token: 'new_auth_token_here'
});
```

### 2. Monitor Access

Regularly review audit logs:

```javascript
// Check recent access
const { data } = await supabase
  .from('vault_audit_log')
  .select('*')
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
```

### 3. Error Monitoring

Implement proper error logging:

```javascript
try {
  const result = await supabase.rpc('vault_get_twilio_credentials', {
    target_user_id: user.id
  });
  
  if (!result.data?.success) {
    // Log the error for monitoring
    console.error('Vault error:', result.data?.message);
  }
} catch (error) {
  // Log system errors
  console.error('System error:', error);
}
```

## Troubleshooting

### Common Issues

1. **Vault Extension Not Enabled**
   ```
   Error: schema "vault" does not exist
   ```
   Solution: Enable Vault extension in Supabase dashboard

2. **Permission Denied**
   ```
   Error: permission denied for schema vault
   ```
   Solution: Verify vault permissions and RLS policies

3. **Invalid Credential Format**
   ```
   Error: Twilio Account SID format: AC followed by 32 hex characters
   ```
   Solution: Use validation functions before storing

4. **Unauthorized Access**
   ```
   Error: Unauthorized: Cannot store credentials for another user
   ```
   Solution: Ensure user is authenticated and accessing own credentials

### Debug Commands

```sql
-- Check if vault extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vault';

-- Check vault secrets (admin only)
SELECT * FROM vault.secrets;

-- Check twilio_settings table
SELECT user_id, phone_number, status, vault_secret_name, created_at 
FROM public.twilio_settings;

-- Check audit log
SELECT * FROM public.vault_audit_log 
ORDER BY created_at DESC 
LIMIT 10;
```

## Migration from Existing Implementation

If you have existing Twilio credentials stored in the database, migrate them to Vault:

```javascript
// Migration script (run once)
async function migrateToVault() {
  // Get all existing twilio_settings records
  const { data: settings, error } = await supabase
    .from('twilio_settings')
    .select('*')
    .not('auth_token', 'is', null); // Only records with auth_token
  
  for (const setting of settings || []) {
    try {
      // Store in vault
      await supabase.rpc('vault_store_twilio_credentials', {
        target_user_id: setting.user_id,
        account_sid: setting.account_sid,
        auth_token: setting.auth_token,
        phone_number: setting.phone_number,
        webhook_url: setting.webhook_url
      });
      
      // Remove auth_token from database
      await supabase
        .from('twilio_settings')
        .update({ auth_token: null })
        .eq('id', setting.id);
        
      console.log(`Migrated credentials for user ${setting.user_id}`);
    } catch (error) {
      console.error(`Failed to migrate user ${setting.user_id}:`, error);
    }
  }
}
```

## Testing

Test the vault setup with these verification steps:

```javascript
// 1. Store test credentials
const storeResult = await supabase.rpc('vault_store_twilio_credentials', {
  target_user_id: user.id,
  account_sid: 'AC' + '0'.repeat(32),
  auth_token: '0'.repeat(32),
  phone_number: '+1234567890'
});

// 2. Test credential availability
const testResult = await supabase.rpc('vault_test_twilio_credentials', {
  target_user_id: user.id
});

// 3. Retrieve credentials (backend only)
const getResult = await supabase.rpc('vault_get_twilio_credentials', {
  target_user_id: user.id
});

// 4. Clean up test data
const deleteResult = await supabase.rpc('vault_delete_twilio_credentials', {
  target_user_id: user.id
});
```

## Support

For additional support:
1. Check the Supabase Vault documentation
2. Review the audit logs for error details
3. Verify RLS policies are correctly applied
4. Test with the provided validation functions

## Security Considerations

1. **Never log sensitive credentials** in application logs
2. **Use HTTPS only** for all credential operations
3. **Implement rate limiting** for credential access
4. **Monitor audit logs** for suspicious activity
5. **Rotate credentials regularly** as part of security best practices
6. **Use environment variables** for system-level credentials when appropriate

This setup provides enterprise-grade security for Twilio credential management while maintaining ease of use for developers.
# Client Onboarding and Testing Guide

This guide explains how to test the client functionality and onboard new clients in the Tradie Textback system.

## Testing Client Functionality as an Admin

As an admin/owner, you can test the client experience by creating a dummy client account:

### Creating a Test Client Account

1. Navigate to the AuthPage (`/auth`)
2. Select "Client" as the user type
3. Enter test details:
   - Name: "Test Client"
   - Address: "123 Test Street, Sydney, NSW 2000"
   - Phone: Use a dummy Australian mobile number like `+61400000000`
4. Submit the form to receive a magic link
5. Check the browser console or Supabase dashboard for the test token
6. Use the token to log in as the test client

### Recommended Test Phone Numbers

For testing purposes, use these dummy Australian mobile numbers:
- `+61400000000` (Primary test number)
- `+61400000001` (Secondary test number)
- `+61400000002` (Tertiary test number)

**Note**: These numbers follow the Australian mobile format but are not real numbers.

## Client Onboarding Process

### For Real Clients

1. **Initial Contact**: Clients receive a job link via SMS after a missed call
2. **Access Job**: Clients click the link to access their job details
3. **Account Creation**: If first time, clients complete signup with:
   - Phone number (verified via SMS)
   - Name
   - Address
4. **Job Management**: Clients can view and update their job details

### For Testing/Development

1. **Create Test Account**: Use the AuthPage with client user type
2. **Simulate Job Creation**: Create test jobs in Supabase dashboard
3. **Generate Job Links**: Use the admin dashboard to create secure links
4. **Test Client Flow**: Log in as client and verify access restrictions

## Testing Different User Experiences

### Admin (Tradie) Experience

- Access to all jobs in the system
- Ability to create and manage all job records
- Generate secure links for clients
- Update job statuses and details
- View analytics and reports

### Client Experience

- Access only to jobs associated with their phone number
- Limited ability to update job information
- View job status updates
- Receive notifications about job changes

## Supabase Testing Tips

### Viewing Test Data

1. Open Supabase Studio
2. Navigate to the "Table Editor"
3. View the `profiles` table to see user types
4. View the `jobs` table to see client assignments
5. View the `job_links` table to see generated links

### Manual Data Creation

For testing purposes, you can manually create test data in Supabase:

```sql
-- Create a test job for a client
INSERT INTO public.jobs (id, client_id, description, status, urgency, customer)
VALUES (
  gen_random_uuid(),
  'CLIENT_USER_ID',
  'Test job for client onboarding',
  'new',
  'normal',
  '{"name": "Test Client", "phone": "+61400000000", "address": "123 Test Street, Sydney, NSW 2000"}'
);
```

## Troubleshooting

### Common Issues

1. **Client can't see jobs**: Verify the `client_id` in the jobs table matches the user's auth ID
2. **Admin can't see all jobs**: Check RLS policies on the jobs table
3. **Address validation fails**: Ensure the Google Maps API is properly configured
4. **Job links expire too quickly**: Adjust the expiration time in the `create_job_link` function

### Verification Steps

1. Log in as admin and create a test client account
2. Create a test job assigned to the client
3. Generate a job link for the client
4. Log out and log in as the client
5. Verify the client can only see their assigned job
6. Verify the admin can see all jobs including the test job

## Best Practices

1. **Use Test Numbers**: Always use dummy phone numbers for testing
2. **Clean Up Test Data**: Remove test accounts and jobs after testing
3. **Document Test Scenarios**: Keep notes on test cases and expected outcomes
4. **Verify Security**: Regularly check that RLS policies are working correctly

## Support

For issues with client onboarding or testing, contact the system administrator.

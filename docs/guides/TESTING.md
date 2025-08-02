# Testing Guide

This guide explains how to test all functionality in the Tradie Textback system, including both admin and client experiences.

## Prerequisites

1. Supabase project set up and configured
2. Environment variables properly configured
3. Database migrations applied
4. Application running locally or deployed

## Testing Multi-Client Functionality

### As an Admin/Owner

1. **Log in as Admin**:
   - Navigate to the AuthPage
   - Select "Tradie" as user type
   - Enter your phone number
   - Complete the signup/login process

2. **Verify Admin Access**:
   - You should see all jobs in the dashboard
   - You should be able to create and manage all jobs
   - You should be able to generate job links for clients

### As a Client

1. **Create Test Client Account**:
   - Use the manual process in AuthPage:
     - Select "Client" as user type
     - Enter test details:
       - Name: "Test Client"
       - Address: "123 Test Street, Sydney, NSW 2000"
       - Phone: `+61400000000`
   - OR use the automated script:
     ```bash
     node scripts/create-test-client.js
     ```

2. **Log in as Client**:
   - Navigate to AuthPage
   - Enter the test phone number (`+61400000000`)
   - Complete the login process

3. **Verify Client Access**:
   - You should only see jobs assigned to this client
   - You should not be able to see other clients' jobs
   - You should be able to update your job information

## Testing Google Maps Integration

1. **Address Input**:
   - During signup, verify address autocomplete works
   - Check that address validation functions properly

2. **Map Display**:
   - In JobCard, verify the map preview shows correctly
   - Click "Open Maps" button to verify it opens Google Maps

## Testing Job Link Security

1. **Link Generation**:
   - As admin, generate a job link for a client
   - Verify the link contains the job ID and token

2. **Link Access**:
   - Access the job link as a client
   - Verify you can access the job details
   - Verify access count increments in the database

3. **Link Expiration**:
   - Modify a job link's expiration date in the database
   - Try to access the expired link
   - Verify appropriate error message is shown

## Testing Row Level Security (RLS)

1. **Client Restrictions**:
   - Log in as a client
   - Attempt to access jobs not assigned to this client
   - Verify access is denied

2. **Admin Access**:
   - Log in as admin
   - Verify access to all jobs
   - Verify ability to modify any job

## Automated Testing

### Using the Test Script

```bash
# Create a test client and job
node scripts/create-test-client.js
```

This script will:
1. Create a test client account with phone `+61400000000`
2. Create a test job assigned to this client
3. Verify both were created successfully

## Manual Testing Checklist

- [ ] Admin can see all jobs
- [ ] Client can only see their own jobs
- [ ] Google Maps integration works (autocomplete, validation, display)
- [ ] Job links can be generated and accessed
- [ ] Job links expire properly
- [ ] Access tracking works (count, timestamp)
- [ ] RLS policies enforce proper access control
- [ ] AuthPage works for both user types
- [ ] Dashboard filters correctly based on user type

## Troubleshooting

### Common Issues

1. **Client can't see jobs**:
   - Verify `client_id` in jobs table matches user's auth ID
   - Check RLS policies on jobs table

2. **Admin can't see all jobs**:
   - Verify user_type is set to 'tradie'
   - Check RLS policies

3. **Map functionality not working**:
   - Verify Google Maps API configuration
   - Check browser console for errors

4. **Job links not working**:
   - Verify token validation logic
   - Check expiration dates
   - Verify job_link table structure

## Support

For testing issues, contact the system administrator.

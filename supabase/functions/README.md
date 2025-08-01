# Supabase Edge Functions Documentation

## Overview

This directory contains Supabase Edge Functions for the tradie-textback project. These functions are used to create test data for development and testing purposes.

## Functions

### create-test-client

Creates a test client user with authentication and profile data.

**Endpoint**: `/create-test-client`

**Method**: POST

**Request Body**:
```json
{
  "phone": "+61412345678",    // Required
  "name": "John Smith",        // Required
  "address": "123 Test St"     // Optional
}
```

**Response**:
```json
{
  "success": true,
  "userId": "uuid",
  "email": "test.client.1234567890@example.com",
  "password": "TestClient1234567890!",
  "phone": "+61412345678",
  "name": "John Smith",
  "message": "Test client created successfully. Save these credentials!",
  "profile": {
    "user_id": "uuid",
    "phone": "+61412345678",
    "name": "John Smith",
    "user_type": "client",
    "address": "123 Test St"
  }
}
```

### create-test-job

Creates a test job for an existing client.

**Endpoint**: `/create-test-job`

**Method**: POST

**Request Body**:
```json
{
  "clientId": "uuid",           // Required - must be valid client UUID
  "description": "Custom desc", // Optional
  "customerName": "Customer",   // Optional
  "phone": "+61412345678",      // Optional
  "jobType": "Plumbing",        // Optional
  "location": "456 Main St",    // Optional
  "urgency": "high"             // Optional - must be: low, medium, high, urgent
}
```

**Response**:
```json
{
  "success": true,
  "jobId": "uuid",
  "job": {
    "id": "uuid",
    "client_id": "uuid",
    "customer_name": "Test Customer",
    "phone": "+61412345678",
    "job_type": "Test Job - Plumbing Inspection",
    "location": "123 Test Street, Sydney NSW 2000",
    "urgency": "medium",
    "status": "new",
    "estimated_value": 250,
    "description": "Test job for client onboarding verification...",
    "preferred_time": "Any time",
    "last_contact": "2025-01-30T12:00:00Z",
    "sms_blocked": false
  },
  "jobLink": "https://your-project.supabase.co/jobs/token123",
  "message": "Test job created successfully in database",
  "clientProfile": {
    "name": "John Smith",
    "phone": "+61412345678",
    "address": "123 Test St"
  }
}
```

## Error Handling

Both functions include comprehensive error handling:

- Missing environment variables
- Invalid input data
- Database connection errors
- Record creation failures
- Invalid UUIDs
- Non-existent clients

## Implementation Details

### create-test-client
1. Creates an auth user with Supabase Auth Admin API
2. Sets user metadata (name, user_type, address)
3. Waits for database trigger to create profile
4. Falls back to manual profile creation if trigger fails
5. Returns credentials and profile data

### create-test-job
1. Validates client ID is a valid UUID
2. Verifies client exists and is of type 'client'
3. Creates job with provided or default values
4. Attempts to create a job link for customer access
5. Returns job data and optional job link

## Usage Example

```bash
# Create a test client
curl -X POST https://your-project.supabase.co/functions/v1/create-test-client \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+61412345678",
    "name": "Test Client",
    "address": "123 Test Street"
  }'

# Create a test job for the client
curl -X POST https://your-project.supabase.co/functions/v1/create-test-job \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_UUID_FROM_ABOVE",
    "urgency": "high"
  }'
```

## Notes

- These functions use the service role key for admin operations
- Profiles are created via database trigger or manually as fallback
- Job links expire after 30 days by default
- All test emails follow pattern: `test.client.{timestamp}@example.com`
- Test passwords follow pattern: `TestClient{timestamp}!`
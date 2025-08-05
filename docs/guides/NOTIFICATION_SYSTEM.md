# Notification System Guide

<!-- Created: 2025-08-05 - Guide for job update notifications and SMS alerts -->

## Overview

The TradieText notification system alerts tradies when clients update their job requests. It combines visual dashboard indicators with SMS notifications to ensure tradies never miss important updates.

## Features

### 1. Visual Dashboard Indicators
- **Updated Badge**: Blue badge with refresh icon appears on updated jobs
- **Card Highlight**: Subtle blue ring around recently updated job cards
- **Update Timestamp**: Shows "Updated: X mins/hours ago" for transparency
- **24-Hour Window**: Visual indicators remain for 24 hours after update

### 2. SMS Notifications
- **Instant Alerts**: SMS sent immediately when client updates job
- **Smart Filtering**: Only sends SMS for client updates (not tradie updates)
- **Twilio Integration**: Uses existing Twilio setup from Settings
- **Fallback Handling**: Dashboard indicators work even without Twilio

### 3. Client Editing Capabilities
- **Location Updates**: Clients can edit job address/location
- **Description Updates**: Clients can modify job notes/description
- **Status Restriction**: Only available for jobs with "new" status
- **Inline Editing**: Clean UI with save/cancel options

## Technical Implementation

### Database Schema

```sql
-- Notification logs table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'push', 'in_app')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Function

The `send-job-update-sms` Edge Function handles SMS notifications:

```typescript
// Located at: supabase/functions/send-job-update-sms/index.ts
interface JobUpdatePayload {
  jobId: string
  updatedFields: string[]
  updatedBy: string
  updatedByType: 'client' | 'tradie'
}
```

### Frontend Integration

In JobCard.tsx, updates trigger notifications:

```typescript
// Send SMS notification if client updated
if (profile?.user_type === 'client' && job.client_id) {
  supabase.functions.invoke('send-job-update-sms', {
    body: {
      jobId: job.id,
      updatedFields: ['location'], // or ['description']
      updatedBy: profile.id,
      updatedByType: 'client'
    }
  })
}
```

## Setup Requirements

### 1. Twilio Configuration
- Valid Twilio Account SID
- Twilio Auth Token
- Twilio Phone Number
- Credentials saved in Settings → Twilio tab

### 2. Database Migration
Run the notification logs migration:
```bash
supabase migration up 20250805000000_add_notification_logs.sql
```

### 3. Deploy Edge Function
```bash
supabase functions deploy send-job-update-sms
```

## SMS Message Format

```
Job Update: [Customer Name] updated their [Job Type] request ([Fields]).
View details: [Site URL]/job/[Job ID]
```

Example:
```
Job Update: John Smith updated their Plumbing request (location).
View details: https://tradietext.com/job/abc-123
```

## Visual Indicators Logic

The dashboard uses these helper functions:

```typescript
const hasBeenUpdated = (job: Job) => {
  const created = new Date(job.created_at).getTime();
  const updated = new Date(job.updated_at).getTime();
  return (updated - created) > 60000; // 1 minute difference
};

const isRecentlyUpdated = (job: Job) => {
  if (!hasBeenUpdated(job)) return false;
  const updated = new Date(job.updated_at);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
  return diffHours < 24;
};
```

## Testing

### Manual Testing
1. Login as a client user
2. Navigate to a job with "new" status
3. Click edit on location or description
4. Make changes and save
5. Verify:
   - Toast confirmation appears
   - Job shows as updated
   - Tradie dashboard shows visual indicators
   - SMS is sent (if Twilio configured)

### Test Without Twilio
The system gracefully handles missing Twilio configuration:
- Visual indicators still work
- Console logs show "Twilio not configured"
- No errors thrown to user

## Troubleshooting

### SMS Not Sending
1. Check Twilio credentials in Settings
2. Verify phone numbers are valid
3. Check Supabase Edge Function logs
4. Ensure notification_logs table exists

### Visual Indicators Not Showing
1. Verify job.updated_at is being set
2. Check timezone handling
3. Ensure real-time subscriptions are active
4. Clear browser cache if needed

## Future Enhancements

- Email notifications as backup
- Push notifications for mobile app
- Notification preferences per tradie
- Batch notifications for multiple updates
- Read receipts for notifications
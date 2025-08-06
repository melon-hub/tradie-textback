# Client Dashboard & SMS Notification Improvements

## Overview
This document outlines planned improvements for the client dashboard and comprehensive SMS notification system to enhance tradie-client communication.

## Status Update - August 5, 2025

### Completed Work
- ✅ Implemented quick action buttons on JobCard component for both client and tradie dashboards
- ✅ Created edge functions for all quick action SMS notifications:
  - `send-quote-sms` - Sends quote to customer when tradie enters amount
  - `send-on-my-way-sms` - Sends ETA notification to customer
  - `send-quote-accepted-sms` - Notifies tradie when customer accepts quote
  - `send-job-cancelled-sms` - Notifies tradie when customer cancels job
- ✅ Created unit tests for all new edge functions (8 tests passing)
- ✅ Updated database schema with new fields:
  - `quote_accepted_at` and `quote_accepted_by` in jobs table
  - `cancellation_reason` in jobs table
  - Expanded `tenant_sms_templates` constraint to include new template types
- ✅ Updated frontend types to match new database schema
- ✅ Implemented visibility logic for quick action buttons based on job status and user type

### Current Implementation
All quick action buttons are now functional in the frontend with proper database integration. The edge functions are ready for deployment and testing.

### Outstanding Issues
- Some TypeScript lint errors in edge function files (expected due to Deno environment differences)
- Manual QA testing needed to verify SMS flows work correctly in production

### Next Steps
1. Deploy edge functions to Supabase
2. Test all quick action flows manually in browser
3. Verify SMS delivery in production environment
4. Address any runtime issues discovered during testing

## 1. SMS Notification Flows

### Client → Tradie Notifications

#### Existing
- **Update Job Details**: When client edits location/description, tradie receives SMS
  - Edge function: `send-job-update-sms`
  - Fields: location, description
  - Only for "new" status jobs

#### Planned
1. **Cancel Job**
   - Client cancels job with reason
   - SMS to tradie: "Job cancelled: [Customer] cancelled their [JobType]. Reason: [Reason]"
   - Update status to "cancelled"

2. **Accept Quote**
   - Client accepts quoted price
   - SMS to tradie: "[Customer] accepted your quote of $[Amount] for [JobType]"
   - Update status to "accepted"

3. **Request Update**
   - Quick action button
   - SMS to tradie: "[Customer] requested an update on their [JobType] job"
   - Log in notification_logs

### Tradie → Client Notifications

#### Planned
1. **Send Quote**
   - When tradie enters quote amount
   - SMS to client: "Quote from [TradieBusinessName]: $[Amount] for your [JobType]. Reply YES to accept"
   - Status changes to "quoted"

2. **Status Updates**
   - Any status change triggers SMS
   - SMS templates:
     - Contacted: "Hi [Customer], this is [Tradie] regarding your [JobType] request. I'll be in touch soon."
     - Scheduled: "Your [JobType] job is scheduled for [Date/Time]"
     - Completed: "Your [JobType] job is complete. Total: $[Amount]. Thank you!"

3. **On My Way**
   - Quick action with ETA selector (15min, 30min, 1hr, 2hr)
   - SMS: "Hi [Customer], I'm on my way. ETA: [Time]"

4. **Request More Info**
   - Predefined info requests
   - SMS: "Hi [Customer], I need more info about your [JobType]: [Specific Request]"

## 2. Quick Actions Design

### Client Dashboard Quick Actions

```typescript
interface ClientQuickActions {
  requestUpdate: {
    label: "Request Update",
    icon: "RefreshCw",
    smsTemplate: "Hi, can I get an update on my {jobType} job?",
    requiresReason: false
  },
  acceptQuote: {
    label: "Accept Quote",
    icon: "Check",
    visibleWhen: "status === 'quoted' && estimated_value > 0",
    smsTemplate: "I accept the quote of ${amount}",
    updatesStatus: "accepted"
  },
  cancelJob: {
    label: "Cancel Job",
    icon: "X",
    visibleWhen: "status !== 'completed' && status !== 'cancelled'",
    requiresReason: true,
    updatesStatus: "cancelled"
  },
  addPhotos: {
    label: "Add Photos",
    icon: "Camera",
    action: "navigate_to_photos"
  }
}
```

### Tradie Dashboard Quick Actions

```typescript
interface TradieQuickActions {
  sendQuote: {
    label: "Send Quote",
    icon: "DollarSign",
    requiresInput: "amount",
    smsTemplate: "Quote for {jobType}: ${amount}. This includes {description}",
    updatesStatus: "quoted"
  },
  onMyWay: {
    label: "On My Way",
    icon: "Navigation",
    requiresInput: "eta",
    options: ["15 mins", "30 mins", "1 hour", "2 hours"],
    smsTemplate: "On my way, ETA: {eta}"
  },
  requestInfo: {
    label: "Request Info",
    icon: "MessageCircle",
    options: [
      "Need gate code/access info",
      "Confirm someone will be home",
      "Need more details about the issue",
      "Parking instructions needed"
    ]
  },
  markComplete: {
    label: "Mark Complete",
    icon: "CheckCircle",
    requiresInput: "finalAmount",
    updatesStatus: "completed",
    triggersReview: true
  }
}
```

## 3. Filter Updates for Client Dashboard

### Current (Tradie-focused)
- All Jobs
- New
- Contacted
- Quote Sent
- Scheduled
- In Progress
- Completed

### Proposed (Client-friendly)
```typescript
const clientFilters = {
  status: {
    "active": ["new", "contacted", "quoted", "accepted"],
    "in_progress": ["scheduled", "in_progress"],
    "completed": ["completed"],
    "cancelled": ["cancelled"]
  },
  time: {
    "this_week": "created_at >= 7 days ago",
    "this_month": "created_at >= 30 days ago",
    "older": "created_at < 30 days ago"
  },
  tradie: "dynamic based on available tradies"
}
```

## 4. Database Schema Updates

### New Fields for jobs table
```sql
-- Add to jobs table
ALTER TABLE jobs ADD COLUMN quote_accepted_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN quote_accepted_by UUID REFERENCES auth.users(id);
ALTER TABLE jobs ADD COLUMN cancellation_reason TEXT;
ALTER TABLE jobs ADD COLUMN last_update_request_at TIMESTAMPTZ;
```

### New SMS Template Types
```sql
-- Update constraint on tenant_sms_templates
ALTER TABLE tenant_sms_templates 
DROP CONSTRAINT tenant_sms_templates_template_type_check;

ALTER TABLE tenant_sms_templates 
ADD CONSTRAINT tenant_sms_templates_template_type_check 
CHECK (template_type IN (
  'missed_call', 
  'after_hours', 
  'job_confirmation', 
  'appointment_reminder', 
  'follow_up', 
  'quote_ready', 
  'invoice_sent',
  -- New types
  'quote_sent',
  'quote_accepted',
  'job_cancelled',
  'status_update',
  'on_my_way',
  'info_request',
  'update_request',
  'job_completed',
  'review_request',
  'review_followup'
));
```

## 5. Edge Functions

### New Functions Needed

1. **send-status-update-sms**
   ```typescript
   interface StatusUpdatePayload {
     jobId: string
     oldStatus: string
     newStatus: string
     updatedBy: string
     updatedByType: 'client' | 'tradie'
     additionalInfo?: {
       eta?: string
       amount?: number
       reason?: string
     }
   }
   ```

2. **send-quote-sms**
   ```typescript
   interface QuoteSmsPayload {
     jobId: string
     customerPhone: string
     customerName: string
     quoteAmount: number
     jobType: string
     tradieBusinessName: string
     description?: string
   }
   ```

3. **send-quick-action-sms**
   ```typescript
   interface QuickActionPayload {
     jobId: string
     actionType: string
     recipientPhone: string
     recipientName: string
     senderType: 'client' | 'tradie'
     customMessage?: string
     templateVars?: Record<string, any>
   }
   ```

## 6. UI Component Updates

### Client Job Card Enhancements
- Progress indicator showing job stages
- Quick action buttons prominently displayed
- Communication history preview (last 3 interactions)
- Photo thumbnails if photos attached

### Mobile Optimizations
- Swipe actions for quick operations
- Bottom sheet for actions on mobile
- Larger touch targets for buttons
- Condensed information hierarchy

## 7. Future Phase: Google Reviews Integration

### Overview
Automated review request system to boost tradie Google Business Profile ratings.

### Trigger Conditions
1. Job status = "completed"
2. Client has acknowledged completion (new field needed)
3. 24 hours have passed since completion
4. Review not already requested for this job

### Implementation Plan

#### Database Updates
```sql
-- Add to profiles table
ALTER TABLE profiles ADD COLUMN google_business_id TEXT;
ALTER TABLE profiles ADD COLUMN reviews_enabled BOOLEAN DEFAULT false;

-- Add to jobs table  
ALTER TABLE jobs ADD COLUMN completion_acknowledged_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN review_requested_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN review_completed_at TIMESTAMPTZ;

-- New review_settings table
CREATE TABLE review_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  delay_hours INTEGER DEFAULT 24,
  followup_hours INTEGER DEFAULT 48,
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### SMS Flow
1. **Initial Request** (24hrs after acknowledged completion)
   - "Thank you for choosing [BusinessName]! We'd appreciate your feedback: [Google Review Link]"

2. **Follow-up** (48hrs later if no review)
   - "Hi [Customer], just a reminder - we'd love your feedback on the [JobType] work: [Review Link]"

#### Settings UI
- Toggle in Settings → Reviews tab
- Custom delay times
- Custom message templates
- View review request stats

### Technical Considerations
- Use Google Business Profile API to generate review links
- Track click-through rates via URL shortener
- Respect SMS opt-out preferences
- Implement rate limiting to avoid spam

## 8. Implementation Priority

### Phase 1 (Completed)
1. ✅ Quick actions for both dashboards
2. ✅ Basic SMS for status updates
3. ⬜ Client filter improvements
4. ⬜ Update request functionality

### Phase 2 (In Progress)
1. ✅ Quote acceptance flow (implemented, needs testing)
2. ✅ On my way notifications (implemented, needs testing)
3. ✅ Job cancellation with reasons (implemented, needs testing)
4. ⬜ Communication history

### Phase 3 (Future)
1. Google Reviews integration
2. Advanced SMS templates
3. SMS conversation threading
4. Analytics on communication effectiveness

## 9. Success Metrics

- Response time improvement (time from update to acknowledgment)
- Job completion rate increase
- Customer satisfaction scores
- SMS engagement rates
- Review submission rates (Phase 3)

## 10. Technical Debt & Considerations

- Ensure Twilio rate limits are respected
- Implement SMS delivery status tracking
- Handle SMS opt-outs gracefully
- Create SMS preview functionality for tradies
- Build comprehensive notification preferences
- Consider SMS costs and billing implications
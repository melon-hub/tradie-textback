# Admin Dashboard & Multi-Tradie Support Plan

## Overview
This document outlines the implementation plan for the admin dashboard and customer multi-tradie support features.

## Phase 1: Customer Multi-Tradie Support

### 1.1 Problem Statement
- Customers may use multiple tradies who both use our platform
- Currently, customers only see jobs from one tradie (based on client_id)
- Need unified view of all their jobs across different tradies

### 1.2 Solution
- Query jobs by phone number instead of client_id for customers
- Add tradie identification to job cards
- Add filtering by tradie

### 1.3 Implementation Tasks
- [ ] Update customer dashboard query to use phone number
- [ ] Add tradie name/business to job cards
- [ ] Create tradie filter dropdown
- [ ] Update job type to include tradie info
- [ ] Test with existing test data

## Phase 2: Admin Dashboard

### 2.1 Core Features

#### User Management
- [ ] View all users (tradies and their settings)
- [ ] Search users by name, email, phone
- [ ] User statistics (join date, last active, job count)
- [ ] Login-as functionality for testing
- [ ] Enable/disable user accounts

#### Job Management
- [ ] View all jobs across platform
- [ ] Advanced filtering (status, date, tradie, customer)
- [ ] Bulk actions (status updates, assignments)
- [ ] Edit job details
- [ ] Delete test/incorrect data

#### Analytics Dashboard
- [ ] Platform statistics (users, jobs, revenue)
- [ ] Growth metrics (new users, job volume)
- [ ] Tradie performance metrics
- [ ] Customer insights (multi-tradie usage)
- [ ] Geographic distribution

### 2.2 Implementation Tasks
- [ ] Create `/admin` route with protection
- [ ] Add `is_admin` field to profiles
- [ ] Build admin layout component
- [ ] Create user management table
- [ ] Implement login-as functionality
- [ ] Build job management interface
- [ ] Create analytics components

## Phase 3: Settings & Configuration

### 3.1 Tradie Settings
- [ ] Business information form
- [ ] Service area configuration
- [ ] Operating hours
- [ ] Team member management
- [ ] Notification preferences

### 3.2 Twilio Integration
- [ ] Twilio credentials form
- [ ] Phone number management
- [ ] SMS template editor
- [ ] Webhook configuration
- [ ] Test SMS functionality

### 3.3 Branding Customization
- [ ] Logo upload
- [ ] Color scheme picker
- [ ] Custom domain settings
- [ ] Email template editor
- [ ] Intake form customization

## Phase 4: Enhanced Features

### 4.1 Communication Center
- [ ] System announcements
- [ ] Direct messaging to users
- [ ] Bulk email/SMS campaigns
- [ ] Support ticket system

### 4.2 Advanced Analytics
- [ ] Revenue tracking
- [ ] Conversion funnels
- [ ] Customer lifetime value
- [ ] Churn analysis
- [ ] Predictive insights

### 4.3 Automation Tools
- [ ] Auto-assignment rules
- [ ] Follow-up reminders
- [ ] Review requests
- [ ] Inactive user re-engagement

## Database Schema Updates

```sql
-- Add admin flag to profiles
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Add business settings
CREATE TABLE business_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  business_name TEXT,
  abn TEXT,
  logo_url TEXT,
  primary_color TEXT,
  service_areas JSONB,
  operating_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add audit log for admin actions
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add view for customer jobs (see all tradies)
CREATE VIEW customer_jobs_view AS
SELECT 
  j.*,
  p.name as tradie_name,
  p.user_id as tradie_id,
  bs.business_name as tradie_business_name
FROM jobs j
JOIN profiles p ON j.client_id = p.user_id
LEFT JOIN business_settings bs ON p.user_id = bs.user_id;
```

## Implementation Priority

### Week 1: Multi-Tradie Support
1. Update customer dashboard queries
2. Add tradie info to job cards
3. Implement filtering
4. Test with existing data

### Week 2: Basic Admin Dashboard
1. Create admin route and protection
2. Build user management table
3. Implement login-as feature
4. Basic job overview

### Week 3: Settings & Twilio
1. Create settings pages
2. Build Twilio integration
3. Add branding options
4. Test SMS functionality

### Week 4: Analytics & Polish
1. Build analytics dashboard
2. Add audit logging
3. Create help documentation
4. Performance optimization

## Success Metrics
- Admin can view and manage all users
- Customers can see jobs from multiple tradies
- Tradies can configure their business settings
- Platform owner has full visibility and control
- All actions are audited for security

## Notes
- Keep MVP scope focused
- Prioritize core functionality over advanced features
- Ensure mobile responsiveness for all interfaces
- Maintain security and data isolation
- Plan for future scalability
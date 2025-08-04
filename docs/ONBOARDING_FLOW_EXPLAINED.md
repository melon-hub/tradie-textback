# Onboarding Flow Explained

## Overview
This document explains how the onboarding system works for real tradies signing up for the service.

## Sign Up Flow

### 1. Initial Sign Up (Magic Link)
When a new tradie wants to sign up:
1. They go to the website and click "Sign Up" or "Get Started"
2. Enter their email address
3. Receive a magic link via email
4. Click the link to authenticate

### 2. Profile Creation & User Type
After first-time authentication:
1. A profile is automatically created via database trigger
2. They're prompted to select their user type:
   - **Tradie** (service provider) → Goes to onboarding
   - **Client** (customer) → Goes to intake form

### 3. Automatic Onboarding Redirect
For new tradies:
- The `RequireOnboarding` component checks if:
  - User type is 'tradie'
  - `onboarding_completed` is false
- If both conditions are true, they're automatically redirected to `/onboarding`

### 4. Onboarding Wizard Steps
The tradie goes through 6 steps:
1. **Basic Info**: Name, phone, primary trade, experience
2. **Business Details**: ABN, insurance, license info
3. **Service Area**: Postcodes or radius they service
4. **Twilio Setup**: Phone number provisioning (optional)
5. **SMS Templates**: Customize automated messages
6. **Review & Complete**: Confirm all information

### 5. Post-Onboarding
Once completed:
- `onboarding_completed` is set to true
- They're redirected to the dashboard
- Can now receive and manage jobs

## Protected Routes

Routes that require onboarding completion:
- `/dashboard` - Main job management interface
- `/settings` - Account settings
- Any future tradie-specific routes

## Development vs Production

### Development (Current)
- Use Dev Drawer to switch between test users
- Password authentication for dev users
- Direct navigation to `/onboarding` for testing

### Production
- Real email addresses with magic links
- Automatic onboarding flow for new tradies
- No manual navigation needed

## Implementation Details

### Key Components
1. **RequireOnboarding** - HOC that enforces onboarding
2. **OnboardingWizard** - The 6-step wizard UI
3. **useOnboarding** - Hook for onboarding state management

### Database Fields
- `user_type`: 'tradie' or 'client'
- `onboarding_completed`: boolean
- `onboarding_step`: 0-6 (tracks progress)

### Auto-Save Feature
- Progress is saved every 30 seconds
- Users can leave and return to continue
- Step data persists in the database

## Testing Instructions

### For Development
1. Run the safe SQL script to create/update dev users
2. Use Dev Drawer to login as 'tradie@dev.local'
3. You'll be redirected to onboarding automatically
4. Complete the wizard or skip steps as needed

### For Production Testing
1. Sign up with a real email
2. Receive magic link
3. Complete onboarding flow
4. Verify data saved to database

## Future Enhancements

### Phase 4 (Twilio Integration)
- Actual phone number provisioning
- Webhook configuration
- SMS testing within onboarding

### Phase 5 (Settings Enhancement)
- Edit onboarding data post-completion
- Re-run specific steps
- Update business information

### Marketing Integration
- Lead capture forms
- Pre-filled onboarding data
- Conversion tracking
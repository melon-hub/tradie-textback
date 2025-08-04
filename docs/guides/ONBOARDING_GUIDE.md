# Onboarding System Guide

<!-- Created: 2025-08-04 - Comprehensive guide for the tradie onboarding system -->

## Overview

The TradiePro onboarding system provides a comprehensive 6-step wizard that guides new tradies through account setup, business configuration, and SMS integration. This guide covers both the technical implementation and user experience.

## System Architecture

### Components Overview

```
Public Flow:
Landing Page → Onboarding Wizard → Email Capture → Magic Link → Dashboard

Components:
- OnboardingPublic.tsx: Public wrapper for unauthenticated users
- OnboardingWizard.tsx: Main wizard container with progress tracking
- Step Components: 6 specialized forms for each onboarding stage
- EmailPreview.tsx: Shows welcome email preview
- RequireOnboarding.tsx: Ensures users complete onboarding
```

### Database Schema

The onboarding system uses these enhanced tables:
- **profiles**: 18 new fields for comprehensive tradie data
- **trade_types**: 10 trade classifications with urgency levels
- **service_locations**: Postcode-based service areas
- **tenant_sms_templates**: Customizable message templates
- **twilio_settings**: Secure phone configuration

## Onboarding Flow

### Step 1: Welcome
- Introduction to the platform
- Overview of benefits
- Sets expectations for the process

### Step 2: Basic Information
- Full name and contact details
- Primary trade selection
- Secondary trades (optional)
- Years of experience

### Step 3: Business Details
- Business name and ABN
- License number (optional)
- Insurance details (optional)
- Business description/bio

### Step 4: Service Area
- Choice between postcode list or radius
- Postcode entry with validation
- Service radius in kilometers
- Maximum travel distance

### Step 5: SMS Templates (Optional)
- 7 pre-configured templates
- Customization with variables
- Character count validation
- Skip option available

### Step 6: Review & Confirm
- Summary of all entered data
- Terms and privacy acceptance
- Edit capability for any section
- Final submission

### Email Capture
- Email address collection
- Magic link generation
- Welcome email preview
- Account activation

## Technical Implementation

### State Management
```typescript
// OnboardingContext provides centralized state
const { state, updateStep, validateStep, submitOnboarding } = useOnboarding();

// Auto-save functionality
useEffect(() => {
  const timer = setTimeout(() => {
    if (hasChanges) saveStepData();
  }, 30000); // 30 seconds
}, [formData]);
```

### Validation
- Zod schemas for type-safe validation
- Real-time field validation
- Step-level validation before progression
- Comprehensive error messages

### Security
- Twilio credentials stored in Supabase Vault
- RLS policies for data isolation
- Input sanitization
- HTTPS-only communication

## Development & Testing

### Test Users
10 pre-configured test tradies at different stages:
```sql
-- Run the test data script
\i scripts/create-onboarding-test-data.sql
```

### Dev Drawer Presets
Quick access to test scenarios:
- Mike (Plumber) - Not started
- Sarah (Electrician) - Step 2
- Dave (Carpenter) - Step 4
- Lisa (HVAC) - Step 6
- Emma (Landscaper) - Complete

### E2E Testing
```bash
# Run onboarding E2E tests
npm run test:e2e -- onboarding.spec.ts
```

## Settings Integration

After onboarding, users can manage their profile through the enhanced settings page:

### Settings Tabs
1. **Profile**: Personal and trade information
2. **Business Details**: Business info and credentials
3. **Service Areas**: Geographic coverage
4. **Pricing & Availability**: Rates and schedule
5. **SMS Templates**: Message customization
6. **Twilio Settings**: Phone configuration

### Key Features
- Auto-save on all forms
- Mobile-responsive design
- Comprehensive validation
- Real-time feedback

## SMS Templates System

### Template Library
20+ professional templates organized by:
- Trade type (plumber, electrician, etc.)
- Message purpose (quotes, scheduling, etc.)
- Automation level (automatic, manual)

### Variable System
50+ variables organized into groups:
- Customer (name, phone, address)
- Business (name, phone, email)
- Job (type, date, time, cost)
- Dynamic (current date/time)

### Features
- Mobile preview with character count
- One-click template application
- Search and filter capabilities
- Trade-specific suggestions

## Twilio Integration

### Self-Service Setup
1. Enter Twilio credentials
2. Search available phone numbers
3. Select and provision number
4. Test SMS functionality
5. Configure webhooks

### Security
- Credentials encrypted in Vault
- Never stored in database
- Comprehensive validation
- Error recovery guidance

## Best Practices

### User Experience
- Keep forms simple and focused
- Provide clear progress indication
- Allow skipping optional steps
- Enable editing at review stage
- Show value at each step

### Performance
- Implement auto-save to prevent data loss
- Use optimistic updates
- Lazy load heavy components
- Cache form data locally

### Mobile Optimization
- Touch-friendly form controls
- Responsive layouts
- Minimal typing required
- Clear error messages
- Progress persistence

## Troubleshooting

### Common Issues

**User can't proceed past a step**
- Check validation errors
- Verify required fields are filled
- Look for console errors
- Check network requests

**Auto-save not working**
- Verify Supabase connection
- Check RLS policies
- Look for validation errors
- Monitor network tab

**Twilio setup fails**
- Verify credentials format
- Check account permissions
- Ensure Vault is configured
- Review error messages

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('onboarding_debug', 'true');

// View state in console
window.__ONBOARDING_STATE__
```

## Deployment Checklist

### Pre-Deployment
- [ ] Run all tests (106 should pass)
- [ ] Verify test data is excluded
- [ ] Configure production environment
- [ ] Set up Supabase Vault
- [ ] Configure Twilio webhooks

### Post-Deployment
- [ ] Test complete flow with real data
- [ ] Monitor error tracking
- [ ] Check performance metrics
- [ ] Verify email delivery
- [ ] Test on multiple devices

## Future Enhancements

### Planned Features
- Social login options
- Document upload (licenses, insurance)
- Team member invitations
- Advanced service area mapping
- Multi-language support

### Integration Opportunities
- Accounting software sync
- Calendar integration
- Payment processing
- Review platform connections
- Marketing automation

## Support Resources

### Documentation
- [Database Schema](../reference/database-schema.md)
- [Testing Guide](../TESTING.md)
- [API Reference](../reference/api-docs.md)

### Common Tasks
- Adding new trade types
- Customizing templates
- Modifying validation rules
- Adding form fields

For additional support, refer to the project documentation or contact the development team.
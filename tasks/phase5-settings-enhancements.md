# Phase 5: Settings Page Enhancements Implementation Plan

## Project Overview
Update the settings page to allow users to edit all the information they entered during onboarding. The settings should be organized into logical sections with a clean, user-friendly interface that's consistent with the onboarding experience but more compact since users are already familiar with the fields.

## Current State Analysis
- **Existing Settings Page**: Has basic structure with Business and Twilio tabs
- **Onboarding System**: Contains all required fields across multiple steps
- **Missing Components**: Personal info, service areas, pricing, SMS templates need to be added
- **Database Tables**: All required tables exist from onboarding implementation

## Required Settings Sections

### 1. Personal Information (New)
- **Fields**: Name, phone, email, primary trade, secondary trades, years of experience
- **Source**: BasicInfoStep from onboarding
- **Database**: `profiles` table
- **Component**: `PersonalInfoForm.tsx`

### 2. Business Details (Enhanced)
- **Current Fields**: Business name, phone, email, address, website, service area, operating hours, emergency availability, ABN, license number, business description
- **Additional Fields Needed**: Bio, insurance provider, insurance expiry, license expiry
- **Source**: BusinessDetailsStep from onboarding + existing BusinessInfoForm
- **Database**: `business_settings` table + `profiles` table
- **Component**: Enhanced `BusinessInfoForm.tsx`

### 3. Service Areas (New)
- **Fields**: Service postcodes/suburbs, max travel distance (radius), base location address, emergency callout availability
- **Source**: ServiceAreaStep from onboarding
- **Database**: `profiles` table (service_postcodes, service_radius_km)
- **Component**: `ServiceAreaForm.tsx`

### 4. Pricing (New)
- **Fields**: Hourly rates (min/max), preferred job types, pricing notes
- **Source**: Not in current onboarding - new feature
- **Database**: `profiles` table (needs new fields) or new `pricing_settings` table
- **Component**: `PricingForm.tsx`

### 5. Twilio Settings (Existing)
- **Status**: Already implemented and working
- **Component**: `TwilioSettingsForm.tsx`

### 6. SMS Templates (New)
- **Fields**: All SMS template types with customizable content
- **Source**: TemplatesStep from onboarding
- **Database**: `tenant_sms_templates` table
- **Component**: `SMSTemplatesForm.tsx`

## Implementation Tasks

### 1. Create Personal Information Component ⏳
- [x] **File**: `/src/components/settings/PersonalInfoForm.tsx`
- [ ] **Features**:
  - Name, phone, email editing
  - Primary and secondary trade selection
  - Years of experience slider/input
  - Integration with profiles table
  - Validation matching onboarding schema
  - Auto-save functionality

### 2. Enhance Business Details Component ⏳
- [x] **File**: `/src/components/settings/BusinessInfoForm.tsx` (enhance existing)
- [ ] **Add Missing Fields**:
  - Business bio/description (longer textarea)
  - Website URL validation
  - Insurance provider and expiry date
  - License expiry date (if license number exists)
  - Professional credentials section
- [ ] **Improve UX**:
  - Better organization with sections
  - Date pickers for expiry dates
  - Character count for bio field
  - Website preview functionality

### 3. Create Service Area Component ⏳
- [x] **File**: `/src/components/settings/ServiceAreaForm.tsx`
- [ ] **Features**:
  - Toggle between postcodes and radius-based service areas
  - Postcode search and selection (reuse from onboarding)
  - Radius configuration with map visualization
  - Base location address management
  - Emergency callout availability toggle
  - Service area validation and display

### 4. Create Pricing Component ⏳
- [x] **File**: `/src/components/settings/PricingForm.tsx`
- [ ] **Features**:
  - Hourly rate range inputs (min/max)
  - Preferred job types multi-select
  - Call-out fees configuration
  - Emergency rates (if different)
  - Pricing notes/terms
  - Currency formatting and validation

### 5. Create SMS Templates Component ⏳
- [x] **File**: `/src/components/settings/SMSTemplatesForm.tsx`
- [ ] **Features**:
  - List all template types from onboarding
  - Live preview with variable substitution
  - Character count for SMS limits
  - Template categories (job lifecycle, marketing, etc.)
  - Import/export functionality
  - Reset to defaults option
  - Custom template creation

### 6. Update Main Settings Page ⏳
- [x] **File**: `/src/pages/Settings.tsx` (update existing)
- [ ] **New Tab Structure**:
  - Personal (PersonalInfoForm)
  - Business (Enhanced BusinessInfoForm)
  - Service Area (ServiceAreaForm)
  - Pricing (PricingForm)
  - SMS/Twilio (TwilioSettingsForm)
  - Templates (SMSTemplatesForm)
- [ ] **Enhanced Navigation**:
  - Better tab icons and labels
  - Progress indicators for incomplete sections
  - Mobile-responsive tab switching
  - Unsaved changes warnings

### 7. Auto-Save Implementation ⏳
- [x] **Service**: `/src/hooks/useAutoSave.ts`
- [ ] **Features**:
  - Debounced auto-save (2-3 seconds after changes)
  - Visual indicators for save status
  - Conflict resolution for concurrent edits
  - Offline/online state handling
  - Success/error toast notifications
  - Manual save triggers

### 8. Enhanced UX Features ⏳
- [ ] **Search/Filter**: Quick search across all settings
- [ ] **Import/Export**: Backup and restore settings
- [ ] **Validation**: Real-time validation with helpful errors
- [ ] **Help System**: Tooltips and help text throughout
- [ ] **Mobile Optimization**: Touch-friendly controls
- [ ] **Keyboard Navigation**: Full accessibility support

## Database Schema Considerations

### New Fields Needed (if not existing)
```sql
-- Add to profiles table if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate_min INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate_max INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_job_types TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trade_secondary TEXT[];
```

### Existing Tables to Use
- `profiles` - Personal info, trade details, service areas
- `business_settings` - Business details, contact info
- `twilio_settings` - Twilio configuration
- `tenant_sms_templates` - SMS template management

## User Experience Design

### Consistency with Onboarding
- **Reuse Components**: Where possible, reuse validation schemas and input components
- **Similar Layout**: Maintain familiar card-based layout
- **Progressive Disclosure**: Group related fields, use collapsible sections
- **Same Visual Language**: Consistent buttons, colors, typography

### Settings-Specific Improvements
- **Compact Layout**: More fields visible at once
- **Batch Operations**: Select multiple templates to edit
- **Quick Actions**: Common tasks easily accessible
- **Context-Aware Help**: Different help content than onboarding
- **Change Tracking**: Show what's been modified since last save

### Mobile Considerations
- **Touch Targets**: Larger buttons and inputs
- **Swipe Navigation**: Between tabs on mobile
- **Collapsible Sections**: Save screen space
- **Sticky Actions**: Save/cancel always visible

## Error Handling & Validation

### Form Validation
- **Real-time**: Validate as user types
- **Cross-field**: Check dependencies between fields
- **Business Logic**: Ensure rates are logical, dates are future
- **Format Validation**: Phone numbers, emails, ABNs, etc.

### Error Recovery
- **Graceful Degradation**: Work offline where possible
- **Retry Logic**: Auto-retry failed saves
- **Conflict Resolution**: Handle concurrent edits
- **Data Recovery**: Restore from local storage if needed

### User Feedback
- **Success States**: Clear confirmation of saves
- **Error Messages**: Specific, actionable error text
- **Loading States**: Show progress for long operations
- **Dirty State**: Warn before leaving unsaved changes

## Performance Considerations

### Data Loading
- **Lazy Loading**: Load tab data when accessed
- **Caching**: Cache frequently accessed data
- **Optimistic Updates**: Update UI immediately, sync later
- **Bundle Splitting**: Code split by tab for faster initial load

### Auto-Save Optimization
- **Debouncing**: Avoid excessive API calls
- **Dirty Checking**: Only save changed fields
- **Batching**: Group related changes
- **Background Sync**: Non-blocking saves

## Security Requirements

### Data Protection
- **Input Sanitization**: All user inputs sanitized
- **RLS Policies**: Row-level security enforced
- **Audit Trail**: Track changes for compliance
- **Data Validation**: Server-side validation required

### Access Control
- **User Isolation**: Users can only edit their own data
- **Admin Overrides**: Admin users can edit all settings
- **Feature Flags**: Control access to new features
- **Rate Limiting**: Prevent abuse of save endpoints

## Testing Strategy

### Unit Tests
- **Form Validation**: Test all validation rules
- **Auto-save Logic**: Test debouncing and retry
- **Error Handling**: Test all error scenarios
- **Data Transformation**: Test format conversions

### Integration Tests
- **Database Operations**: Test all CRUD operations
- **Cross-component**: Test data flow between forms
- **Navigation**: Test tab switching and routing
- **Mobile Responsiveness**: Test on various screen sizes

### User Acceptance
- **Real Data**: Test with actual user profiles
- **Edge Cases**: Long text, special characters, etc.
- **Performance**: Test with slow connections
- **Accessibility**: Screen reader and keyboard testing

## Success Criteria

### Functionality
- [ ] All onboarding fields available in settings
- [ ] Auto-save works reliably without conflicts
- [ ] Validation matches onboarding behavior
- [ ] Mobile experience is smooth and intuitive
- [ ] Search and filtering work across all fields

### Performance
- [ ] Initial load under 2 seconds
- [ ] Tab switching is instant
- [ ] Auto-save doesn't block UI
- [ ] Works offline for viewing/editing
- [ ] Graceful degradation on slow connections

### User Experience
- [ ] Intuitive navigation and organization
- [ ] Clear feedback for all user actions
- [ ] Help content is contextual and useful
- [ ] Error messages are actionable
- [ ] Consistent with rest of application

### Technical
- [ ] Code is well-structured and maintainable
- [ ] Full TypeScript coverage
- [ ] Comprehensive error handling
- [ ] Proper accessibility implementation
- [ ] Security best practices followed

## Migration Plan

### Phase 5.1: Core Components (Week 1)
- Create PersonalInfoForm component
- Enhance BusinessInfoForm with missing fields
- Create ServiceAreaForm component
- Update Settings.tsx with new tab structure

### Phase 5.2: Advanced Features (Week 2)
- Create PricingForm component
- Create SMSTemplatesForm component
- Implement auto-save functionality
- Add validation and error handling

### Phase 5.3: Polish & Testing (Week 3)
- Mobile optimization and responsive design
- Accessibility improvements
- Performance optimization
- Comprehensive testing and bug fixes

### Phase 5.4: Deployment (Week 4)
- User acceptance testing
- Documentation updates
- Production deployment
- Monitor and address any issues

## Implementation Notes

### Component Reusability
- Extract shared form components where possible
- Create custom hooks for common patterns
- Use consistent validation schemas
- Implement shared error handling

### Data Management
- Use React Query for server state management
- Implement optimistic updates for better UX
- Cache form data locally to prevent loss
- Handle race conditions in auto-save

### Accessibility
- Proper ARIA labels and descriptions
- Keyboard navigation for all interactions
- Screen reader announcements for state changes
- High contrast mode support

This plan provides a comprehensive roadmap for implementing all the missing settings functionality while maintaining consistency with the existing onboarding system and providing an excellent user experience.
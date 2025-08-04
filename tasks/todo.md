# Onboarding Wizard UI System - Implementation Plan

## Project Overview
Create a comprehensive onboarding wizard UI system for tradies with 6 steps, state management, validation, and auto-save functionality using shadcn/ui components and Tailwind CSS.

## Prerequisites Analysis
- ✅ Project uses React + TypeScript + Vite
- ✅ shadcn/ui components available
- ✅ Tailwind CSS configured
- ✅ React Hook Form + Zod validation available
- ✅ Supabase database integration ready
- ✅ Onboarding schema migration exists

## Implementation Plan

### Step 1: Create Directory Structure
- [ ] Create `/src/components/onboarding/` directory
- [ ] Create `/src/components/onboarding/steps/` subdirectory
- [ ] Create `/src/types/onboarding.ts` for TypeScript interfaces

### Step 2: Core Infrastructure Components
- [ ] Create `OnboardingContext.tsx` - Context provider for state management
- [ ] Create `OnboardingWizard.tsx` - Main container component with progress bar
- [ ] Create validation schemas file `validation.ts` using Zod

### Step 3: Individual Step Components
- [ ] Create `BasicInfoStep.tsx` (Step 1)
  - Name, phone, email, trade type, years experience
  - Form validation with Zod schema
  - Auto-save functionality
- [ ] Create `BusinessDetailsStep.tsx` (Step 2)
  - ABN, insurance details, license info, specializations
  - File upload for certificates (placeholder)
- [ ] Create `ServiceAreaStep.tsx` (Step 3)
  - Postcode selection or radius-based service area
  - Travel surcharge configuration
- [ ] Create `TwilioSetupStep.tsx` (Step 4)
  - Phone number provisioning interface (placeholder UI)
  - Skip functionality for later setup
- [ ] Create `TemplatesStep.tsx` (Step 5)
  - SMS template customization interface
  - Preview functionality
- [ ] Create `ReviewStep.tsx` (Step 6)
  - Summary of all entered information
  - Final confirmation and submission

### Step 4: State Management & Auto-save
- [ ] Implement onboarding context with:
  - Current step tracking
  - Form data persistence across steps
  - Validation state management
  - Auto-save to database every 30 seconds
  - Skip step functionality

### Step 5: Navigation & Progress
- [ ] Create progress bar with step indicators
- [ ] Implement next/previous navigation
- [ ] Add step validation before progression
- [ ] Handle browser back/forward navigation

### Step 6: Mobile Responsiveness & Accessibility
- [ ] Ensure all components are mobile-first responsive
- [ ] Add proper ARIA labels and keyboard navigation
- [ ] Test across different screen sizes
- [ ] Implement smooth transitions and animations

### Step 7: Database Integration
- [ ] Connect auto-save to profiles table
- [ ] Update onboarding_step field on progression
- [ ] Set onboarding_completed = true on finish
- [ ] Handle offline/online state management

### Step 8: Error Handling & UX
- [ ] Add loading states during saves
- [ ] Implement error notifications
- [ ] Add confirmation dialogs for navigation
- [ ] Handle network failures gracefully

## File Structure Plan
```
src/components/onboarding/
├── OnboardingWizard.tsx        # Main container
├── OnboardingContext.tsx       # State management
├── validation.ts               # Zod schemas
└── steps/
    ├── BasicInfoStep.tsx       # Step 1
    ├── BusinessDetailsStep.tsx # Step 2
    ├── ServiceAreaStep.tsx     # Step 3
    ├── TwilioSetupStep.tsx     # Step 4
    ├── TemplatesStep.tsx       # Step 5
    └── ReviewStep.tsx          # Step 6

src/types/
└── onboarding.ts              # TypeScript interfaces
```

## Technical Requirements
- **Framework**: React with TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS with mobile-first approach
- **Form Handling**: React Hook Form
- **Validation**: Zod schemas
- **State Management**: React Context API
- **Database**: Supabase with auto-save
- **Routing**: React Router integration

## Design Principles
- Mobile-first responsive design
- Accessibility compliance (ARIA standards)
- Smooth animations and transitions
- Clear progress indication
- Intuitive user experience
- Consistent design system
- Performance optimization

## Quality Checklist
For each component:
- [ ] TypeScript interfaces properly defined
- [ ] Zod validation schemas implemented
- [ ] Mobile responsive across all breakpoints
- [ ] Accessibility standards met
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Auto-save functionality working
- [ ] Smooth animations implemented
- [ ] Cross-browser compatibility tested

## Testing Plan
- [ ] Unit tests for validation schemas
- [ ] Integration tests for auto-save
- [ ] E2E tests for complete wizard flow
- [ ] Mobile device testing
- [ ] Accessibility testing
- [ ] Cross-browser testing

## Success Criteria
- Complete 6-step onboarding wizard functional
- All form data auto-saves to database
- Mobile-responsive across all screen sizes
- Smooth user experience with clear progress
- Proper error handling and validation
- Accessibility compliant
- Integration with existing profile system

---

## Notes
- This builds on the existing onboarding schema migration
- Uses existing shadcn/ui component library
- Integrates with current Supabase database
- Follows project's TypeScript and React patterns
- Maintains consistency with existing UI components
# Improved Signup Flow

## Current Implementation (Better Approach)

### User Journey
```
Landing Page → "Start 14-day trial" → Onboarding (no login) → Enter email → Magic link → Dashboard
```

### Benefits
1. **Lower Friction**: No login required to start
2. **Better Conversion**: Users see value before creating account
3. **Commitment First**: Collect business info before account creation
4. **Smooth Experience**: One continuous flow

## How It Works

### 1. Landing Page (`/`)
- Marketing content
- "Start 14-day Free Trial" button
- "Sign In" for existing users

### 2. Public Onboarding (`/onboarding`)
- No authentication required
- Collect all business information:
  - Basic info (name, trade, experience)
  - Business details (ABN, insurance)
  - Service areas
  - SMS templates
- Data stored temporarily in browser

### 3. Email Collection
- After completing onboarding steps
- Single email field
- "Start Free Trial" button

### 4. Magic Link
- Email sent with activation link
- Link contains onboarding data
- One click to activate account

### 5. Account Activation
- User clicks magic link
- Account created with all onboarding data
- Redirected to dashboard
- Ready to use immediately

## Technical Implementation

### Routes
- `/` - Landing page (public)
- `/onboarding` - Public onboarding wizard
- `/auth` - Sign in page
- `/dashboard` - Protected route (requires auth + onboarding)

### Components
- `LandingPage.tsx` - Marketing page
- `OnboardingPublic.tsx` - Public onboarding flow
- `RequireOnboarding.tsx` - Route protection

### Data Flow
1. Onboarding data collected in browser
2. Passed to Supabase auth metadata
3. Profile created on first login
4. Data populated from auth metadata

## Testing

### Development
1. Go to http://localhost:8080/
2. Click "Start 14-day Free Trial"
3. Complete onboarding steps
4. Enter email
5. Check console for magic link (dev mode)

### Production
- Real emails sent
- Proper domain configuration
- SSL certificates required

## Future Enhancements

### Conversion Optimization
- A/B test button text
- Track drop-off points
- Optimize step order
- Add progress saving

### Lead Capture
- Save partial completions
- Follow-up emails
- Retargeting pixels
- Analytics integration

### Personalization
- Pre-fill from URL params
- Industry-specific flows
- Location-based defaults
- Referral tracking
# User Flow Diagrams

<!-- Updated: 2025-08-04 - Added comprehensive onboarding flow with 6-step wizard -->

## Current System Flows

### 1. New Tradie Onboarding Flow (Public Signup)

```
┌─────────────────┐
│   Landing Page  │
│       (/)       │
│ "Start 14-Day  │
│  Free Trial"    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│          Onboarding Wizard                  │
│         (/get-started)                      │
│                                             │
│  Step 1: Welcome                            │
│  Step 2: Basic Info (Name, Trade, Phone)   │
│  Step 3: Business Details (ABN, License)   │
│  Step 4: Service Areas (Postcodes/Radius)  │
│  Step 5: SMS Templates (Optional)          │
│  Step 6: Review & Confirm                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Email Capture │
         │  & Preview    │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐     ┌──────────────┐
         │  Magic Link   │────▶│  Dashboard   │
         │   Sent        │     │ (Onboarded) │
         └───────────────┘     └──────────────┘
```

### 2. Existing User Login Flow

```
┌─────────────────┐
│   Landing Page  │
│       (/)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Choose Action  │────▶│   Auth Page     │
│                 │     │   (/auth)       │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
               ┌──────────────┐  ┌──────────────┐
               │ Phone Login  │  │ Email Login  │
               │ (SMS OTP)    │  │ (Magic Link) │
               └──────┬───────┘  └──────┬───────┘
                      │                 │
                      └────────┬────────┘
                               ▼
                      ┌─────────────────┐
                      │   Dashboard     │
                      │ (/dashboard)    │
                      └─────────────────┘
```

### 3. Client Flow (Customer) - NEEDS FIXING

```
┌─────────────────┐
│   Dashboard     │
│  (/dashboard)   │
│ ┌─────────────┐ │
│ │ Your Jobs   │ │
│ │ - Job List  │ │
│ └─────────────┘ │
└────────┬────────┘
         │
         ├─────────────────┐
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  Job Details    │  │  Secure Access  │
│  (/job/:id)     │  │ (/secure/:id)   │
│                 │  │ (Phone verify)  │
│ - View status   │  └────────┬────────┘
│ - See updates   │           │
│ - Contact info  │           ▼
└─────────────────┘  ┌─────────────────┐
                     │  Job Details    │
                     │  (Protected)    │
                     └─────────────────┘

Note: Clients can only see their own jobs
```

### 4. Tradie Flow (Business Owner) - NEEDS FIXING

```
┌─────────────────────┐
│     Dashboard       │
│   (/dashboard)      │
│ ┌─────────────────┐ │
│ │ Manage Business │ │
│ │ - All Jobs      │ │
│ │ - Analytics     │ │
│ └─────────────────┘ │
└──────────┬──────────┘
           │
    ┌──────┴──────┬─────────┬──────────┐
    ▼             ▼         ▼          ▼
┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
│   Jobs   │ │   Job    │ │Settings│ │  Admin   │
│  (List)  │ │ Details  │ │(/sett- │ │Dashboard │
│          │ │(/job/:id)│ │ ings)  │ │ (/admin) │
│ - Filter │ │          │ │        │ │   *if    │
│ - Search │ │ - Edit   │ │- Biz   │ │  admin   │
│ - Sort   │ │   quote  │ │  info  │ └──────────┘
└──────────┘ │ - Update │ │- Twilio│
             │   status │ │- Notif │
             │ - Add    │ └────────┘
             │   notes  │
             └──────────┘
```

### 5. Admin Flow

```
┌────────────────────┐
│   Admin Dashboard  │
│     (/admin)       │
│ ┌────────────────┐ │
│ │ - User Mgmt    │ │
│ │ - Job Overview │ │
│ │ - Analytics    │ │
│ └────────────────┘ │
└─────────┬──────────┘
          │
    ┌─────┴─────┬──────────┬────────────┐
    ▼           ▼          ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│  Users  │ │  Jobs   │ │Analytics│ │ Settings │
│  Table  │ │  Table  │ │  View   │ │  Page    │
│         │ │         │ │         │ │          │
│- Search │ │- All    │ │- Stats  │ │- System  │
│- Filter │ │  jobs   │ │- Charts │ │  config  │
│- Login  │ │- Edit   │ │- Export │ │- Integr- │
│  as user│ │  any    │ │         │ │  ations  │
└────┬────┘ └─────────┘ └─────────┘ └──────────┘
     │
     ▼
┌─────────────────┐     ┌──────────────────┐
│  Impersonation  │────▶│ User's Dashboard │
│     Active      │     │   (as user)      │
│ (Shows banner)  │     └──────────────────┘
└─────────────────┘
```

## Page Access Matrix

```
┌─────────────────────┬────────┬────────┬────────┬────────┐
│      Page/Route     │ Visitor│ Client │ Tradie │ Admin  │
├─────────────────────┼────────┼────────┼────────┼────────┤
│ / (Landing)         │   ✓    │   ✓    │   ✓    │   ✓    │
│ /auth (Login)       │   ✓    │   ✓    │   ✓    │   ✓    │
│ /dashboard          │   ✗    │   ✓    │   ✓    │   ✓    │
│ /job/:id            │   ✗    │  Own   │   ✓    │   ✓    │
│ /secure/:id         │  Phone │  Phone │  Phone │  Phone │
│ /settings           │   ✗    │   ✗    │   ✓    │   ✓    │
│ /admin              │   ✗    │   ✗    │   ✗    │   ✓    │
└─────────────────────┴────────┴────────┴────────┴────────┘
```

## 🚨 IDENTIFIED ISSUES

### Terminology Problem:
- "Client" in code = Tradie (business owner) - WRONG!
- "Tradie" in code = Admin user - WRONG!

### Missing Core Flow:
```
Customer calls → Missed call → SMS sent → No login needed!
```

## Proposed Simplified Flows

### 1. Customer Journey (People who call tradies)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Calls Tradie│────▶│ Missed Call │────▶│ Gets SMS    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                        ┌─────────────┐
                                        │ SMS Contains│
                                        │ - Job ref   │
                                        │ - Status    │
                                        │ - Link      │
                                        └──────┬──────┘
                                               │ (Optional)
                                               ▼
                                        ┌─────────────┐
                                        │ Click Link  │
                                        │ /secure/:id │
                                        │ (No login)  │
                                        └─────────────┘
```

### 2. Tradie Journey (Business owners)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Landing    │────▶│  Sign Up    │────▶│  Dashboard  │
│  Page (/)   │     │  (/auth)    │     │(/dashboard) │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼─────────────┐
                    ▼                          ▼             ▼
            ┌─────────────┐           ┌─────────────┐ ┌─────────────┐
            │ Job List    │           │ Job Detail  │ │  Settings   │
            │ - New jobs  │           │ (/job/:id)  │ │ - Business  │
            │ - Active    │           │ - Update    │ │ - Twilio    │
            │ - Completed │           │ - Quote     │ │ - SMS msgs  │
            └─────────────┘           └─────────────┘ └─────────────┘
```

### 3. Simplified Architecture
```
┌─────────────────────────────────────────────┐
│             Customer Journey                 │
│  Call → SMS → (Optional: Check status web)  │
└─────────────────────────────────────────────┘
                      ↕️
┌─────────────────────────────────────────────┐
│              Tradie Journey                  │
│  Sign up → Connect Twilio → Manage jobs     │
└─────────────────────────────────────────────┘
```

## Action Items
1. Fix terminology (client → tradie, customer for callers)
2. Remove customer login/dashboard requirement
3. Simplify to core flow: missed call → SMS → follow up
4. Mobile-first design for tradies
5. Remove unnecessary complexity
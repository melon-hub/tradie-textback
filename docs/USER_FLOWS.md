# User Flow Diagrams

## Current System Flows

### 1. New Visitor Flow (Unauthenticated)

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

### 2. Client Flow (Customer) - NEEDS FIXING

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

### 3. Tradie Flow (Business Owner) - NEEDS FIXING

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

### 4. Admin Flow

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
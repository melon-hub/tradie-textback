# User Flow Diagrams (Mermaid)

## How to View These Diagrams

### Option 1: VS Code (Recommended)
1. Install the "Markdown Preview Mermaid Support" extension
2. Open this file and press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows)
3. Diagrams will render automatically!

### Option 2: GitHub
- Just push this file - GitHub renders Mermaid automatically

### Option 3: Online
- Copy any diagram to [mermaid.live](https://mermaid.live)

---

## Current System Flows

### 1. New Visitor Flow

```mermaid
flowchart TD
    A[Landing Page /] --> B{Choose Action}
    B --> C[Auth Page /auth]
    C --> D[Phone Login - SMS OTP]
    C --> E[Email Login - Magic Link]
    D --> F[Dashboard]
    E --> F[Dashboard]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
```

### 2. Customer Flow (Currently Broken - They shouldn't need login!)

```mermaid
flowchart TD
    A[Customer Dashboard] --> B[Your Jobs List]
    B --> C[Job Details /job/:id]
    B --> D[Secure Access /secure/:id]
    D --> E[Phone Verification]
    E --> F[Protected Job View]
    
    style A fill:#fbb,stroke:#333,stroke-width:2px
    style B fill:#fbb,stroke:#333,stroke-width:2px
```

### 3. Tradie Business Owner Flow

```mermaid
flowchart TD
    A[Dashboard] --> B[Job List]
    A --> C[Job Details]
    A --> D[Settings]
    A --> E[Admin Panel<br/>if admin]
    
    B --> F[Filter Jobs]
    B --> G[Search Jobs]
    B --> H[Sort Jobs]
    
    C --> I[Edit Quote]
    C --> J[Update Status]
    C --> K[Add Notes]
    
    D --> L[Business Info]
    D --> M[Twilio Config]
    D --> N[Notifications]
    
    style A fill:#9f9,stroke:#333,stroke-width:2px
    style E fill:#ff9,stroke:#333,stroke-width:2px
```

### 4. Admin Flow

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[User Management]
    A --> C[Jobs Overview]
    A --> D[Analytics]
    A --> E[Settings]
    
    B --> F[Search Users]
    B --> G[Filter Users]
    B --> H[Login as User]
    
    H --> I[Impersonation Active<br/>Shows Banner]
    I --> J[User's Dashboard]
    J --> K[Exit Impersonation]
    K --> A
    
    style A fill:#ff9,stroke:#333,stroke-width:2px
    style I fill:#f99,stroke:#333,stroke-width:2px
```

---

## 🎯 Proposed Simplified Flows

### 1. Customer Journey (No Login Required!)

```mermaid
sequenceDiagram
    participant C as Customer
    participant P as Phone System
    participant T as Twilio
    participant S as Supabase
    participant SMS as SMS Service
    
    C->>P: Calls Tradie
    P->>P: Missed Call
    P->>T: Webhook Triggered
    T->>S: Create Job Record
    S->>SMS: Send SMS to Customer
    SMS->>C: "Thanks for calling!<br/>Job #1234<br/>Status: New<br/>Link: example.com/secure/1234"
    
    Note over C: Optional - Can check status
    C->>C: Clicks Link (Optional)
    C->>S: Views Job Status<br/>(Phone verification only)
```

### 2. Tradie Daily Workflow

```mermaid
flowchart LR
    A[Check Dashboard] --> B{New Jobs?}
    B -->|Yes| C[Review Urgent First]
    B -->|No| D[Check Active Jobs]
    
    C --> E[Click Job]
    E --> F[Update Quote/Status]
    F --> G[System Sends SMS]
    G --> H[Job Updated]
    
    D --> I[Follow Up Required?]
    I -->|Yes| J[Call Customer]
    I -->|No| K[Mark Complete]
    
    style A fill:#9f9,stroke:#333,stroke-width:2px
    style G fill:#9ff,stroke:#333,stroke-width:2px
```

### 3. System Architecture Overview

```mermaid
graph TB
    subgraph "Customer Side"
        A[Customer Phone]
    end
    
    subgraph "Twilio"
        B[Phone Number]
        C[Webhook]
        D[SMS API]
    end
    
    subgraph "Your App"
        E[Supabase Function]
        F[(Database)]
        G[React Dashboard]
    end
    
    subgraph "Tradie Side"
        H[Mobile/Desktop]
    end
    
    A -->|Calls| B
    B -->|Missed Call| C
    C -->|POST| E
    E -->|Store Job| F
    E -->|Send SMS| D
    D -->|Deliver| A
    
    H -->|View/Update| G
    G -->|Read/Write| F
    F -->|Trigger SMS| D
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#9f9,stroke:#333,stroke-width:2px
```

### 4. Simplified Page Access

```mermaid
graph TD
    subgraph "Public"
        A[Landing /]
        B[Auth /auth]
        C[Secure Job /secure/:id]
    end
    
    subgraph "Authenticated"
        D[Dashboard]
        E[Job Details /job/:id]
        F[Settings]
    end
    
    subgraph "Admin Only"
        G[Admin Panel]
    end
    
    A --> B
    B --> D
    C -.->|Phone Verify Only| E
    D --> E
    D --> F
    D --> G
    
    style A fill:#9f9,stroke:#333,stroke-width:2px
    style G fill:#f99,stroke:#333,stroke-width:2px
```

---

## Key Improvements Needed

```mermaid
mindmap
  root((Simplify))
    Fix Naming
      Client -> Tradie
      Customer for callers
    Remove Complexity
      No customer accounts
      No customer dashboard
      Phone verify only
    Mobile First
      One tap actions
      Large buttons
      Clear priorities
    Core Flow
      Missed Call
      Auto SMS
      Tradie Follows Up
```

---

## Implementation Priority

```mermaid
gantt
    title Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Critical
    Fix user type naming    :crit, a1, 2024-01-15, 2d
    Remove customer login   :crit, a2, after a1, 3d
    section Important
    Mobile optimization     :b1, after a2, 5d
    Simplify job flow      :b2, after a2, 4d
    section Nice to Have
    Advanced analytics     :c1, after b1, 7d
    Bulk operations        :c2, after b2, 5d
```
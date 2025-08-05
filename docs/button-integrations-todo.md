# Button Integrations & SMS Templates TODO

## Overview
This document tracks all buttons in the JobCard component that need proper SMS/notification integration and their required templates.

---

## 🔘 QUOTE SECTION BUTTONS

### 1. **"Send Quote" Button**
- **Location**: `JobCard.tsx:800` - Quote section, inline with price
- **Current Function**: `handleSendQuote()`
- **Status**: ❌ **NEEDS IMPLEMENTATION**

#### Required Integration:
```javascript
// Edge Function: send-quote-sms
await supabase.functions.invoke('send-quote-sms', {
  body: {
    jobId: job.id,
    customerPhone: job.phone,
    customerName: job.customer_name,
    quoteAmount: job.estimated_value,
    jobType: job.job_type,
    location: job.location
  }
});
```

#### SMS Template Needed:
```
Hi [CUSTOMER_NAME], 

Your [JOB_TYPE] quote for [LOCATION] is ready: $[QUOTE_AMOUNT]

This quote is valid for 30 days. Reply YES to book or call us with questions.

- [TRADIE_BUSINESS_NAME]
[TRADIE_PHONE]
```

---

## 📱 COMMUNICATION BUTTONS

### 2. **"Send SMS" Button**
- **Location**: `JobCard.tsx:828` - Actions section
- **Current Function**: `handleSMS()`
- **Status**: ❌ **NEEDS IMPLEMENTATION**

#### Required Integration:
```javascript
// Edge Function: send-custom-sms
await supabase.functions.invoke('send-custom-sms', {
  body: {
    jobId: job.id,
    customerPhone: phone,
    customerName: customerName,
    message: customMessage,
    senderId: profile.id
  }
});
```

#### SMS Templates Needed:
```
// General Contact Template
Hi [CUSTOMER_NAME], this is [TRADIE_NAME] regarding your [JOB_TYPE] job at [LOCATION]. Please reply with any questions.

// Job Update Template  
Hi [CUSTOMER_NAME], update on your [JOB_TYPE] job: [CUSTOM_MESSAGE]. We'll keep you posted!

// Scheduling Template
Hi [CUSTOMER_NAME], we'd like to schedule your [JOB_TYPE] job at [LOCATION]. When works best for you? Reply with preferred times.
```

---

## 📊 STATUS UPDATE BUTTONS

### 3. **"Contacted" Button**
- **Location**: `JobCard.tsx:851` - Status section
- **Current Function**: `handleStatusUpdate('contacted')`
- **Status**: ❌ **NEEDS SMS NOTIFICATION**

#### Required Integration:
```javascript
// Should trigger SMS to customer when marked as contacted
// Edge Function: send-status-update-sms
```

#### SMS Template:
```
Hi [CUSTOMER_NAME], we've received your [JOB_TYPE] request for [LOCATION]. We'll be in touch soon with next steps.

- [TRADIE_BUSINESS_NAME]
```

### 4. **"Quoted" Button** 
- **Location**: `JobCard.tsx:858` - Status section
- **Current Function**: `handleStatusUpdate('quoted')`
- **Status**: ❌ **NEEDS SMS NOTIFICATION**

#### SMS Template:
```
Hi [CUSTOMER_NAME], your [JOB_TYPE] has been assessed. Check your quote and reply to book: [JOB_LINK]

- [TRADIE_BUSINESS_NAME]
```

### 5. **"Scheduled" Button**
- **Location**: `JobCard.tsx:865` - Status section  
- **Current Function**: `handleStatusUpdate('scheduled')`
- **Status**: ❌ **NEEDS SMS NOTIFICATION**

#### SMS Template:
```
✅ Your [JOB_TYPE] job at [LOCATION] is scheduled for [SCHEDULED_DATE]. We'll text you before arrival.

- [TRADIE_BUSINESS_NAME]
[TRADIE_PHONE]
```

### 6. **"Completed" Button**
- **Location**: `JobCard.tsx:872` - Status section
- **Current Function**: `handleStatusUpdate('completed')`  
- **Status**: ❌ **NEEDS SMS NOTIFICATION**

#### SMS Template:
```
✅ Your [JOB_TYPE] job at [LOCATION] is complete! Thanks for choosing [TRADIE_BUSINESS_NAME]. 

Please leave a review: [REVIEW_LINK]
```

---

## 🔗 UTILITY BUTTONS

### 7. **"Call Now" Button**
- **Location**: `JobCard.tsx:802` - Actions section
- **Current Function**: `handleCall()`
- **Status**: ✅ **WORKING** (opens tel: link)
- **No SMS needed** - direct phone call

### 8. **"Open Maps" Button**  
- **Location**: `JobCard.tsx:814` - Actions section
- **Current Function**: `handleMaps()`
- **Status**: ✅ **WORKING** (opens Google Maps)
- **No SMS needed** - navigation only

### 9. **"Share Job" Button**
- **Location**: `JobCard.tsx:820` - Actions section
- **Current Function**: `shareJobLink()`
- **Status**: ✅ **WORKING** (copies to clipboard)
- **No SMS needed** - sharing functionality

---

## 📋 REQUIRED SUPABASE EDGE FUNCTIONS

### Functions to Create:

#### 1. `send-quote-sms`
- **Purpose**: Send quote to customer with amount and details
- **Trigger**: "Send Quote" button
- **Template**: Quote notification with amount

#### 2. `send-custom-sms`  
- **Purpose**: General SMS communication from tradie to customer
- **Trigger**: "Send SMS" button
- **Template**: Custom message with job context

#### 3. `send-status-update-sms`
- **Purpose**: Automatic notifications when job status changes
- **Trigger**: All status update buttons
- **Templates**: Different templates per status

---

## 🎯 IMPLEMENTATION PRIORITY

### **High Priority (Critical for UX)**
1. ✅ **Send Quote SMS** - Core business function
2. ✅ **Send Custom SMS** - General communication  
3. ✅ **Job Completed SMS** - Customer satisfaction

### **Medium Priority (Nice to Have)**
4. ⚠️ **Job Scheduled SMS** - Helps with no-shows
5. ⚠️ **Job Contacted SMS** - Sets expectations

### **Low Priority (Optional)**
6. ⏸️ **Job Quoted SMS** - May be redundant with Send Quote

---

## 📝 SMS TEMPLATE VARIABLES

### Standard Variables Available:
- `[CUSTOMER_NAME]` - job.customer_name
- `[JOB_TYPE]` - job.job_type  
- `[LOCATION]` - job.location
- `[QUOTE_AMOUNT]` - job.estimated_value
- `[TRADIE_NAME]` - profile.name
- `[TRADIE_BUSINESS_NAME]` - business_settings.business_name
- `[TRADIE_PHONE]` - profile.phone
- `[JOB_LINK]` - Secure job link for customer
- `[REVIEW_LINK]` - Google/Facebook review link
- `[SCHEDULED_DATE]` - To be added to job schema

---

## 💡 ADDITIONAL FEATURES TO CONSIDER

### Auto-SMS Triggers (Future)
- **New job submitted** → SMS to tradie
- **Customer edits job** → SMS to tradie (already implemented)
- **Payment received** → SMS confirmation
- **Job cancelled** → SMS notification

### Template Customization
- Allow tradies to customize SMS templates in settings
- A/B test different template wordings
- Track SMS delivery and response rates

---

## 🔧 TECHNICAL NOTES

### Rate Limiting Required:
- Max 5 SMS per job per day
- Max 50 SMS per tradie per day  
- Blacklist for opted-out numbers

### Cost Tracking:
- Log all SMS sends with cost
- Daily/monthly spending reports
- Auto-cutoff at spending limits

### Compliance:
- Add unsubscribe option to all SMS
- Store opt-out preferences
- Include business name in all messages

---

## ✅ COMPLETION CHECKLIST

- [ ] Create `send-quote-sms` edge function
- [ ] Create `send-custom-sms` edge function  
- [ ] Create `send-status-update-sms` edge function
- [ ] Design SMS template system
- [ ] Add SMS logging to database
- [ ] Implement rate limiting
- [ ] Add SMS cost tracking
- [ ] Test all button integrations
- [ ] Update JobCard.tsx error handling
- [ ] Create admin SMS analytics dashboard

---

*Last Updated: August 5, 2025*
*Next Review: When implementing SMS system*
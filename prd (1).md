# Tradie Missed‑Call Text‑Back — Lean PRD (v1.0)

> Capture missed calls, turn them into photo‑rich job leads, and give tradies a one‑tap mobile dashboard — **without changing their phone system**.

---

## 1. Problem & Wedge

| Pain (caller)                                 | Pain (tradie)                | Our Wedge                                                                                  |
| --------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| Nobody answers, caller rings the next tradie. | Missed calls = lost revenue. | **Instant SMS** → suburb + photo intake; tradie gets a **mobile job card** + 18:00 digest. |

Target ICP: 1–5‑person plumbers, electricians, locksmiths, handymen in AU metro areas.

---

## 2. AU Setup & Packaging

| Tier                                                                        | How it works                                        | Price (AUD, ex‑GST)        |
| --------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------- |
| **Option A** – Conditional forward on “no‑answer” to our +61 DID (default). | Keep their mobile; we only step in on missed calls. | **\$49 /mo** + \$149 setup |
| **Option B** – Branded business DID (add‑on).                               | New public number; always forwards to their mobile. | +\$15 /mo                  |

Costs to us (Twilio AU, Jul 2025): +61 DID **US\$6.50/mo**, outbound **US\$0.0515/segment**, inbound **US\$0.0075/segment**. Typical pilot usage ≈ **US\$10–12/mo** (60 missed calls → 60 outbound + 60 inbound).

---

## 3. Pricing & Cost Model (light)

- **Starter \$49/mo**: Missed‑call SMS, intake form, job card, 18 h summary
- **Pro \$79/mo**: Starter + branded DID + WhatsApp intake (later) + mini inbox
- Setup \$149 one‑off (provision DID, forwarding, branding, test)

Break‑even → \~1 extra job/month for most tradies.

---

## 4. 10‑Minute On‑boarding Checklist

1. Provision +61 DID in Twilio/Telnyx
2. Add Sheet + Supabase tenant config
3. Set conditional forward on tradie’s phone (*61*DID#)
4. Test: call → missed → caller SMS + tradie job card SMS/email
5. Confirm nightly summary at 18:00 (tenant timezone)

---

## 5. Caller Flow & Message Templates

| Step                        | Channel   | Copy (≤160 chars)                                                                                      |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| Missed‑call → SMS           | SMS       | “G’day, on a job. Tap to send suburb & 1–3 photos so I can quote fast: {link}. Reply STOP to opt‑out.” |
| Form submitted → Tradie SMS | SMS       | “New job: Jane B – Thornbury. Plumbing leak. Photos: {p}. Call: {tel}. Card: {c}. Mark: C Q W L.”      |
| 18 h Digest                 | SMS/email | “Today: {n} leads, {m} with photos. {summary‑link}.”                                                   |

Reply shortcuts: **C**=Called, **Q**=Quoted, **W**=Won, **L**=Lost.

---

## 6. Intake Form Fields (mobile wizard)

| Field             | Type           | Note                                                 |
| ----------------- | -------------- | ---------------------------------------------------- |
| Name              | text           | required                                             |
| Mobile            | tel            | auto‑prefill from Caller ID if possible              |
| Suburb / Postcode | text           | required                                             |
| Job type          | select         | Plumbing / Electrical / Locksmith / Cleaning / Other |
| Description       | textarea       | 140 chars max                                        |
| Photos            | up‑to‑3 images | auto‑compress                                        |
| Preferred time    | radio          | Morning / Midday / Arvo / After hours                |
| Urgency           | radio          | Now / Soon / Flexible                                |
| Property type     | radio          | Residential / Commercial                             |
| Consent           | checkbox       | “OK to text me about this job”                       |

---

## 7. Job Card (mobile)

- Header: Call | Maps | Add‑to‑Calendar | Status chips (New/Called/Quoted/Won/Lost)
- Body: Name, phone, suburb, job type, notes, photos (thumbs → full)
- Activity log: Created → status changes (timestamps)
- **Link format:** `go.yourbrand.au/t/{tenant}/j/{job_id}` (signed, 30‑day expiry)

---

## 8. Success Metrics & Pilot Gate

| KPI (14‑day pilot)  | Target                |
| ------------------- | --------------------- |
| Leads captured      | ≥70 % of missed calls |
| Leads with photos   | ≥40 %                 |
| Callback within 2 h | ≥80 %                 |
| Extra jobs won      | ≥1                    |

If targets met ⇒ convert to paid tier.

---

## 9. Technical Architecture (MVP → Phase 2)

| Layer            | MVP Tech                              | AU‑Only Option                                                        | Phase 2 (scale)          |
| ---------------- | ------------------------------------- | --------------------------------------------------------------------- | ------------------------ |
| Edge / Hot path  | **Cloudflare Worker** (global POPs)   | Same (code runs at AU POPs; data never stored)                        | Supabase Edge Function   |
| Data (admin)     | Google Sheets *(multi‑region)*        | **Supabase Postgres – Sydney (ap‑southeast‑2)** if residency required | Supabase Postgres        |
| Data (dashboard) | Supabase Postgres – Sydney            | Same                                                                  | 100 % Supabase           |
| Storage (photos) | S3/GCS – Sydney bucket, 30‑day expire | Same (R2 Sydney if moving)                                            | R2 / Cloudflare Images   |
| Workflows        | n8n Cron & Webhooks *(EU hosting)*    | Self‑host n8n on AU VM if required                                    | Supabase Background Jobs |

**Admin Data Choice**

- **Default (pilot):** dual‑write to Google Sheet per tenant (*fast CSV‑like view, but US‑hosted*).
- **AU‑only mode:** skip Sheets → write only to Supabase Sydney; export CSV via dashboard for admin tasks.

\---|---|---| | Edge / Hot path | **Cloudflare Worker** | Supabase Edge Function | | Data (admin) | Google Sheets | Supabase Postgres | | Data (dashboard) | Supabase Postgres | 100 % Supabase | | Storage | S3/GCS 30‑day expire | R2 / Cloudflare Images | | Workflows | n8n Cron & Webhooks | Supabase Background Jobs |

Dual‑write Worker → Sheet + Supabase during MVP.

---

## 10. Build Milestones (link GitHub board)

1. Telephony webhook + instant SMS (Worker)
2. Intake form + dual‑write
3. Supabase dashboard subscription live
4. Nightly summary flow (n8n)
5. 2‑tradie pilot live

(Board: [https://github.com/melon-hub/tradie-textback/projects/1](https://github.com/melon-hub/tradie-textback/projects/1))

---

## 11. Objections & Answers

- **Spam?** Only callers get one service SMS; STOP opt‑out.
- **New number?** Not with Option A; keep your SIM.
- **App to learn?** None. Call, then tap status.
- **WhatsApp?** Add‑on later once pilot succeeds.

---

## 12. Legal & Privacy

- **Service SMS** (not marketing); identify sender; include STOP.
- **Encryption & Retention:** AES‑256 at rest; photos auto‑purge after 30 days.
- **Tenant Isolation:** one DID per tenant; RLS on Postgres when used.
- **Data Residency (AU option):**
  - Supabase Sydney region (ap‑southeast‑2)
  - S3 or R2 Sydney bucket for photos
  - n8n self‑hosted on AU VM if required
  - Google Sheets disabled in AU‑only mode (admin CSV exports via dashboard instead).
- **Sub‑processors List:** Cloudflare, AWS (Sydney), Google (if Sheets enabled), Supabase (Sydney), Twilio/Telnyx.
- Draft **Data Processing Addendum** referencing above regions.

---

-



---

## 13. Roadmap (Phased Growth — aligned to TradiePro plan)
| Phase | Timeline | Key Deliverables |
| --- | --- | --- |
| **Phase 0 – Foundation** (done) | Pre‑MVP | Supabase schema (`jobs`, `job_photos`, `job_links`, `profiles`, `auth_sessions`), real‑time dashboard hooks. |
| **Phase 1 – MVP Photo & Auth** | Months 0‑1 | Missed‑call SMS → intake with advanced photo upload (mobile camera, env capture), Magic‑link phone login, secure job links (30‑day). Pilot 2 tradies. |
| **Phase 2 – PWA & Accessibility** | Months 2‑3 | Service Worker offline, install prompt, background sync, push‑ready, ARIA / keyboard nav, screen‑reader pass. |
| **Phase 3 – Mobile Optimisation** | Months 3‑4 | Bottom tab nav, safe‑area CSS, 44 px targets, touch momentum, font scaling, performance tweaks. |
| **Phase 4 – Advanced Insights** | Months 4‑6 | Analytics dashboard (conversion, trend, job type), browser/in‑app notifications, weekly email report, loading skeletons & error states. |
| **Phase 5 – Scale & Marketplace** | 6 mo+ | Stripe billing, review‑booster add‑on, WhatsApp intake, branded DID, photo‑to‑quote link, niche job board cross‑sell. |

--- | --- | --- |
| **MVP (live pilot)** | Months 0‑1 | Option A flow (Supabase Edge Func → SMS → Form), dual‑write Sheets + Supabase, 2‑tradie pilot, nightly digest. |
| **Phase 1 – Core polish** | Months 2‑3 | **Optional latency upgrade:** migrate hot SMS webhook to **Cloudflare Worker** for sub‑150 ms response in AU.<br>Mini inbox PWA, status nudges, per‑tenant dashboards, Stripe billing, basic analytics. |
| **Phase 2 – Revenue add‑ons** | Months 4‑6 | Option B branded number, WhatsApp intake, Review‑Booster SMS add‑on, Intake link for completed jobs. |
| **Phase 3 – Scale & Ops** | Months 6‑12 | Postgres‑only data, background jobs queue, observability dashboard, team seats. |
| **Phase 4 – Marketplace plays** | 12 mo+ | Photo‑to‑Quote module, micro‑SaaS scheduling add‑on, niche job board cross‑sell. |

------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| **MVP (live pilot)**            | Months 0‑1  | Option A flow (Worker → SMS → Form), dual‑write Sheets + Supabase, 2‑tradie pilot, nightly digest.                         |
| **Phase 1 – Core polish**       | Months 2‑3  | Mini inbox PWA, status nudges, per‑tenant dashboards, Stripe billing, basic analytics.                                     |
| **Phase 2 – Revenue add‑ons**   | Months 4‑6  | Option B branded number, WhatsApp intake, Review‑Booster SMS add‑on, Intake link for completed jobs.                       |
| **Phase 3 – Scale & Ops**       | Months 6‑12 | Migrate intake to Supabase Edge Functions, Postgres‑only data, background jobs queue, observability dashboard, team seats. |
| **Phase 4 – Marketplace plays** | 12 mo+      | Photo‑to‑Quote module, micro‑SaaS scheduling add‑on, niche job board cross‑sell.                                           |

---

## 14. Risk Log (live list)

| Risk                                | Likelihood | Impact             | Mitigation                                                         |
| ----------------------------------- | ---------- | ------------------ | ------------------------------------------------------------------ |
| SMS link filtered by AUS carriers   | Med        | Med (lost leads)   | Keep first SMS plain; own short domain; monitor delivery receipts. |
| Forwarding mis‑configured by tradie | Med        | High               | Live test during onboarding; weekly heartbeat alert.               |
| Telco DID price hikes               | Low        | Med                | Can port to Telnyx/Vonage; small buffer in margin.                 |
| ACMA spam compliance breach         | Low        | High (fines)       | Service messages only; clear ID + STOP; log consents.              |
| Data leak (photos/PII)              | Low        | High               | Signed URLs, 30‑day purge, encryption at rest, access logs.        |
| n8n downtime                        | Med        | Low (non‑critical) | Hot path runs in Worker; queue retries to n8n.                     |

---

## 15. Backlog Add‑ons & Ideas

1. **Review Booster** – One‑tap SMS review invite + 48h reminder (+\$19‑29/mo).
2. **WhatsApp Intake** – Quick‑reply buttons once customer initiates chat (+\$15/mo add‑on or Pro tier).
3. **Photo‑to‑Quote Link** – Stand‑alone guided form for small‑job quoting (+\$39‑59/mo).
4. **Mini Inbox PWA** – Installable web app for Today/Un‑actioned leads (included in Pro).
5. **Dashboard Analytics** – Win rate, response times, photo attach %, weekly email report.
6. **Team Seats** – Multiple mobiles/emails per tradie with role‑based access.
7. **Invoice Sync** – Push won jobs to Xero/QuickBooks/Jobber via API.
8. **Niche Job Board** – Curated listings, lead‑capture integration (separate product).
9. **Digital Templates Store** – Sell checklists/quote docs; funnel back to SaaS.

---

## 16. Go‑to‑Market Playbook (v0.9)

| Stage                                 | Actions                                                                                       | KPIs                                     | DB / Infra Upgrade Trigger                                                                        | Upgrade Needed?            |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| **Pilot (2 tradies)**                 | Cold‑call 10 local plumbers/sparkies, 14‑day free trial, nightly touch‑points                 | ≥1 extra job each, positive NPS          | **None** – Google Sheet + Supabase dual‑write fine at this load                                   | **No**                     |
| **Launch (10 tradies)**               | Niche landing pages ("Plumber Text‑Back"), referral credit \$50, local FB groups, Gumtree ads | 10 paying tradies, churn <10 %           | **Monitor** – if Sheet hits 5k rows **or** >1 req/s, prep migration script but stay on dual‑write | **Maybe (watch)**          |
| **Scale (50 tradies)**                | Case‑study ads, Google Ads "missed call text", partnership with trade associations            | MRR ≥ A\$2.5 K, CAC ≤ 1 month MRR        | **Cut‑over** – Drop Google Sheet write; use Supabase Postgres only; enable RLS & indexes          | **Yes**                    |
| **Channel (Reseller)**                | Offer white‑label to digital agencies; \$20/mo wholesale                                      | ≥2 agency partners, 20 white‑label seats | **Supabase Edge Functions** for hot path; consider moving photo storage to Cloudflare R2          | **Yes (Edge upgrade)**     |
| **Retention / Growth (100+ tradies)** | Monthly usage report; "jobs saved" counter; quarterly check‑in                                | Net revenue retention > 100 %            | **Queue & Worker** system for background jobs; observability stack; shard if >5 k writes/min      | **Yes (Advanced scaling)** |

Sales collateral: quick‑start PDF, competitor matrix slides.\
Support SLA: next‑business‑day email; urgent SMS in 30 min.

---

*(Previous note about separate docs removed; everything centralised here for now.)*



---

## 17. MVP Task List — Who Does What? (Status cross‑checked)
> **Legend**: *(Hoff)* = you / human • *(AI)* = ChatGPT / assist • **DONE** = confirmed completed

| # | Task | Owner | Status | Notes |
|---|---|---|---|---|
| **1** | Buy +61 test DID in Twilio/Telnyx sandbox | *(Hoff)* | **Pending** | Needed before any SMS flow can be tested |
| **2** | Supabase schema (`jobs`, `job_photos`, `job_links`, `profiles`, `auth_sessions`) | *(AI)* SQL draft → *(Hoff)* run | **DONE** | Confirmed in your front‑end summary |
| **3** | Edge Function `/voice-forwarded` – parse webhook, send SMS, insert row | *(AI)* code → *(Hoff)* deploy | **Pending** | Blocked until DID + webhook setup |
| **4** | Register Twilio Voice webhook to Edge Function URL | *(Hoff)* | **Pending** | Needs DID first |
| **5** | Intake form (React) – photo upload + POST `/intake` | *(AI)* scaffold → *(Hoff)* style | **DONE** | Mobile camera + drag‑drop implemented |
| **6** | Edge Function `/intake` – update job row, secure link, tradie SMS | *(AI)* code → *(Hoff)* test | **Pending** | SMS part blocked until DID; DB insert likely working |
| **7** | Magic‑link auth – phone/email provider, login screen | *(AI)* guidance → *(Hoff)* config | **DONE** | 7‑day session with resend link button |
| **8** | Real‑time dashboard – Supabase hooks, PWA offline | *(AI)* snippet → *(Hoff)* integrate | **DONE** | Bottom tab nav, service worker present |
| **9** | End‑to‑end smoke test (call → SMS → form → card → dashboard) | *(Hoff)* | **Pending** | Waits on DID + webhook |
| **10** | Quick‑Start PDF & landing page (GitHub/CF Pages) | *(AI)* draft → *(Hoff)* polish | **Pending** | Draft exists? confirm before marking done |
| **11** | Onboard 2 pilot tradies | *(Hoff)* | **Pending** | Schedule calls after smoke test |
| **12** | Monitor metrics 14 days; tweak SMS copy/form | *(Hoff)* + *(AI)* suggestions | **Pending** | Starts after onboarding |

*Post‑pilot enhancements*
- **13** Status reply parsing (`/sms-inbound`)
- **14** PWA Service Worker push notification setup

---

## 18. Pre‑Launch Checklist (MVP Ready‑to‑Ship)
> **Required?** ✓ = mandatory for launch • Opt = post‑launch / AU‑only toggle

| Area | Action | Owner | Required? | Notes |
|---|---|---|---|---|
| **Legal Entity** | Register Pty Ltd or Sole Trader, ABN, GST decision | *(Hoff)* | ✓ | Needed for Stripe payouts |
| **Business Email Setup** | Create `hello@yourbrand.com.au` (Google Workspace) | *(Hoff)* | ✓ | Required for Twilio, Stripe, domain WHOIS |
| **Business GitHub Org** | Create org, transfer repo, add personal collab | *(Hoff)* | Opt | Keeps IP in business entity |
| **Terms & Privacy** | Draft TOS & Privacy Policy (AU Privacy Act) | *(AI)* draft; *(Hoff)* review | ✓ | Must link on site & intake |
| **ACMA Compliance** | Verify service SMS, STOP, consent logs | *(AI)* checklist; *(Hoff)* confirm | ✓ | Avoid spam fines |
| **Data Protection** | Supabase RLS, signed URLs, 30‑day purge | *(AI)* code; *(Hoff)* test | ✓ | |
| **Data Residency Toggle** | If client requests AU‑only → disable Sheets, confirm Sydney resources | *(Hoff)* | Opt | |
| **Monitoring & Alerts** | Uptime ping + Slack/SMS alerts | *(AI)* code; *(Hoff)* mobile | ✓ | |
| **Billing & Tax** | Stripe live, GST settings, invoice template | *(Hoff)* | ✓ | |
| **Support Setup** | help@ email, SLA doc | *(AI)* draft; *(Hoff)* publish | ✓ | |
| **Backup & DR** | Export Sheets & DB daily (S3 Sydney) | *(AI)* schedule | Opt | Good practice week‑2 |
| **Pen‑Test / Vulnerability** | Run OWASP ZAP, fix high issues | *(AI)* script; *(Hoff)* review | Opt | First month |
| **Insurance** | Public liability / cyber cover quotes | *(Hoff)* | Opt | Personal risk reduction |
| **Cookie Banner** | Lightweight banner on marketing site | *(AI)* code | Opt | Privacy best‑practice |
| **Accessibility QA** | Lighthouse & axe run on forms | *(AI)* report; *(Hoff)* fix blockers | Opt | Aim WCAG AA |

Launch gate = all ✓ items green.

---

## 19. Operational Automations & Self‑Healing
| Automation | Trigger | Action | Owner | Required? |
|---|---|---|---|---|
| **SMS retry x3** | Twilio API 5xx / timeout | Auto‑retry at 30 s, 2 min, 5 min back‑off | *(AI)* code; *(Hoff)* test | ✓ |
| **Dead‑letter queue** | After 3 failed retries | Post JSON to `#alerts` Slack + send email summary | *(AI)* | ✓ |
| **Worker heartbeat** | Every 5 min cron | Call `/health`; >2 misses → SMS Hoff | *(AI)* ping; *(Hoff)* mobile | ✓ |
| **Photo cleanup cron** | Daily 03:00 | Delete S3/GCS objects >30 days | *(AI)* code | ✓ |
| **Missing summary guard** | 18:30 per tenant | If no digest sent, send fallback summary + alert | *(AI)* | ✓ |
| **N8n queue retry** | n8n node error | Auto‑retry up to 5x; push to Slack | *(AI)* | ✓ |
| **Fallback provider** | Twilio outage >5 min | Re‑route SMS via Telnyx | *(AI)* logic; *(Hoff)* creds | Opt |
| **Synthetic call test** | Hourly | Test number rings DID → validate SMS flow | *(AI)* script; *(Hoff)* review | Opt |
| **Offline PWA sync** | Browser back online | Background sync queued jobs | *(AI)* service worker | Opt |

Mandatory ✓ automations protect deliverability & data; Opt items add resilience post‑pilot.

---

## 20. Multi‑Tenant Flow (5‑Tradie Scenario)
```text
[ Caller ]
    │  Rings tradie mobile
    ▼
[ Carrier ]  — Conditional forward on “no‑answer” → tradie DID
    ▼
[ Twilio DIDs (+61 xN) ]  → Voice webhook `To` (DID) + `From` (caller)
    ▼
[ Supabase Edge Function ]
    1. Look up tenant by DID
    2. Send SMS to caller
    3. Insert `jobs` row (tenant_id)
    ▼
[ Supabase Postgres (Sydney) ]  — RLS on `tenant_id`
    ▼   realtime
[ React Dashboard ] (JWT embeds tenant_id)
```
**Isolation**: DID per tradie → tenant_id in DB → per‑tenant storage folders → Supabase RLS → dashboard JWT.

---

## 21. Authentication & Access Control
| Use‑case | Method | Flow | Pros | Cons |
|---|---|---|---|---|
| **Job Card** | Signed URL (30‑day HMAC) | Link in SMS → direct access | Zero login, 1‑tap | Can be forwarded (timeouts mitigate) |
| **Dashboard** | Supabase Magic Link (email) or Phone OTP | Onboard email → link → JWT with tenant_id | No passwords; token auto‑refresh | Needs new link after 7 days inactivity |
| **Status SMS reply** | Map `From` + DID | `C/Q/W/L` → Edge Fn updates job | Fast, no login | Inbound SMS setup later |

---

## 22. Dashboard UX Safeguards
| Potential issue | Front‑end safeguard | API support |
|---|---|---|
| Session expired | “Send login link” button → `/auth/resend` | Supabase resend endpoint |
| Job‑card link expired | Redirect 403 → `/renew?j=…` new signed URL | Edge Fn `/renew` |
| Realtime disconnect | Toast “Reconnecting…” auto‑retry | Supabase socket events |
| Photo upload fail | Retry button on thumbnail | PATCH `/intake/photo` |
| SMS blocked (STOP) | Yellow badge on card | Twilio status callback flag |
| Offline PWA | Cache last 50 jobs; banner “Offline” | Service Worker |
| Accessibility | ARIA labels, 44 px targets | N/A |

---


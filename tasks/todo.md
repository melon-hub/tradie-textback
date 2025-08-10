# Cursor Rules Alignment – Todo List

## Problem Analysis
`/.cursorrules` is missing several critical operational rules and workflows that exist in `CLAUDE.md` (RLS recursion prevention, secure Supabase workflow, start-of-session checklist, testing gates, Sentry notes, pitfall list). This causes inconsistency for contributors using Cursor.

## Objectives
- Align `/.cursorrules` with the most important, non-sensitive guidance from `CLAUDE.md`.
- Keep the rules concise, high-signal, and safe (no secrets).
- Minimal edits with clear sections and checklists.

## Todo Items
- [x] Identify key gaps between `/.cursorrules` and `CLAUDE.md` (RLS, env/secrets, dev server, checklists, pitfalls, testing, Sentry)
- [x] Add "Clarifying Questions First" section (short, actionable bullets)
- [x] Add "RLS Recursion Prevention" (never use `auth.uid()` directly; use `(SELECT auth.uid())`; avoid self-referencing policies; daily health check reference)
- [x] Add "Environment & Secrets" (use `./bin/sdb-*`, never commit secrets, how to locate `.env.local`, avoid direct `supabase db push`)
- [x] Add "Development Server" guidance (port 8080, check existing server before starting, avoid hardcoding other ports)
- [x] Add "Start-of-Session Checklist" (branch/status, `.env.local`, validate, sync migrations, then `npm run dev`)
- [x] Add "Common Pitfalls" list (env duplication, insecure commands, complex RLS, terminology confusion, unnecessary emojis)
- [x] Add "Testing & Quality Gates" (commands, 80% coverage, run tests+lint before commit)
- [x] Add brief "Sentry Monitoring" note (configured in `src/lib/sentry.ts`; source maps on; no secrets in rules; `lovable-tagger` disabled in `vite.config.ts`)
- [x] Add "Terminology & Roles" clarification (client = customer, tradie = service provider)
- [x] Review for brevity and sensitivity (no tokens, no service-role keys)
- [x] Commit changes as a single minimal edit to `/.cursorrules`

## Review
- Updated `/.cursorrules` with high-signal operational rules aligned to `CLAUDE.md` without adding secrets.
- Kept edits minimal and tool-agnostic for Cursor users. Ensures day-to-day guidance is consistent across tools.

## Acceptance Criteria
- `/.cursorrules` contains the new sections above, is concise (< 350 lines), and has no secrets.
- Guidance matches `CLAUDE.md` intent while being tool-agnostic for Cursor.
- Clear, checkable checklists suitable for day-to-day development.

---
# Job Card Redesign - Todo List

## Problem Analysis
The current job card in the tradie dashboard (lines 687-822 in Dashboard.tsx) is congested with too much information displayed simultaneously. The card includes:
- Customer name and tradie badge
- Job type (Blocked Drain)
- Address with pin icon
- "Not contacted yet" status badge
- Submitted time
- Urgency and status badges
- Photo thumbnail
- Price ($350)
- 4 action buttons (Call Now, Send SMS, Start Job, Complete, Share, Details)

This creates visual noise and makes it difficult to quickly scan and process information.

## Redesign Goals
1. Improve visual hierarchy - most important info should be prominent
2. Group related information together
3. Reduce visual noise and congestion
4. Make primary actions more prominent
5. Better spacing and typography
6. Maintain all functionality while improving UX

## Todo Items

### [ ] 1. Analyze current card structure and identify information hierarchy
- Determine primary vs secondary information
- Identify most frequently used actions
- Group related data elements

### [ ] 2. Create cleaner card header design
- Simplify customer name and tradie badge presentation
- Improve job type and location display
- Better status badge positioning

### [ ] 3. Redesign main content area
- Group related information (time, urgency, price)
- Improve photo thumbnail integration
- Create better visual separation between sections

### [ ] 4. Optimize action buttons layout
- Prioritize primary actions (Call, SMS)
- Group secondary actions appropriately
- Improve button sizing and spacing

### [ ] 5. Implement responsive improvements
- Ensure mobile-first design
- Better tablet and desktop layouts
- Proper touch-friendly sizing

### [ ] 6. Apply consistent spacing and typography
- Use Tailwind spacing utilities effectively
- Improve text hierarchy with proper font weights/sizes
- Better use of color for visual hierarchy

### [ ] 7. Test and refine the design
- Ensure all functionality remains intact
- Verify accessibility improvements
- Check responsiveness across screen sizes

## Design Principles to Follow
- Mobile-first responsive design
- Clear visual hierarchy with typography and spacing
- Group related information together
- Reduce cognitive load while maintaining functionality
- Use Tailwind CSS utilities efficiently
- Follow shadcn/ui component patterns
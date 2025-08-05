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
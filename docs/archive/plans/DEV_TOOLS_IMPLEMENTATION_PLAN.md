# Dev Tools Implementation Plan

## Overview
Implementing a comprehensive development and demo tooling system to improve testing efficiency and demo capabilities.

## Phase 1: Core Infrastructure ✅ COMPLETED
### 1.1 Git Command Optimization ✅
- [x] Created streamlined `git-autopush` script
- [x] Reduced output from ~50 lines to 5-6 lines
- [x] Auto-versioning with tag management
- [x] Integrated into Claude commands

### 1.2 Test Users Setup ✅
- [x] Created SQL migration for dev users
- [x] Three test users: admin@dev.local, tradie@dev.local, client@dev.local
- [x] All with password: devpass123
- [x] Pre-seeded with test jobs

### 1.3 Auth Switch Helper ✅
- [x] Created `DevAuthSwitch` class
- [x] Handles proper Supabase session switching
- [x] Clears caches and invalidates queries
- [x] Production-safe with env checks

## Phase 2: Dev Drawer Component 🚧 IN PROGRESS
### 2.1 Basic Dev Drawer ✅
- [x] Created `DevDrawer` component
- [x] Floating FAB button
- [x] Keyboard shortcut (Ctrl+`)
- [x] Three tabs: Navigate, Auth, Tools

### 2.2 Navigation Features ✅
- [x] Quick jump to any route
- [x] Search/filter routes
- [x] Current route indicator

### 2.3 Auth Switching ✅
- [x] One-click role switching
- [x] Shows current user info
- [x] Real Supabase sessions (not mocked)

### 2.4 Demo-Safe Features ✅
- [x] Environment flags (VITE_DEV_TOOLS, VITE_DEMO_TOOLS)
- [x] Demo mode banner
- [x] Separated dev-only vs demo-safe actions
- [x] Demo presets for quick scenarios

## Phase 3: App Integration 🔴 TODO
### 3.1 Add DevDrawer to App Layout
- [ ] Import DevDrawer in App.tsx
- [ ] Wrap in a provider/layout component
- [ ] Ensure it appears on all routes

### 3.2 Remove Old DevToolsPanel
- [ ] Replace DevToolsPanel with DevDrawer
- [ ] Migrate any missing features
- [ ] Clean up old code

## Phase 4: Demo Enhancements 🔴 TODO
### 4.1 Stable Demo Data
- [ ] Create demo data seed script
- [ ] Mark demo data with `demo: true` flag
- [ ] Protect demo data from destructive actions

### 4.2 More Demo Presets
- [ ] "Missed Call Flow" - Client perspective
- [ ] "Busy Day View" - Tradie with multiple jobs
- [ ] "Admin Review" - Admin checking system health
- [ ] "New User Onboarding" - Fresh signup flow

### 4.3 State Snapshots
- [ ] Save/restore UI state to localStorage
- [ ] Include filters, selected items, etc.
- [ ] One-click restore for demos

## Phase 5: Production Safety 🔴 TODO
### 5.1 Environment Configuration
- [ ] Set up .env.example with all flags
- [ ] Document flag usage
- [ ] Ensure tree-shaking removes dev code

### 5.2 Deep Link Support
- [ ] Parse ?devRole= query param
- [ ] Auto-apply role on page load
- [ ] Generate shareable demo links

## Implementation Priority

### High Priority (Do First)
1. **Phase 3.1** - Add DevDrawer to App.tsx
2. **Phase 3.2** - Remove old DevToolsPanel
3. Test the basic functionality

### Medium Priority (Do Next)
4. **Phase 4.1** - Create stable demo data
5. **Phase 4.2** - Add more demo presets
6. **Phase 5.1** - Environment configuration

### Low Priority (Nice to Have)
7. **Phase 4.3** - State snapshots
8. **Phase 5.2** - Deep link support
9. Additional keyboard shortcuts
10. Draggable/resizable drawer

## Testing Checklist
- [ ] Dev mode works with all features
- [ ] Demo mode hides dangerous actions
- [ ] Role switching maintains proper auth
- [ ] All routes are accessible
- [ ] Production build excludes dev tools
- [ ] Demo presets work reliably

## Environment Variables
```env
# Development tools (full access)
VITE_DEV_TOOLS=true

# Demo mode (safe subset)
VITE_DEMO_TOOLS=true

# Both should be false in production
```

## Next Steps
1. Complete Phase 3 (App Integration)
2. Test basic functionality
3. Add demo data and presets
4. Document usage for team

## Benefits When Complete
- ✅ Fast role switching for testing
- ✅ Quick navigation to any page
- ✅ Safe, repeatable demos
- ✅ No auth workarounds
- ✅ Real e2e testing with Supabase
- ✅ Reduced context switching
- ✅ Better developer experience
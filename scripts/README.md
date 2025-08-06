# SQL Scripts Directory

## ⚠️ Too Many Scripts!
We have 36+ SQL scripts here because we kept debugging RLS issues. Most are no longer needed.

## 🔥 Essential Scripts Only

### For Emergency Fixes
- `just-make-it-work.sql` - When everything is broken, run this
- `simple-fix-profiles.sql` - Fix profile RLS recursion quickly

### For Testing
- `test-data-functions-v2.sql` - Create test data functions
- `client-test-data-functions.sql` - Client-specific test data

### For Validation
- `validate-constraints.sql` - Check database constraints
- `validate-rls-policies.sql` - Check for RLS recursion

## ❌ Scripts to Avoid
- Anything with "nuclear" in the name
- Multiple versions of the same fix (v1, v2, v3, etc.)
- Debug scripts for specific issues already solved

## 📝 Lesson Learned
**Don't create a new SQL script for every issue!**
- First try to fix in code
- Only create scripts for migrations or one-time fixes
- Document fixes in CLAUDE.md instead of creating new scripts

## 🗑️ Cleanup Recommendation
Most of these scripts can be deleted after confirming the app works:
- All the fix-*-rls scripts (keep one simple version)
- All the debug-* scripts
- All the check-* scripts
- All the diagnose-* scripts

Keep only:
1. Migration scripts
2. Test data scripts
3. One emergency fix script
4. Validation scripts
# Tradie Textback Project Plan

## Notes
- Project uses React, TypeScript, Vite, shadcn/ui, Tailwind, and Supabase for backend (auth, database, storage, real-time, migrations).
- Supabase integration is robust: typed client, real-time jobs, phone magic link auth, secure job links, and photo storage.
- Database schema and migrations are present in `supabase/`.
- In Lovable projects, Supabase anon/public key is intentionally hardcoded in the client; .env files are not required for frontend keys.
- Using an external IDE is fully supported: just clone, install dependencies, and run; no .env or extra setup needed for Supabase connection.
- User has git access and has cloned the repo; next concern is connecting to Supabase.
- Current dashboard is designed for a single end user (tradie) and does not yet support individualized dashboards for multiple clients.
- Multi-client (multi-tenant) support will be implemented using a simplified approach: store client info in Supabase Auth user metadata, use user_type to distinguish tradie/client, and add a client_id column to jobs for data isolation. No dedicated client table will be created.
- RLS policies and dashboard logic will be updated to enforce per-user/client data access based on auth metadata and client_id.
- Admin user model will use the `user_type` (or `role`) field in profiles/auth metadata.

## Task List
- [x] Review project structure and Supabase integration
- [x] Review database schema and migrations
- [ ] Document steps to connect local dev environment to Supabase
  - [x] Identify required Supabase env variables (hardcoded, no .env needed)
  - [x] Document where/how to set these variables (not needed for Lovable)
  - [ ] Confirm Supabase project access (Studio or CLI)
  - [ ] Test local connection and authentication flow
- [ ] Implement simplified multi-client (multi-tenant) support
  - [x] Add `client_id` column to jobs table (references auth.users)
  - [ ] Add `user_type` field to profiles/auth metadata (tradie/client)
  - [ ] Update signup/auth flows to set user_type in metadata
  - [ ] Update RLS policies to enforce per-user/client access
  - [ ] Update dashboard logic to filter jobs by client_id and user_type
  - [ ] Document admin user capabilities and access
- [ ] Implement Google Maps integration
  - [ ] Create new Supabase migration for address field
  - [ ] Add `address` column to `profiles` table
  - [ ] Add address validation constraints (optional)
  - [ ] Update `handle_new_user()` function to populate address if needed
  - [ ] Create API endpoint for address geocoding
  - [ ] Implement token-based job link expiration logic
  - [ ] Add address validation middleware
  - [ ] Update authentication flow to include address handling
  - [ ] Add address field to user profile form
  - [ ] Implement Google Maps autocomplete integration
  - [ ] Add form validation for address field
  - [ ] Update profile display components to show address
  - [ ] Add RLS policies for address field access
  - [ ] Update existing row-level security policies
  - [ ] Implement token validation for job links
  - [ ] Add rate limiting for geocoding API
  - [ ] Write unit tests for migration scripts
  - [ ] Create test cases for address validation
  - [ ] Implement geocoding error handling
  - [ ] Test token expiration workflow
## Current Goal
Implement simplified metadata-based multi-client support

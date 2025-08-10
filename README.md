# Tradie Textback - Missed Call Management System

A React TypeScript application that helps Australian tradies capture leads by automatically sending SMS responses to missed calls.

## Overview

Tradie Textback helps Australian tradies win more jobs by automatically texting back missed calls, linking customers to a simple intake form, and organising requests in a mobile-friendly dashboard.

## Features

- Auto-SMS for missed calls (Twilio)
- Simple job intake form for customers
- Job dashboard with statuses and notes
- Client vs tradie views with proper access
- Mobile-first UI (Tailwind + shadcn)
- Secure backend (Supabase Auth + RLS)

## Live Demo

- Lovable project: https://lovable.dev/projects/17ebc76a-2297-472d-aba2-aae2d54dd873
  - Note: demo may use test data and limited features

## Quick Start (Local)

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

For backend setup (Supabase, Twilio, Google Maps) see:
- docs/critical/database-setup.md
- docs/guides/GOOGLE_MAPS_INTEGRATION.md
- docs/google-api-security.md

> Note: This repository avoids exposing secrets. Never commit service_role keys. Frontend uses anon keys; database access is protected by RLS policies.

## Testing

See [docs/TESTING.md](docs/TESTING.md) for unit, integration, and E2E guides. Quick commands:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Development Tools

For AI/developer-specific workflows (Claude commands, Lovable usage), see:
- CLAUDE.md
- docs/README.md

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time, Storage)
- **External APIs**: Twilio (SMS), Google Maps (Location)
- **Testing**: Vitest, React Testing Library, Playwright

## Google Maps API Setup

See setup guide in `docs/guides/GOOGLE_MAPS_INTEGRATION.md` and security tips in `docs/google-api-security.md`.

## Deployment

You can publish via Lovable: open the project and Share → Publish.

- Project: https://lovable.dev/projects/17ebc76a-2297-472d-aba2-aae2d54dd873
- Custom domains: https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide

## Contributing & Docs

- Developer docs index: `docs/README.md`
- Project rules and commands: `CLAUDE.md`


# Tradie Textback - Missed Call Management System

A React TypeScript application that helps Australian tradies capture leads by automatically sending SMS responses to missed calls.

## Project info

**URL**: https://lovable.dev/projects/17ebc76a-2297-472d-aba2-aae2d54dd873

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/17ebc76a-2297-472d-aba2-aae2d54dd873) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up Supabase development environment
./scripts/setup-dev.sh

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Supabase Setup

This project uses Supabase for backend services. To set up the development environment:

1. **Create `.env.local` file** with your database password:
   ```bash
   PGPASSWORD=your-database-password
   DB_URL="postgresql://postgres.cjxejmljovszxuleibqn:your-password@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"
   ```

2. **Run the setup script**:
   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Restart your terminal** to activate the new aliases

#### Available Supabase Commands

After setup, you'll have these convenient aliases:

- `sdb-push` - Push database changes to Supabase
- `sdb-pull` - Pull database changes from Supabase  
- `sdb-types` - Generate fresh TypeScript types

#### Manual Commands (if aliases don't work)

```bash
# First, load your environment variables
source .env.local

# Push database changes (password loaded from environment)
supabase db push --password "$PGPASSWORD"

# Pull database changes (password loaded from environment)
supabase db pull --password "$PGPASSWORD"

# Generate TypeScript types
supabase gen types typescript --project-id cjxejmljovszxuleibqn > src/types/database.types.ts
```

**🔐 Security Note**: The aliases and manual commands above automatically load your password from `.env.local` so it's never visible in terminal history or process lists.

## Testing

This project includes a comprehensive test suite to ensure reliability and quality.

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open test dashboard
npm run test:dashboard
```

### Test Types

- **Unit Tests**: Test individual components and hooks in isolation
- **Integration Tests**: Test how different parts work together
- **E2E Tests**: Test complete user workflows

For detailed testing documentation, see [docs/TESTING.md](docs/TESTING.md).

## Development Tools

### Claude Code Slash Commands

When using Claude Code CLI, you have access to custom slash commands for common tasks:

- `/docs` - Quick check to see what files have changed in the project
- `/update-docs` - Full documentation update process that analyzes changes and updates all relevant documentation

#### Using Slash Commands

1. Type `/` followed by the command name (e.g., `/docs`)
2. The command will execute and show results
3. For `/update-docs`, it will also stage the documentation changes

#### Creating Custom Commands

You can add your own slash commands:

1. Create a `.md` file in `~/.claude/commands/` (e.g., `mycommand.md`)
2. Add frontmatter and command content:
   ```markdown
   ---
   description: "Brief description"
   allowed-tools: ["bash", "read", "write"]
   ---
   
   Your command prompt here. Use $ARGUMENTS for input.
   ```
3. Restart Claude Code to activate new commands

See [CLAUDE.md](CLAUDE.md#custom-slash-commands) for more details on slash commands.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time, Storage)
- **External APIs**: Twilio (SMS), Google Maps (Location)
- **Testing**: Vitest, React Testing Library, Playwright

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/17ebc76a-2297-472d-aba2-aae2d54dd873) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

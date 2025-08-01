#!/bin/bash

# Tradie Textback - Development Setup Script
# This script sets up convenient aliases for Supabase CLI operations

echo "🚀 Setting up Tradie Textback development environment..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your database password:"
    echo "PGPASSWORD=your-database-password"
    echo "DB_URL=\"postgresql://postgres.cjxejmljovszxuleibqn:your-password@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres\""
    exit 1
fi

# Source the environment variables
source .env.local

# Extract password from .env.local
DB_PASSWORD=$(grep "PGPASSWORD=" .env.local | cut -d'=' -f2)

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "your-database-password-here" ]; then
    echo "❌ Please set your actual database password in .env.local"
    exit 1
fi

echo "✅ Database password found in .env.local"

# Add aliases to shell profile
SHELL_PROFILE=""
if [ -f ~/.zshrc ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f ~/.bashrc ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f ~/.bash_profile ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
else
    echo "❌ Could not find shell profile file"
    exit 1
fi

echo "📝 Adding Supabase aliases to $SHELL_PROFILE..."

# Remove existing aliases if they exist
sed -i '' '/alias sdb-push=/d' "$SHELL_PROFILE" 2>/dev/null || true
sed -i '' '/alias sdb-pull=/d' "$SHELL_PROFILE" 2>/dev/null || true
sed -i '' '/alias sdb-types=/d' "$SHELL_PROFILE" 2>/dev/null || true

# Add new aliases (using environment variable for security)
cat >> "$SHELL_PROFILE" << EOF

# Tradie Textback - Supabase Development Aliases
# Load environment variables from .env.local before running commands
alias sdb-push="cd \$(git rev-parse --show-toplevel) && source .env.local && supabase db push --password \"\$PGPASSWORD\""
alias sdb-pull="cd \$(git rev-parse --show-toplevel) && source .env.local && supabase db pull --password \"\$PGPASSWORD\""
alias sdb-types="supabase gen types typescript --project-id cjxejmljovszxuleibqn > src/types/database.types.ts"
EOF

echo "✅ Aliases added successfully!"
echo ""
echo "🎯 Available commands after restarting your terminal:"
echo "  sdb-push   - Push database changes to Supabase"
echo "  sdb-pull   - Pull database changes from Supabase"
echo "  sdb-types  - Generate fresh TypeScript types"
echo ""
echo "🔄 Restart your terminal or run: source $SHELL_PROFILE"
echo "✨ Development environment setup complete!"
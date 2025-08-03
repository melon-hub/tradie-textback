#!/bin/bash

# Claude Code Documentation Updater
# This script helps update documentation based on local changes

echo "📚 Claude Code Documentation Updater"
echo "===================================="
echo ""

# Function to get all local changes
get_local_changes() {
    echo "🔍 Scanning for local changes..."
    
    # Combine staged, unstaged, untracked, and recent commit changes
    {
        git diff --name-only 2>/dev/null
        git diff --cached --name-only 2>/dev/null
        git ls-files --others --exclude-standard 2>/dev/null
        git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null || true
    } | sort | uniq | grep -v "node_modules\|dist\|build\|coverage" || true
}

# Get changes
CHANGES=$(get_local_changes)

if [ -z "$CHANGES" ]; then
    echo "✅ No local changes detected!"
    exit 0
fi

echo "📝 Found changes in:"
echo "$CHANGES" | sed 's/^/   - /'
echo ""

# Create a prompt file for Claude
PROMPT_FILE="/tmp/update-docs-prompt.txt"

cat > "$PROMPT_FILE" << 'EOF'
Please update the documentation in the docs/ directory based on these local changes:

Changed Files:
EOF

echo "$CHANGES" >> "$PROMPT_FILE"

cat >> "$PROMPT_FILE" << 'EOF'

Instructions:
1. Review each changed file and determine which docs need updating
2. Use the Read tool to check current documentation
3. Update relevant docs using Edit or MultiEdit tools
4. Focus on these documentation areas:
   - docs/README.md - Overview and getting started
   - docs/TESTING.md - Test-related changes
   - docs/USER_FLOWS*.md - UI/UX flow changes
   - docs/critical/* - Critical setup and configuration
   - docs/guides/* - How-to guides
   - docs/reference/* - API and component reference
   - docs/status/* - Current project status

5. For each update:
   - Keep changes minimal and focused
   - Preserve existing structure
   - Add a changelog entry like: "<!-- Updated: YYYY-MM-DD - Description -->"
   - Update any relevant Mermaid diagrams

6. After updating, summarize what was changed

Please proceed with updating the documentation.
EOF

echo "📋 Created update prompt at: $PROMPT_FILE"
echo ""
echo "🤖 To update docs with Claude, copy and paste this command:"
echo ""
echo "cat $PROMPT_FILE"
echo ""
echo "Or run: cat $PROMPT_FILE | pbcopy (to copy to clipboard on Mac)"
echo ""
echo "After Claude updates the docs, run:"
echo "   git add docs/"
echo "   git commit -m \"docs: update documentation for recent changes\""
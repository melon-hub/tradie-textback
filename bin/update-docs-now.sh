#!/bin/bash

# Quick documentation updater for Claude
echo "📚 Preparing documentation update request for Claude..."

# Get all local changes
CHANGES=$(cat <<'EOF'
$(git status --porcelain 2>/dev/null | grep -v "^??" | cut -c4- | grep -v "node_modules\|dist\|build")
$(git ls-files --others --exclude-standard | grep -v "node_modules\|dist\|build")
EOF
)

# If no changes, check last commit
if [ -z "$CHANGES" ]; then
    CHANGES=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null)
fi

echo ""
echo "🔄 LOCAL CHANGES DETECTED:"
echo "=========================="
echo "$CHANGES" | sed 's/^/  /'
echo ""
echo "📝 CLAUDE INSTRUCTION:"
echo "===================="
echo ""
echo "Please update the documentation based on the local changes listed above."
echo ""
echo "1. Check which files were changed"
echo "2. Read the relevant documentation files in docs/"
echo "3. Update documentation to reflect the changes"
echo "4. Focus on:"
echo "   - docs/README.md (if dependencies or setup changed)"
echo "   - docs/TESTING.md (if tests were added/modified)"
echo "   - docs/USER_FLOWS*.md (if UI/UX changed)"
echo "   - docs/guides/* (if implementation patterns changed)"
echo "   - docs/critical/* (if critical config/setup changed)"
echo ""
echo "5. Add a changelog entry to updated docs like:"
echo "   <!-- Updated: $(date +%Y-%m-%d) - Brief description -->"
echo ""
echo "After updating, I'll stage the changes with: git add docs/"
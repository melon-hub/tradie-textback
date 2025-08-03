---
description: "Update all documentation based on recent code changes"
allowed_tools: ["bash", "read", "edit", "write", "task"]
model_preference: "claude-3-opus-20240229"
---

# Update Documentation

Run the documentation updater script to analyze all local changes (staged, unstaged, and untracked files) and update the relevant documentation in the docs/ folder.

## Steps to perform:

1. First, run the documentation update script:
```bash
/Users/michaelhofstein/Coding/tradie-textback/bin/update-docs
```

2. Analyze the changes detected by the script

3. Read the changed files to understand what was modified

4. Update the relevant documentation files in docs/:
   - docs/README.md - Main documentation index
   - docs/TESTING.md - Test-related changes
   - docs/guides/* - Implementation guides
   - docs/critical/* - Critical configuration/setup
   - docs/reference/* - API and component docs
   - docs/status/* - Project status updates
   - docs/USER_FLOWS*.md - UI/UX flow changes

5. For each documentation update:
   - Keep changes minimal and focused
   - Add a changelog comment: `<!-- Updated: YYYY-MM-DD - Description -->`
   - Preserve existing structure
   - Update any affected Mermaid diagrams

6. After updating all relevant docs, stage them:
```bash
git add docs/
```

7. Provide a summary of what documentation was updated

Remember: This command should analyze ALL local changes, not just git diff. It includes:
- Staged files (git diff --cached)
- Unstaged files (git diff)
- Untracked files (git ls-files --others)
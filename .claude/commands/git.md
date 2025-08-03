# Git Auto-Push Command

Streamlined git workflow that commits, tags, and pushes in one efficient operation.

## Usage

```bash
/git [commit message]
```

## Examples

```bash
# With custom message
/git Fixed authentication bug

# Without message (uses default)
/git
```

## What it does

1. **Checks status** - Exits if no changes
2. **Auto-increments version** - Bumps patch version automatically
3. **Commits & tags** - Creates commit with message and version tag
4. **Pushes everything** - Sends commit and tag to GitHub
5. **Shows summary** - Displays success with version and repo link

## Features

- ✅ Minimal output - only essential information
- ✅ Single command execution - no multiple steps
- ✅ Auto-versioning - no manual version input needed
- ✅ Error handling - exits cleanly on any failure
- ✅ Branch awareness - shows warning if not on main

## Implementation

```bash
# Quick execution
bin/git-autopush "$ARGUMENTS"
```

The optimized script reduces the original ~50 lines of output to just 5-6 essential lines.
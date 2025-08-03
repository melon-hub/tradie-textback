#!/usr/bin/env node

/**
 * Claude Code Hook: /update-docs
 * Automatically updates documentation based on git changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_DIR = path.join(process.cwd(), 'docs');
const DRY_RUN = process.argv.includes('--dry-run');

// Documentation mapping
const DOC_MAPPINGS = {
  // Source patterns -> Documentation files
  'src/hooks/': ['docs/reference/HOOKS.md', 'docs/TESTING.md'],
  'src/components/': ['docs/reference/COMPONENTS.md', 'docs/guides/UI_COMPONENTS.md'],
  'src/pages/': ['docs/USER_FLOWS_MERMAID.md', 'docs/reference/PAGES.md'],
  'supabase/migrations/': ['docs/critical/MIGRATION_ISSUES.md', 'docs/guides/DATABASE.md'],
  'tests/': ['docs/TESTING.md', 'docs/guides/TESTING_GUIDE.md'],
  '.env': ['docs/guides/SETUP.md', 'docs/critical/ENVIRONMENT.md'],
  'package.json': ['docs/README.md', 'docs/guides/DEPENDENCIES.md'],
  'src/integrations/': ['docs/guides/INTEGRATIONS.md', 'docs/critical/API_KEYS.md'],
  'src/types/': ['docs/reference/TYPES.md'],
  'docs/': [], // Don't update docs based on doc changes
};

// Get all local changes (staged, unstaged, and untracked)
function getLocalChanges() {
  try {
    // Get staged changes
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
      .split('\n').filter(Boolean);
    
    // Get unstaged changes
    const unstaged = execSync('git diff --name-only', { encoding: 'utf-8' })
      .split('\n').filter(Boolean);
    
    // Get untracked files (new files not in git)
    const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf-8' })
      .split('\n').filter(Boolean);
    
    // Get files modified in the last commit (in case user wants to update docs after commit)
    let lastCommit = [];
    try {
      lastCommit = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf-8' })
        .split('\n').filter(Boolean);
    } catch (e) {
      // Might fail on first commit
    }
    
    // Combine all changes and remove duplicates
    const allChanges = [...new Set([
      ...staged,
      ...unstaged,
      ...untracked,
      ...lastCommit
    ])];
    
    // Filter out node_modules, build files, etc.
    const relevantChanges = allChanges.filter(file => {
      return !file.includes('node_modules/') &&
             !file.includes('dist/') &&
             !file.includes('build/') &&
             !file.includes('.git/') &&
             !file.includes('coverage/');
    });
    
    return relevantChanges;
  } catch (error) {
    console.error('Error getting local changes:', error.message);
    return [];
  }
}

// Get detailed changes for files
function getDetailedChanges(files) {
  const changes = {};
  
  files.forEach(file => {
    try {
      // Check if file exists
      if (!fs.existsSync(file)) {
        changes[file] = 'File deleted';
        return;
      }
      
      // Try to get git diff first
      let diff = '';
      try {
        diff = execSync(`git diff HEAD -- "${file}"`, { encoding: 'utf-8' });
      } catch (e) {
        // Try staged diff
        try {
          diff = execSync(`git diff --cached -- "${file}"`, { encoding: 'utf-8' });
        } catch (e2) {
          // File might be untracked
        }
      }
      
      if (diff) {
        changes[file] = {
          type: 'modified',
          diff: diff
        };
      } else {
        // If no diff, file might be new/untracked, show content preview
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const preview = content.slice(0, 500) + (content.length > 500 ? '...' : '');
          changes[file] = {
            type: 'new',
            preview: preview,
            size: content.length
          };
        } catch (e) {
          changes[file] = {
            type: 'unknown',
            error: e.message
          };
        }
      }
    } catch (error) {
      changes[file] = {
        type: 'error',
        error: error.message
      };
    }
  });
  
  return changes;
}

// Determine which docs need updating
function getDocsToUpdate(changedFiles) {
  const docsToUpdate = new Set();
  
  changedFiles.forEach(file => {
    // Find matching patterns
    Object.entries(DOC_MAPPINGS).forEach(([pattern, docs]) => {
      if (file.includes(pattern)) {
        docs.forEach(doc => docsToUpdate.add(doc));
      }
    });
    
    // Also check specific file mappings
    if (file === 'README.md') {
      docsToUpdate.add('docs/README.md');
    }
    if (file === 'CLAUDE.md') {
      docsToUpdate.add('docs/critical/CLAUDE_INSTRUCTIONS.md');
    }
  });
  
  return Array.from(docsToUpdate);
}

// Generate update summary
function generateUpdateSummary(changes, docsToUpdate) {
  const date = new Date().toISOString().split('T')[0];
  
  let summary = `## Documentation Update Plan - ${date}\n\n`;
  summary += `### Changed Files (${Object.keys(changes).length}):\n`;
  
  Object.keys(changes).forEach(file => {
    summary += `- ${file}\n`;
  });
  
  summary += `\n### Documentation to Update (${docsToUpdate.length}):\n`;
  docsToUpdate.forEach(doc => {
    summary += `- ${doc}\n`;
  });
  
  return summary;
}

// Create prompt for Claude
function createClaudePrompt(changes, docsToUpdate) {
  const prompt = `
I need to update documentation based on these code changes:

${JSON.stringify(changes, null, 2)}

Please update the following documentation files:
${docsToUpdate.join('\n')}

For each documentation file:
1. Read the current content
2. Identify sections that need updating based on the code changes
3. Update only the relevant sections
4. Add a changelog entry at the bottom like: "Updated: YYYY-MM-DD - Brief description"
5. Preserve existing structure and formatting
6. Keep updates minimal and focused

Important:
- Only update what's directly affected by the changes
- Maintain existing markdown/mermaid formatting
- Don't create new sections unless necessary
- Keep the tone consistent with existing docs
`;

  return prompt;
}

// Main execution
async function main() {
  console.log('🔍 Analyzing local changes...\n');
  
  // Get all local changes (not just git diff)
  const changedFiles = getLocalChanges();
  
  if (changedFiles.length === 0) {
    console.log('✅ No changes detected. Documentation is up to date!');
    return;
  }
  
  // Get detailed changes
  const changes = getDetailedChanges(changedFiles);
  
  // Determine which docs need updating
  const docsToUpdate = getDocsToUpdate(changedFiles);
  
  if (docsToUpdate.length === 0) {
    console.log('✅ No documentation updates needed for these changes.');
    return;
  }
  
  // Generate and show summary
  const summary = generateUpdateSummary(changes, docsToUpdate);
  console.log(summary);
  
  if (DRY_RUN) {
    console.log('\n🔄 DRY RUN MODE - No changes will be made.\n');
    console.log('Run without --dry-run to apply updates.');
    return;
  }
  
  // Ask for confirmation
  console.log('\n❓ Proceed with documentation updates? (This will use Claude to analyze and update docs)');
  console.log('   Press Enter to continue or Ctrl+C to cancel...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Create prompt for Claude
  const prompt = createClaudePrompt(changes, docsToUpdate);
  
  // Output prompt for Claude (since we can't directly call Claude from here)
  console.log('\n📝 Please run this with Claude to update the documentation:\n');
  console.log('```');
  console.log(prompt);
  console.log('```');
  
  // Stage documentation changes
  console.log('\n📦 To stage documentation changes after updates:');
  console.log('   git add docs/');
  
  console.log('\n✅ Documentation update process initiated!');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { getGitDiff, getDocsToUpdate, generateUpdateSummary };
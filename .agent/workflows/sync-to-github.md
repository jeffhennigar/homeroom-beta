---
description: Sync all changes to GitHub with an auto-generated commit message
---

# Sync to GitHub

This workflow stages all changes, generates a commit message, and pushes to main.

## Steps

// turbo-all
1. Stage all changes:
   ```
   git add -A
   ```

2. View staged changes to understand what was modified:
   ```
   git diff --cached --stat
   ```

3. Generate a commit message based on the staged changes and commit. The message should:
   - Be concise (under 72 characters for the title)
   - Summarize the main changes
   - Use conventional commit format if applicable (feat:, fix:, docs:, etc.)

4. Push to main branch:
   ```
   git push origin main
   ```

5. Confirm success to the user.

---
name: "commit"
description: "Smart conventional commit"
command: "/commit"
args: "[message]"
---

# /commit Skill

Create a well-structured conventional commit from staged changes.

## Usage
- `/commit` — auto-generate commit message from staged changes
- `/commit fix login bug` — use provided message as basis

## Steps

1. Run `git status` and `git diff --staged` to analyze changes
2. If no changes are staged, check for unstaged changes and suggest what to stage
3. Determine the commit type (feat, fix, docs, refactor, test, chore, etc.)
4. Determine the scope from the changed files/directories
5. Generate a concise commit message in conventional commit format
6. If a message hint was provided, incorporate it
7. Show the proposed commit message and ask for confirmation
8. Create the commit

## Commit Format
```
<type>(<scope>): <description>

[body if changes are complex]
```

## Rules
- Never commit .env files or files containing secrets
- Keep the subject line under 72 characters
- Use imperative mood ("add" not "added")
- If breaking changes exist, add `BREAKING CHANGE:` footer

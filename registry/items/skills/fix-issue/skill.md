---
name: "fix-issue"
description: "Fix GitHub issue end-to-end"
command: "/fix-issue"
args: "[number]"
---

# /fix-issue Skill

Fix a GitHub issue from start to finish: read, branch, fix, test, commit.

## Usage
- `/fix-issue 42` — fix issue #42

## Steps

1. **Read the issue**: `gh issue view [number]` to understand the problem
2. **Create a branch**: `git checkout -b fix/issue-[number]-[slug]`
3. **Investigate**: Find the relevant code, reproduce the issue
4. **Fix**: Apply the minimal fix that addresses the root cause
5. **Test**: Write or update tests to cover the fix
6. **Verify**: Run the test suite to ensure no regressions
7. **Commit**: Create a conventional commit referencing the issue
8. **Summary**: Show what was changed and suggest next steps (PR, etc.)

## Commit Format
```
fix(<scope>): <description>

Fixes #[number]
```

## Guidelines
- Always understand the issue fully before coding
- One issue, one fix — don't bundle unrelated changes
- If the issue is unclear, explain what you found and ask for clarification
- If the fix is complex, break it into steps and confirm approach first
